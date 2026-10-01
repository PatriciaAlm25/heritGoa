export const RATE_PER_KM = 85;
export const FARE_VARIATION = 100;

export function calculateFareRange(distanceKm) {
  const base = Math.round(distanceKm * RATE_PER_KM);
  return {
    base,
    min: Math.max(0, base - FARE_VARIATION),
    max: base + FARE_VARIATION,
  };
}

export function formatRupees(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
