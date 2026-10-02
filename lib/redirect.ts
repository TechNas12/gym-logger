/**
 * Open-redirect protection utility.
 * Ensures the `next` query parameter only navigates to safe, internal relative application paths.
 */

export function getSafeRedirectUrl(
  nextParam: string | null | undefined,
  fallback = '/dashboard'
): string {
  if (!nextParam || typeof nextParam !== 'string') {
    return fallback;
  }

  const trimmed = nextParam.trim();

  // Must begin with a single slash
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return fallback;
  }

  // Prevent backslash evasion and scheme tricks (e.g. javascript:, data:, https:)
  if (trimmed.includes('\\') || trimmed.includes(':')) {
    return fallback;
  }

  try {
    // Validate with URL parser against dummy localhost origin
    const parsed = new URL(trimmed, 'http://localhost');
    if (parsed.origin !== 'http://localhost') {
      return fallback;
    }

    // Keep pathname and search query if safe
    return parsed.pathname + parsed.search;
  } catch {
    return fallback;
  }
}
