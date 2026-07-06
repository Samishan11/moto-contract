import { z } from 'zod';
import { GroupUserSummarySchema } from './group';

/**
 * Lifts — peer ride requests. A rider without a bike asks for a lift from their
 * current location to a destination; the request fans out to nearby mutual-group
 * members, and the first to accept becomes the driver (first-accept-wins).
 */

export const LiftStatus = z.enum(['OPEN', 'ACCEPTED', 'CANCELLED', 'COMPLETED']);
export type LiftStatus = z.infer<typeof LiftStatus>;

export const LiftRequestSchema = z.object({
  id: z.string(),
  requester: GroupUserSummarySchema,
  accepter: GroupUserSummarySchema.nullable(),
  fromLat: z.number(),
  fromLng: z.number(),
  fromLabel: z.string().nullable(),
  toLat: z.number(),
  toLng: z.number(),
  toLabel: z.string().nullable(),
  note: z.string().nullable(),
  status: LiftStatus,
  /** Meters from the query point to the pickup, on nearby responses. */
  distanceM: z.number().optional(),
  createdAt: z.string(),
  acceptedAt: z.string().nullable(),
});
export type LiftRequest = z.infer<typeof LiftRequestSchema>;

export const CreateLiftSchema = z.object({
  fromLat: z.number().min(-90).max(90),
  fromLng: z.number().min(-180).max(180),
  fromLabel: z.string().max(120).nullable().optional(),
  toLat: z.number().min(-90).max(90),
  toLng: z.number().min(-180).max(180),
  toLabel: z.string().max(120).nullable().optional(),
  note: z.string().max(280).nullable().optional(),
});
export type CreateLiftRequest = z.infer<typeof CreateLiftSchema>;

export const UpdateLiftSchema = z.object({
  status: z.enum(['CANCELLED', 'COMPLETED']),
});
export type UpdateLiftRequest = z.infer<typeof UpdateLiftSchema>;

// --- Socket.IO event payloads ---

/** Server → nearby mutual-group rooms: a new open lift request. */
export const LiftNewEventSchema = z.object({
  liftId: z.string(),
  requesterId: z.string(),
  fromLat: z.number(),
  fromLng: z.number(),
  toLat: z.number(),
  toLng: z.number(),
  toLabel: z.string().nullable(),
});
export type LiftNewEvent = z.infer<typeof LiftNewEventSchema>;

/** Server → rooms: a lift was accepted (requester learns the driver; others drop it). */
export const LiftAcceptedEventSchema = z.object({
  liftId: z.string(),
  accepterId: z.string(),
  requesterId: z.string(),
});
export type LiftAcceptedEvent = z.infer<typeof LiftAcceptedEventSchema>;

/** Server → rooms: a lift closed (cancelled/completed); remove it. */
export const LiftClosedEventSchema = z.object({
  liftId: z.string(),
  status: LiftStatus,
});
export type LiftClosedEvent = z.infer<typeof LiftClosedEventSchema>;
