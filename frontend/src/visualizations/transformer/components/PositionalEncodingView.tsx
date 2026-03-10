/**
 * Positional Encoding View
 *
 * Visualizes the sinusoidal positional encoding vectors.
 * Shows both the sine and cosine components across positions.
 */

import { useRef, useEffect, useMemo } from 'react'
import { Box, Typography, Stack, Paper } from '@mui/material'
import type { Token } from '../types'
import { viridisRGB } from '../utils/colormap'

interface PositionalEncodingViewProps {
  tokens: Token[]
  visibleDims?: number
}

const CANVAS_W = 380
const CANVAS_H = 200

export default function PositionalEncodingView({
  tokens,
  visibleDims = 32,
}: PositionalEncodingViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Precompute normalized PE matrix
  const { peMatrix, dModel } = useMemo(() => {
    if (tokens.length === 0) return { peMatrix: [], dModel: 0 }
    const dim = tokens[0]!.positionalEncoding.length
    const dims = Math.min(visibleDims, dim)

    let min = Infinity
    let max = -Infinity
    for (const t of tokens) {
      for (let d = 0; d < dims; d++) {
        const v = t.positionalEncoding[d]!
        if (v < min) min = v
        if (v > max) max = v
      }
    }
    const range = max - min || 1

    const matrix = tokens.map((t) =>
      Array.from({ length: dims }, (_, d) => (t.positionalEncoding[d]! - min) / range),
    )
    return { peMatrix: matrix, dModel: dim }
  }, [tokens, visibleDims])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || peMatrix.length === 0) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS_W * dpr
    canvas.height = CANVAS_H * dpr
    ctx.scale(dpr, dpr)

    // Background
    ctx.fillStyle = '#0d0d1a'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    const seqLen = peMatrix.length
    const dims = peMatrix[0]?.length ?? 0
    const cellW = (CANVAS_W - 50) / dims
    const cellH = (CANVAS_H - 30) / seqLen
    const offsetX = 45
    const offsetY = 20

    // Draw heatmap cells
    for (let pos = 0; pos < seqLen; pos++) {
      for (let d = 0; d < dims; d++) {
        const val = peMatrix[pos]?.[d] ?? 0
        const [r, g, b] = viridisRGB(val)
        ctx.fillStyle = `rgb(${r},${g},${b})`
        ctx.fillRect(
          offsetX + d * cellW,
          offsetY + pos * cellH,
          cellW - 0.5,
          cellH - 0.5,
        )
      }
    }

    // Labels — positions
    ctx.fillStyle = '#B0BEC5'
    ctx.font = '8px monospace'
    ctx.textAlign = 'right'
    ctx.textBaseline = 'middle'
    for (let pos = 0; pos < seqLen; pos++) {
      ctx.fillText(
        tokens[pos]?.text.slice(0, 5) ?? `p${pos}`,
        offsetX - 4,
        offsetY + pos * cellH + cellH / 2,
      )
    }

    // Labels — dimensions
    ctx.textAlign = 'center'
    ctx.textBaseline = 'top'
    for (let d = 0; d < dims; d += Math.max(1, Math.floor(dims / 8))) {
      ctx.fillText(`${d}`, offsetX + d * cellW + cellW / 2, CANVAS_H - 12)
    }

    // Axis labels
    ctx.save()
    ctx.fillStyle = '#8E44AD'
    ctx.font = 'bold 9px sans-serif'
    ctx.translate(8, CANVAS_H / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.textAlign = 'center'
    ctx.fillText('Position', 0, 0)
    ctx.restore()

    ctx.fillStyle = '#8E44AD'
    ctx.font = 'bold 9px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Dimension (sin/cos)', CANVAS_W / 2 + 20, 8)
  }, [peMatrix, tokens])

  if (tokens.length === 0) return null

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle2">Positional Encoding</Typography>
          <Typography variant="caption" color="text.secondary">
            d_model = {dModel}
          </Typography>
        </Stack>

        <Typography variant="caption" color="text.secondary">
          <b>PE(pos, 2i)</b> = sin(pos / 10000^(2i/d)) &nbsp;|&nbsp;
          <b>PE(pos, 2i+1)</b> = cos(pos / 10000^(2i/d))
        </Typography>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: '#0d0d1a',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ width: CANVAS_W, height: CANVAS_H, maxWidth: '100%' }}
          />
        </Box>
      </Stack>
    </Paper>
  )
}
