/**
 * AI Action Proposals — Module-Based Task Management & Automation
 *
 * DESIGN PRINCIPLE (per user spec):
 *   "The AI must never modify important data automatically.
 *    Before performing actions... The AI must:
 *      1. Explain the reason.
 *      2. Show the proposed changes.
 *      3. Request explicit user approval.
 *      4. Apply the changes only after approval.
 *    Automation should activate only when the user requests it through the chatbot."
 *
 * FLOW:
 *   1. User asks: "Optimize my study plan" / "Reorganize this week's workouts" / "Clean up completed tasks"
 *   2. Chatbot route detects automation intent → calls generateActionProposals()
 *   3. AI returns a structured JSON list of proposals (each = one concrete change)
 *   4. Each proposal is persisted with status="pending" — NOT applied
 *   5. Chat UI renders proposal cards inline with Approve/Reject buttons
 *   6. User clicks Approve → /api/ai/proposals/[id] applies it via the module executor
 *   7. User clicks Reject → status set to "rejected"
 *
 * Each proposal is atomic: a single create/edit/delete/reorder/merge/archive on
 * one entity (task, workout, learning_topic, etc.). Multi-step optimizations are
 * expressed as multiple proposals so the user can approve selectively.
 */

import { db } from '@/lib/db';
import { aiChat } from '@/lib/ai-provider';
import { buildModuleContext, getModuleMemory, formatMemoryBlock } from '@/lib/ai-module-context';

// ─── Types ───────────────────────────────────────────────────────────────────

export type ActionType = 'create' | 'edit' | 'delete' | 'reorder' | 'merge' | 'archive';
export type EntityType =
  | 'task'
  | 'workout'
  | 'learning_topic'
  | 'learning_entry'
  | 'content_entry'
  | 'content_series'
  | 'day_plan';
export type ProposalStatus =
  | 'pending'
  | 'approved'
  | 'rejected'
  | 'applied'
  | 'failed'
  | 'expired';

export interface ActionProposal {
  module: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId?: string;
  title: string;
  reason: string;
  beforeState?: Record<string, any>;
  afterState: Record<string, any>;
  expectedBenefit?: string;
  confidence: number; // 0.0 - 1.0
}

export interface AppliedProposalResult {
  success: boolean;
  message: string;
  entityId?: string;
}

// ─── Automation Intent Detection ─────────────────────────────────────────────

/**
 * Detects whether the user's message is a request for module automation.
 * Only triggers proposal generation when the user EXPLICITLY asks for it —
 * never on background. This honors the spec:
 *   "Automation should activate only when the user requests it through the chatbot."
 */
const AUTOMATION_TRIGGERS = [
  // Direct commands
  'optimize', 'reorganize', 'reorganise', 'rearrange', 'reorder',
  'clean up', 'cleanup', 'clean-up',
  'generate a better', 'generate better',
  'suggest improvements', 'improve my', 'improve the',
  'update my', 'update the',
  'rearrange my', 'rearrange the',
  'fix my', 'fix the',
  'rebalance', 'rebalance my',
  // Module-specific automation phrases
  'study plan', 'study roadmap', 'learning roadmap',
  'workout schedule', 'workout plan', 'training plan',
  'task list', 'task list', 'schedule',
  'break down', 'break this down',
  'suggest next', 'next step', 'next steps',
  'merge duplicate', 'find duplicate', 'deduplicate',
  'remove unnecessary', 'remove outdated', 'remove completed',
  'plan my week', 'plan my day', 'plan my tomorrow',
  'auto schedule', 'auto-schedule',
];

const AUTOMATION_BLOCKERS = [
  'what is', 'what are', 'how do', 'how does', 'why', 'explain',
  'tell me about', 'describe', 'definition',
  'recipe', 'macro', 'calorie', 'protein', 'form tip',
  'motivate', 'motivation', 'encourage',
];

