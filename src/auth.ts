import { z } from 'zod';
import { UnitSystem } from './common';

export const PasswordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(128);

export const EmailSchema = z.string().email().max(254).toLowerCase();

export const RegisterRequestSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  displayName: z.string().min(1).max(80),
});
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>;

export const LoginRequestSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1).max(128),
  deviceName: z.string().max(120).optional(),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']).optional(),
});
export type LoginRequest = z.infer<typeof LoginRequestSchema>;

/** Google Sign-In: the client obtains a Google ID token and exchanges it here. */
export const GoogleLoginRequestSchema = z.object({
  idToken: z.string().min(1),
  deviceName: z.string().max(120).optional(),
  platform: z.enum(['IOS', 'ANDROID', 'WEB']).optional(),
});
export type GoogleLoginRequest = z.infer<typeof GoogleLoginRequestSchema>;

export const RefreshRequestSchema = z.object({ refreshToken: z.string().min(1) });
export type RefreshRequest = z.infer<typeof RefreshRequestSchema>;

export const VerifyEmailRequestSchema = z.object({ token: z.string().min(1) });
export type VerifyEmailRequest = z.infer<typeof VerifyEmailRequestSchema>;

export const ResendVerificationRequestSchema = z.object({ email: EmailSchema });
export type ResendVerificationRequest = z.infer<typeof ResendVerificationRequestSchema>;

export const ForgotPasswordRequestSchema = z.object({ email: EmailSchema });
export type ForgotPasswordRequest = z.infer<typeof ForgotPasswordRequestSchema>;

export const ResetPasswordRequestSchema = z.object({
  token: z.string().min(1),
  newPassword: PasswordSchema,
});
export type ResetPasswordRequest = z.infer<typeof ResetPasswordRequestSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(), // access token lifetime, seconds
});
export type AuthTokens = z.infer<typeof AuthTokensSchema>;

export const UserPublicSchema = z.object({
  id: z.string(),
  email: z.string(),
  emailVerified: z.boolean(),
  displayName: z.string().nullable(),
  locale: z.string(),
  timezone: z.string(),
  unitSystem: UnitSystem,
  createdAt: z.string(), // ISO-8601 UTC
});
export type UserPublic = z.infer<typeof UserPublicSchema>;

export const AuthResultSchema = z.object({
  user: UserPublicSchema,
  tokens: AuthTokensSchema,
});
export type AuthResult = z.infer<typeof AuthResultSchema>;

export const MessageResponseSchema = z.object({ ok: z.literal(true) });
export type MessageResponse = z.infer<typeof MessageResponseSchema>;
