import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { otpStore } from "@/lib/otp-store";

export async function POST(req: Request) {
  try {
    const { phone, otp } = await req.json();
    if (!phone || !otp) return NextResponse.json({ error: "Phone and OTP required" }, { status: 400 });

    const stored = otpStore.get(phone);
    if (!stored) return NextResponse.json({ error: "No OTP sent to this number" }, { status: 400 });
    if (Date.now() > stored.expires) {
      otpStore.delete(phone);
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }
    if (stored.otp !== otp) return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });

    otpStore.delete(phone);

    // Find or create user
    let user = await db.user.findFirst({ where: { phone }, include: { profile: true, adminRole: true } });
    if (!user) {
      const username = `user_${phone.replace(/\+/g, '')}_${Date.now().toString(36)}`;
      const passwordHash = await bcrypt.hash(Math.random().toString(36), 10);
      user = await db.user.create({
        data: {
          email: `${phone}@phone.sre`,
          phone,
          username,
          passwordHash,
          profile: { create: { name: phone, activePhases: "[]", phaseActivityMap: "{}" } },
        },
        include: { profile: true, adminRole: true },
      });
    }

    if (user.profile?.accessStatus === 'suspended' || user.profile?.accessStatus === 'banned') {
      return NextResponse.json({ error: "Account restricted" }, { status: 403 });
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error) {
    console.error("OTP verification error:", error);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
