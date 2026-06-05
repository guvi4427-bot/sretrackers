import { NextResponse } from "next/server";
import { otpStore } from "@/lib/otp-store";

export async function POST(req: Request) {
  try {
    const { phone } = await req.json();
    if (!phone) return NextResponse.json({ error: "Phone required" }, { status: 400 });

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(phone, { otp, expires });

    // In production, send SMS here
    console.log(`OTP for ${phone}: ${otp}`);

    return NextResponse.json({
      success: true,
      expiresIn: 600,
      devOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
