/**
 * Returns color based on Saffir-Simpson hurricane scale
 * @param kt Wind speed in knots
 * @returns Color as hex string
 */
export function catColor(kt: number): string {
  // Tropical Depression (< 34 kt)
  if (kt < 34) {
    return '#6b7280' // gray
  }
  // Tropical Storm (34-63 kt)
  else if (kt < 64) {
    return '#fbbf24' // yellow
  }
  // Category 1 (64-82 kt)
  else if (kt < 83) {
    return '#f97316' // orange
  }
  // Category 2 (83-95 kt)
  else if (kt < 96) {
    return '#dc2626' // red
  }
  // Category 3 (96-112 kt)
  else if (kt < 113) {
    return '#ea580c' // deep orange-red
  }
  // Category 4 (113-136 kt)
  else if (kt < 137) {
    return '#9333ea' // purple
  }
  // Category 5 (≥ 137 kt)
  else {
    return '#000000' // black
  }
} 