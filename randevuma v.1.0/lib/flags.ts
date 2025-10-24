// lib/flags.ts
import { getPrisma } from '@/lib/prisma';

/**
 * Check if a feature flag is enabled
 * @param key - Feature flag key
 * @param fallback - Default value if flag doesn't exist
 * @returns true if enabled, false otherwise
 */
export async function isEnabled(key: string, fallback = false): Promise<boolean> {
  const prisma = await getPrisma();
  const flag = await prisma.featureFlag.findUnique({ 
    where: { key },
    select: { enabled: true }
  });
  return flag?.enabled ?? fallback;
}

/**
 * Set a feature flag value
 * @param key - Feature flag key
 * @param enabled - Whether the flag should be enabled
 * @param note - Optional note about the flag
 */
export async function setFlag(key: string, enabled: boolean, note?: string) {
  const prisma = await getPrisma();
  return await prisma.featureFlag.upsert({
    where: { key },
    update: { enabled, note, updatedAt: new Date() },
    create: { key, enabled, note, updatedAt: new Date() },
  });
}

