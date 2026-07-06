import { z } from 'zod';

/**
 * The "trivial endpoint" used to prove the shared-contract pipeline:
 * the API implements GET /health/ready against this schema and the
 * mobile/admin clients consume the inferred type — no duplicated types.
 */
export const ServiceStatus = z.enum(['up', 'down']);
export type ServiceStatus = z.infer<typeof ServiceStatus>;

export const HealthResponseSchema = z.object({
  status: ServiceStatus,
  uptime: z.number(), // seconds
  services: z.object({
    database: ServiceStatus,
    redis: ServiceStatus,
    storage: ServiceStatus,
  }),
  timestamp: z.string(), // ISO-8601 UTC
});
export type HealthResponse = z.infer<typeof HealthResponseSchema>;
