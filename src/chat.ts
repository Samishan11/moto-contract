import { z } from 'zod';
import { GroupUserSummarySchema } from './group';

/**
 * Phase 4 — Real-time chat: messages, reactions, read receipts, replies,
 * block list, and trust/safety reports. Real-time delivery rides Socket.IO;
 * these schemas type both the REST payloads and the socket event bodies.
 */

// --- Messages ---

export const MessageReactionSchema = z.object({
  emoji: z.string(),
  count: z.number().int(),
  /** Whether the requesting user reacted with this emoji. */
  mine: z.boolean(),
});
export type MessageReactionSummary = z.infer<typeof MessageReactionSchema>;

/** A one-level reply preview (the quoted ancestor); never recurses. */
export const ReplyPreviewSchema = z.object({
  id: z.string(),
  author: GroupUserSummarySchema,
  content: z.string(),
  deleted: z.boolean(),
});
export type ReplyPreview = z.infer<typeof ReplyPreviewSchema>;

export const ChatMessageSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  author: GroupUserSummarySchema,
  content: z.string(),
  mediaUrls: z.array(z.string()), // presigned GET URLs, resolved server-side
  replyTo: ReplyPreviewSchema.nullable(),
  reactions: z.array(MessageReactionSchema),
  readCount: z.number().int(),
  /** Whether the requesting user has read this message. */
  readByMe: z.boolean(),
  isEdited: z.boolean(),
  deleted: z.boolean(), // soft-deleted tombstone
  createdAt: z.string(), // ISO-8601 UTC
  updatedAt: z.string(),
});
export type ChatMessage = z.infer<typeof ChatMessageSchema>;

/** Paged message history — newest first, cursor via the oldest returned id. */
export const MessagePageSchema = z.object({
  messages: z.array(ChatMessageSchema),
  nextCursor: z.string().nullable(), // pass as `before` to fetch older
});
export type MessagePage = z.infer<typeof MessagePageSchema>;

export const SendMessageSchema = z.object({
  content: z.string().max(4000),
  mediaKeys: z.array(z.string()).max(10).optional(), // objectKeys from presign step
  replyToId: z.string().nullable().optional(),
});
export type SendMessageRequest = z.infer<typeof SendMessageSchema>;

export const EditMessageSchema = z.object({
  content: z.string().min(1).max(4000),
});
export type EditMessageRequest = z.infer<typeof EditMessageSchema>;

// --- Reactions ---

export const AddReactionSchema = z.object({
  emoji: z.string().min(1).max(16),
});
export type AddReactionRequest = z.infer<typeof AddReactionSchema>;

// --- Block list ---

export const BlockedUserSchema = z.object({
  id: z.string(), // block-list row id
  user: GroupUserSummarySchema,
  createdAt: z.string(),
});
export type BlockedUser = z.infer<typeof BlockedUserSchema>;

export const BlockUserSchema = z.object({
  blockedUserId: z.string().min(1),
});
export type BlockUserRequest = z.infer<typeof BlockUserSchema>;

// --- Reports ---

export const ReportReason = z.enum([
  'HARASSMENT',
  'SPAM',
  'INAPPROPRIATE',
  'HATE_SPEECH',
  'OTHER',
]);
export type ReportReason = z.infer<typeof ReportReason>;

export const CreateReportSchema = z.object({
  reason: ReportReason,
  notes: z.string().max(1000).nullable().optional(),
});
export type CreateReportRequest = z.infer<typeof CreateReportSchema>;

// --- Socket.IO event payloads ---
// Event names are stable strings; keep them in sync with the gateway.

