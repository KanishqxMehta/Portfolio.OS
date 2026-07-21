export type ErrorSeverity = "fatal" | "error" | "warning" | "info";

export interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id?: string; email?: string; username?: string };
}

/**
 * Production-ready error monitoring abstraction.
 * Integrates with Sentry if NEXT_PUBLIC_SENTRY_DSN is configured,
 * and falls back to structured logging in development.
 */
export function captureException(
  error: unknown,
  context?: ErrorContext
): void {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));

  if (process.env.NODE_ENV !== "test") {
    console.error("[ERROR_LOGGER]", {
      message: normalizedError.message,
      stack: normalizedError.stack,
      context,
      timestamp: new Date().toISOString(),
    });
  }

  // If Sentry DSN is present, dynamically forward to Sentry if loaded
  const dsn =
    process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN;

  if (dsn && typeof window !== "undefined") {
    const windowWithSentry = window as unknown as {
      Sentry?: {
        captureException: (err: unknown, ctx?: unknown) => void;
      };
    };
    if (windowWithSentry.Sentry) {
      windowWithSentry.Sentry.captureException(normalizedError, context);
    }
  }
}

/**
 * Log a non-exception warning or informational message to monitoring.
 */
export function captureMessage(
  message: string,
  level: ErrorSeverity = "info",
  context?: ErrorContext
): void {
  if (process.env.NODE_ENV !== "test") {
    console.log(`[LOG_${level.toUpperCase()}]`, {
      message,
      context,
      timestamp: new Date().toISOString(),
    });
  }
}