export function detectAutomationIntent(message: string, module: string): boolean {
  const lower = message.toLowerCase();

  // Must contain a trigger phrase
  const hasTrigger = AUTOMATION_TRIGGERS.some(phrase => lower.includes(phrase));
  if (!hasTrigger) return false;

  // Must be paired with a module-relevant noun
  const moduleNouns: Record<string, string[]> = {
    productivity: ['task', 'tasks', 'schedule', 'day', 'week', 'time', 'plan', 'todo', 'to-do', 'priority', 'priorities'],
    fitness: ['workout', 'workouts', 'training', 'exercise', 'split', 'muscle', 'session', 'plan', 'schedule'],
    learning: ['study', 'learning', 'topic', 'topics', 'roadmap', 'revision', 'plan', 'schedule'],
    content: ['content', 'series', 'pipeline', 'post', 'blog', 'video', 'idea', 'draft'],
    time: ['task', 'tasks', 'schedule', 'day', 'week', 'time', 'plan', 'todo', 'to-do', 'priority', 'priorities'],
  };

  const nouns = moduleNouns[module] || moduleNouns.productivity;
  const hasModuleNoun = nouns.some(n => lower.includes(n));

  return hasModuleNoun;
}

// ─── Proposal Generator (AI-driven) ──────────────────────────────────────────

const MODULE_ENTITY_TYPES: Record<string, EntityType[]> = {
  productivity: ['task', 'day_plan'],
  time: ['task', 'day_plan'],
  fitness: ['workout'],
  learning: ['learning_topic', 'learning_entry'],
  content: ['content_entry', 'content_series'],
};

const PROPOSAL_SYSTEM_PROMPT = `You are a module automation engine for the SRE productivity platform.
The user has explicitly asked you to optimize, reorganize, clean up, or improve their {MODULE} module.

Based on the user's actual data (provided below) and their request, generate a JSON list of concrete action proposals.

CRITICAL RULES:
1. Each proposal must be ATOMIC — a single change to a single entity.
2. NEVER propose destructive actions (deletes) unless the user explicitly asked ("clean up", "remove").
3. For every proposal, include:
   - title: short human-readable summary (max 80 chars)
   - reason: WHY this change helps (1-2 sentences)
   - expectedBenefit: what the user gains (1 sentence)
   - confidence: 0.0-1.0 — how confident you are this is the right change
4. For edit/delete/reorder/merge, you MUST reference the existing entity by its actual ID (from the context).
5. For create, entityId should be null.
6. Cap at 8 proposals total. Quality over quantity.
7. If the user's request is unclear or there's nothing useful to change, return an empty array.

VALID actionType values: "create", "edit", "delete", "reorder", "merge", "archive"
VALID entityType values for {MODULE}: {ENTITY_TYPES}

OUTPUT FORMAT — return ONLY valid JSON, no markdown fences, no commentary:
{
  "proposals": [
    {
      "actionType": "edit",
      "entityType": "task",
      "entityId": "actual_id_from_context",
      "title": "Move 'Read book' to 7:00 AM",
      "reason": "You marked reading as your top priority but scheduled it at 11 PM when your energy is lowest.",
      "expectedBenefit": "Higher-priority work gets done during peak focus hours.",
      "confidence": 0.85,
      "beforeState": { "title": "Read book", "fromTime": "23:00", "toTime": "23:30" },
      "afterState":  { "title": "Read book", "fromTime": "07:00", "toTime": "07:30" }
    }
  ]
}

Return ONLY the JSON object. If no proposals, return {"proposals": []}.`;

