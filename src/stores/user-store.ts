import { create } from 'zustand';

export interface UserProfile {
  id: string;
  userId: string;
  name: string;
  username: string;
  avatarUrl: string | null;
  bio: string | null;
  phone: string | null;
  email: string | null;
  activePhases: string[];
  phaseActivityMap: Record<string, { activities: string[]; metadata: Record<string, Record<string, string>> }>;
  onboardingComplete: boolean;
  xp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  region: string | null;
  accessStatus: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  verified: boolean;
  tempVerified: boolean;
  shareAchievements: boolean;
  shareFitnessProgress: boolean;
  shareContentStatus: boolean;
  shareLearningProgress: boolean;
  isPublic: boolean;
  category: string | null;
  followerCount: number;
  followingCount: number;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
  setUser: (data: any) => void;
  clearUser: () => void;
  fetchProfile: () => Promise<void>;
  addXp: (amount: number) => void;
  setLevel: (level: number) => void;
  setStreak: (current: number, longest: number) => void;
}

function safeParseJson<T>(val: any, fallback: T): T {
  if (!val) return fallback;
  if (typeof val !== 'string') {
    // If it's already the target type, return it
    if (Array.isArray(fallback) && Array.isArray(val)) return val as T;
    return val as T;
  }
  try {
    const parsed = JSON.parse(val);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    return parsed;
  } catch {
    return fallback;
  }
}

function ensureArray(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    try {
      const parsed = JSON.parse(val);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function normalizePhaseActivityMap(raw: any): Record<string, { activities: string[]; metadata: Record<string, Record<string, string>> }> {
  const parsed = safeParseJson<Record<string, any>>(raw, {});
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
  const result: Record<string, { activities: string[]; metadata: Record<string, Record<string, string>> }> = {};
  for (const [phase, value] of Object.entries(parsed)) {
    if (Array.isArray(value)) {
      result[phase] = { activities: value.filter((v: any) => typeof v === 'string'), metadata: {} };
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[phase] = {
        activities: Array.isArray((value as any).activities) ? (value as any).activities.filter((v: any) => typeof v === 'string') : [],
        metadata: (value as any).metadata && typeof (value as any).metadata === 'object' && !Array.isArray((value as any).metadata) ? (value as any).metadata : {},
      };
    }
  }
  return result;
}

function mapApiToProfile(data: any): UserProfile {
  const activePhases = ensureArray(data.activePhases);
  const phaseActivityMap = normalizePhaseActivityMap(data.phaseActivityMap);

  return {
    id: data.id || '',
    userId: data.id || '',
    name: data.name || data.username || 'User',
    username: data.username || '',
    avatarUrl: data.avatarUrl || null,
    bio: data.bio || null,
    phone: data.phone || null,
    email: data.email || null,
    activePhases,
    phaseActivityMap,
    onboardingComplete: !!data.onboardingComplete,
    xp: typeof data.xp === 'number' ? Math.max(0, data.xp) : 0,
    level: typeof data.level === 'number' ? data.level : 1,
    currentStreak: typeof data.currentStreak === 'number' ? data.currentStreak : 0,
    longestStreak: typeof data.longestStreak === 'number' ? data.longestStreak : 0,
    lastActiveDate: data.lastActiveDate || null,
    region: data.region || null,
    accessStatus: data.accessStatus || 'active',
    isAdmin: typeof data.isAdmin === 'boolean' ? data.isAdmin : data.role === 'admin' || data.role === 'super-admin',
    isSuperAdmin: typeof data.isSuperAdmin === 'boolean' ? data.isSuperAdmin : data.role === 'super-admin',
    verified: !!data.verified,
    tempVerified: !!data.tempVerified,
    shareAchievements: !!data.shareAchievements,
    shareFitnessProgress: !!data.shareFitnessProgress,
    shareContentStatus: !!data.shareContentStatus,
    shareLearningProgress: !!data.shareLearningProgress,
    isPublic: data.isPublic !== undefined ? !!data.isPublic : true,
    category: data.category || null,
    followerCount: typeof data.followerCount === 'number' ? data.followerCount : 0,
    followingCount: typeof data.followingCount === 'number' ? data.followingCount : 0,
  };
}

export const useUserStore = create<UserState>((set, get) => ({
  profile: null,
  loading: true,

  setUser: (data: any) => {
    try {
      const newProfile = mapApiToProfile(data);
      // No merge protection needed — server counts are authoritative
      // Previous Math.max merge strategy prevented legitimate decreases after unfollow
      set((state) => {
        if (!state.profile) return { profile: newProfile, loading: false };
        return { profile: newProfile, loading: false };
      });
    } catch {
      set({ loading: false });
    }
  },

  clearUser: () => {
    set({ profile: null, loading: false });
  },

  fetchProfile: async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (res.ok) {
        const data = await res.json();
        try {
          const newProfile = mapApiToProfile(data);
          // Server counts are authoritative — no merge protection
          // Previous Math.max strategy prevented legitimate decreases after unfollow
          set((state) => {
            if (!state.profile) return { profile: newProfile, loading: false };
            return { profile: newProfile, loading: false };
          });
        } catch {
          set({ loading: false });
        }
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  addXp: (amount: number) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, xp: Math.max(0, state.profile.xp + amount) } : null,
    })),

  setLevel: (level: number) =>
    set((state) => ({
      profile: state.profile ? { ...state.profile, level } : null,
    })),

  setStreak: (current: number, longest: number) =>
    set((state) => ({
      profile: state.profile
        ? { ...state.profile, currentStreak: current, longestStreak: longest }
        : null,
    })),
}));
