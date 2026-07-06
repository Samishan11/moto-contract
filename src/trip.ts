import { z } from 'zod';
import { GroupUserSummarySchema } from './group';

/**
 * Phase 5 — Trip planning & voting: trips, ordered stops (rendered on MapLibre),
 * RSVP/attendance, and polls with single/multiple choice + anonymous masking.
 */

export const RsvpStatus = z.enum(['PENDING', 'GOING', 'NOT_GOING', 'MAYBE']);
export type RsvpStatus = z.infer<typeof RsvpStatus>;

export const PollType = z.enum(['SINGLE', 'MULTIPLE']);
export type PollType = z.infer<typeof PollType>;

// --- Stops ---

export const TripStopSchema = z.object({
  id: z.string(),
  order: z.number().int(),
  name: z.string(),
  category: z.string().nullable(),
  latitude: z.number(),
  longitude: z.number(),
  eta: z.number().int().nullable(), // minutes from start
  notes: z.string().nullable(),
});
export type TripStop = z.infer<typeof TripStopSchema>;

export const CreateStopSchema = z.object({
  order: z.number().int().min(0),
  name: z.string().min(1).max(120),
  category: z.string().max(40).nullable().optional(),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  eta: z.number().int().min(0).nullable().optional(),
  notes: z.string().max(1000).nullable().optional(),
});
export type CreateStopRequest = z.infer<typeof CreateStopSchema>;

export const UpdateStopSchema = CreateStopSchema.partial();
export type UpdateStopRequest = z.infer<typeof UpdateStopSchema>;

/** Replace a trip's entire ordered stop list in one call (route editing). */
export const ReplaceStopsSchema = z.object({
  stops: z.array(CreateStopSchema).max(100),
});
export type ReplaceStopsRequest = z.infer<typeof ReplaceStopsSchema>;

// --- Attendance ---

export const TripAttendeeSchema = z.object({
  id: z.string(),
  user: GroupUserSummarySchema,
  rsvp: RsvpStatus,
  respondedAt: z.string().nullable(),
});
export type TripAttendee = z.infer<typeof TripAttendeeSchema>;

/** Aggregate counts for the trip header. */
export const RsvpBreakdownSchema = z.object({
  going: z.number().int(),
  maybe: z.number().int(),
  notGoing: z.number().int(),
  pending: z.number().int(),
});
export type RsvpBreakdown = z.infer<typeof RsvpBreakdownSchema>;

export const RsvpRequestSchema = z.object({
  rsvp: z.enum(['GOING', 'NOT_GOING', 'MAYBE']),
});
export type RsvpRequest = z.infer<typeof RsvpRequestSchema>;

// --- Polls ---

export const PollOptionSchema = z.object({
  id: z.string(),
  text: z.string(),
  voteCount: z.number().int(),
  /** Whether the requesting user voted for this option. */
  votedByMe: z.boolean(),
});
export type PollOption = z.infer<typeof PollOptionSchema>;

export const PollSchema = z.object({
  id: z.string(),
  tripId: z.string(),
  question: z.string(),
  type: PollType,
  isAnonymous: z.boolean(),
  options: z.array(PollOptionSchema),
  totalVotes: z.number().int(),
  expiresAt: z.string().nullable(),
  closed: z.boolean(), // past expiry
  createdBy: z.string().nullable(),
  createdAt: z.string(),
});
export type Poll = z.infer<typeof PollSchema>;

/** One voter's pick, used only for non-anonymous poll results. */
export const PollVoterSchema = z.object({
  user: GroupUserSummarySchema,
  optionId: z.string(),
});
export type PollVoter = z.infer<typeof PollVoterSchema>;

export const PollResultsSchema = z.object({
  poll: PollSchema,
  /** Present only when the poll is NOT anonymous; empty otherwise. */
  voters: z.array(PollVoterSchema),
});
export type PollResults = z.infer<typeof PollResultsSchema>;

export const CreatePollSchema = z.object({
  question: z.string().min(1).max(200),
  type: PollType.optional(), // defaults SINGLE
  isAnonymous: z.boolean().optional(),
  options: z.array(z.string().min(1).max(120)).min(2).max(10),
  expiresAt: z.string().nullable().optional(),
});
export type CreatePollRequest = z.infer<typeof CreatePollSchema>;

export const VoteRequestSchema = z.object({
  optionIds: z.array(z.string().min(1)).min(1).max(10),
});
export type VoteRequest = z.infer<typeof VoteRequestSchema>;

/** Socket.IO `poll:updated` payload — broadcast to the trip's group room. */
export const PollUpdatedEventSchema = z.object({
  groupId: z.string(),
  tripId: z.string(),
  poll: PollSchema,
});
export type PollUpdatedEvent = z.infer<typeof PollUpdatedEventSchema>;

// --- Trips ---

export const TripSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  scheduledAt: z.string(), // ISO-8601 UTC
  location: z.string().nullable(),
  createdBy: z.string().nullable(),
  stopCount: z.number().int(),
  rsvp: RsvpBreakdownSchema,
  /** The requesting user's own RSVP, or null if they haven't responded. */
  myRsvp: RsvpStatus.nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Trip = z.infer<typeof TripSchema>;

/** Trip detail bundles stops (ordered), attendees, and polls. */
export const TripDetailSchema = TripSchema.extend({
  stops: z.array(TripStopSchema),
  attendees: z.array(TripAttendeeSchema),
  polls: z.array(PollSchema),
});
export type TripDetail = z.infer<typeof TripDetailSchema>;

export const CreateTripSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000).nullable().optional(),
  location: z.string().max(120).nullable().optional(),
  scheduledAt: z.string(), // ISO-8601
  stops: z.array(CreateStopSchema).max(100).optional(),
});
export type CreateTripRequest = z.infer<typeof CreateTripSchema>;

export const UpdateTripSchema = z.object({
  title: z.string().min(1).max(160),
  description: z.string().max(2000).nullable(),
  location: z.string().max(120).nullable(),
  scheduledAt: z.string(),
}).partial();
export type UpdateTripRequest = z.infer<typeof UpdateTripSchema>;
