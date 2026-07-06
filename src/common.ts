import { z } from 'zod';

/**
 * Shared primitives + the canonical error envelope.
 * Every API error returns this shape so clients can switch on `code`
 * and resolve a localized message from `messageKey` (i18n).
 */
export const ErrorResponseSchema = z.object({
  code: z.string(), // e.g. AUTH_INVALID_CREDENTIALS
  messageKey: z.string(), // e.g. errors.auth.invalidCredentials
  message: z.string().optional(), // human-readable fallback (English)
  details: z.record(z.unknown()).optional(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;

export const UnitSystem = z.enum(['METRIC', 'IMPERIAL']);
export type UnitSystem = z.infer<typeof UnitSystem>;
