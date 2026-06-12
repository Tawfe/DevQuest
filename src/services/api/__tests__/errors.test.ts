import { AxiosError, AxiosHeaders, CanceledError } from 'axios';

import { ApiError, normalizeError } from '../errors';

function axiosErrorWithStatus(status: number): AxiosError {
  const error = new AxiosError('Request failed', 'ERR_BAD_RESPONSE');
  error.response = {
    status,
    statusText: '',
    data: { message: 'boom' },
    headers: {},
    config: { headers: new AxiosHeaders() },
  };
  return error;
}

describe('normalizeError', () => {
  it('maps HTTP responses to kind=http with status and data', () => {
    const result = normalizeError(axiosErrorWithStatus(404));
    expect(result.kind).toBe('http');
    expect(result.status).toBe(404);
    expect(result.data).toEqual({ message: 'boom' });
  });

  it('maps timeouts to kind=timeout', () => {
    const error = new AxiosError('timeout exceeded', AxiosError.ECONNABORTED);
    expect(normalizeError(error).kind).toBe('timeout');
  });

  it('maps connection failures to kind=network', () => {
    const error = new AxiosError('Network Error', AxiosError.ERR_NETWORK);
    expect(normalizeError(error).kind).toBe('network');
  });

  it('maps cancellations to kind=cancelled', () => {
    expect(normalizeError(new CanceledError('cancelled')).kind).toBe(
      'cancelled',
    );
  });

  it('wraps unknown values without losing the message', () => {
    const result = normalizeError(new Error('something odd'));
    expect(result.kind).toBe('unknown');
    expect(result.message).toBe('something odd');
  });

  it('passes existing ApiErrors through untouched', () => {
    const original = new ApiError('http', 'kept', { status: 500 });
    expect(normalizeError(original)).toBe(original);
  });
});

describe('ApiError.isRetryable', () => {
  it.each([
    ['network', undefined, true],
    ['timeout', undefined, true],
    ['http', 500, true],
    ['http', 503, true],
    ['http', 404, false],
    ['http', 401, false],
    ['cancelled', undefined, false],
    ['unknown', undefined, false],
  ] as const)('kind=%s status=%s → %s', (kind, status, expected) => {
    expect(new ApiError(kind, 'test', { status }).isRetryable).toBe(expected);
  });
});
