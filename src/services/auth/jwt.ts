/**
 * Minimal JWT payload decoding — NO signature verification. Only use this
 * to read display claims from an ID token we received directly from the
 * token endpoint over TLS. Anything security-relevant must be verified
 * server-side.
 */

const BASE64_CHARS =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/* eslint-disable no-bitwise -- byte unpacking requires bit math */
function base64Decode(input: string): string {
  // base64url → base64, with padding.
  let base64 = input.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }

  let bytes: number[] = [];
  for (let i = 0; i < base64.length; i += 4) {
    const chunk = [0, 1, 2, 3].map(offset =>
      BASE64_CHARS.indexOf(base64[i + offset]),
    );
    bytes.push((chunk[0] << 2) | (chunk[1] >> 4));
    if (chunk[2] !== -1) {
      bytes.push(((chunk[1] & 15) << 4) | (chunk[2] >> 2));
    }
    if (chunk[3] !== -1) {
      bytes.push(((chunk[2] & 3) << 6) | chunk[3]);
    }
  }
  // UTF-8 decode.
  return decodeURIComponent(
    bytes.map(byte => `%${byte.toString(16).padStart(2, '0')}`).join(''),
  );
}
/* eslint-enable no-bitwise */

export function decodeJwtPayload(
  token: string,
): Record<string, unknown> | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }
  try {
    return JSON.parse(base64Decode(parts[1])) as Record<string, unknown>;
  } catch {
    return null;
  }
}
