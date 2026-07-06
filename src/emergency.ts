import { z } from 'zod';

/**
 * Phase 7 — Local emergency services. Resolved from a lat/lng: the country's
 * emergency phone numbers (static, offline-capable) plus nearest facilities
 * (hospital/police/fire) from OpenStreetMap. Numbers are best-effort — the UI
 * must show a "verify local numbers" disclaimer.
 */

export const EmergencyNumbersSchema = z.object({
  /** ISO 3166-1 alpha-2, e.g. "NP", "US". */
  country: z.string(),
  /** Universal / general emergency number (112, 911, 999…). */
  universal: z.string().nullable(),
  police: z.string().nullable(),
  ambulance: z.string().nullable(),
  fire: z.string().nullable(),
});
export type EmergencyNumbers = z.infer<typeof EmergencyNumbersSchema>;

export const EmergencyFacilityType = z.enum(['HOSPITAL', 'POLICE', 'FIRE', 'PHARMACY']);
export type EmergencyFacilityType = z.infer<typeof EmergencyFacilityType>;

export const EmergencyFacilitySchema = z.object({
  type: EmergencyFacilityType,
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  distanceM: z.number(),
  phone: z.string().nullable(),
});
export type EmergencyFacility = z.infer<typeof EmergencyFacilitySchema>;

export const EmergencyServicesSchema = z.object({
  numbers: EmergencyNumbersSchema,
  /** Nearest facilities; empty if the POI lookup was unavailable. */
  facilities: z.array(EmergencyFacilitySchema),
});
export type EmergencyServices = z.infer<typeof EmergencyServicesSchema>;
