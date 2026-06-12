import { AxiosError, CanceledError } from 'axios';

export type ApiErrorKind =
  | 'network' // no connection / DNS / socket failure
  | 'timeout' // request exceeded its deadline
  | 'http' // server answered with a non-2xx status
  | 'cancelled' // aborted by the caller
  | 'unknown';

/**
 * Every failure leaving the API layer is an ApiError. UI code switches on
 * `kind` (and `status` for `http`) instead of poking at axios internals.
 */
export class ApiError extends Error {
  readonly kind: ApiErrorKind;
  /** HTTP status code, present when kind === 'http'. */
  readonly status?: number;
  /** Response body, when the server returned one. */
  readonly data?: unknown;
  readonly cause?: unknown;

  constructor(
    kind: ApiErrorKind,
    message: string,
    options: { status?: number; data?: unknown; cause?: unknown } = {},
  ) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = options.status;
    this.data = options.data;
    this.cause = options.cause;
  }

  /** Safe to retry: transient network conditions and 5xx responses. */
  get isRetryable(): boolean {
    if (this.kind === 'network' || this.kind === 'timeout') {
      return true;
    }
    return (
      this.kind === 'http' && this.status !== undefined && this.status >= 500
    );
  }
}

export function normalizeError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof CanceledError) {
    return new ApiError('cancelled', 'Request was cancelled', { cause: error });
  }
  if (error instanceof AxiosError) {
    if (error.response) {
      return new ApiError(
        'http',
        `Request failed with status ${error.response.status}`,
        {
          status: error.response.status,
          data: error.response.data,
          cause: error,
        },
      );
    }
    if (
      error.code === AxiosError.ECONNABORTED ||
      error.code === AxiosError.ETIMEDOUT
    ) {
      return new ApiError('timeout', 'Request timed out', { cause: error });
    }
    return new ApiError('network', 'Network request failed', { cause: error });
  }
  return new ApiError(
    'unknown',
    error instanceof Error ? error.message : 'Unknown error',
    {
      cause: error,
    },
  );
}
