/**
 * Every analytics event in the app, with its parameters. Adding an event
 * means adding it here first — screens never call a provider directly, so
 * this map is the complete, reviewable list of what the app records.
 *
 * COPPA note: parameters must never contain PII (names, emails, free text).
 */
export type AnalyticsEvents = {
  app_opened: undefined;
  sign_in_started: undefined;
  sign_in_completed: undefined;
  sign_out: undefined;
  lesson_started: { trackId: string; lessonId: string };
  lesson_completed: { trackId: string; lessonId: string; xpEarned: number };
  exercise_answered: { lessonId: string; exerciseId: string; correct: boolean };
  streak_extended: { days: number };
};

export type AnalyticsEventName = keyof AnalyticsEvents;

export interface AnalyticsProvider {
  readonly name: string;
  logEvent(
    name: string,
    params?: Record<string, string | number | boolean>,
  ): void;
  setUserId(id: string | null): void;
  setCollectionEnabled(enabled: boolean): void;
}
