import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiClassifyTask } from '@/lib/ai-provider';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { title, description } = await req.json();
    if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });
    const result = await aiClassifyTask(title, description);
    return NextResponse.json({ ...result, isProductive: result.productivity !== 'unproductive' });
  } catch (error) {
    console.error('Classify task error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