export async function generateActionProposals(
  userId: string,
  module: string,
  userMessage: string,
  conversationId?: string
): Promise<ActionProposal[]> {
  // Normalize module names: 'time' → 'productivity' for the executor
  const normalizedModule = module === 'time' ? 'productivity' : module;
  const validEntityTypes = MODULE_ENTITY_TYPES[module] || MODULE_ENTITY_TYPES.productivity;

  // Fetch user's actual module data + persistent memory in parallel
  const [moduleContext, memory] = await Promise.all([
    buildModuleContext(userId, module),
    getModuleMemory(userId, module === 'navigation' ? 'general' : module),
  ]);

  const memoryBlock = formatMemoryBlock(memory);

  const systemPrompt = PROPOSAL_SYSTEM_PROMPT
    .replace(/\{MODULE\}/g, normalizedModule)
    .replace(/\{ENTITY_TYPES\}/g, validEntityTypes.map(t => `"${t}"`).join(', '));

  const userPrompt = `USER REQUEST: ${userMessage}

── USER'S ACTUAL ${normalizedModule.toUpperCase()} DATA ──
${moduleContext?.contextBlock || '(no activity yet)'}

${memoryBlock ? `── PERSISTENT MEMORY ──\n${memoryBlock}` : ''}

Generate up to 8 atomic action proposals for this user based on their actual data and explicit request.
Return ONLY the JSON object: {"proposals": [...]}
Do NOT include any other text, explanation, or markdown.`;

  try {
    const messages = [{ role: 'user', content: userPrompt }];
    const rawResponse = await aiChat(messages, systemPrompt);

    // Extract JSON from response (handle AI sometimes wrapping in markdown)
    const jsonStr = extractJsonFromResponse(rawResponse);
    if (!jsonStr) {
      console.log('[AI Proposals] No JSON found in AI response');
      return [];
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('[AI Proposals] JSON parse error:', parseErr);
      return [];
    }

    if (!parsed.proposals || !Array.isArray(parsed.proposals)) {
      return [];
    }

    // Validate + sanitize each proposal
    const validProposals: ActionProposal[] = [];
    for (const p of parsed.proposals) {
      const sanitized = sanitizeProposal(p, normalizedModule, validEntityTypes);
      if (sanitized) validProposals.push(sanitized);
    }

    // Persist proposals to DB (status="pending")
    if (validProposals.length > 0) {
      await persistProposals(userId, normalizedModule, validProposals, conversationId);
    }

    return validProposals;
  } catch (error) {
    console.error('[AI Proposals] Generation failed:', error);
    return [];
  }
}

function extractJsonFromResponse(text: string): string | null {
  if (!text) return null;

  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    return fenceMatch[1].trim();
  }

  // Try direct JSON parse
  const trimmed = text.trim();
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return trimmed;
  }

  // Find first { and last }
  const firstBrace = trimmed.indexOf('{');
  const lastBrace = trimmed.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return trimmed.substring(firstBrace, lastBrace + 1);
  }

  return null;
}

function sanitizeProposal(
  p: any,
  module: string,
  validEntityTypes: EntityType[]
): ActionProposal | null {
  if (!p || typeof p !== 'object') return null;

  const actionType = String(p.actionType || '').toLowerCase();
  const entityType = String(p.entityType || '').toLowerCase();

  const VALID_ACTIONS: ActionType[] = ['create', 'edit', 'delete', 'reorder', 'merge', 'archive'];
  if (!VALID_ACTIONS.includes(actionType as ActionType)) return null;
  if (!validEntityTypes.includes(entityType as EntityType)) return null;

  // Require title and reason
  const title = String(p.title || '').trim();
  const reason = String(p.reason || '').trim();
  if (!title || !reason) return null;

  // Require afterState for all actions
  const afterState = p.afterState && typeof p.afterState === 'object' ? p.afterState : null;
  if (!afterState) return null;

  // entityId required for edit/delete/reorder/merge; optional for create/archive
  const entityId = p.entityId ? String(p.entityId) : undefined;
  if ((actionType === 'edit' || actionType === 'delete' || actionType === 'reorder' || actionType === 'merge') && !entityId) {
    return null;
  }

  const confidence = typeof p.confidence === 'number'
    ? Math.max(0, Math.min(1, p.confidence))
    : 0.7;

  return {
    module,
    actionType: actionType as ActionType,
    entityType: entityType as EntityType,
    entityId,
    title: title.substring(0, 200),
    reason: reason.substring(0, 500),
    beforeState: p.beforeState && typeof p.beforeState === 'object' ? p.beforeState : undefined,
    afterState,
    expectedBenefit: p.expectedBenefit ? String(p.expectedBenefit).substring(0, 300) : undefined,
    confidence,
  };
}

async function persistProposals(
  userId: string,
  module: string,
  proposals: ActionProposal[],
  conversationId?: string
): Promise<void> {
  try {
    await db.aiActionProposal.createMany({
      data: proposals.map(p => ({
        userId,
        module,
        conversationId: conversationId || null,
        actionType: p.actionType,
        entityType: p.entityType,
        entityId: p.entityId || null,
        title: p.title,
        reason: p.reason,
        beforeStateJson: p.beforeState ? JSON.stringify(p.beforeState) : null,
        afterStateJson: JSON.stringify(p.afterState),
        expectedBenefit: p.expectedBenefit || null,
        confidence: p.confidence,
        status: 'pending',
      })),
    });
  } catch (err) {
    console.error('[AI Proposals] Persist failed:', err);
    // Non-fatal — proposals are still returned to the client, just not persisted
  }
}

