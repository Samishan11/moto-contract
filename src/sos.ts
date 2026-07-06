import { z } from 'zod';
import { GroupUserSummarySchema } from './group';
import { EmergencyServicesSchema } from './emergency';

/**
 * Phase 7 — SOS mode. A rider triggers SOS; the server snapshots their emergency
 * contacts (emailed) and nearby riders (pinged over Socket.IO), then streams
 * location + who's responding until the event is resolved.
 */

export const SosStatus = z.enum(['ACTIVE', 'RESOLVED']);
export type SosStatus = z.infer<typeof SosStatus>;

/** An emergency contact the SOS was dispatched to. */
export const SosContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  relation: z.string(),
  /** When the notification (email) went out, or null if not yet sent. */
  notifiedAt: z.string().nullable(),
  acknowledgedAt: z.string().nullable(),
});
export type SosContact = z.infer<typeof SosContactSchema>;

/** A nearby rider who was alerted and may be responding. */
export const SosResponderSchema = z.object({
  rider: GroupUserSummarySchema,
  respondedAt: z.string().nullable(),
  /** Straight-line ETA in seconds when known (distance ÷ avg speed). */
  etaSeconds: z.number().nullable(),
});
export type SosResponder = z.infer<typeof SosResponderSchema>;

export const SosEventSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  status: SosStatus,
  contacts: z.array(SosContactSchema),
  responders: z.array(SosResponderSchema),
  /** Local emergency numbers + facilities for the SOS location. */
  services: EmergencyServicesSchema,
  createdAt: z.string(),
  resolvedAt: z.string().nullable(),
});
export type SosEvent = z.infer<typeof SosEventSchema>;

export const TriggerSosSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type TriggerSosRequest = z.infer<typeof TriggerSosSchema>;

export const UpdateSosSchema = z.object({
  status: z.literal('RESOLVED'),
});
export type UpdateSosRequest = z.infer<typeof UpdateSosSchema>;

// --- Socket.IO event payloads ---

/** Server → nearby riders: someone triggered SOS within ~1km. */
export const SosTriggeredEventSchema = z.object({
  sosId: z.string(),
  userId: z.string().nullable(),
  lat: z.number(),
  lng: z.number(),
});
export type SosTriggeredEvent = z.infer<typeof SosTriggeredEventSchema>;

/** Server → SOS creator: a nearby rider is coming to help. */
export const SosRespondedEventSchema = z.object({
  sosId: z.string(),
  riderId: z.string(),
});
export type SosRespondedEvent = z.infer<typeof SosRespondedEventSchema>;

/** Server → all alerted: the SOS was resolved; clear the alert. */
export const SosResolvedEventSchema = z.object({
  sosId: z.string(),
});
export type SosResolvedEvent = z.infer<typeof SosResolvedEventSchema>;
