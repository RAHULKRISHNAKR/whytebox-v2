/**
 * Transformer Visualization Constants
 *
 * Centralized configuration for colors, spacing, and rendering parameters.
 */

// ─── Color palette (aligned with v2 theme) ──────────────────────────────────

export const COLORS = {
  // Stage colors
  input: '#27AE60',
  token: '#3498DB',
  embedding: '#9B59B6',
  positionalEncoding: '#8E44AD',
  query: '#E74C3C',
  key: '#F39C12',
  value: '#2ECC71',
  attention: '#3498DB',
  feedForward: '#E67E22',
  residual: '#1ABC9C',
  layerNorm: '#BD10E0',
  output: '#E74C3C',

  // Encoder/decoder
  encoder: '#2E86DE',
  decoder: '#F5A623',

  // UI
  background: '#1a1a2e',
  gridLine: 'rgba(255, 255, 255, 0.1)',
  text: '#FFFFFF',
  textSecondary: '#B0BEC5',
} as const;

// ─── Viridis colormap stops ─────────────────────────────────────────────────

export const VIRIDIS_STOPS = [
  { pos: 0.0, r: 68, g: 1, b: 84 },
  { pos: 0.25, r: 59, g: 82, b: 139 },
  { pos: 0.5, r: 33, g: 145, b: 140 },
  { pos: 0.75, r: 94, g: 201, b: 98 },
  { pos: 1.0, r: 253, g: 231, b: 37 },
] as const;

// ─── 3D Scene layout ────────────────────────────────────────────────────────

export const LAYOUT = {
  tokenSpacing: 0.6,
  layerVerticalSpacing: 3.0,
  stageSpacing: 2.5,
  headGridGap: 0.15,
  maxHeadsPerRow: 4,
  arcHeightFactor: 0.5,
  arcMaxHeight: 2.0,
  arcSegments: 15,
  residualCurveSegments: 20,
} as const;

// ─── Default transformer config (educational size) ──────────────────────────

export const DEFAULT_CONFIG = {
  dModel: 64,
  numHeads: 4,
  dFF: 128,
  numLayers: 2,
  vocabSize: 1000,
  maxSeqLen: 32,
} as const;

// ─── Model-specific configurations ──────────────────────────────────────────

export const MODEL_CONFIGS = {
  custom: DEFAULT_CONFIG,
  bert_base: {
    dModel: 768,
    numHeads: 12,
    dFF: 3072,
    numLayers: 12,
    vocabSize: 30522,
    maxSeqLen: 512,
  },
  gpt2: {
    dModel: 768,
    numHeads: 12,
    dFF: 3072,
    numLayers: 12,
    vocabSize: 50257,
    maxSeqLen: 1024,
  },
} as const;

export type ModelPreset = keyof typeof MODEL_CONFIGS;

export const MODEL_LABELS: Record<ModelPreset, string> = {
  custom: 'Custom Configuration',
  bert_base: 'BERT-base (12L, 768d, 12H)',
  gpt2: 'GPT-2 (12L, 768d, 12H)',
} as const;

// ─── Animation ──────────────────────────────────────────────────────────────

export const ANIMATION = {
  defaultSpeed: 1.0,
  expandDuration: 300, // ms
  collapseDuration: 200, // ms
  flowSpeed: 0.02,
} as const;

// ─── Rendering limits ───────────────────────────────────────────────────────

export const LIMITS = {
  maxTokens: 16,
  maxVisibleHeads: 8,
  textureSize: 256,
  attentionThreshold: 0.1,
} as const;