// ─── Proposal Executor ───────────────────────────────────────────────────────

/**
 * Applies a single approved proposal to the actual module data.
 * This is the ONLY place where AI-proposed changes touch real data —
 * and only after the user has explicitly approved via the API.
 */
export async function applyProposal(proposalId: string, userId: string): Promise<AppliedProposalResult> {
  let proposal: any;
  try {
    proposal = await db.aiActionProposal.findFirst({
      where: { id: proposalId, userId },
    });
  } catch (err) {
    return { success: false, message: 'Proposal table not available' };
  }

  if (!proposal) {
    return { success: false, message: 'Proposal not found' };
  }

  if (proposal.status === 'applied') {
    return { success: false, message: 'Proposal already applied' };
  }
  if (proposal.status === 'rejected') {
    return { success: false, message: 'Proposal was rejected' };
  }

  // Mark as approved (transitioning through approved → applied)
  try {
    await db.aiActionProposal.update({
      where: { id: proposalId },
      data: { status: 'approved' },
    });
  } catch (err) {
    // Continue even if status update fails
  }

  const afterState = JSON.parse(proposal.afterStateJson || '{}');
  const beforeState = proposal.beforeStateJson ? JSON.parse(proposal.beforeStateJson) : null;

  try {
    let result: AppliedProposalResult;

    switch (proposal.entityType) {
      case 'task':
      case 'day_plan':
        result = await executeTaskProposal(proposal, afterState, beforeState, userId);
        break;
      case 'workout':
        result = await executeWorkoutProposal(proposal, afterState, beforeState, userId);
        break;
      case 'learning_topic':
        result = await executeLearningTopicProposal(proposal, afterState, beforeState, userId);
        break;
      case 'learning_entry':
        result = await executeLearningEntryProposal(proposal, afterState, beforeState, userId);
        break;
      case 'content_entry':
        result = await executeContentEntryProposal(proposal, afterState, beforeState, userId);
        break;
      case 'content_series':
        result = await executeContentSeriesProposal(proposal, afterState, beforeState, userId);
        break;
      default:
        result = { success: false, message: `Unknown entity type: ${proposal.entityType}` };
    }

    // Update proposal status based on result
    await db.aiActionProposal.update({
      where: { id: proposalId },
      data: {
        status: result.success ? 'applied' : 'failed',
        appliedAt: result.success ? new Date() : null,
        errorMessage: result.success ? null : result.message,
      },
    });

    return result;
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    await db.aiActionProposal.update({
      where: { id: proposalId },
      data: { status: 'failed', errorMessage: errorMsg.substring(0, 500) },
    }).catch(() => {});
    return { success: false, message: errorMsg };
  }
}

// ─── Task / Day Plan Executor ────────────────────────────────────────────────

