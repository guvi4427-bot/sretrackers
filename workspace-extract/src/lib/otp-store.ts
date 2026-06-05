// Simple in-memory OTP store (use Redis in production)
// Using globalThis to persist across hot reloads in development
const globalForOtp = globalThis as unknown as { otpStore: Map<string, { otp: string; expires: number }> };
if (!globalForOtp.otpStore) {
  globalForOtp.otpStore = new Map<string, { otp: string; expires: number }>();
}
export const otpStore = globalForOtp.otpStore;

export async function cleanupExpiredOtps() {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expires < now) {
      otpStore.delete(key);
    }
  }
}
