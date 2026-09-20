export interface Coordinates {
  latitude: number;
  longitude: number;
}

/**
 * Calculates the geographic distance between two coordinates in meters
 * using the Haversine formula.
 *
 * Earth Radius = 6,371,000 meters.
 * Latitude must be in range [-90, 90], Longitude in [-180, 180].
 */
export function calculateDistanceInMeters(
  point1: Coordinates,
  point2: Coordinates
): number {
  const earthRadius = 6371000; // Earth's mean radius in meters

  const lat1 = toRadians(point1.latitude);
  const lat2 = toRadians(point2.latitude);

  const deltaLat = toRadians(point2.latitude - point1.latitude);
  const deltaLon = toRadians(point2.longitude - point1.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Formats a distance in meters into a human-readable display string.
 * Example: 96 -> "96 m", 1843 -> "1.84 km"
 */
export function formatDistanceDisplay(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(2)} km`;
}
