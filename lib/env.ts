/**
 * Environment variable helper with descriptive dev-time validation errors.
 * Note: Next.js only inlines NEXT_PUBLIC_* variables in client bundles when
 * accessed statically via direct property access (e.g., process.env.NEXT_PUBLIC_...).
 */

export function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      '[Configuration Error]: Missing required environment variable "NEXT_PUBLIC_SUPABASE_URL".\n' +
      'Please ensure "NEXT_PUBLIC_SUPABASE_URL" is defined in your .env.local file.\n' +
      'Refer to .env.example for required variables.'
    );
  }

  if (!anonKey) {
    throw new Error(
      '[Configuration Error]: Missing required environment variable "NEXT_PUBLIC_SUPABASE_ANON_KEY".\n' +
      'Please ensure "NEXT_PUBLIC_SUPABASE_ANON_KEY" is defined in your .env.local file.\n' +
      'Refer to .env.example for required variables.'
    );
  }

  return { url, anonKey };
}
