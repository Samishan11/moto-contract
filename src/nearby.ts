import { z } from 'zod';
import { GroupUserSummarySchema } from './group';

/**
 * Global nearby riders (RIDE tab). Presence is EPHEMERAL: while the nearby map
 * is open the client pings `presence:location`; the server keeps only a Redis
 * geo-index entry (no DB rows) and fans `presence:update` out to the rider's
 * group rooms. Visibility is mutual-group only, by construction: you only sit
 * in rooms for groups you belong to, and the snapshot endpoint applies the same
 * filter. Entries expire server-side when pings stop.
 */

export const NearbyRiderSchema = z.object({
  user: GroupUserSummarySchema,
  lat: z.number(),
  lng: z.number(),
  heading: z.number().nullable(),
  speed: z.number().nullable(),
  distanceM: z.number(),
  /** ISO timestamp of the rider's last presence ping. */
  lastSeen: z.string(),
});
export type NearbyRider = z.infer<typeof NearbyRiderSchema>;

// --- Socket.IO event payloads ---

/** Client → server: my position while the nearby map is open (every ~4s). */
export const PresenceLocationEventSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  heading: z.number().nullable().optional(),
  speed: z.number().nullable().optional(),
});
export type PresenceLocationEvent = z.infer<typeof PresenceLocationEventSchema>;

/** Server → mutual-group rooms: a rider moved. */
export const PresenceUpdateEventSchema = z.object({
  userId: z.string(),
  lat: z.number(),
  lng: z.number(),
  heading: z.number().nullable(),
  speed: z.number().nullable(),
  at: z.string(),
});
export type PresenceUpdateEvent = z.infer<typeof PresenceUpdateEventSchema>;

/** Server → mutual-group rooms: a rider went off the map (closed it). */
export const PresenceStopEventSchema = z.object({
  userId: z.string(),
});
export type PresenceStopEvent = z.infer<typeof PresenceStopEventSchema>;
