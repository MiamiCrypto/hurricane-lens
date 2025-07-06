/**
 * Returns color based on Saffir-Simpson hurricane scale (Colab style)
 * @param kt Wind speed in knots
 * @returns Color as string
 */
export function catColor(kt: number): string {
  // Tropical Storm/Depression (< 64 kt)
  if (kt < 64) {
    return 'gray'
  }
  // Category 1 (64-82 kt)
  else if (kt < 83) {
    return 'yellow'
  }
  // Category 2 (83-95 kt)
  else if (kt < 96) {
    return 'orange'
  }
  // Category 3 (96-112 kt)
  else if (kt < 113) {
    return 'red'
  }
  // Category 4 (113-136 kt)
  else if (kt < 137) {
    return 'purple'
  }
  // Category 5 (≥ 137 kt)
  else {
    return 'black'
  }
} 