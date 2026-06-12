import axios, { AxiosError } from 'axios';
import Config from 'react-native-config';

import { normalizeError } from './errors';
import { attachRetry } from './retry';

export const API_TIMEOUT_MS = 15_000;

/**
 * Supplies access tokens to the API layer without coupling it to a specific
 * auth implementation. The auth service registers itself at app start
 * (see `registerAuthWithApi` in `@/services/auth`).
 */
export interface TokenProvider {
  getAccessToken(): Promise<string | null>;
  /** Refresh and return the new access token, or null if refresh failed. */
  refreshAccessToken(): Promise<string | null>;
}

let tokenProvider: TokenProvider | null = null;

export function setTokenProvider(provider: TokenProvider | null): void {
  tokenProvider = provider;
}

export const apiClient = axios.create({
  baseURL: Config.API_BASE_URL ?? 'https://api.dev.devquest.example',
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the bearer token when one is available.
apiClient.interceptors.request.use(async config => {
  if (tokenProvider && !config.headers.Authorization) {
    const token = await tokenProvider.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 401 → refresh once (single-flight) and replay the original request.
let refreshInFlight: Promise<string | null> | null = null;

type ReplayableConfig = NonNullable<AxiosError['config']> & {
  _didRefresh?: boolean;
};

apiClient.interceptors.response.use(undefined, async (error: unknown) => {
  const axiosError = error instanceof AxiosError ? error : null;
  const config = axiosError?.config as ReplayableConfig | undefined;

  if (
    axiosError?.response?.status === 401 &&
    config &&
    !config._didRefresh &&
    tokenProvider
  ) {
    refreshInFlight ??= tokenProvider.refreshAccessToken().finally(() => {
      refreshInFlight = null;
    });
    const newToken = await refreshInFlight;
    if (newToken) {
      config._didRefresh = true;
      config.headers.Authorization = `Bearer ${newToken}`;
      return apiClient.request(config);
    }
  }
  throw normalizeError(error);
});

// Backoff retry for idempotent requests. Registered after the auth
// interceptor so retries happen first and 401 handling sees final failures.
attachRetry(apiClient);
