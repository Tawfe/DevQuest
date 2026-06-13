import {
  authorize,
  refresh as appAuthRefresh,
  revoke,
  type AuthConfiguration,
} from 'react-native-app-auth';
import Config from 'react-native-config';

import { decodeJwtPayload } from './jwt';
import { clearTokens, loadTokens, saveTokens } from './tokenStorage';
import type { AuthService, AuthTokens, AuthUser } from './types';

/**
 * Roblox OAuth 2.0 — Authorization Code + PKCE (public client, no secret).
 *
 * NOT LIVE YET: the app must be registered at
 * https://create.roblox.com/dashboard/credentials and pass Roblox's app
 * review before sign-in works for anyone other than the app owner's test
 * account. Until then ROBLOX_CLIENT_ID in the .env files is a placeholder.
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
};

export function userFromIdToken(idToken: string | undefined): AuthUser | null {
  if (!idToken) {
    return null;
  }
  const payload = decodeJwtPayload(idToken);
  if (!payload || typeof payload.sub !== 'string') {
    return null;
  }
  return {
    id: payload.sub,
    displayName:
      typeof payload.nickname === 'string'
        ? payload.nickname
        : typeof payload.name === 'string'
        ? payload.name
        : undefined,
    pictureUrl:
      typeof payload.picture === 'string' ? payload.picture : undefined,
  };
}

async function signIn(): Promise<AuthUser> {
  const result = await authorize(oauthConfig);
  const tokens: AuthTokens = {
    accessToken: result.accessToken,
    refreshToken: result.refreshToken || undefined,
    idToken: result.idToken || undefined,
    accessTokenExpiresAt: result.accessTokenExpirationDate
      ? new Date(result.accessTokenExpirationDate).getTime()
      : undefined,
  };
  await saveTokens(tokens);

  const user = userFromIdToken(tokens.idToken);
  if (!user) {
    throw new Error('Roblox sign-in succeeded but the ID token had no subject');
  }
  return user;
}

async function refresh(): Promise<AuthTokens | null> {
  const current = await loadTokens();
  if (!current?.refreshToken) {
    return null;
  }
  try {
    const result = await appAuthRefresh(oauthConfig, {
      refreshToken: current.refreshToken,
    });
    const tokens: AuthTokens = {
      accessToken: result.accessToken,
      // Roblox rotates refresh tokens; keep the new one when present.
      refreshToken: result.refreshToken ?? current.refreshToken,
      idToken: result.idToken || current.idToken,
      accessTokenExpiresAt: result.accessTokenExpirationDate
        ? new Date(result.accessTokenExpirationDate).getTime()
        : undefined,
    };
    await saveTokens(tokens);
    return tokens;
  } catch {
    // Refresh token expired or revoked — force a fresh sign-in.
    await clearTokens();
    return null;
  }
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
