/**
 * Token Embedding View
 *
 * Displays token embeddings as a visual grid with color-coded values.
 * Shows the embedding vector for each token.
 */

import { useMemo } from 'react'
import {
  Box,
  Typography,
  Stack,
  Paper,
  Tooltip,
} from '@mui/material'
import type { Token } from '../types'
import { viridisHex } from '../utils/colormap'

interface TokenEmbeddingViewProps {
  tokens: Token[]
  /** Number of dimensions to display (for readability) */
  visibleDims?: number
}

export default function TokenEmbeddingView({
  tokens,
  visibleDims = 16,
}: TokenEmbeddingViewProps) {
  // Normalize embeddings for color mapping
  const { normalized, dModel } = useMemo(() => {
    if (tokens.length === 0) return { normalized: [], dModel: 0 }
    const dim = tokens[0]!.embedding.length

    // Find global min/max across all token embeddings
    let min = Infinity
    let max = -Infinity
    for (const token of tokens) {
      for (const v of token.embedding) {
        if (v < min) min = v
        if (v > max) max = v
      }
    }
    const range = max - min || 1

    const norm = tokens.map((token) =>
      token.embedding.slice(0, visibleDims).map((v) => (v - min) / range),
    )
    return { normalized: norm, dModel: dim }
  }, [tokens, visibleDims])

  if (tokens.length === 0) return null

  const cellSize = Math.max(16, Math.min(28, 320 / tokens.length))

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">Token Embeddings</Typography>
          <Typography variant="caption" color="text.secondary">
            d_model = {dModel}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Each row is a token; each column is one embedding dimension.
          Color intensity shows magnitude (viridis colormap).
        </Typography>

        <Box sx={{ overflowX: 'auto' }}>
          <Box sx={{ display: 'inline-block' }}>
            {/* Column header: dimension indices */}
            <Stack direction="row" sx={{ ml: '60px', mb: 0.25 }}>
              {Array.from({ length: Math.min(visibleDims, dModel) }, (_, d) => (
                <Typography
                  key={d}
                  variant="caption"
                  sx={{
                    width: cellSize,
                    textAlign: 'center',
                    fontSize: '0.55rem',
                    color: 'text.secondary',
                  }}
                >
                  {d}
                </Typography>
              ))}
              {dModel > visibleDims && (
                <Typography variant="caption" sx={{ ml: 0.5, color: 'text.secondary', fontSize: '0.55rem' }}>
                  ...+{dModel - visibleDims}
                </Typography>
              )}
            </Stack>

            {/* Rows: one per token */}
            {tokens.map((token, tIdx) => (
              <Stack key={tIdx} direction="row" alignItems="center" sx={{ mb: '1px' }}>
                <Typography
                  variant="caption"
                  sx={{
                    width: 56,
                    textAlign: 'right',
                    pr: 0.5,
                    fontSize: '0.65rem',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {token.text}
                </Typography>
                {normalized[tIdx]?.map((val, d) => (
                  <Tooltip
                    key={d}
                    title={`${token.text}[${d}] = ${token.embedding[d]?.toFixed(3)}`}
                    placement="top"
                    arrow
                  >
                    <Box
                      sx={{
                        width: cellSize,
                        height: cellSize,
                        backgroundColor: viridisHex(val),
                        border: '0.5px solid rgba(255,255,255,0.05)',
                        cursor: 'default',
                      }}
                    />
                  </Tooltip>
                ))}
              </Stack>
            ))}
          </Box>
        </Box>
      </Stack>
    </Paper>
  )
}