function localDateStr(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

async function executeTaskProposal(
  proposal: any,
  afterState: Record<string, any>,
  beforeState: Record<string, any> | null,
  userId: string
): Promise<AppliedProposalResult> {
  const today = localDateStr();
  const tomorrow = localDateStr(1);

  switch (proposal.actionType) {
    case 'create': {
      const date = afterState.date || today;
      if (date !== today && date !== tomorrow) {
        return { success: false, message: 'Tasks can only be created for today or tomorrow' };
      }
      const maxOrderTask = await db.timeTask.findFirst({
        where: { userId, date },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      const task = await db.timeTask.create({
        data: {
          userId,
          title: String(afterState.title || 'Untitled task'),
          description: afterState.description ? String(afterState.description) : null,
          category: afterState.category ? String(afterState.category) : null,
          priority: afterState.priority ? String(afterState.priority) : 'medium',
          isProductive: afterState.isProductive !== undefined ? Boolean(afterState.isProductive) : true,
          fromTime: afterState.fromTime ? String(afterState.fromTime) : null,
          toTime: afterState.toTime ? String(afterState.toTime) : null,
          date,
          order: (maxOrderTask?.order ?? -1) + 1,
        },
      });
      return { success: true, message: `Created task: ${task.title}`, entityId: task.id };
    }
    case 'edit': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for edit' };
      const existing = await db.timeTask.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Task not found' };

      const data: Record<string, unknown> = {};
      if (afterState.title !== undefined) data.title = String(afterState.title);
      if (afterState.description !== undefined) data.description = afterState.description ? String(afterState.description) : null;
      if (afterState.category !== undefined) data.category = afterState.category ? String(afterState.category) : null;
      if (afterState.priority !== undefined) data.priority = String(afterState.priority);
      if (afterState.isProductive !== undefined) data.isProductive = Boolean(afterState.isProductive);
      if (afterState.fromTime !== undefined) data.fromTime = afterState.fromTime ? String(afterState.fromTime) : null;
      if (afterState.toTime !== undefined) data.toTime = afterState.toTime ? String(afterState.toTime) : null;
      if (afterState.date !== undefined && (afterState.date === today || afterState.date === tomorrow)) {
        data.date = String(afterState.date);
      }

      await db.timeTask.update({ where: { id: proposal.entityId }, data });
      return { success: true, message: `Updated task: ${existing.title}`, entityId: existing.id };
    }
    case 'delete': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for delete' };
      const existing = await db.timeTask.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Task not found' };
      await db.timeTask.delete({ where: { id: proposal.entityId } });
      return { success: true, message: `Deleted task: ${existing.title}` };
    }
    case 'reorder': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for reorder' };
      const newOrder = Number(afterState.order);
      if (Number.isNaN(newOrder)) return { success: false, message: 'Invalid order value' };
      const existing = await db.timeTask.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Task not found' };
      await db.timeTask.update({ where: { id: proposal.entityId }, data: { order: newOrder } });
      return { success: true, message: `Reordered task: ${existing.title}` };
    }
    case 'merge': {
      // Merge: source task (entityId) deleted, target task (afterState.mergeTargetId) updated with combined info
      if (!proposal.entityId) return { success: false, message: 'entityId required for merge' };
      const targetId = afterState.mergeTargetId;
      if (!targetId) return { success: false, message: 'mergeTargetId required for merge' };
      const source = await db.timeTask.findFirst({ where: { id: proposal.entityId, userId } });
      const target = await db.timeTask.findFirst({ where: { id: targetId, userId } });
      if (!source || !target) return { success: false, message: 'Source or target task not found' };

      const mergedDescription = [target.description, source.description].filter(Boolean).join(' | ');
      await db.timeTask.update({
        where: { id: targetId },
        data: {
          description: mergedDescription || null,
          priority: ['high', 'medium', 'low'].sort((a, b) =>
            [a, b].indexOf(source.priority) - [a, b].indexOf(target.priority)
          )[0] === source.priority ? source.priority : target.priority,
        },
      });
      await db.timeTask.delete({ where: { id: proposal.entityId } });
      return { success: true, message: `Merged "${source.title}" into "${target.title}"` };
    }
    case 'archive': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for archive' };
      const existing = await db.timeTask.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Task not found' };
      // Archive = mark as missed (kept for reflection)
      await db.timeTask.update({
        where: { id: proposal.entityId },
        data: { status: 'missed', reflectionNote: 'Archived by AI assistant' },
      });
      return { success: true, message: `Archived task: ${existing.title}` };
    }
    default:
      return { success: false, message: `Unknown action: ${proposal.actionType}` };
  }
}

// ─── Workout Executor ────────────────────────────────────────────────────────

const CALORIE_RATES: Record<string, number> = {
  'Running': 10, 'Walking': 4, 'Cycling': 8, 'Swimming': 9, 'Weight Training': 6,
  'HIIT': 12, 'Yoga': 3, 'Pilates': 4, 'Dance': 7, 'Boxing': 10, 'Jump Rope': 11,
  'Rowing': 8, 'Elliptical': 7, 'Stair Climbing': 9, 'Stretching': 2,
  'Basketball': 8, 'Football': 8, 'Tennis': 7, 'Badminton': 6, 'Cricket': 5,
  'Push-ups': 8, 'Pull-ups': 8, 'Squats': 7, 'Planks': 5, 'Burpees': 10,
};

