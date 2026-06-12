export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  /** Epoch ms when the access token expires. */
  accessTokenExpiresAt?: number;
}

export interface AuthUser {
  /** Roblox user id (the `sub` claim). */
  id: string;
  displayName?: string;
  pictureUrl?: string;
}

export interface AuthService {
  /** Run the interactive sign-in flow. */
  signIn(): Promise<AuthUser>;
  /** Revoke tokens (best effort) and clear local credentials. */
  signOut(): Promise<void>;
  /** Refresh tokens; returns the new tokens, or null if refresh failed. */
  refresh(): Promise<AuthTokens | null>;
  /** Currently stored tokens, if any. */
  getTokens(): Promise<AuthTokens | null>;
}
