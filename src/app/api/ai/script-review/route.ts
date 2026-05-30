import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { aiChat } from '@/lib/ai-provider';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const { content, platform } = await req.json();
    if (!content) return NextResponse.json({ error: 'Content required' }, { status: 400 });

    try {
      const reply = await aiChat(
        [{ role: 'user', content: `Review this ${platform || 'content'} script:\n\n${content}\n\nRespond ONLY with JSON: {"corrections":["any"],"hooks":["suggested hooks"],"ctas":["call to actions"],"engagementTriggers":["triggers"]}` }],
        'You are a content strategy AI. Return only valid JSON.'
      );
      const match = reply.match(/\{[\s\S]*\}/);
      if (match) return NextResponse.json(JSON.parse(match[0]));
    } catch {}

    return NextResponse.json({ corrections: [], hooks: ['Start with a bold question'], ctas: ['Subscribe for more'], engagementTriggers: ['Ask viewers to comment'] });
  } catch (error) { return NextResponse.json({ error: 'Internal server error' }, { status: 500 }); }
}
