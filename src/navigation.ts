import { z } from 'zod';
import { RouteGeometrySchema } from './route';

// --- Phase 11.3: turn-by-turn navigation ---
// Routes come from a self-hosted Valhalla (motorcycle costing), fronted by the
// backend; the app never calls it directly. Guidance (progress, prompts,
// rerouting) runs in the app.

/** Voice and banner language. Valhalla has no Nepali narrative. */
export const NavigationLanguageSchema = z.enum(['en-US', 'hi-IN']);
export type NavigationLanguage = z.infer<typeof NavigationLanguageSchema>;

export const NavLatLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});
export type NavLatLng = z.infer<typeof NavLatLngSchema>;

/** Rider preferences, mapped onto Valhalla's motorcycle costing. */
export const NavigationOptionsSchema = z.object({
  avoidHighways: z.boolean().optional(),
  avoidTolls: z.boolean().optional(),
  /** Tracks and trails are fine (adventure riding). Off by default. */
  allowTrails: z.boolean().optional(),
});
export type NavigationOptions = z.infer<typeof NavigationOptionsSchema>;

/** POST /navigation/route. The first waypoint is where the rider is now. */
export const NavigationRouteRequestSchema = z.object({
  waypoints: z.array(NavLatLngSchema).min(2).max(20),
  /** Direction of travel (degrees from north), so the route doesn't start with a U-turn. */
  heading: z.number().min(0).max(360).optional(),
  language: NavigationLanguageSchema.optional(),
  options: NavigationOptionsSchema.optional(),
  /** Alternative routes to return as well. Only with exactly two waypoints. */
  alternates: z.number().int().min(0).max(2).optional(),
});
export type NavigationRouteRequest = z.infer<typeof NavigationRouteRequestSchema>;

export const NavManeuverSchema = z.object({
  /** OSRM maneuver type: depart, turn, new name, continue, merge, on ramp,
   * off ramp, fork, end of road, roundabout, rotary, exit roundabout,
   * exit rotary, notification, arrive. */
  type: z.string(),
  /** straight, slight left/right, left/right, sharp left/right, uturn. */
  modifier: z.string().nullable(),
  location: z.tuple([z.number(), z.number()]), // [lng, lat]
  bearingAfter: z.number().nullable(),
  /** Roundabout exit to take. */
  exit: z.number().nullable(),
});
export type NavManeuver = z.infer<typeof NavManeuverSchema>;

/**
 * What to show about the maneuver at the END of a step (the next step's
 * maneuver), from `distanceToManeuverM` before it onwards.
 */
export const NavBannerSchema = z.object({
  distanceToManeuverM: z.number(),
  primary: z.string(),
  secondary: z.string().nullable(),
  type: z.string().nullable(),
  modifier: z.string().nullable(),
  /** Roundabout exit to take. */
  exit: z.number().nullable(),
});
export type NavBanner = z.infer<typeof NavBannerSchema>;

/** What to say about the maneuver at the END of a step, `distanceToManeuverM` before it. */
export const NavVoiceSchema = z.object({
  distanceToManeuverM: z.number(),
  text: z.string(),
});
export type NavVoice = z.infer<typeof NavVoiceSchema>;

/** A stretch of road that starts with `maneuver`. */
export const NavStepSchema = z.object({
  maneuver: NavManeuverSchema,
  name: z.string().nullable(),
  ref: z.string().nullable(),
  distanceM: z.number(),
  durationS: z.number(),
  /** Index of the step's first point in the route's geometry. */
  geometryIndex: z.number().int().nonnegative(),
  banners: z.array(NavBannerSchema),
  voice: z.array(NavVoiceSchema),
});
export type NavStep = z.infer<typeof NavStepSchema>;

/** Waypoint i → waypoint i+1. */
export const NavLegSchema = z.object({
  distanceM: z.number(),
  durationS: z.number(),
  steps: z.array(NavStepSchema),
});
export type NavLeg = z.infer<typeof NavLegSchema>;

export const NavigationRouteSchema = z.object({
  /** Full-resolution line through every step, for snapping and progress. */
  geometry: RouteGeometrySchema,
  distanceM: z.number(),
  durationS: z.number(),
  legs: z.array(NavLegSchema),
  language: NavigationLanguageSchema,
});
export type NavigationRoute = z.infer<typeof NavigationRouteSchema>;

/** The recommended route first, then any alternatives. */
export const NavigationRouteResponseSchema = z.object({
  routes: z.array(NavigationRouteSchema).min(1),
});
export type NavigationRouteResponse = z.infer<typeof NavigationRouteResponseSchema>;
