import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { db } from "./db";
import { NextRequest } from "next/server";

// Get the authenticated user's ID from the session
export async function getUserId(): Promise<string> {
  const session = await getServerSession(authOptions);
  if (session?.user?.id) {
    return session.user.id;
  }
  throw new Error("Unauthorized - No valid session");
}

// Optional: get user ID or null (doesn't throw)
export async function getUserIdOrNull(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    return session?.user?.id || null;
  } catch {
    return null;
  }
}

// Check if a request is from a guest (via x-guest header set by middleware)
// Used to enforce VIEW-ONLY access for guests at the API level
export function isGuestRequest(request: Request): boolean {
  return request.headers.get('x-guest') === 'true';
}

// Require that the request is NOT from a guest — returns an error response if it is
// Use this at the top of any API route that should be restricted from guests
export function rejectGuest(request: Request): Response | null {
  if (isGuestRequest(request)) {
    return new Response(
      JSON.stringify({ error: 'Sign in required. Create a free account to use this feature.' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  return null;
}
