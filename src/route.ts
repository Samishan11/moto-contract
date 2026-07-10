import { z } from 'zod';

// --- Phase 10.2: routing (OSRM) & geocoding (Nominatim) ---
// Both services are self-hosted and fronted by the backend RouteModule; the
// app never talks to them directly.

/** GeoJSON LineString — directly renderable by MapLibre ShapeSource. */
export const RouteGeometrySchema = z.object({
  type: z.literal('LineString'),
  coordinates: z.array(z.tuple([z.number(), z.number()])), // [lng, lat]
});
export type RouteGeometry = z.infer<typeof RouteGeometrySchema>;

/** One leg = stop i → stop i+1, in `TripStop.order` order. */
export const TripRouteLegSchema = z.object({
  fromStopId: z.string(),
  toStopId: z.string(),
  distanceM: z.number(),
  durationS: z.number(),
});
export type TripRouteLeg = z.infer<typeof TripRouteLegSchema>;

/**
 * OSRM route through a trip's stops. Computing it also persists cumulative
 * `TripStop.eta` (minutes from the first stop), so trip detail reflects ETAs
 * after the first fetch.
 */
export const TripRouteSchema = z.object({
  tripId: z.string(),
  geometry: RouteGeometrySchema, // simplified overview, not turn-by-turn
  distanceM: z.number(),
  durationS: z.number(),
  legs: z.array(TripRouteLegSchema),
  computedAt: z.string(),
});
export type TripRoute = z.infer<typeof TripRouteSchema>;

/** A Nominatim hit for the stop-picker search. */
export const GeocodeResultSchema = z.object({
  name: z.string(), // display_name — "Thamel, Kathmandu, Bagmati, Nepal"
  lat: z.number(),
  lng: z.number(),
  /** Nominatim class/type, e.g. "tourism/attraction" — for a result icon. */
  kind: z.string().nullable(),
});
export type GeocodeResult = z.infer<typeof GeocodeResultSchema>;

export const GeocodeSearchResponseSchema = z.object({
  results: z.array(GeocodeResultSchema),
});
export type GeocodeSearchResponse = z.infer<typeof GeocodeSearchResponseSchema>;

/** A rider passing within a stop's radius during a ride (recorded once). */
export const StopCrossingSchema = z.object({
  id: z.string(),
  rideId: z.string(),
  userId: z.string(),
  stopId: z.string(),
  stopName: z.string(),
  crossedAt: z.string(),
});
export type StopCrossing = z.infer<typeof StopCrossingSchema>;

export const RideCrossingsResponseSchema = z.object({
  crossings: z.array(StopCrossingSchema),
});
export type RideCrossingsResponse = z.infer<typeof RideCrossingsResponseSchema>;

/** Server → group room: a rider reached a trip stop (SocketEvents.RideCheckpoint). */
export const RideCheckpointEventSchema = z.object({
  rideId: z.string(),
  groupId: z.string(),
  userId: z.string(),
  stopId: z.string(),
  stopName: z.string(),
  crossedAt: z.string(),
});
export type RideCheckpointEvent = z.infer<typeof RideCheckpointEventSchema>;
