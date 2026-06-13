import {
  authorize,
  revoke,
  type AuthConfiguration,
} from 'react-native-app-auth';
import Config from 'react-native-config';

import { exchangeRobloxCode } from '@/services/api/auth';
import { clearTokens, loadTokens, saveTokens } from './tokenStorage';
import type { AuthService, AuthTokens, AuthUser } from './types';

/**
 * Roblox OAuth 2.0 — Authorization Code + PKCE (public client, no secret).
 *
 * The on-device app does NOT exchange the authorization code itself. Instead
 * it runs the Roblox consent flow with `skipCodeExchange`, then hands the
 * resulting code + PKCE verifier to the DevQuest backend (`POST /auth/roblox`).
 * The backend completes the exchange with Roblox (it holds the client secret),
 * creates/looks up the user, and returns its OWN access token — that backend
 * token is what authenticates every other API call.
 *
 * The app must be registered at
 * https://create.roblox.com/dashboard/credentials with `devquest://oauth/callback`
 * as an allowed redirect URI.
 */
const oauthConfig: AuthConfiguration = {
  serviceConfiguration: {
    authorizationEndpoint: 'https://apis.roblox.com/oauth/v1/authorize',
    tokenEndpoint: 'https://apis.roblox.com/oauth/v1/token',
    revocationEndpoint: 'https://apis.roblox.com/oauth/v1/token/revoke',
  },
  clientId: Config.ROBLOX_CLIENT_ID ?? '5717850802896701234',
  redirectUrl: Config.ROBLOX_REDIRECT_URL ?? 'devquest://oauth/callback',
  scopes: ['openid', 'profile'],
  usePKCE: true,
  // Keep the authorization code unused on-device so the backend can redeem it.
  skipCodeExchange: true,
};

/** Backend access tokens last 1 hour (per the API contract). */
const ACCESS_TOKEN_TTL_MS = 60 * 60 * 1000;

async function signIn(): Promise<AuthUser> {
  const result = await authorize(oauthConfig);
  if (!result.authorizationCode || !result.codeVerifier) {
    throw new Error(
      'Roblox sign-in did not return an authorization code to exchange',
    );
  }

  const { robloxId, accessToken } = await exchangeRobloxCode({
    code: result.authorizationCode,
    codeVerifier: result.codeVerifier,
    redirectUri: oauthConfig.redirectUrl,
  });

  const tokens: AuthTokens = {
    accessToken,
    accessTokenExpiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
  };
  await saveTokens(tokens);

  return { id: robloxId };
}

async function refresh(): Promise<AuthTokens | null> {
  // The backend issues no refresh token; once the 1-hour token expires a fresh
  // authorization code (a new interactive sign-in) is required.
  await clearTokens();
  return null;
}

async function signOut(): Promise<void> {
  const current = await loadTokens();
  if (current?.refreshToken) {
    try {
      await revoke(oauthConfig, {
        tokenToRevoke: current.refreshToken,
        sendClientId: true,
      });
    } catch {
      // Best effort — local sign-out must succeed regardless.
    }
  }
  await clearTokens();
}

export const robloxAuthService: AuthService = {
  signIn,
  signOut,
  refresh,
  getTokens: loadTokens,
};