async function executeWorkoutProposal(
  proposal: any,
  afterState: Record<string, any>,
  beforeState: Record<string, any> | null,
  userId: string
): Promise<AppliedProposalResult> {
  switch (proposal.actionType) {
    case 'create': {
      const workoutType = String(afterState.workoutType || 'Weight Training');
      const duration = parseInt(afterState.duration || '30');
      const date = String(afterState.date || localDateStr());
      const rate = CALORIE_RATES[workoutType] || 6;
      const calcCalories = afterState.estimatedCalories
        ? parseFloat(afterState.estimatedCalories)
        : Math.round(rate * duration);

      const workout = await db.fitnessWorkoutLog.create({
        data: {
          userId,
          workoutType,
          duration,
          estimatedCalories: calcCalories,
          notes: afterState.notes ? String(afterState.notes) : null,
          date,
          muscleGroup: afterState.muscleGroup ? String(afterState.muscleGroup) : null,
          sets: afterState.sets ? parseInt(afterState.sets) : null,
          reps: afterState.reps ? parseInt(afterState.reps) : null,
          loadKg: afterState.loadKg ? parseFloat(afterState.loadKg) : null,
          workoutSplit: afterState.workoutSplit ? String(afterState.workoutSplit) : null,
        },
      });
      return { success: true, message: `Created workout: ${workoutType}`, entityId: workout.id };
    }
    case 'edit': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for edit' };
      const existing = await db.fitnessWorkoutLog.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Workout not found' };

      // Per existing API, only notes can be edited on workouts (other fields are immutable)
      // To respect that constraint, AI edit proposals on workouts only update notes.
      // If AI proposes changes to sets/reps/load, we create a new workout instead.
      if (afterState.notes !== undefined) {
        await db.fitnessWorkoutLog.update({
          where: { id: proposal.entityId },
          data: { notes: afterState.notes ? String(afterState.notes) : null },
        });
        return { success: true, message: `Updated workout notes: ${existing.workoutType}` };
      }
      return { success: false, message: 'Workouts only support notes edits — other fields require creating a new entry' };
    }
    case 'delete': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for delete' };
      const existing = await db.fitnessWorkoutLog.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Workout not found' };
      await db.fitnessWorkoutLog.delete({ where: { id: proposal.entityId } });
      return { success: true, message: `Deleted workout: ${existing.workoutType}` };
    }
    case 'archive': {
      // Workouts don't have an archive state — delete is the equivalent
      if (!proposal.entityId) return { success: false, message: 'entityId required for archive' };
      const existing = await db.fitnessWorkoutLog.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Workout not found' };
      await db.fitnessWorkoutLog.delete({ where: { id: proposal.entityId } });
      return { success: true, message: `Archived (deleted) workout: ${existing.workoutType}` };
    }
    default:
      return { success: false, message: `Action ${proposal.actionType} not supported for workouts` };
  }
}

// ─── Learning Topic Executor ─────────────────────────────────────────────────

async function executeLearningTopicProposal(
  proposal: any,
  afterState: Record<string, any>,
  beforeState: Record<string, any> | null,
  userId: string
): Promise<AppliedProposalResult> {
  switch (proposal.actionType) {
    case 'create': {
      const name = String(afterState.name || 'Untitled topic');
      const topic = await db.learningTopic.create({
        data: {
          userId,
          name,
          phase: afterState.phase ? String(afterState.phase) : null,
          isSharedCollection: false,
          collectionVisibility: 'public',
        },
      });
      return { success: true, message: `Created topic: ${name}`, entityId: topic.id };
    }
    case 'edit': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for edit' };
      const existing = await db.learningTopic.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Topic not found' };
      const data: Record<string, unknown> = {};
      if (afterState.name !== undefined) data.name = String(afterState.name);
      if (afterState.phase !== undefined) data.phase = afterState.phase ? String(afterState.phase) : null;
      await db.learningTopic.update({ where: { id: proposal.entityId }, data });
      return { success: true, message: `Updated topic: ${existing.name}`, entityId: existing.id };
    }
    case 'delete': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for delete' };
      const existing = await db.learningTopic.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Topic not found' };
      await db.learningTopic.delete({ where: { id: proposal.entityId } });
      return { success: true, message: `Deleted topic: ${existing.name}` };
    }
    case 'merge': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for merge' };
      const targetId = afterState.mergeTargetId;
      if (!targetId) return { success: false, message: 'mergeTargetId required' };
      const source = await db.learningTopic.findFirst({ where: { id: proposal.entityId, userId } });
      const target = await db.learningTopic.findFirst({ where: { id: targetId, userId } });
      if (!source || !target) return { success: false, message: 'Source or target topic not found' };

      // Move all entries from source to target, then delete source
      await db.learningEntry.updateMany({
        where: { topicId: proposal.entityId },
        data: { topicId: targetId },
      });
      await db.learningTopic.delete({ where: { id: proposal.entityId } });
      return { success: true, message: `Merged topic "${source.name}" into "${target.name}"` };
    }
    case 'archive': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for archive' };
      const existing = await db.learningTopic.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Topic not found' };
      // Archive = mark as private (hidden from public collections)
      await db.learningTopic.update({
        where: { id: proposal.entityId },
        data: { collectionVisibility: 'private', isSharedCollection: false },
      });
      return { success: true, message: `Archived topic: ${existing.name}` };
    }
    default:
      return { success: false, message: `Action ${proposal.actionType} not supported for learning topics` };
  }
}

