import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true, adminRole: true },
    });

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const followerCount = await db.follow.count({ where: { followingId: user.id, status: 'accepted' } });
    const followingCount = await db.follow.count({ where: { followerId: user.id, status: 'accepted' } });

    const role = user.adminRole ? (user.adminRole.isSuperAdmin ? 'super-admin' : 'admin') : 'user';

    return NextResponse.json({
      id: user.id,
      email: user.email,
      phone: user.phone,
      username: user.username,
      name: user.profile?.name || user.username,
      avatarUrl: user.profile?.avatarUrl || null,
      bio: user.profile?.bio || null,
      xp: user.profile?.xp ?? 0,
      level: user.profile?.level ?? 1,
      currentStreak: user.profile?.currentStreak || 0,
      longestStreak: user.profile?.longestStreak || 0,
      activePhases: user.profile?.activePhases || '[]',
      phaseActivityMap: user.profile?.phaseActivityMap || '{}',
      category: user.profile?.category || null,
      onboardingComplete: user.profile?.onboardingComplete || false,
      lastActiveDate: user.profile?.lastActiveDate || null,
      region: user.profile?.region || null,
      accessStatus: user.profile?.accessStatus || 'active',
      language: user.profile?.language || 'en',
      verified: user.profile?.verified || false,
      shareAchievements: user.profile?.shareAchievements || false,
      shareFitnessProgress: user.profile?.shareFitnessProgress || false,
      shareContentStatus: user.profile?.shareContentStatus || false,
      shareLearningProgress: user.profile?.shareLearningProgress || false,
      isPublic: user.profile?.isPublic !== undefined ? user.profile.isPublic : true,
      followerCount,
      followingCount,
      role,
      isAdmin: !!user.adminRole,
      isSuperAdmin: user.adminRole?.isSuperAdmin || false,
    });
  } catch (error) {
    console.error('Profile GET error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { name, bio, avatarUrl, region, language, shareAchievements, isPublic, shareFitnessProgress, shareContentStatus, shareLearningProgress, phone, currentPassword, newPassword } = body;

    if (currentPassword && newPassword) {
      const user = await db.user.findUnique({ where: { id: session.user.id } });
      if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
      const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isValid) return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
      const newHash = await bcrypt.hash(newPassword, 12);
      await db.user.update({ where: { id: session.user.id }, data: { passwordHash: newHash } });
      return NextResponse.json({ success: true, message: 'Password updated' });
    }

    const profileData: Record<string, unknown> = {};
    if (name !== undefined) profileData.name = name;
    if (bio !== undefined) profileData.bio = bio;
    if (avatarUrl !== undefined) profileData.avatarUrl = avatarUrl;
    if (region !== undefined) profileData.region = region;
    if (language !== undefined) profileData.language = language;
    if (shareAchievements !== undefined) profileData.shareAchievements = shareAchievements;
    if (isPublic !== undefined) profileData.isPublic = isPublic;
    if (shareFitnessProgress !== undefined) profileData.shareFitnessProgress = shareFitnessProgress;
    if (shareContentStatus !== undefined) profileData.shareContentStatus = shareContentStatus;
    if (shareLearningProgress !== undefined) profileData.shareLearningProgress = shareLearningProgress;

    if (Object.keys(profileData).length > 0) {
      await db.profile.upsert({
        where: { userId: session.user.id },
        update: profileData,
        create: { userId: session.user.id, ...profileData },
      });
    }

    if (phone !== undefined) {
      await db.user.update({ where: { id: session.user.id }, data: { phone } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile PATCH error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    await db.user.delete({ where: { id: session.user.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Profile DELETE error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
