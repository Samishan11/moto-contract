import { z } from 'zod';
import { GroupUserSummarySchema } from './group';

/**
 * Lifts — peer ride requests. A rider without a bike asks for a lift from their
 * current location to a destination; the request fans out to nearby mutual-group
 * members, and the first to accept becomes the driver (first-accept-wins).
 */

export const LiftStatus = z.enum(['OPEN', 'ACCEPTED', 'CANCELLED', 'COMPLETED']);
export type LiftStatus = z.infer<typeof LiftStatus>;

/**
 * A lift party as the *other* party sees them. `phone` is present only while
 * the lift is ACCEPTED, only for the two parties, and only if its owner's
 * `shareContactOnLift` is true (Phase 10.5 contact reveal).
 */
export const LiftPartySchema = GroupUserSummarySchema.extend({
  phone: z.string().nullable().optional(),
});
export type LiftParty = z.infer<typeof LiftPartySchema>;

export const LiftRequestSchema = z.object({
  id: z.string(),
  requester: LiftPartySchema,
  accepter: LiftPartySchema.nullable(),
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

// --- Lift chat (Phase 10.5) ---
// A temporary 2-party channel between requester and driver: writable while the
// lift is ACCEPTED, readable after it closes.

export const LiftMessageSchema = z.object({
  id: z.string(),
  liftId: z.string(),
  author: GroupUserSummarySchema,
  content: z.string(),
  createdAt: z.string(),
});
export type LiftMessage = z.infer<typeof LiftMessageSchema>;

export const SendLiftMessageSchema = z.object({
  content: z.string().min(1).max(1000),
});
export type SendLiftMessageRequest = z.infer<typeof SendLiftMessageSchema>;

/** Server → both parties' user rooms: a new lift chat message. */
export type LiftMessageEvent = LiftMessage;
