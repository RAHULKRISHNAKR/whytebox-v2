/**
 * Transformer Visualization Type Definitions
 *
 * Core data structures for the interactive transformer visualization system.
 */

// ─── Token types ────────────────────────────────────────────────────────────

export interface Token {
  id: number
  text: string
  embedding: number[]
  positionalEncoding: number[]
  /** Combined embedding + positional encoding */
  combinedEmbedding: number[]
}

// ─── Attention types ────────────────────────────────────────────────────────

export interface AttentionHead {
  headIndex: number
  query: number[][]    // [seqLen, dK]
  key: number[][]      // [seqLen, dK]
  value: number[][]    // [seqLen, dV]
  weights: number[][]  // [seqLen, seqLen] — softmax(QK^T / sqrt(dK))
  output: number[][]   // [seqLen, dV]
}

export interface MultiHeadAttentionResult {
  heads: AttentionHead[]
  mergedOutput: number[][]  // [seqLen, dModel]
  numHeads: number
}

// ─── Layer types ────────────────────────────────────────────────────────────

export interface FeedForwardResult {
  input: number[][]       // [seqLen, dModel]
  hidden: number[][]      // [seqLen, dFF]
  output: number[][]      // [seqLen, dModel]
}

export interface ResidualResult {
  preNorm: number[][]     // [seqLen, dModel]
  postNorm: number[][]    // [seqLen, dModel]
  skipInput: number[][]   // [seqLen, dModel]
}

export interface TransformerLayerResult {
  layerIndex: number
  selfAttention: MultiHeadAttentionResult
  attentionResidual: ResidualResult
  feedForward: FeedForwardResult
  ffnResidual: ResidualResult
  output: number[][]      // [seqLen, dModel]
}

// ─── Full transformer state ─────────────────────────────────────────────────

export interface TransformerState {
  tokens: Token[]
  layers: TransformerLayerResult[]
  finalOutput: number[][]
  config: TransformerConfig
}

export interface TransformerConfig {
  dModel: number
  numHeads: number
  dFF: number
  numLayers: number
  vocabSize: number
  maxSeqLen: number
}

// ─── Visualization stage stepping ───────────────────────────────────────────

export enum TransformerStage {
  INPUT = 0,
  TOKENIZATION = 1,
  EMBEDDING = 2,
  POSITIONAL_ENCODING = 3,
  SELF_ATTENTION = 4,
  MULTI_HEAD_ATTENTION = 5,
  RESIDUAL_ADD_NORM_1 = 6,
  FEED_FORWARD = 7,
  RESIDUAL_ADD_NORM_2 = 8,
  LAYER_OUTPUT = 9,
  FINAL_OUTPUT = 10,
}

export const STAGE_LABELS: Record<TransformerStage, string> = {
  [TransformerStage.INPUT]: 'Input Text',
  [TransformerStage.TOKENIZATION]: 'Tokenization',
  [TransformerStage.EMBEDDING]: 'Token Embeddings',
  [TransformerStage.POSITIONAL_ENCODING]: 'Positional Encoding',
  [TransformerStage.SELF_ATTENTION]: 'Self-Attention (Q·K·V)',
  [TransformerStage.MULTI_HEAD_ATTENTION]: 'Multi-Head Attention',
  [TransformerStage.RESIDUAL_ADD_NORM_1]: 'Add & Normalize',
  [TransformerStage.FEED_FORWARD]: 'Feed-Forward Network',
  [TransformerStage.RESIDUAL_ADD_NORM_2]: 'Add & Normalize',
  [TransformerStage.LAYER_OUTPUT]: 'Layer Output',
  [TransformerStage.FINAL_OUTPUT]: 'Final Output',
}

export const TOTAL_STAGES = Object.keys(TransformerStage).length / 2 // enum has reverse mappings

// ─── Visualization mode ─────────────────────────────────────────────────────

export type AttentionVizMode = 'heatmap' | 'arc' | 'matrix'

export interface VisualizationSettings {
  attentionMode: AttentionVizMode
  selectedHead: number
  selectedLayer: number
  opacity: number
  showLabels: boolean
  animationSpeed: number
}