// ─── Learning Entry Executor ─────────────────────────────────────────────────

async function executeLearningEntryProposal(
  proposal: any,
  afterState: Record<string, any>,
  beforeState: Record<string, any> | null,
  userId: string
): Promise<AppliedProposalResult> {
  switch (proposal.actionType) {
    case 'create': {
      if (!afterState.topicId) return { success: false, message: 'topicId required to create entry' };
      const topic = await db.learningTopic.findFirst({ where: { id: afterState.topicId, userId } });
      if (!topic) return { success: false, message: 'Topic not found' };
      const entry = await db.learningEntry.create({
        data: {
          userId,
          topicId: String(afterState.topicId),
          title: String(afterState.title || 'Untitled entry'),
          content: afterState.content ? String(afterState.content) : null,
          duration: afterState.duration ? parseInt(afterState.duration) : null,
          date: afterState.date ? String(afterState.date) : localDateStr(),
        },
      });
      return { success: true, message: `Created learning entry: ${entry.title}`, entityId: entry.id };
    }
    case 'edit': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for edit' };
      const existing = await db.learningEntry.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Entry not found' };
      const data: Record<string, unknown> = {};
      if (afterState.title !== undefined) data.title = String(afterState.title);
      if (afterState.content !== undefined) data.content = afterState.content ? String(afterState.content) : null;
      if (afterState.duration !== undefined) data.duration = afterState.duration ? parseInt(afterState.duration) : null;
      if (afterState.topicId !== undefined) {
        // Validate target topic belongs to user
        const topic = await db.learningTopic.findFirst({ where: { id: String(afterState.topicId), userId } });
        if (!topic) return { success: false, message: 'Target topic not found' };
        data.topicId = String(afterState.topicId);
      }
      await db.learningEntry.update({ where: { id: proposal.entityId }, data });
      return { success: true, message: `Updated entry: ${existing.title}`, entityId: existing.id };
    }
    case 'delete': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for delete' };
      const existing = await db.learningEntry.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Entry not found' };
      await db.learningEntry.delete({ where: { id: proposal.entityId } });
      return { success: true, message: `Deleted entry: ${existing.title}` };
    }
    default:
      return { success: false, message: `Action ${proposal.actionType} not supported for learning entries` };
  }
}

// ─── Content Entry/Series Executors ──────────────────────────────────────────

