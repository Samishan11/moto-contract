import { z } from 'zod';
import { UserPublicSchema } from './auth';
import { UnitSystem } from './common';

/**
 * Phase 2.1 — User profile (extends the auth `UserPublic` view) and 2.2 —
 * emergency contacts.
 */

export const UserProfileSchema = UserPublicSchema.extend({
  avatarUrl: z.string().nullable(), // presigned GET URL, resolved server-side
  bio: z.string().nullable(),
  phone: z.string().nullable(),
  dateOfBirth: z.string().nullable(), // ISO-8601
  location: z.string().nullable(),
  /** Reveal my phone to the other lift party while a lift is ACCEPTED (10.5). */
  shareContactOnLift: z.boolean(),
  /** ISO-4217 code for converted expense totals (10.3); null = no conversion. */
  preferredCurrency: z.string().nullable(),
  updatedAt: z.string(), // ISO-8601 UTC
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const UpdateProfileRequestSchema = z
  .object({
    displayName: z.string().min(1).max(80),
    bio: z.string().max(500).nullable(),
    phone: z.string().max(40).nullable(),
    dateOfBirth: z.string().nullable(), // ISO date string
    location: z.string().max(120).nullable(),
    shareContactOnLift: z.boolean(),
    // Settings screen (Phase 9 polish)
    locale: z.string().min(2).max(10),
    timezone: z.string().min(1).max(64), // IANA tz, e.g. "Asia/Kathmandu"
    unitSystem: UnitSystem,
    // ISO-4217; converted expense totals (10.3). Null clears it.
    preferredCurrency: z.string().regex(/^[A-Z]{3}$/).nullable(),
  })
  .partial();
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

/** Commit an uploaded avatar (objectKey from the presign step). */
export const SetAvatarRequestSchema = z.object({ objectKey: z.string().min(1) });
export type SetAvatarRequest = z.infer<typeof SetAvatarRequestSchema>;

// --- Emergency contacts (2.2) ---

export const EmergencyContactSchema = z.object({
  id: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().nullable(),
  relation: z.string(),
  priority: z.number().int(),
  createdAt: z.string(),
});
export type EmergencyContact = z.infer<typeof EmergencyContactSchema>;

export const CreateEmergencyContactSchema = z.object({
  name: z.string().min(1).max(120),
  phone: z.string().min(1).max(40),
  email: z.string().email().max(254).nullable().optional(),
  relation: z.string().min(1).max(60),
  priority: z.number().int().min(1).max(99).default(1),
});
export type CreateEmergencyContactRequest = z.infer<typeof CreateEmergencyContactSchema>;

export const UpdateEmergencyContactSchema = CreateEmergencyContactSchema.partial();
export type UpdateEmergencyContactRequest = z.infer<typeof UpdateEmergencyContactSchema>;
