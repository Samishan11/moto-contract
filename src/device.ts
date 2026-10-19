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
 * Payload carried in a push notification's `data` field, one shape per `kind`.
 * The client routes a tap on the notification to the screen for its ids.
 */
export const PushDataSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('trip:reminder'), tripId: z.string() }),
  z.object({ kind: z.literal('hazard:new'), hazardId: z.string() }),
  z.object({ kind: z.literal('call:started'), groupId: z.string(), callId: z.string() }),
  z.object({ kind: z.literal('lift:accepted'), liftId: z.string() }),
  z.object({ kind: z.literal('lift:message'), liftId: z.string() }),
  z.object({ kind: z.literal('expense:settled'), expenseId: z.string(), groupId: z.string() }),
  z.object({ kind: z.literal('sos:triggered'), sosId: z.string() }),
  z.object({ kind: z.literal('sos:responded'), sosId: z.string() }),
  z.object({ kind: z.literal('sos:resolved'), sosId: z.string() }),
]);
export type PushData = z.infer<typeof PushDataSchema>;
export type PushKind = PushData['kind'];
