import { z } from 'zod';

/**
 * Phase 3 — Groups, role-based access control (RBAC), join requests,
 * invite links, and announcements.
 */

export const Role = z.enum(['OWNER', 'ADMIN', 'RIDE_LEADER', 'MODERATOR', 'MEMBER']);
export type Role = z.infer<typeof Role>;

export const GroupVisibility = z.enum(['PUBLIC', 'PRIVATE']);
export type GroupVisibility = z.infer<typeof GroupVisibility>;

export const JoinRequestStatus = z.enum(['PENDING', 'APPROVED', 'REJECTED']);
export type JoinRequestStatus = z.infer<typeof JoinRequestStatus>;

/** Lightweight user summary embedded in member / request responses. */
export const GroupUserSummarySchema = z.object({
  id: z.string(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().nullable(), // presigned GET URL, resolved server-side
});
export type GroupUserSummary = z.infer<typeof GroupUserSummarySchema>;

/** Server → group room: a member joined or left (real-time membership sync). */
export const GroupMemberAction = z.enum(['JOINED', 'LEFT']);
export type GroupMemberAction = z.infer<typeof GroupMemberAction>;

export const GroupMemberEventSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  action: GroupMemberAction,
});
export type GroupMemberEvent = z.infer<typeof GroupMemberEventSchema>;

// --- Group ---

export const GroupSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  coverUrl: z.string().nullable(), // presigned GET URL, resolved server-side
  visibility: GroupVisibility,
  location: z.string().nullable(),
  memberCount: z.number().int(),
  /** The requesting user's role in this group, or null if not a member. */
  myRole: Role.nullable(),
  createdAt: z.string(), // ISO-8601 UTC
  updatedAt: z.string(),
});
export type Group = z.infer<typeof GroupSchema>;

/**
 * Paged group listing — filtering (search) and pagination happen server-side.
 * Ordered newest-first; `nextCursor` is the last returned group id, passed
 * back as `cursor` to fetch the next page.
 */
export const GroupPageSchema = z.object({
  groups: z.array(GroupSchema),
  nextCursor: z.string().nullable(),
});
export type GroupPage = z.infer<typeof GroupPageSchema>;

export const GroupMemberSchema = z.object({
  id: z.string(),
  user: GroupUserSummarySchema,
  role: Role,
  joinedAt: z.string(),
});
export type GroupMember = z.infer<typeof GroupMemberSchema>;

/** Group detail bundles the member list. */
export const GroupDetailSchema = GroupSchema.extend({
  members: z.array(GroupMemberSchema),
});
export type GroupDetail = z.infer<typeof GroupDetailSchema>;

export const CreateGroupSchema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(2000).nullable().optional(),
  visibility: GroupVisibility.optional(), // defaults to PUBLIC server-side
  location: z.string().max(120).nullable().optional(),
});
export type CreateGroupRequest = z.infer<typeof CreateGroupSchema>;

export const UpdateGroupSchema = CreateGroupSchema.partial();
export type UpdateGroupRequest = z.infer<typeof UpdateGroupSchema>;

/** Commit an uploaded cover image (objectKey from the presign step). */
export const SetGroupCoverSchema = z.object({ objectKey: z.string().min(1) });
export type SetGroupCoverRequest = z.infer<typeof SetGroupCoverSchema>;

// --- Members & roles ---

/** Owner cannot be assigned via this route; ownership transfer is separate. */
export const UpdateMemberRoleSchema = z.object({
  role: z.enum(['ADMIN', 'RIDE_LEADER', 'MODERATOR', 'MEMBER']),
});
export type UpdateMemberRoleRequest = z.infer<typeof UpdateMemberRoleSchema>;

// --- Join requests ---

export const JoinRequestSchema = z.object({
  id: z.string(),
  group: z.object({ id: z.string(), name: z.string() }),
  user: GroupUserSummarySchema,
  message: z.string().nullable(),
  status: JoinRequestStatus,
  createdAt: z.string(),
});
export type JoinRequestDto = z.infer<typeof JoinRequestSchema>;

export const CreateJoinRequestSchema = z.object({
  message: z.string().max(500).nullable().optional(),
});
export type CreateJoinRequestRequest = z.infer<typeof CreateJoinRequestSchema>;

export const ReviewJoinRequestSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});
export type ReviewJoinRequestRequest = z.infer<typeof ReviewJoinRequestSchema>;

// --- Invite links ---

export const GroupInviteSchema = z.object({
  id: z.string(),
  token: z.string(),
  maxUses: z.number().int().nullable(),
  usedCount: z.number().int(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});
export type GroupInvite = z.infer<typeof GroupInviteSchema>;

export const CreateInviteSchema = z.object({
  maxUses: z.number().int().min(1).max(10000).nullable().optional(),
  expiresAt: z.string().nullable().optional(), // ISO-8601
});
export type CreateInviteRequest = z.infer<typeof CreateInviteSchema>;

/**
 * What a still-usable invite token resolves to, before redeeming it — the join
 * screen shows the group and opens it after accepting. `group.myRole` is set
 * when the caller already belongs to the group (accepting would 409).
 */
export const InvitePreviewSchema = z.object({
  group: GroupSchema,
  expiresAt: z.string().nullable(),
});
export type InvitePreview = z.infer<typeof InvitePreviewSchema>;

// --- Announcements ---

export const AnnouncementSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  title: z.string(),
  content: z.string(),
  mediaUrl: z.string().nullable(), // presigned GET URL, resolved server-side
  tripLink: z.string().nullable(),
  isPinned: z.boolean(),
  createdBy: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Announcement = z.infer<typeof AnnouncementSchema>;

export const CreateAnnouncementSchema = z.object({
  title: z.string().min(1).max(160),
  content: z.string().min(1).max(5000),
  mediaKey: z.string().nullable().optional(), // objectKey from presign step
  tripLink: z.string().max(200).nullable().optional(),
  isPinned: z.boolean().optional(),
});
export type CreateAnnouncementRequest = z.infer<typeof CreateAnnouncementSchema>;

export const UpdateAnnouncementSchema = CreateAnnouncementSchema.partial();
export type UpdateAnnouncementRequest = z.infer<typeof UpdateAnnouncementSchema>;
