import { create } from 'zustand';
import { PlanLevel } from '@/lib/pricing';

interface User {
  id: number;
  email: string;
  creditBalance: number;
  plan: PlanLevel;
  aiReadingsUsage: number;
  consultationUsage: number;
  invitationCode?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, code: string, inviteCode?: string) => Promise<void>;
  sendVerificationCode: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  redeemCode: (code: string) => Promise<{ success: boolean; pointsAdded: number; newBalance: number }>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isLoading: true,

  login: async (email, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Login failed');
    }
    
    const data = await res.json();
    set({ user: data.user });
  },

  register: async (email, password, code, inviteCode) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, code, inviteCode }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Register failed');
    }
    
    const data = await res.json();
    set({ user: data.user });
  },

  sendVerificationCode: async (email) => {
    const res = await fetch('/api/auth/send-code', {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to send verification code');
    }
  },

  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    set({ user: null });
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user });
      } else {
        set({ user: null });
      }
    } catch {
      set({ user: null });
    } finally {
      set({ isLoading: false });
    }
  },

  redeemCode: async (code) => {
    const res = await fetch('/api/redeem', {
      method: 'POST',
      body: JSON.stringify({ code }),
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Redemption failed');
    }
    
    const data = await res.json();
    
    // Update local user balance
    const currentUser = get().user;
    if (currentUser) {
        set({ user: { ...currentUser, creditBalance: data.newBalance } });
    }

    return data;
  },
}));
