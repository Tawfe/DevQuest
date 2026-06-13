import { apiClient } from './client';

export interface RobloxAuthRequest {
  /** Authorization code from the Roblox OAuth redirect. */
  code: string;
  /** PKCE code verifier generated before the OAuth flow. */
  codeVerifier: string;
  /** Redirect URI used when opening the Roblox auth page. */
  redirectUri: string;
}

export interface RobloxAuthResponse {
  robloxId: string;
  /** Backend-issued bearer token for all authenticated requests. */
  accessToken: string;
}

/**
 * Exchanges a Roblox authorization code for a DevQuest backend session.
 * Handles both sign up and sign in — the backend creates the account if it
 * doesn't exist. The returned accessToken is the one used as the Bearer
 * token for every other API call (NOT the raw Roblox token).
 */
export async function exchangeRobloxCode(
  body: RobloxAuthRequest,
): Promise<RobloxAuthResponse> {
  const { data } = await apiClient.post<RobloxAuthResponse>(
    '/auth/roblox',
    body,
  );
  return data;
}
