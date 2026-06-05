import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      username?: string;
      isAdmin?: boolean;
      isSuperAdmin?: boolean;
    };
  }

  interface User {
    id: string;
    username?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    username?: string;
    isAdmin?: boolean;
    isSuperAdmin?: boolean;
  }
}
