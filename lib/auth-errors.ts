export interface AuthErrorDetails {
  message: string;
  isEmailNotConfirmed?: boolean;
  isRateLimited?: boolean;
  isInvalidCredentials?: boolean;
}

/**
 * Maps Supabase Auth errors to friendly, user-facing error messages.
 * Never leaks raw server error codes, stack traces, or whether an email exists on login.
 */
export function mapAuthError(error: unknown): AuthErrorDetails {
  if (!error) {
    return { message: 'An unknown error occurred.' };
  }

  // Real error is logged for developers and diagnostics
  console.error('[Supabase Auth Error]:', error);

  const errObj = error as {
    message?: string;
    code?: string;
    status?: number;
    name?: string;
  };

  const rawMessage = (errObj.message || '').toLowerCase();
  const code = (errObj.code || '').toLowerCase();
  const status = errObj.status || 0;
  const name = errObj.name || '';

  // 1. Network / connectivity errors
  if (
    name === 'AuthRetryableFetchError' ||
    rawMessage.includes('fetch failed') ||
    rawMessage.includes('failed to fetch') ||
    rawMessage.includes('network') ||
    rawMessage.includes('connection refused')
  ) {
    return {
      message:
        'Unable to connect to the authentication service. Please check your internet connection and try again.',
    };
  }

  // 2. Rate limiting / too many requests
  if (
    status === 429 ||
    code === 'over_request_rate_limit' ||
    code === 'over_email_send_rate_limit' ||
    code.includes('rate_limit') ||
    rawMessage.includes('rate limit') ||
    rawMessage.includes('too many requests')
  ) {
    return {
      message:
        'Too many attempts in a short period. Please wait a few moments before trying again.',
      isRateLimited: true,
    };
  }

  // 3. Email not confirmed
  if (
    code === 'email_not_confirmed' ||
    rawMessage.includes('email not confirmed') ||
    rawMessage.includes('not confirmed')
  ) {
    return {
      message:
        'Your email address has not been confirmed yet. Please check your inbox or request a new confirmation link below.',
      isEmailNotConfirmed: true,
    };
  }

  // 4. Invalid credentials (must not reveal whether email exists)
  if (
    code === 'invalid_credentials' ||
    code === 'invalid_grant' ||
    rawMessage.includes('invalid login credentials') ||
    rawMessage.includes('invalid credentials')
  ) {
    return {
      message: 'Invalid email or password. Please verify your credentials and try again.',
      isInvalidCredentials: true,
    };
  }

  // 5. Email already registered (signup)
  if (
    code === 'user_already_exists' ||
    rawMessage.includes('user already registered') ||
    rawMessage.includes('already registered') ||
    rawMessage.includes('already exists')
  ) {
    return {
      message: 'An account with this email address already exists. Please log in instead.',
    };
  }

  // 6. Weak or leaked password
  if (
    code === 'weak_password' ||
    rawMessage.includes('pwned') ||
    rawMessage.includes('weak') ||
    rawMessage.includes('password should be') ||
    rawMessage.includes('compromised')
  ) {
    return {
      message:
        'The password chosen is too common, weak, or has appeared in a known data breach. Please choose a stronger password.',
    };
  }

  // 7. User banned or disabled
  if (
    code === 'user_banned' ||
    code === 'user_disabled' ||
    rawMessage.includes('banned') ||
    rawMessage.includes('disabled') ||
    rawMessage.includes('suspended')
  ) {
    return {
      message: 'This account has been disabled or suspended. Please contact support for assistance.',
    };
  }

  // 8. Expired or invalid session / token
  if (
    code === 'session_expired' ||
    code === 'bad_jwt' ||
    code === 'token_expired' ||
    rawMessage.includes('session expired') ||
    rawMessage.includes('jwt expired') ||
    rawMessage.includes('invalid token')
  ) {
    return {
      message: 'Your session has expired or is invalid. Please log in again.',
    };
  }

  // 9. Generic fallback for unexpected errors
  return {
    message: 'An unexpected authentication error occurred. Please try again later.',
  };
}
