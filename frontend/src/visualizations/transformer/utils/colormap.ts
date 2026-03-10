/**
 * Viridis Colormap Utility
 *
 * Ported from legacy AttentionVisualizer.js with type safety.
 * Converts a normalized value [0,1] to a viridis color.
 */

import { VIRIDIS_STOPS } from '../constants'

/**
 * Convert a value in [0,1] to an RGB tuple via viridis interpolation.
 */
export function viridisRGB(value: number): [number, number, number] {
  const v = Math.max(0, Math.min(1, value))
  const s = v * (VIRIDIS_STOPS.length - 1)
  const lo = Math.floor(s)
  const hi = Math.min(lo + 1, VIRIDIS_STOPS.length - 1)
  const t = s - lo
  const a = VIRIDIS_STOPS[lo]
  const b = VIRIDIS_STOPS[hi]
  return [
    Math.round(a.r + (b.r - a.r) * t),
    Math.round(a.g + (b.g - a.g) * t),
    Math.round(a.b + (b.b - a.b) * t),
  ]
}

/**
 * Convert a value in [0,1] to a hex color string via viridis colormap.
 */
export function viridisHex(value: number): string {
  const [r, g, b] = viridisRGB(value)
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Convert a hex color string to an [r, g, b] tuple normalized to [0,1].
 */
export function hexToRGBNormalized(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  return [
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255,
  ]
}

/**
 * HSL to RGB conversion for head color gradients.
 * Ported from legacy AttentionLayerVisualizer.js.
 */
export function hslToRGB(h: number, s: number, l: number): [number, number, number] {
  let r: number, g: number, b: number

  if (s === 0) {
    r = g = b = l
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)]
}
