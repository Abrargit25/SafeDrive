export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function calculateMagnitude(x: number, y: number, z: number) {
  return Math.sqrt(x * x + y * y + z * z);
}
