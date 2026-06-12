export type PushProviderName = 'fcm' | 'hms' | 'none';

export interface PushMessage {
  title?: string;
  body?: string;
  data?: Record<string, string>;
}

export interface PushProvider {
  readonly name: PushProviderName;
  /** Ask the OS for notification permission. Resolves to granted/denied. */
  requestPermission(): Promise<boolean>;
  /** Device push token for this provider, or null if unavailable. */
  getToken(): Promise<string | null>;
  /** Foreground message listener. Returns an unsubscribe function. */
  onMessage(listener: (message: PushMessage) => void): () => void;
  /** Token rotation listener. Returns an unsubscribe function. */
  onTokenRefresh(listener: (token: string) => void): () => void;
  deleteToken(): Promise<void>;
}
