import { backoffDelayMs, DEFAULT_RETRY } from '../retry';

describe('backoffDelayMs', () => {
  it('stays within the exponential ceiling per attempt', () => {
    for (let attempt = 0; attempt < 5; attempt++) {
      const ceiling = Math.min(
        DEFAULT_RETRY.maxDelayMs,
        DEFAULT_RETRY.baseDelayMs * 2 ** attempt,
      );
      for (let i = 0; i < 25; i++) {
        const delay = backoffDelayMs(attempt);
        expect(delay).toBeGreaterThanOrEqual(0);
        expect(delay).toBeLessThanOrEqual(ceiling);
      }
    }
  });

  it('never exceeds maxDelayMs even for large attempts', () => {
    for (let i = 0; i < 25; i++) {
      expect(backoffDelayMs(20)).toBeLessThanOrEqual(DEFAULT_RETRY.maxDelayMs);
    }
  });
});
