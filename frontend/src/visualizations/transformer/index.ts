/**
 * Transformer Visualization Module
 *
 * Barrel export for the complete transformer visualization system.
 */

// Main component
export { default as TransformerVisualizer } from './components/TransformerVisualizer'

// Sub-components (for standalone use)
export { default as TransformerScene } from './components/TransformerScene'
export { default as TokenInput } from './components/TokenInput'
export { default as StageControls } from './components/StageControls'
export { default as AttentionMatrix } from './components/AttentionMatrix'
export { default as TokenEmbeddingView } from './components/TokenEmbeddingView'
export { default as PositionalEncodingView } from './components/PositionalEncodingView'
export { default as FeedForwardView } from './components/FeedForwardView'
export { default as ResidualConnectionView } from './components/ResidualConnectionView'

// Engine
export { runTransformer } from './engine/TransformerEngine'
export { multiHeadAttention, scaledDotProductAttention } from './engine/AttentionCompute'

// Types
export type {
  Token,
  AttentionHead,
  MultiHeadAttentionResult,
  FeedForwardResult,
  ResidualResult,
  TransformerLayerResult,
  TransformerState,
  TransformerConfig,
  AttentionVizMode,
  VisualizationSettings,
} from './types'
export { TransformerStage, STAGE_LABELS, TOTAL_STAGES } from './types'

// Utils
export { viridisHex, viridisRGB, hslToRGB } from './utils/colormap'
export { tokenize, positionalEncoding } from './utils/tokenizer'
