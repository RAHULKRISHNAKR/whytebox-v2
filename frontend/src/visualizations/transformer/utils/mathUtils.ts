/**
 * Math Utilities for Transformer Computations
 *
 * Pure functions for attention computation, layer normalization, etc.
 * These simulate transformer forward-pass for educational visualization.
 */

/**
 * Softmax over a 1D array.
 */
export function softmax(values: number[]): number[] {
  const max = Math.max(...values)
  const exps = values.map((v) => Math.exp(v - max))
  const sum = exps.reduce((a, b) => a + b, 0)
  return exps.map((e) => e / sum)
}

/**
 * Dot product of two vectors.
 */
export function dot(a: number[], b: number[]): number {
  let sum = 0
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] ?? 0) * (b[i] ?? 0)
  }
  return sum
}

/**
 * Matrix multiply: A [m×k] × B [k×n] → C [m×n]
 */
export function matmul(a: number[][], b: number[][]): number[][] {
  const m = a.length
  const k = a[0]?.length ?? 0
  const n = b[0]?.length ?? 0
  const result: number[][] = Array.from({ length: m }, () => new Array(n).fill(0))
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0
      for (let p = 0; p < k; p++) {
        sum += (a[i]?.[p] ?? 0) * (b[p]?.[j] ?? 0)
      }
      result[i]![j] = sum
    }
  }
  return result
}

/**
 * Transpose a 2D matrix.
 */
export function transpose(matrix: number[][]): number[][] {
  if (matrix.length === 0) return []
  const rows = matrix.length
  const cols = matrix[0]!.length
  const result: number[][] = Array.from({ length: cols }, () => new Array(rows).fill(0))
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      result[j]![i] = matrix[i]?.[j] ?? 0
    }
  }
  return result
}

/**
 * Element-wise addition of two matrices.
 */
export function addMatrices(a: number[][], b: number[][]): number[][] {
  return a.map((row, i) => row.map((val, j) => val + (b[i]?.[j] ?? 0)))
}

/**
 * Layer normalization over each row (token vector).
 */
export function layerNorm(matrix: number[][], epsilon = 1e-5): number[][] {
  return matrix.map((row) => {
    const mean = row.reduce((a, b) => a + b, 0) / row.length
    const variance = row.reduce((sum, x) => sum + (x - mean) ** 2, 0) / row.length
    const std = Math.sqrt(variance + epsilon)
    return row.map((x) => (x - mean) / std)
  })
}

/**
 * ReLU activation element-wise on a matrix.
 */
export function relu(matrix: number[][]): number[][] {
  return matrix.map((row) => row.map((v) => Math.max(0, v)))
}

/**
 * Scale a matrix by a scalar.
 */
export function scaleMatrix(matrix: number[][], scalar: number): number[][] {
  return matrix.map((row) => row.map((v) => v * scalar))
}

/**
 * Generate a random matrix with values from a normal distribution.
 * Uses Box-Muller transform. Seeded via a simple LCG for reproducibility.
 */
export function randomMatrix(rows: number, cols: number, scale = 0.1, seed = 42): number[][] {
  let state = seed
  const next = () => {
    state = (state * 1664525 + 1013904223) & 0xffffffff
    return (state >>> 0) / 0xffffffff
  }

  return Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => {
      const u1 = next()
      const u2 = next()
      // Box-Muller
      const z = Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2)
      return z * scale
    }),
  )
}

/**
 * Slice columns from a matrix: matrix[:, start:end]
 */
export function sliceCols(matrix: number[][], start: number, end: number): number[][] {
  return matrix.map((row) => row.slice(start, end))
}

/**
 * Concatenate matrices along columns (axis=1).
 */
export function concatCols(matrices: number[][][]): number[][] {
  if (matrices.length === 0) return []
  const rows = matrices[0]!.length
  return Array.from({ length: rows }, (_, i) =>
    matrices.flatMap((m) => m[i] ?? []),
  )
}
