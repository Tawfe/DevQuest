import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { normalizeError } from './errors';

const IDEMPOTENT_METHODS = new Set(['get', 'head', 'options']);

export interface RetryOptions {
  retries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

export const DEFAULT_RETRY: RetryOptions = {
  retries: 3,
  baseDelayMs: 300,
  maxDelayMs: 5_000,
};

/** Full-jitter exponential backoff: random(0, min(max, base * 2^attempt)). */
export function backoffDelayMs(
  attempt: number,
  options: RetryOptions = DEFAULT_RETRY,
): number {
  const ceiling = Math.min(
    options.maxDelayMs,
    options.baseDelayMs * 2 ** attempt,
  );
  return Math.floor(Math.random() * ceiling);
}

type RetryableConfig = InternalAxiosRequestConfig & { _retryAttempt?: number };

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retries idempotent requests (GET/HEAD/OPTIONS) on transient failures —
 * network errors, timeouts, and 5xx responses — with exponential backoff.
 * Mutating requests are never retried automatically: the server may have
 * already applied them.
 */
export function attachRetry(
  client: AxiosInstance,
  options: RetryOptions = DEFAULT_RETRY,
): void {
  client.interceptors.response.use(undefined, async (error: unknown) => {
    const apiError = normalizeError(error);
    const config = (error as { config?: RetryableConfig })?.config;

    if (!config || !apiError.isRetryable) {
      throw apiError;
    }
    const method = (config.method ?? 'get').toLowerCase();
    if (!IDEMPOTENT_METHODS.has(method)) {
      throw apiError;
    }
    const attempt = config._retryAttempt ?? 0;
    if (attempt >= options.retries) {
      throw apiError;
    }

    config._retryAttempt = attempt + 1;
    await sleep(backoffDelayMs(attempt, options));
    return client.request(config);
  });
}