async function executeContentEntryProposal(
  proposal: any,
  afterState: Record<string, any>,
  beforeState: Record<string, any> | null,
  userId: string
): Promise<AppliedProposalResult> {
  switch (proposal.actionType) {
    case 'create': {
      if (!afterState.seriesId) return { success: false, message: 'seriesId required to create entry' };
      const series = await db.contentSeries.findFirst({ where: { id: String(afterState.seriesId), userId } });
      if (!series) return { success: false, message: 'Series not found' };
      const entry = await db.contentEntry.create({
        data: {
          userId,
          seriesId: String(afterState.seriesId),
          title: String(afterState.title || 'Untitled content'),
          content: afterState.content ? String(afterState.content) : null,
          status: afterState.status ? String(afterState.status) : 'idea',
          contentType: afterState.contentType ? String(afterState.contentType) : 'post',
        },
      });
      return { success: true, message: `Created content entry: ${entry.title}`, entityId: entry.id };
    }
    case 'edit': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for edit' };
      const existing = await db.contentEntry.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Entry not found' };
      const data: Record<string, unknown> = {};
      if (afterState.title !== undefined) data.title = String(afterState.title);
      if (afterState.content !== undefined) data.content = afterState.content ? String(afterState.content) : null;
      if (afterState.status !== undefined) data.status = String(afterState.status);
      if (afterState.contentType !== undefined) data.contentType = String(afterState.contentType);
      if (afterState.liveStatus !== undefined) data.liveStatus = String(afterState.liveStatus);
      await db.contentEntry.update({ where: { id: proposal.entityId }, data });
      return { success: true, message: `Updated content: ${existing.title}` };
    }
    case 'delete': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for delete' };
      const existing = await db.contentEntry.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Entry not found' };
      await db.contentEntry.delete({ where: { id: proposal.entityId } });
      return { success: true, message: `Deleted content: ${existing.title}` };
    }
    case 'archive': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for archive' };
      const existing = await db.contentEntry.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Entry not found' };
      await db.contentEntry.update({ where: { id: proposal.entityId }, data: { status: 'archived' } });
      return { success: true, message: `Archived content: ${existing.title}` };
    }
    default:
      return { success: false, message: `Action ${proposal.actionType} not supported for content entries` };
  }
}

async function executeContentSeriesProposal(
  proposal: any,
  afterState: Record<string, any>,
  beforeState: Record<string, any> | null,
  userId: string
): Promise<AppliedProposalResult> {
  switch (proposal.actionType) {
    case 'create': {
      const series = await db.contentSeries.create({
        data: {
          userId,
          name: String(afterState.name || 'Untitled series'),
          description: afterState.description ? String(afterState.description) : null,
          category: afterState.category ? String(afterState.category) : null,
        },
      });
      return { success: true, message: `Created series: ${series.name}`, entityId: series.id };
    }
    case 'edit': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for edit' };
      const existing = await db.contentSeries.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Series not found' };
      const data: Record<string, unknown> = {};
      if (afterState.name !== undefined) data.name = String(afterState.name);
      if (afterState.description !== undefined) data.description = afterState.description ? String(afterState.description) : null;
      if (afterState.category !== undefined) data.category = afterState.category ? String(afterState.category) : null;
      await db.contentSeries.update({ where: { id: proposal.entityId }, data });
      return { success: true, message: `Updated series: ${existing.name}` };
    }
    case 'delete': {
      if (!proposal.entityId) return { success: false, message: 'entityId required for delete' };
      const existing = await db.contentSeries.findFirst({ where: { id: proposal.entityId, userId } });
      if (!existing) return { success: false, message: 'Series not found' };
      await db.contentSeries.delete({ where: { id: proposal.entityId } });
      return { success: true, message: `Deleted series: ${existing.name}` };
    }
    default:
      return { success: false, message: `Action ${proposal.actionType} not supported for content series` };
  }
}

// ─── Proposal Listing & Status Updates ───────────────────────────────────────

export async function listPendingProposals(userId: string, module?: string): Promise<any[]> {
  try {
    const where: any = { userId, status: 'pending' };
    if (module) {
      // Normalize time → productivity
      where.module = module === 'time' ? 'productivity' : module;
    }
    return await db.aiActionProposal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch (err) {
    console.error('[AI Proposals] List failed:', err);
    return [];
  }
}

export async function rejectProposal(proposalId: string, userId: string): Promise<boolean> {
  try {
    const proposal = await db.aiActionProposal.findFirst({
      where: { id: proposalId, userId },
    });
    if (!proposal) return false;
    if (proposal.status !== 'pending') return false;
    await db.aiActionProposal.update({
      where: { id: proposalId },
      data: { status: 'rejected' },
    });
    return true;
  } catch (err) {
    console.error('[AI Proposals] Reject failed:', err);
    return false;
  }
}

export async function expireOldProposals(userId: string): Promise<number> {
  // Auto-expire proposals older than 24 hours that are still pending
  try {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await db.aiActionProposal.updateMany({
      where: {
        userId,
        status: 'pending',
        createdAt: { lt: cutoff },
      },
      data: { status: 'expired' },
    });
    return result.count || 0;
  } catch (err) {
    console.error('[AI Proposals] Expire failed:', err);
    return 0;
  }
}
