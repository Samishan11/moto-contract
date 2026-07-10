import { z } from 'zod';

/**
 * Generic presigned-upload handshake (Phase 2). The client asks the API for a
 * presigned PUT URL, uploads the file directly to object storage (MinIO), then
 * references the returned `objectKey` when creating/updating the owning
 * resource (avatar, bike photo, service invoice). File bytes never transit the
 * API.
 */
export const UploadScope = z.enum([
  'AVATAR',
  'BIKE_PHOTO',
  'SERVICE_INVOICE',
  'GROUP_COVER',
  'ANNOUNCEMENT_MEDIA',
  'EXPENSE_RECEIPT',
]);
export type UploadScope = z.infer<typeof UploadScope>;

export const PresignUploadRequestSchema = z.object({
  scope: UploadScope,
  contentType: z.string().min(1).max(100), // e.g. "image/jpeg", "application/pdf"
});
export type PresignUploadRequest = z.infer<typeof PresignUploadRequestSchema>;

export const PresignUploadResponseSchema = z.object({
  uploadUrl: z.string(), // presigned PUT URL
  objectKey: z.string(), // opaque storage key to send back on commit
  expiresIn: z.number(), // seconds the upload URL is valid
});
export type PresignUploadResponse = z.infer<typeof PresignUploadResponseSchema>;
