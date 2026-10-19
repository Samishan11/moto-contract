import { z } from 'zod';
import { GroupUserSummarySchema } from './group';
import { EmergencyServicesSchema } from './emergency';
import { MedicalInfoSchema } from './profile';

/**
 * Phase 7 — SOS mode. A rider triggers SOS; the server emails their emergency
 * contacts (those with an address) and alerts riders nearby or in the same live
 * ride (socket + push). Alerted riders can answer "I'm coming"; the owner sees
 * who is on the way until they resolve the event ("I'm safe").
 */

export const SosStatus = z.enum(['ACTIVE', 'RESOLVED']);
export type SosStatus = z.infer<typeof SosStatus>;

/** How the caller relates to an SOS: the rider in trouble, or a rider alerted to it. */
export const SosRole = z.enum(['OWNER', 'ALERTED']);
export type SosRole = z.infer<typeof SosRole>;

/** An emergency contact the SOS was sent to (owner only). */
export const SosContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  relation: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  /** When the alert email went out; null while sending, or when it can't be emailed. */
  notifiedAt: z.string().nullable(),
});
export type SosContact = z.infer<typeof SosContactSchema>;

/** A rider who answered "I'm coming". */
export const SosResponderSchema = z.object({
  rider: GroupUserSummarySchema,
  respondedAt: z.string(),
  /**
   * Seconds until they're likely there: straight-line distance from where they
   * responded ÷ an average riding speed, minus the time since. Null if unknown.
   */
  etaSeconds: z.number().int().nullable(),
});
export type SosResponder = z.infer<typeof SosResponderSchema>;

export const SosEventSchema = z.object({
  id: z.string(),
  /** The rider who needs help. */
  user: GroupUserSummarySchema,
  latitude: z.number(),
  longitude: z.number(),
  status: SosStatus,
  role: SosRole,
  /** Contacts the alert went to — owner only, empty for alerted riders. */
  contacts: z.array(SosContactSchema),
  /** How many riders were alerted. */
  alertedCount: z.number().int(),
  /** Riders on their way, soonest first. */
  responders: z.array(SosResponderSchema),
  /** Alerted riders: when I answered "I'm coming"; null until then (and for the owner). */
  respondedAt: z.string().nullable(),
  /** Alerted riders: my straight-line distance (m) when alerted or when I responded. */
  distanceM: z.number().nullable(),
  /** The owner's medical card — to the owner, and to alerted riders once they respond. */
  medical: MedicalInfoSchema.nullable(),
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

/** "I'm coming" — where the responder is now, for the owner's ETA. */
export const RespondSosSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});
export type RespondSosRequest = z.infer<typeof RespondSosSchema>;

export const UpdateSosSchema = z.object({
  status: z.literal('RESOLVED'),
});
export type UpdateSosRequest = z.infer<typeof UpdateSosSchema>;

// --- Socket.IO event payloads (delivered to user rooms) ---

/** Server → alerted riders: someone nearby (or in my ride) triggered SOS. */
export const SosTriggeredEventSchema = z.object({
  sosId: z.string(),
  userId: z.string(),
  lat: z.number(),
  lng: z.number(),
});
export type SosTriggeredEvent = z.infer<typeof SosTriggeredEventSchema>;

/** Server → owner + alerted riders: a rider answered "I'm coming". */
export const SosRespondedEventSchema = z.object({
  sosId: z.string(),
  riderId: z.string(),
});
export type SosRespondedEvent = z.infer<typeof SosRespondedEventSchema>;

/** Server → owner + alerted riders: the SOS was resolved; clear the alert. */
export const SosResolvedEventSchema = z.object({
  sosId: z.string(),
});
export type SosResolvedEvent = z.infer<typeof SosResolvedEventSchema>;
