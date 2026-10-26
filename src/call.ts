import { z } from 'zod';
import { GroupUserSummarySchema } from './group';

// --- Phase 11.1: group voice calls (WebRTC, P2P mesh) ---
// The server is signaling + state only — audio never touches it. One active
// call per group, capped at MAX_CALL_PEERS participants (mesh uplink limit).

export const MAX_CALL_PEERS = 6;

// --- Client → server ---

export const CallStartSchema = z.object({ groupId: z.string() });
export type CallStartRequest = z.infer<typeof CallStartSchema>;

export const CallJoinSchema = z.object({ callId: z.string() });
export type CallJoinRequest = z.infer<typeof CallJoinSchema>;

export const CallLeaveSchema = z.object({ callId: z.string() });
export type CallLeaveRequest = z.infer<typeof CallLeaveSchema>;

/** WebRTC signaling payload — opaque to the server, it only relays. */
export const CallSignalPayloadSchema = z.object({
  type: z.enum(['offer', 'answer', 'ice']),
  sdp: z.string().optional(),
  candidate: z.unknown().optional(),
  /** Which connection attempt this belongs to: chosen by the offerer, echoed
   * in the answer and in both sides' ICE. After a rider rejoins, it tells
   * signals for the new connection from ones for a replaced connection.
   * Optional: apps before it don't send it. */
  connection: z.string().optional(),
});
export type CallSignalPayload = z.infer<typeof CallSignalPayloadSchema>;

export const CallSignalSchema = z.object({
  callId: z.string(),
  toUserId: z.string(),
  payload: CallSignalPayloadSchema,
});
export type CallSignalRequest = z.infer<typeof CallSignalSchema>;

// --- Server → clients ---

/** Group room: a call went live. */
export const CallStartedEventSchema = z.object({
  callId: z.string(),
  groupId: z.string(),
  startedBy: GroupUserSummarySchema,
});
export type CallStartedEvent = z.infer<typeof CallStartedEventSchema>;

/** Call room: someone joined/left the mesh. */
export const CallParticipantEventSchema = z.object({
  callId: z.string(),
  user: GroupUserSummarySchema,
});
export type CallParticipantEvent = z.infer<typeof CallParticipantEventSchema>;

/** Group room: the call is over (last participant left). */
export const CallEndedEventSchema = z.object({
  callId: z.string(),
  groupId: z.string(),
});
export type CallEndedEvent = z.infer<typeof CallEndedEventSchema>;

/** Target user's room: a relayed offer/answer/ICE from a peer. */
export const CallSignalEventSchema = z.object({
  callId: z.string(),
  fromUserId: z.string(),
  payload: CallSignalPayloadSchema,
});
export type CallSignalEvent = z.infer<typeof CallSignalEventSchema>;

/** Joining socket only: who is already in the mesh — the newcomer sends each
 * of these peers an offer (deterministic initiator, no glare). */
export const CallParticipantsEventSchema = z.object({
  callId: z.string(),
  participants: z.array(GroupUserSummarySchema),
});
export type CallParticipantsEvent = z.infer<typeof CallParticipantsEventSchema>;

/** Error reply to a failed start/join/signal (emitted to the caller only). */
export const CallErrorEventSchema = z.object({
  code: z.enum([
    'CALL_FULL',
    'CALL_NOT_FOUND',
    'CALL_FORBIDDEN',
    'CALL_ALREADY_ACTIVE',
  ]),
  callId: z.string().optional(),
  groupId: z.string().optional(),
});
export type CallErrorEvent = z.infer<typeof CallErrorEventSchema>;

// --- REST ---

/** GET /groups/:id/call — the live call for the chat-screen banner, or null. */
export const ActiveCallSchema = z.object({
  callId: z.string(),
  groupId: z.string(),
  startedAt: z.string(),
  participants: z.array(GroupUserSummarySchema),
});
export type ActiveCall = z.infer<typeof ActiveCallSchema>;

/** GET /call/ice-servers — STUN always, TURN when the server has credentials. */
export const IceServerSchema = z.object({
  urls: z.union([z.string(), z.array(z.string())]),
  username: z.string().optional(),
  credential: z.string().optional(),
});
export type IceServer = z.infer<typeof IceServerSchema>;

export const IceServersResponseSchema = z.object({
  iceServers: z.array(IceServerSchema),
});
export type IceServersResponse = z.infer<typeof IceServersResponseSchema>;
