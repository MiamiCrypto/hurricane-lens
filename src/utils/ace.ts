/**
 * Calculate Accumulated Cyclone Energy (ACE) for a single observation
 * ACE = v^2 / 10^4, where v is the maximum sustained wind speed in knots
 * @param windSpeed Wind speed in knots
 * @returns ACE value
 */
export function calculateAce(windSpeed: number): number {
  // Only tropical systems (>= 34 knots) contribute to ACE
  if (windSpeed < 34) return 0;
  
  // ACE formula: v^2 / 10^4
  return Math.pow(windSpeed, 2) / 10000;
}

/**
 * Extends storm data with category information
 * @param storm Storm data object
 * @returns Storm data with category field
 */
export function getStormCategory(windSpeed: number): number {
  // Tropical Depression (< 34 kt)
  if (windSpeed < 34) {
    return 0;
  }
  // Tropical Storm (34-63 kt)
  else if (windSpeed < 64) {
    return 0;
  }
  // Category 1 (64-82 kt)
  else if (windSpeed < 83) {
    return 1;
  }
  // Category 2 (83-95 kt)
  else if (windSpeed < 96) {
    return 2;
  }
  // Category 3 (96-112 kt)
  else if (windSpeed < 113) {
    return 3;
  }
  // Category 4 (113-136 kt)
  else if (windSpeed < 137) {
    return 4;
  }
  // Category 5 (≥ 137 kt)
  else {
    return 5;
  }
} 