import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const SUPER_ADMIN_EMAIL = "myselfgowtham140707@gmail.com";

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;

  const adminRole = await db.adminRole.findUnique({
    where: { userId: session.user.id },
  });

  if (!adminRole) return null;

  return {
    session,
    adminRole,
    isSuperAdmin: adminRole.isSuperAdmin || adminRole.email === SUPER_ADMIN_EMAIL,
  };
}

export type AdminSession = NonNullable<Awaited<ReturnType<typeof getAdminSession>>>;

export async function requireAdmin(): Promise<
  | { error: { status: number; message: string }; data?: undefined }
  | { data: AdminSession; error?: undefined }
> {
  const result = await getAdminSession();
  if (!result) {
    return { error: { status: 401, message: "Unauthorized - Admin access required" } };
  }
  return { data: result };
}

export async function logAudit(adminId: string, action: string, targetUserId?: string, details?: Record<string, unknown>) {
  await db.auditLog.create({
    data: {
      adminId,
      action,
      targetUserId: targetUserId || null,
      details: details ? JSON.stringify(details) : null,
    },
  });
}

export { SUPER_ADMIN_EMAIL };
