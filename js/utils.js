/**
 * ALIEN ASSAULT 3D - UTILITIES
 * Pure math and formatting helpers
 */

export function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

export function randRange(min, max) {
  return min + Math.random() * (max - min);
}

export function randChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function formatCr(val) {
  return (val || 0).toLocaleString() + ' CR';
}

if (typeof window !== "undefined") {
  window.clamp = clamp;
  window.randRange = randRange;
  window.randChoice = randChoice;
  window.formatCr = formatCr;
}
