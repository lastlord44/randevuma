// lib/db-filters.ts
// Helper filters for common queries

/**
 * Filter for active records (not soft-deleted)
 * Usage: prisma.staff.findMany({ where: { businessId, ...activeOnly } })
 */
export const activeOnly = { deletedAt: null as null };

