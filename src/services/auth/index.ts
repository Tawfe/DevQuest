import { setTokenProvider } from '@/services/api/client';
import { robloxAuthService } from './robloxAuth';

export { robloxAuthService } from './robloxAuth';
export { useAuthStore, type AuthStatus } from './store';
export type { AuthService, AuthTokens, AuthUser } from './types';

/**
 * Connects the auth service to the API layer so requests carry the bearer
 * token and 401s trigger refresh-and-replay. Call once at app start.
 */
export function registerAuthWithApi(): void {
  setTokenProvider({
    getAccessToken: async () => {
      const tokens = await robloxAuthService.getTokens();
      return tokens?.accessToken ?? null;
    },
    refreshAccessToken: async () => {
      const tokens = await robloxAuthService.refresh();
      return tokens?.accessToken ?? null;
    },
  });
}
