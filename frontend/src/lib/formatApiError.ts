/**
 * DRF validation errors come back as either {detail: string} or
 * {field: string[]} (or both mixed). Flattens either shape into one
 * human-readable string for inline display.
 */
export function formatApiError(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;

  const body = error as Record<string, unknown>;

  if (typeof body.detail === 'string') return body.detail;

  const messages = Object.values(body)
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === 'string');

  return messages.length > 0 ? messages.join(' ') : fallback;
}
