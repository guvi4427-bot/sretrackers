import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { requireAdmin, logAudit } from '@/lib/admin-auth';
import { getUserId } from '@/lib/auth-helper';

// Verification criteria
const VERIFICATION_CRITERIA = {
  minLevel: 5,
  minFollowers: 1500,
  minStreak: 7,
  minPosts: 10,
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    // Check eligibility - any authenticated user can check their own
    if (action === 'check-eligibility') {
      const userId = await getUserId();
      const profile = await db.profile.findUnique({ where: { userId } });
      if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });

      const followerCount = await db.follow.count({ where: { followingId: userId, status: 'accepted' } });
      const postCount = await db.post.count({ where: { userId } });

      const eligible = profile.level >= VERIFICATION_CRITERIA.minLevel
        && followerCount >= VERIFICATION_CRITERIA.minFollowers
        && profile.currentStreak >= VERIFICATION_CRITERIA.minStreak
        && postCount >= VERIFICATION_CRITERIA.minPosts;

      return NextResponse.json({
        eligible,
        criteria: {
          level: { current: profile.level, required: VERIFICATION_CRITERIA.minLevel, met: profile.level >= VERIFICATION_CRITERIA.minLevel },
          followers: { current: followerCount, required: VERIFICATION_CRITERIA.minFollowers, met: followerCount >= VERIFICATION_CRITERIA.minFollowers },
          streak: { current: profile.currentStreak, required: VERIFICATION_CRITERIA.minStreak, met: profile.currentStreak >= VERIFICATION_CRITERIA.minStreak },
          posts: { current: postCount, required: VERIFICATION_CRITERIA.minPosts, met: postCount >= VERIFICATION_CRITERIA.minPosts },
        },
      });
    }

    // Admin: list pending verification requests
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    if (action === 'pending') {
      const pending = await db.verification.findMany({
        where: { status: 'pending' },
        include: { user: { select: { id: true, username: true, email: true, profile: { select: { name: true, level: true, currentStreak: true, verified: true } } } } },
        orderBy: { createdAt: 'desc' },
      });
      return NextResponse.json({ requests: pending });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Verify GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // User applying for verification
    if (action === 'apply') {
      const userId = await getUserId();
      const profile = await db.profile.findUnique({ where: { userId } });
      if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
      if (profile.verified) return NextResponse.json({ error: 'Already verified' }, { status: 400 });

      // Check if already applied
      const existing = await db.verification.findFirst({
        where: { userId, status: 'pending' },
      });
      if (existing) return NextResponse.json({ error: 'Application already pending' }, { status: 400 });

      // Check criteria
      const followerCount = await db.follow.count({ where: { followingId: userId, status: 'accepted' } });
      const postCount = await db.post.count({ where: { userId } });
      const eligible = profile.level >= VERIFICATION_CRITERIA.minLevel
        && followerCount >= VERIFICATION_CRITERIA.minFollowers
        && profile.currentStreak >= VERIFICATION_CRITERIA.minStreak
        && postCount >= VERIFICATION_CRITERIA.minPosts;

      // Create verification request
      await db.verification.create({
        data: {
          userId,
          type: 'identity',
          status: 'pending',
          notes: `Auto-application. Level: ${profile.level}, Followers: ${followerCount}, Streak: ${profile.currentStreak}, Posts: ${postCount}`,
        },
      });

      // If eligible, grant temporary badge
      let temporaryBadge = false;
      if (eligible && !profile.verified) {
        await db.profile.update({
          where: { userId },
          data: { tempVerified: true } as any,
        });
        temporaryBadge = true;
      }

      return NextResponse.json({ success: true, eligible, temporaryBadge });
    }

    // Admin: approve or deny verification
    const adminCheck = await requireAdmin();
    if ('error' in adminCheck) return NextResponse.json({ error: adminCheck.error!.message }, { status: adminCheck.error!.status });

    const { verificationId, decision, adminNote } = body;
    if (!verificationId || !decision) {
      return NextResponse.json({ error: 'verificationId and decision required' }, { status: 400 });
    }

    const verification = await db.verification.findUnique({ where: { id: verificationId } });
    if (!verification) return NextResponse.json({ error: 'Verification not found' }, { status: 404 });

    if (decision === 'approve') {
      await db.$transaction([
        db.verification.update({
          where: { id: verificationId },
          data: { status: 'approved', verifiedBy: adminCheck.data.session.user.id, notes: adminNote || verification.notes },
        }),
        db.profile.update({
          where: { userId: verification.userId },
          data: { verified: true, tempVerified: false } as any,
        }),
      ]);

      // Notify user
      await db.notification.create({
        data: {
          userId: verification.userId,
          type: 'verification',
          message: 'Congratulations! Your account has been verified! 🎉',
        },
      });

      await logAudit(adminCheck.data.session.user.id, 'verify_user', verification.userId, { decision: 'approved' });
    } else {
      await db.$transaction([
        db.verification.update({
          where: { id: verificationId },
          data: { status: 'rejected', verifiedBy: adminCheck.data.session.user.id, notes: adminNote || verification.notes },
        }),
        db.profile.update({
          where: { userId: verification.userId },
          data: { tempVerified: false } as any,
        }),
      ]);

      await db.notification.create({
        data: {
          userId: verification.userId,
          type: 'verification',
          message: 'Your verification application was not approved. Keep growing and try again!',
        },
      });

      await logAudit(adminCheck.data.session.user.id, 'deny_verification', verification.userId, { decision: 'rejected' });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verify POST error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
