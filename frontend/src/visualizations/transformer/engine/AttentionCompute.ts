/**
 * Attention Computation Module
 *
 * Computes scaled dot-product attention and multi-head attention.
 * Simulates real transformer operations for educational visualization.
 */

import type { AttentionHead, MultiHeadAttentionResult } from '../types'
import {
  softmax,
  matmul,
  transpose,
  randomMatrix,
  sliceCols,
  concatCols,
  scaleMatrix,
} from '../utils/mathUtils'

/**
 * Compute scaled dot-product attention for a single head.
 *
 * Attention(Q, K, V) = softmax(Q·K^T / √dK) · V
 */
export function scaledDotProductAttention(
  query: number[][],
  key: number[][],
  value: number[][],
): { weights: number[][]; output: number[][] } {
  const dK = query[0]?.length ?? 1
  const scale = Math.sqrt(dK)

  // Q · K^T
  const scores = matmul(query, transpose(key))

  // Scale
  const scaled = scaleMatrix(scores, 1 / scale)

  // Softmax per row
  const weights = scaled.map((row) => softmax(row))

  // Weights · V
  const output = matmul(weights, value)

  return { weights, output }
}

/**
 * Compute multi-head attention.
 *
 * Splits input into numHeads parallel attention heads, each operating
 * on a dK-dimensional slice of the dModel-dimensional input.
 *
 * @param input - [seqLen, dModel] input matrix
 * @param dModel - model dimension
 * @param numHeads - number of attention heads
 * @param seed - for reproducible weight initialization
 */
export function multiHeadAttention(
  input: number[][],
  dModel: number,
  numHeads: number,
  seed = 42,
): MultiHeadAttentionResult {
  const dK = Math.floor(dModel / numHeads)
  const seqLen = input.length

  // Generate weight matrices (simulated — in practice these are learned)
  const Wq = randomMatrix(dModel, dModel, 0.1, seed)
  const Wk = randomMatrix(dModel, dModel, 0.1, seed + 100)
  const Wv = randomMatrix(dModel, dModel, 0.1, seed + 200)
  const Wo = randomMatrix(dModel, dModel, 0.1, seed + 300)

  // Project: Q = input · Wq, K = input · Wk, V = input · Wv
  const Q = matmul(input, Wq)
  const K = matmul(input, Wk)
  const V = matmul(input, Wv)

  // Split into heads and compute attention
  const heads: AttentionHead[] = []
  const headOutputs: number[][][] = []

  for (let h = 0; h < numHeads; h++) {
    const start = h * dK
    const end = start + dK

    const qHead = sliceCols(Q, start, end)
    const kHead = sliceCols(K, start, end)
    const vHead = sliceCols(V, start, end)

    const { weights, output } = scaledDotProductAttention(qHead, kHead, vHead)

    heads.push({
      headIndex: h,
      query: qHead,
      key: kHead,
      value: vHead,
      weights,
      output,
    })

    headOutputs.push(output)
  }

  // Concatenate head outputs and project through Wo
  const concatenated = concatCols(headOutputs)

  // If concatenated width < dModel (due to integer division), pad
  const padded = concatenated.map((row) => {
    if (row.length < dModel) {
      return [...row, ...new Array(dModel - row.length).fill(0)]
    }
    return row.slice(0, dModel)
  })

  const mergedOutput = matmul(padded, Wo)

  return {
    heads,
    mergedOutput,
    numHeads,
  }
}
