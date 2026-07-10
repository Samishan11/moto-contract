import { z } from 'zod';

/**
 * Phase 10.1 — Push notification devices. The client registers its Expo push
 * token after sign-in (POST /devices) and removes it on sign-out
 * (DELETE /devices/:token). The server fans pushes out to every registered
 * device of a user and prunes tokens Expo reports as dead.
 */

export const DevicePlatform = z.enum(['IOS', 'ANDROID']);
export type DevicePlatform = z.infer<typeof DevicePlatform>;

export const RegisterDeviceSchema = z.object({
  /** Expo push token, e.g. "ExponentPushToken[xxxxxxxx]". */
  token: z.string().min(1).max(200),
  platform: DevicePlatform,
  /** Human-readable label, e.g. "iPhone 15" — shown in a future devices screen. */
  deviceName: z.string().max(80).optional(),
});
export type RegisterDeviceRequest = z.infer<typeof RegisterDeviceSchema>;

/**
 * Payload carried in a push notification's `data` field. `url` (a `moto://`
 * deep link) is what the client opens when the notification is tapped.
 */
export const PushDataSchema = z.object({
  kind: z.string(),
  url: z.string().optional(),
});
export type PushData = z.infer<typeof PushDataSchema>;
