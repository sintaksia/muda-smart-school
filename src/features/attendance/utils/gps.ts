const EARTH_RADIUS_METERS = 6_371_000;

/** Great-circle distance between two coordinates, in meters (haversine). */
export function distanceMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number): number => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

/**
 * Soft GPS check (Process 2, step 6): outside-radius scans are still
 * recorded, only flagged for teacher review — indoor drift is expected.
 */
export function evaluateGps(
  scanLat: number | undefined,
  scanLng: number | undefined,
  schoolLat: number,
  schoolLng: number,
  radiusMeters: number,
): { gpsValid: boolean | null; needsReview: boolean } {
  if (scanLat === undefined || scanLng === undefined) {
    return { gpsValid: null, needsReview: true };
  }
  const distance = distanceMeters(scanLat, scanLng, schoolLat, schoolLng);
  const gpsValid = distance <= radiusMeters;
  return { gpsValid, needsReview: !gpsValid };
}
