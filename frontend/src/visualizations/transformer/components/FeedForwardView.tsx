/**
 * Feed-Forward View
 *
 * Visualizes the position-wise feed-forward network transformation.
 * Shows the expansion (dModel → dFF) and compression (dFF → dModel).
 */

import { useRef, useEffect, useMemo } from 'react'
import { Box, Typography, Stack, Paper, Chip } from '@mui/material'
import type { FeedForwardResult } from '../types'
import { viridisRGB } from '../utils/colormap'
import { COLORS } from '../constants'

interface FeedForwardViewProps {
  ffn: FeedForwardResult
  dModel: number
  dFF: number
}

const CANVAS_W = 380
const CANVAS_H = 160

export default function FeedForwardView({ ffn, dModel, dFF }: FeedForwardViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Normalize values for the three stages
  const normalized = useMemo(() => {
    const normalize = (matrix: number[][]) => {
      const flat = matrix.flat()
      const min = Math.min(...flat)
      const max = Math.max(...flat)
      const range = max - min || 1
      return matrix.map((row) => row.map((v) => (v - min) / range))
    }
    return {
      input: normalize(ffn.input),
      hidden: normalize(ffn.hidden),
      output: normalize(ffn.output),
    }
  }, [ffn])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS_W * dpr
    canvas.height = CANVAS_H * dpr
    ctx.scale(dpr, dpr)

    ctx.fillStyle = '#0d0d1a'
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H)

    const seqLen = Math.min(ffn.input.length, 8)
    const sections = [
      { label: `Input (${dModel})`, data: normalized.input, dims: Math.min(dModel, 16) },
      { label: `Hidden (${dFF})`, data: normalized.hidden, dims: Math.min(dFF, 24) },
      { label: `Output (${dModel})`, data: normalized.output, dims: Math.min(dModel, 16) },
    ]

    const sectionW = (CANVAS_W - 40) / 3
    const topPad = 25

    sections.forEach((section, si) => {
      const sx = 20 + si * sectionW
      const dims = section.dims
      const cellW = Math.max(2, (sectionW - 20) / dims)
      const cellH = Math.max(8, (CANVAS_H - topPad - 20) / seqLen)

      // Section label
      ctx.fillStyle = COLORS.feedForward
      ctx.font = 'bold 8px sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText(section.label, sx + sectionW / 2, 14)

      // Heatmap
      for (let t = 0; t < seqLen; t++) {
        for (let d = 0; d < dims; d++) {
          const val = section.data[t]?.[d] ?? 0
          const [r, g, b] = viridisRGB(val)
          ctx.fillStyle = `rgb(${r},${g},${b})`
          ctx.fillRect(
            sx + 5 + d * cellW,
            topPad + t * cellH,
            cellW - 0.5,
            cellH - 0.5,
          )
        }
      }

      // Arrow to next section
      if (si < sections.length - 1) {
        const arrowX = sx + sectionW - 5
        const arrowY = topPad + (seqLen * cellH) / 2
        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(arrowX + 8, arrowY)
        ctx.strokeStyle = '#666'
        ctx.lineWidth = 1.5
        ctx.stroke()
        // Arrowhead
        ctx.beginPath()
        ctx.moveTo(arrowX + 8, arrowY - 3)
        ctx.lineTo(arrowX + 12, arrowY)
        ctx.lineTo(arrowX + 8, arrowY + 3)
        ctx.fillStyle = '#666'
        ctx.fill()

        // Operation label
        ctx.fillStyle = '#E74C3C'
        ctx.font = 'bold 7px monospace'
        ctx.textAlign = 'center'
        ctx.fillText(si === 0 ? 'ReLU' : 'Linear', arrowX + 5, arrowY - 8)
      }
    })
  }, [normalized, ffn, dModel, dFF])

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="subtitle2">Feed-Forward Network</Typography>
          <Chip
            label={`${dModel} → ${dFF} → ${dModel}`}
            size="small"
            sx={{ fontSize: '0.6rem', height: 18, bgcolor: COLORS.feedForward, color: '#fff' }}
          />
        </Stack>

        <Typography variant="caption" color="text.secondary">
          FFN(x) = ReLU(x·W₁ + b₁)·W₂ + b₂
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
