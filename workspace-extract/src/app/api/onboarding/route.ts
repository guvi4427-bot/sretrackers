import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();
    const { activePhases, phaseActivityMap, learningTopics, fitnessProfile, category, categoryAnswers } = body;

    // Validate phases
    if (!activePhases || !Array.isArray(activePhases) || activePhases.length === 0) {
      return NextResponse.json(
        { error: 'At least one phase must be selected' },
        { status: 400 }
      );
    }

    const validPhases = ['start', 'restart', 'explore'];
    const invalidPhases = activePhases.filter((p: string) => !validPhases.includes(p));
    if (invalidPhases.length > 0) {
      return NextResponse.json(
        { error: `Invalid phases: ${invalidPhases.join(', ')}` },
        { status: 400 }
      );
    }

    // Build update data
    const updateData: Record<string, any> = {
      activePhases: JSON.stringify(activePhases),
      onboardingComplete: true,
    };

    // Store phaseActivityMap in rich format
    if (phaseActivityMap && typeof phaseActivityMap === 'object') {
      updateData.phaseActivityMap = JSON.stringify(phaseActivityMap);
    }

    // Store category (legacy support)
    if (category) {
      updateData.category = category;
    }

    // Store categoryAnswers (legacy support)
    if (categoryAnswers) {
      updateData.categoryAnswers = JSON.stringify(categoryAnswers);
    }

    // Update profile
    const profile = await db.profile.update({
      where: { userId },
      data: updateData,
    });

    // Create learning topics if provided
    if (learningTopics && Array.isArray(learningTopics) && learningTopics.length > 0) {
      for (const topicName of learningTopics) {
        if (typeof topicName === 'string' && topicName.trim()) {
          // Determine which phase this topic belongs to
          let topicPhase: string | null = null;
          for (const [phase, data] of Object.entries(phaseActivityMap || {})) {
            const phaseData = data as { activities: string[]; metadata: Record<string, Record<string, string>> };
            if (phaseData.activities?.includes('learning')) {
              topicPhase = phase;
              break; // Assign to first phase that has learning
            }
          }

          await db.learningTopic.upsert({
            where: {
              id: `${userId}-${topicName.trim().toLowerCase().replace(/\s+/g, '-')}`,
            },
            create: {
              id: `${userId}-${topicName.trim().toLowerCase().replace(/\s+/g, '-')}`,
              userId,
              name: topicName.trim(),
              phase: topicPhase,
            },
            update: {
              phase: topicPhase,
            },
          });
        }
      }
    }

    // Create or update fitness profile if provided
    if (fitnessProfile && fitnessProfile.weight && fitnessProfile.height && fitnessProfile.age) {
      // Determine which phase this fitness belongs to
      let fitnessPhase: string | null = null;
      for (const [phase, data] of Object.entries(phaseActivityMap || {})) {
        const phaseData = data as { activities: string[]; metadata: Record<string, Record<string, string>> };
        if (phaseData.activities?.includes('fitness')) {
          fitnessPhase = phase;
          break;
        }
      }

      await db.fitnessProfile.upsert({
        where: { userId },
        create: {
          userId,
          weight: fitnessProfile.weight,
          height: fitnessProfile.height,
          age: fitnessProfile.age,
          gender: fitnessProfile.gender || null,
          activityLevel: fitnessProfile.activityLevel || null,
          goal: fitnessProfile.goal || null,
          tdee: fitnessProfile.tdee || null,
          fitnessPhase,
        },
        update: {
          weight: fitnessProfile.weight,
          height: fitnessProfile.height,
          age: fitnessProfile.age,
          gender: fitnessProfile.gender || null,
          activityLevel: fitnessProfile.activityLevel || null,
          goal: fitnessProfile.goal || null,
          tdee: fitnessProfile.tdee || null,
          fitnessPhase,
        },
      });
    }

    return NextResponse.json({
      message: 'Onboarding completed successfully',
      profile: {
        activePhases: (() => { try { const parsed = JSON.parse(profile.activePhases); return Array.isArray(parsed) ? parsed : []; } catch { return []; } })(),
        phaseActivityMap: (() => { try { const parsed = JSON.parse(profile.phaseActivityMap || '{}'); return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {}; } catch { return {}; } })(),
        category: profile.category,
        onboardingComplete: profile.onboardingComplete,
      },
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
