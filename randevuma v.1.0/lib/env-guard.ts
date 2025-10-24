// lib/env-guard.ts
/**
 * Required environment variables for production
 * Only check in Node.js runtime (not Edge)
 */
const REQUIRED = ['DATABASE_URL', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'] as const;

/**
 * Check if all required environment variables are set
 * Throws an error with missing variable names if any are missing
 * 
 * Usage: Call this at the top of API routes that need database access
 * 
 * @throws Error if any required env vars are missing
 */
export function checkEnv(): void {
  const missing = REQUIRED.filter(key => !String(process.env[key] ?? '').trim());
  
  if (missing.length > 0) {
    throw new Error(`ENV_MISSING: Required environment variables are not set: ${missing.join(', ')}`);
  }
}

