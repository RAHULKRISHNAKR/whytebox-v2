/**
 * Simple Tokenizer for Educational Visualization
 *
 * Splits text into word-level tokens with special tokens.
 * This is intentionally simple — real transformers use BPE/WordPiece.
 */

import { LIMITS } from '../constants'

/**
 * Tokenize input text into word-level tokens.
 * Adds [CLS] and [SEP] markers for BERT-style visualization.
 */
export function tokenize(text: string): string[] {
  const trimmed = text.trim()
  if (!trimmed) return ['[CLS]', '[SEP]']

  // Split on whitespace and punctuation boundaries
  const words = trimmed
    .split(/(\s+|(?=[.,!?;:])|(?<=[.,!?;:]))/)
    .map((w) => w.trim())
    .filter((w) => w.length > 0)
    .slice(0, LIMITS.maxTokens - 2) // reserve space for special tokens

  return ['[CLS]', ...words, '[SEP]']
}

/**
 * Get a simple deterministic "embedding" for a token.
 * Uses character code sums to generate a reproducible vector.
 * This is for visualization only — not a real embedding.
 */
export function simpleEmbedding(token: string, dModel: number, seed = 0): number[] {
  const embedding = new Array(dModel).fill(0)
  for (let d = 0; d < dModel; d++) {
    let val = 0
    for (let c = 0; c < token.length; c++) {
      const code = token.charCodeAt(c)
      // Deterministic pseudo-random based on char, position, dimension
      val += Math.sin((code + seed) * (d + 1) * 0.1) * Math.cos((c + 1) * (d + 1) * 0.07)
    }
    embedding[d] = val / Math.max(token.length, 1)
  }
  return embedding
}

/**
 * Generate positional encoding vector for a given position.
 * Uses sine/cosine encoding from "Attention Is All You Need":
 *   PE(pos, 2i)   = sin(pos / 10000^(2i/dModel))
 *   PE(pos, 2i+1) = cos(pos / 10000^(2i/dModel))
 */
export function positionalEncoding(position: number, dModel: number): number[] {
  const pe = new Array(dModel).fill(0)
  for (let i = 0; i < dModel; i++) {
    const denom = Math.pow(10000, (2 * Math.floor(i / 2)) / dModel)
    pe[i] = i % 2 === 0
      ? Math.sin(position / denom)
      : Math.cos(position / denom)
  }
  return pe
}
