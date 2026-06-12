export interface CrashReporter {
  readonly name: string;
  /** Record a handled (non-fatal) error. */
  recordError(error: unknown, context?: string): void;
  /** Breadcrumb attached to subsequent crash reports. */
  log(message: string): void;
  setUserId(id: string | null): void;
  setCollectionEnabled(enabled: boolean): void;
}