export const SocketEvents = {
  MessageNew: 'message:new',
  MessageUpdated: 'message:updated',
  MessageDeleted: 'message:deleted',
  ReactionAdded: 'reaction:added',
  ReactionRemoved: 'reaction:removed',
  MessageRead: 'message:read',
  Typing: 'typing',
  /** Client → server: ensure this socket is joined to a group's room. */
  Subscribe: 'group:subscribe',
  /** Server → clients: a poll's vote tallies changed (Phase 5). */
  PollUpdated: 'poll:updated',
  /** Server → group room: membership changed (someone joined/left). */
  GroupMembersChanged: 'group:members:changed',
  // --- Live ride (Phase 6) ---
  /** Client → server: a rider's GPS position (emitted every 3–5s). */
  RideLocation: 'ride:location',
  /** Server → group room: a rider moved. */
  RideLocationUpdate: 'ride:location:update',
  /** Server → group room: someone joined the ride. */
  RideParticipantJoined: 'ride:participant:joined',
  /** Server → group room: someone dropped out of the ride. */
  RideParticipantLeft: 'ride:participant:left',
  /** Server → group room: leader changed the ride status (paused/resumed/ended). */
  RideStatus: 'ride:status',
  // --- Safety & emergency (Phase 7) ---
  /** Client → server: join the hazard broadcast room (map/ride open). */
  HazardSubscribe: 'hazard:subscribe',
  /** Server → riders on the map: a new hazard was reported nearby. */
  HazardNew: 'hazard:new',
  /** Server → riders on the map: remove an expired/deleted hazard. */
  HazardExpired: 'hazard:expired',
  /** Server → nearby riders: someone triggered SOS within ~1km. */
  SosTriggered: 'sos:triggered',
  /** Server → SOS creator: a nearby rider is responding. */
  SosResponded: 'sos:responded',
  /** Server → all alerted: the SOS was resolved. */
  SosResolved: 'sos:resolved',
  // --- Global nearby riders (RIDE tab) ---
  /** Client → server: my position while the nearby map is open. */
  PresenceLocation: 'presence:location',
  /** Server → mutual-group rooms: a rider moved. */
  PresenceUpdate: 'presence:update',
  /** Client → server on map close; server → rooms: rider left the map. */
  PresenceStop: 'presence:stop',
  // --- Lifts (peer ride requests) ---
  /** Server → nearby mutual-group rooms: a new open lift request. */
  LiftNew: 'lift:new',
  /** Server → rooms: a lift was accepted. */
  LiftAccepted: 'lift:accepted',
  /** Server → rooms: a lift closed (cancelled/completed); remove it. */
  LiftClosed: 'lift:closed',
} as const;

export const MessageNewEventSchema = ChatMessageSchema;
export type MessageNewEvent = z.infer<typeof MessageNewEventSchema>;

export const MessageUpdatedEventSchema = z.object({
  messageId: z.string(),
  groupId: z.string(),
  content: z.string(),
  isEdited: z.boolean(),
  updatedAt: z.string(),
});
export type MessageUpdatedEvent = z.infer<typeof MessageUpdatedEventSchema>;

export const MessageDeletedEventSchema = z.object({
  messageId: z.string(),
  groupId: z.string(),
});
export type MessageDeletedEvent = z.infer<typeof MessageDeletedEventSchema>;

export const ReactionEventSchema = z.object({
  messageId: z.string(),
  groupId: z.string(),
  userId: z.string(),
  emoji: z.string(),
});
export type ReactionEvent = z.infer<typeof ReactionEventSchema>;

export const MessageReadEventSchema = z.object({
  messageId: z.string(),
  groupId: z.string(),
  userId: z.string(),
  readAt: z.string(),
});
export type MessageReadEvent = z.infer<typeof MessageReadEventSchema>;

/** Client → server: emit while the user is (or stops) typing in a group. */
export const TypingEventSchema = z.object({
  groupId: z.string(),
  isTyping: z.boolean(),
});
export type TypingEvent = z.infer<typeof TypingEventSchema>;

/** Server → clients: someone's typing state changed. */
export const TypingBroadcastSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  displayName: z.string().nullable(),
  isTyping: z.boolean(),
});
export type TypingBroadcast = z.infer<typeof TypingBroadcastSchema>;
