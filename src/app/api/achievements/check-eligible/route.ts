import { NextResponse } from 'next/server';
import { getUserId } from '@/lib/auth-helper';
import { checkAndNotifyEligibleAchievements } from '@/lib/achievements';

export async function POST() {
  try {
    const userId = await getUserId();
    const newCount = await checkAndNotifyEligibleAchievements(userId);
    return NextResponse.json({ success: true, newNotifications: newCount });
  } catch (error) {
    console.error('[CheckEligible] Endpoint error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
