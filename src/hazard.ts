import { z } from 'zod';

/**
 * Phase 7 — Hazard reporting. A rider drops a hazard (accident, police, animal,
 * weather…) at a location; it's visible to riders within `radius` until it
 * expires. The server fans `hazard:new` / `hazard:expired` to riders on the map,
 * who filter by their own distance.
 */

export const HazardType = z.enum([
  'ACCIDENT',
  'CONSTRUCTION',
  'POLICE',
  'ANIMAL',
  'WEATHER',
  'OBSTACLE',
  'FUEL',
  'OTHER',
]);
export type HazardType = z.infer<typeof HazardType>;

export const HazardSchema = z.object({
  id: z.string(),
  type: HazardType,
  latitude: z.number(),
  longitude: z.number(),
  radius: z.number(), // meters
  description: z.string().nullable(),
  /** Presigned GET URL for the hazard photo, resolved server-side. */
  photoUrl: z.string().nullable(),
  /** Reporter id, or null if the reporter's account was removed. */
  reportedById: z.string().nullable(),
  /** Meters from the query point, present on nearby responses. */
  distanceM: z.number().optional(),
  expiresAt: z.string(),
  createdAt: z.string(),
});
export type Hazard = z.infer<typeof HazardSchema>;

export const CreateHazardSchema = z.object({
  type: HazardType,
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().min(50).max(5000).optional(), // default 500 server-side
  description: z.string().max(280).nullable().optional(),
  /** MinIO object key from a prior upload, if a photo was attached. */
  photo: z.string().nullable().optional(),
  /** Override expiry; defaults to now + 24h server-side. */
  expiresAt: z.string().datetime().optional(),
});
export type CreateHazardRequest = z.infer<typeof CreateHazardSchema>;

export const UpdateHazardSchema = z.object({
  expiresAt: z.string().datetime(),
});
export type UpdateHazardRequest = z.infer<typeof UpdateHazardSchema>;

// --- Socket.IO event payloads ---

/** Server → riders on the map: a new hazard was reported nearby. */
export const HazardNewEventSchema = z.object({
  hazardId: z.string(),
  type: HazardType,
  lat: z.number(),
  lng: z.number(),
  radius: z.number(),
});
export type HazardNewEvent = z.infer<typeof HazardNewEventSchema>;

/** Server → riders on the map: remove an expired/deleted hazard. */
export const HazardExpiredEventSchema = z.object({
  hazardId: z.string(),
});
export type HazardExpiredEvent = z.infer<typeof HazardExpiredEventSchema>;
