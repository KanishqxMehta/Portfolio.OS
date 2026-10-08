import * as Sentry from "@sentry/nextjs";

export type ErrorSeverity = "fatal" | "error" | "warning" | "info";

export interface ErrorContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  user?: { id?: string; email?: string; username?: string };
}

/**
 * Sends client-side errors to Sentry when it is configured and always emits a
 * structured console log for local development and platform log collection.
 */
export function captureException(
  error: unknown,
  context?: ErrorContext
): void {
  const normalizedError =
    error instanceof Error ? error : new Error(String(error));

  console.error("[ERROR_LOGGER]", {
    message: normalizedError.message,
    stack: normalizedError.stack,
    context,
    timestamp: new Date().toISOString(),
  });

  if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.withScope((scope) => {
      if (context?.tags) scope.setTags(context.tags);
      if (context?.extra) scope.setExtras(context.extra);

      // Do not attach email addresses here: errors should not introduce PII
      // into monitoring unless the product explicitly opts into that policy.
      if (context?.user?.id || context?.user?.username) {
        scope.setUser({
          id: context.user.id,
          username: context.user.username,
        });
      }

      Sentry.captureException(normalizedError);
    });
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
  console.log(`[LOG_${level.toUpperCase()}]`, {
    message,
    context,
    timestamp: new Date().toISOString(),
  });
}
