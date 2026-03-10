/**
 * Transformer Engine
 *
 * Full forward-pass simulation of a transformer encoder for visualization.
 * Computes embeddings, positional encoding, multi-head attention, FFN,
 * and residual connections step by step.
 */

import type {
  Token,
  TransformerConfig,
  TransformerState,
  TransformerLayerResult,
  FeedForwardResult,
  ResidualResult,
} from '../types'
import { DEFAULT_CONFIG } from '../constants'
import { tokenize, simpleEmbedding, positionalEncoding } from '../utils/tokenizer'
import {
  addMatrices,
  layerNorm,
  matmul,
  randomMatrix,
  relu,
} from '../utils/mathUtils'
import { multiHeadAttention } from './AttentionCompute'

/**
 * Run the full transformer encoder forward pass on input text.
 *
 * Returns a TransformerState that includes all intermediate results
 * for step-by-step visualization.
 */
export function runTransformer(
  inputText: string,
  config: TransformerConfig = DEFAULT_CONFIG,
): TransformerState {
  const { dModel, numHeads, dFF, numLayers } = config

  // ── Step 1: Tokenize ────────────────────────────────────────────────────
  const tokenStrings = tokenize(inputText)

  // ── Step 2: Embeddings + Positional Encoding ────────────────────────────
  const tokens: Token[] = tokenStrings.map((text, idx) => {
    const emb = simpleEmbedding(text, dModel, idx)
    const pe = positionalEncoding(idx, dModel)
    const combined = emb.map((v, d) => v + pe[d]!)
    return {
      id: idx,
      text,
      embedding: emb,
      positionalEncoding: pe,
      combinedEmbedding: combined,
    }
  })

  // ── Step 3: Layer-by-layer processing ───────────────────────────────────
  let currentInput = tokens.map((t) => t.combinedEmbedding)
  const layers: TransformerLayerResult[] = []

  for (let l = 0; l < numLayers; l++) {
    const layerResult = computeTransformerLayer(
      currentInput,
      dModel,
      numHeads,
      dFF,
      l,
    )
    layers.push(layerResult)
    currentInput = layerResult.output
  }

  return {
    tokens,
    layers,
    finalOutput: currentInput,
    config,
  }
}

/**
 * Compute one transformer encoder layer.
 */
function computeTransformerLayer(
  input: number[][],
  dModel: number,
  numHeads: number,
  dFF: number,
  layerIndex: number,
): TransformerLayerResult {
  // ── Sub-layer 1: Multi-Head Self-Attention ──────────────────────────────
  const selfAttention = multiHeadAttention(
    input,
    dModel,
    numHeads,
    layerIndex * 1000 + 1,
  )

  // Residual + LayerNorm after attention
  const attResidualPre = addMatrices(input, selfAttention.mergedOutput)
  const attResidualPost = layerNorm(attResidualPre)
  const attentionResidual: ResidualResult = {
    preNorm: attResidualPre,
    postNorm: attResidualPost,
    skipInput: input,
  }

  // ── Sub-layer 2: Position-wise Feed-Forward Network ─────────────────────
  const ffn = computeFeedForward(attResidualPost, dModel, dFF, layerIndex)

  // Residual + LayerNorm after FFN
  const ffnResidualPre = addMatrices(attResidualPost, ffn.output)
  const ffnResidualPost = layerNorm(ffnResidualPre)
  const ffnResidual: ResidualResult = {
    preNorm: ffnResidualPre,
    postNorm: ffnResidualPost,
    skipInput: attResidualPost,
  }

  return {
    layerIndex,
    selfAttention,
    attentionResidual,
    feedForward: ffn,
    ffnResidual,
    output: ffnResidualPost,
  }
}

/**
 * Compute position-wise feed-forward network.
 * FFN(x) = ReLU(x · W1 + b1) · W2 + b2
 */
function computeFeedForward(
  input: number[][],
  dModel: number,
  dFF: number,
  seed: number,
): FeedForwardResult {
  const W1 = randomMatrix(dModel, dFF, 0.1, seed * 2000 + 1)
  const W2 = randomMatrix(dFF, dModel, 0.1, seed * 2000 + 2)

  const hidden = relu(matmul(input, W1))
  const output = matmul(hidden, W2)

  return { input, hidden, output }
}
