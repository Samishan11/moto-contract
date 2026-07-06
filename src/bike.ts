import { z } from 'zod';

/**
 * Phase 2.3 — Bike garage, 2.4 — service history, 2.5 — reminders.
 */

export const BikePhotoSchema = z.object({
  id: z.string(),
  url: z.string(), // presigned GET URL
  createdAt: z.string(),
});
export type BikePhoto = z.infer<typeof BikePhotoSchema>;

export const ServiceRecordSchema = z.object({
  id: z.string(),
  type: z.string(),
  odometer: z.number().int().nullable(),
  cost: z.number().nullable(),
  date: z.string(), // ISO-8601
  workshop: z.string().nullable(),
  invoiceUrl: z.string().nullable(), // presigned GET URL
  notes: z.string().nullable(),
  createdAt: z.string(),
});
export type ServiceRecord = z.infer<typeof ServiceRecordSchema>;

export const BikeSchema = z.object({
  id: z.string(),
  brand: z.string(),
  model: z.string(),
  cc: z.number().int().nullable(),
  registrationNum: z.string().nullable(),
  vin: z.string().nullable(),
  purchaseDate: z.string().nullable(),
  insuranceExpiry: z.string().nullable(),
  registrationExpiry: z.string().nullable(),
  photos: z.array(BikePhotoSchema),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Bike = z.infer<typeof BikeSchema>;

/** Bike detail bundles its service history. */
export const BikeDetailSchema = BikeSchema.extend({
  serviceRecords: z.array(ServiceRecordSchema),
});
export type BikeDetail = z.infer<typeof BikeDetailSchema>;

export const CreateBikeSchema = z.object({
  brand: z.string().min(1).max(80),
  model: z.string().min(1).max(80),
  cc: z.number().int().min(0).max(10000).nullable().optional(),
  registrationNum: z.string().max(40).nullable().optional(),
  vin: z.string().max(40).nullable().optional(),
  purchaseDate: z.string().nullable().optional(),
  insuranceExpiry: z.string().nullable().optional(),
  registrationExpiry: z.string().nullable().optional(),
});
export type CreateBikeRequest = z.infer<typeof CreateBikeSchema>;

export const UpdateBikeSchema = CreateBikeSchema.partial();
export type UpdateBikeRequest = z.infer<typeof UpdateBikeSchema>;

/** Commit an uploaded bike photo (objectKey from the presign step). */
export const AddBikePhotoSchema = z.object({ objectKey: z.string().min(1) });
export type AddBikePhotoRequest = z.infer<typeof AddBikePhotoSchema>;

export const CreateServiceRecordSchema = z.object({
  type: z.string().min(1).max(80),
  odometer: z.number().int().min(0).nullable().optional(),
  cost: z.number().min(0).nullable().optional(),
  date: z.string(), // ISO-8601
  workshop: z.string().max(120).nullable().optional(),
  invoiceKey: z.string().nullable().optional(), // objectKey from presign step
  notes: z.string().max(1000).nullable().optional(),
});
export type CreateServiceRecordRequest = z.infer<typeof CreateServiceRecordSchema>;

export const UpdateServiceRecordSchema = CreateServiceRecordSchema.partial();
export type UpdateServiceRecordRequest = z.infer<typeof UpdateServiceRecordSchema>;

// --- Reminders (2.5) ---

export const ReminderKind = z.enum(['INSURANCE_EXPIRY', 'REGISTRATION_EXPIRY']);
export type ReminderKind = z.infer<typeof ReminderKind>;

export const ReminderSchema = z.object({
  kind: ReminderKind,
  bikeId: z.string(),
  bikeLabel: z.string(), // "Brand Model"
  dueDate: z.string(), // ISO-8601
  daysUntilDue: z.number().int(), // negative = overdue
});
export type Reminder = z.infer<typeof ReminderSchema>;
