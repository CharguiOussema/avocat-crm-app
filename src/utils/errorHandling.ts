/**
 * Error handling utilities
 * Provides centralized error message extraction and formatting
 */

/**
 * Extracts a user-friendly error message from various error types
 * @param error - The error object (can be Error, string, or unknown)
 * @param fallbackMessage - Default message if error message cannot be extracted
 * @returns A user-friendly error message string
 */
export const getErrorMessage = (
  error: unknown,
  fallbackMessage: string = "An unexpected error occurred"
): string => {
  // Handle Error instances
  if (error instanceof Error) {
    return error.message;
  }

  // Handle string errors
  if (typeof error === "string") {
    return error;
  }

  // Handle objects with message property
  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message: unknown }).message;
    if (typeof message === "string") {
      return message;
    }
  }

  // Handle axios errors with response data
  if (
    error &&
    typeof error === "object" &&
    "response" in error &&
    error.response &&
    typeof error.response === "object" &&
    "data" in error.response
  ) {
    const data = (error.response as { data: unknown }).data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message: unknown }).message;
      if (typeof message === "string") {
        return message;
      }
    }
  }

  return fallbackMessage;
};

/**
 * Logs an error to the console (development only)
 * In production, this should be replaced with a proper logging service
 * @param error - The error to log
 * @param context - Additional context about where the error occurred
 */
export const logError = (error: unknown, context?: string): void => {
  if (import.meta.env.DEV) {
    const prefix = context ? `[${context}]` : "[Error]";
    console.error(prefix, error);
  }
  // TODO: In production, send to logging service (e.g., Sentry, LogRocket)
};

/**
 * Handles API errors and returns a formatted message
 * @param error - The API error
 * @param operation - Description of the operation that failed
 * @returns Formatted error message
 */
export const handleApiError = (error: unknown, operation: string): string => {
  logError(error, operation);
  return getErrorMessage(error, `Failed to ${operation}`);
};
