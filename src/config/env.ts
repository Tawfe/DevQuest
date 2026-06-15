import Config from 'react-native-config';

/**
 * Resolved runtime configuration.
 *
 * `react-native-config` bakes env vars into the binary at build time. The file
 * it reads is chosen by the `ENVFILE` build setting and defaults to `.env`; if
 * that file is missing (or the build wasn't pointed at `.env.development`),
 * every `Config.*` value comes back `undefined`. The fallbacks below keep the
 * dev build working against the ngrok host in that case.
 *
 * Everything that needs the API host MUST import from here so the REST client
 * and the realtime socket can never resolve to different origins.
 */
export const API_BASE_URL =
  Config.API_BASE_URL ?? 'https://unequal-capacity-happy.ngrok-free.dev';
