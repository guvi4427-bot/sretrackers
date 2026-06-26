import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { getModuleMemory, updateModuleMemory, formatMemoryBlock } from '@/lib/ai-module-context';

/**
 * GET /api/ai/module-memory?module=fitness
 * Returns the user's persistent memory for the given module.
 */
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('module') || 'general';

    const memory = await getModuleMemory(session.user.id, moduleName);
    return NextResponse.json({ memory });
  } catch (error) {
    console.error('Module memory GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch memory' }, { status: 500 });
  }
}

/**
 * POST /api/ai/module-memory
 * Body: { module: string, preferences?: string[], frequentItems?: string[], goals?: string[], notes?: string[] }
 *
 * Merges new items into existing memory (dedupes + caps array size).
 * The chatbot route calls this automatically after AI responses — but
 * users/clients can also call it directly to inject explicit preferences.
 */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { module: moduleName, preferences, frequentItems, goals, notes } = body;

    if (!moduleName || typeof moduleName !== 'string') {
      return NextResponse.json({ error: 'Module name required' }, { status: 400 });
    }

    const validModules = ['fitness', 'learning', 'time', 'content', 'nutrition', 'general'];
    if (!validModules.includes(moduleName)) {
      return NextResponse.json({ error: `Invalid module. Must be one of: ${validModules.join(', ')}` }, { status: 400 });
    }

    const updates: any = {};
    if (Array.isArray(preferences)) updates.preferences = preferences.filter((x: any) => typeof x === 'string').slice(0, 10);
    if (Array.isArray(frequentItems)) updates.frequentItems = frequentItems.filter((x: any) => typeof x === 'string').slice(0, 20);
    if (Array.isArray(goals)) updates.goals = goals.filter((x: any) => typeof x === 'string').slice(0, 5);
    if (Array.isArray(notes)) updates.notes = notes.filter((x: any) => typeof x === 'string').slice(0, 10);

    await updateModuleMemory(session.user.id, moduleName, updates);

    const updated = await getModuleMemory(session.user.id, moduleName);
    return NextResponse.json({
      success: true,
      memory: updated,
      formatted: formatMemoryBlock(updated),
    });
  } catch (error) {
    console.error('Module memory POST error:', error);
    return NextResponse.json({ error: 'Failed to update memory' }, { status: 500 });
  }
}

/**
 * DELETE /api/ai/module-memory?module=fitness
 * Clears all memory for the given module (user-initiated reset).
 */
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const moduleName = searchParams.get('module');

    if (!moduleName) return NextResponse.json({ error: 'Module parameter required' }, { status: 400 });

    try {
      await db.moduleMemory.deleteMany({
        where: { userId: session.user.id, module: moduleName },
      });
    } catch (e) {
      // Table may not exist yet — non-fatal
      console.log('[Module Memory] DELETE skipped (table may not exist):', e instanceof Error ? e.message : 'unknown');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Module memory DELETE error:', error);
    return NextResponse.json({ error: 'Failed to clear memory' }, { status: 500 });
  }
}
