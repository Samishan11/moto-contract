import { z } from 'zod';
import { GroupUserSummarySchema } from './group';

/**
 * Phase 6 — Live ride mode: a leader starts a ride, members join, and each
 * rider broadcasts GPS every 3–5s. The server fans locations out over Socket.IO
 * to the group room. Post-ride, tracks + stats are available for playback.
 */

export const RideStatus = z.enum(['PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED']);
export type RideStatus = z.infer<typeof RideStatus>;

export const ParticipantStatus = z.enum(['WAITING', 'RIDING', 'DROPPED_OUT', 'FINISHED']);
export type ParticipantStatus = z.infer<typeof ParticipantStatus>;

// --- Participants ---

/** A participant's last broadcast position (from the persisted track). */
export const LastLocationSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  speed: z.number().nullable(),
  heading: z.number().nullable(),
  battery: z.number().nullable(),
  at: z.string(),
});
export type LastLocation = z.infer<typeof LastLocationSchema>;

export const RideParticipantSchema = z.object({
  id: z.string(),
  user: GroupUserSummarySchema,
  status: ParticipantStatus,
  isLeader: z.boolean(),
  joinedAt: z.string(),
  leftAt: z.string().nullable(),
  /** Seeds the marker for viewers who open the ride mid-way; null if never broadcast. */
  lastLocation: LastLocationSchema.nullable(),
});
export type RideParticipant = z.infer<typeof RideParticipantSchema>;

// --- Ride ---

export const RideSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  tripId: z.string().nullable(),
  title: z.string().nullable(),
  status: RideStatus,
  leaderId: z.string().nullable(),
  /** The requesting user's participant status, or null if not joined. */
  myStatus: ParticipantStatus.nullable(),
  participantCount: z.number().int(),
  startedAt: z.string().nullable(),
  pausedAt: z.string().nullable(),
  endedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Ride = z.infer<typeof RideSchema>;

/** Ride detail bundles the participant list. */
export const RideDetailSchema = RideSchema.extend({
  participants: z.array(RideParticipantSchema),
});
export type RideDetail = z.infer<typeof RideDetailSchema>;

export const StartRideSchema = z.object({
  tripId: z.string().nullable().optional(),
  title: z.string().max(160).nullable().optional(),
});
export type StartRideRequest = z.infer<typeof StartRideSchema>;

/** Leader-driven status transitions (start/pause/resume/end). */
export const UpdateRideStatusSchema = z.object({
  status: z.enum(['ACTIVE', 'PAUSED', 'COMPLETED']),
});
export type UpdateRideStatusRequest = z.infer<typeof UpdateRideStatusSchema>;

// --- Location broadcast ---

export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  speed: z.number().min(0).max(500).nullable().optional(), // kph
  heading: z.number().min(0).max(360).nullable().optional(),
  accuracy: z.number().min(0).nullable().optional(), // meters
  battery: z.number().min(0).max(100).nullable().optional(), // %
  // Phase 10.2 — GPS altitude (meters). Bounds fit terrestrial riding
  // (Dead Sea −430m … Everest 8849m) and reject barometric garbage.
  altitude: z.number().min(-500).max(9000).nullable().optional(),
});
export type LocationRequest = z.infer<typeof LocationSchema>;

// --- Track & stats (post-ride) ---

export const TrackPointSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  speed: z.number().nullable(),
  heading: z.number().nullable(),
  battery: z.number().nullable(),
  altitude: z.number().nullable(), // meters (Phase 10.2)
  timestamp: z.string(),
});
export type TrackPoint = z.infer<typeof TrackPointSchema>;

export const RideTrackSchema = z.object({
  userId: z.string(),
  points: z.array(TrackPointSchema),
});
export type RideTrack = z.infer<typeof RideTrackSchema>;

export const RideStatsSchema = z.object({
  distanceKm: z.number(),
  durationSeconds: z.number().int(),
  avgSpeedKph: z.number(),
  maxSpeedKph: z.number(),
  participantCount: z.number().int(),
  /** userId of the rider who hit the highest instantaneous speed, or null. */
  topSpeedRiderId: z.string().nullable(),
  /** Total climb in meters (leader's track), or null when no altitude data (Phase 10.2). */
  totalAscentM: z.number().nullable(),
});
export type RideStats = z.infer<typeof RideStatsSchema>;

// --- Socket.IO event payloads ---

/**
 * Client → server: emitted every 3–5s while riding. Extends the bounded
 * LocationSchema so the server can safeParse and reject out-of-range
 * coordinates instead of persisting them into the track.
 */
export const RideLocationEventSchema = LocationSchema.extend({
  rideId: z.string(),
});
export type RideLocationEvent = z.infer<typeof RideLocationEventSchema>;

/** Server → group room: a rider's position moved. */
export const RideLocationUpdateSchema = z.object({
  rideId: z.string(),
  groupId: z.string(),
  userId: z.string(),
  lat: z.number(),
  lng: z.number(),
  speed: z.number().nullable(),
  heading: z.number().nullable(),
  battery: z.number().nullable(),
  timestamp: z.string(),
});
export type RideLocationUpdate = z.infer<typeof RideLocationUpdateSchema>;

export const RideParticipantEventSchema = z.object({
  rideId: z.string(),
  groupId: z.string(),
  userId: z.string(),
});
export type RideParticipantEvent = z.infer<typeof RideParticipantEventSchema>;

export const RideStatusEventSchema = z.object({
  rideId: z.string(),
  groupId: z.string(),
  status: RideStatus,
  at: z.string(),
});
export type RideStatusEvent = z.infer<typeof RideStatusEventSchema>;
