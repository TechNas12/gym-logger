/**
 * Environment variable helper with descriptive dev-time validation errors.
 */

export function getEnvVar(name: string, fallback?: string): string {
  const value = process.env[name] || fallback;
  if (!value) {
    const errorMsg =
      `[Configuration Error]: Missing required environment variable "${name}".\n` +
      `Please ensure "${name}" is defined in your .env.local file.\n` +
      `Refer to .env.example for required variables.`;

    // Only throw in non-production or when critical for auth execution
    throw new Error(errorMsg);
  }
  return value;
}

export function getSupabaseEnv() {
  const url = getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
  const anonKey = getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  return { url, anonKey };
}
