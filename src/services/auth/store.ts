import { create } from 'zustand';

import { STORAGE_KEYS } from '@/constants';
import { appStorage } from '@/lib/storage';
import { analytics } from '@/services/analytics';
import { crashReporter } from '@/services/crash';
import { robloxAuthService } from './robloxAuth';
import type { AuthUser } from './types';

export type AuthStatus = 'restoring' | 'signedOut' | 'signingIn' | 'signedIn';

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  /** Restore the session from secure storage at app start. */
  restore: () => Promise<void>;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

function loadCachedUser(): AuthUser | null {
  const raw = appStorage.getString(STORAGE_KEYS.authUser);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

function cacheUser(user: AuthUser | null): void {
  if (user) {
    appStorage.set(STORAGE_KEYS.authUser, JSON.stringify(user));
  } else {
    appStorage.remove(STORAGE_KEYS.authUser);
  }
}

export const useAuthStore = create<AuthState>(set => ({
  status: 'restoring',
  user: null,

  restore: async () => {
    try {
      const tokens = await robloxAuthService.getTokens();
      if (tokens) {
        set({ status: 'signedIn', user: loadCachedUser() });
        analytics.setUserId(loadCachedUser()?.id ?? null);
      } else {
        set({ status: 'signedOut', user: null });
      }
    } catch (error) {
      crashReporter.recordError(error);
      set({ status: 'signedOut', user: null });
    }
  },

  signIn: async () => {
    set({ status: 'signingIn' });
    analytics.track('sign_in_started');
    try {
      const user = await robloxAuthService.signIn();
      cacheUser(user);
      analytics.setUserId(user.id);
      analytics.track('sign_in_completed');
      set({ status: 'signedIn', user });
    } catch (error) {
      crashReporter.recordError(error);
      set({ status: 'signedOut', user: null });
      throw error;
    }
  },

  signOut: async () => {
    await robloxAuthService.signOut();
    cacheUser(null);
    analytics.setUserId(null);
    analytics.track('sign_out');
    set({ status: 'signedOut', user: null });
  },
}));
