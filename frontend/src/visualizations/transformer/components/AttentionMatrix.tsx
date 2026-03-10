/**
 * Attention Matrix Component
 *
 * Interactive 2D canvas-based attention heatmap.
 * Supports heatmap, arc, and matrix visualization modes.
 * Ported from legacy AttentionVisualizer.js with React/TypeScript.
 */

import { useRef, useEffect, useCallback, useMemo } from 'react'
import {
  Box,
  Typography,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Paper,
} from '@mui/material'
import type { AttentionVizMode } from '../types'
import { viridisHex, viridisRGB } from '../utils/colormap'
import { COLORS, LIMITS } from '../constants'

interface AttentionMatrixProps {
  tokens: string[]
  weights: number[][]       // [seqLen, seqLen]
  mode: AttentionVizMode
  onModeChange: (mode: AttentionVizMode) => void
  selectedHead: number
  numHeads: number
  onHeadChange: (head: number) => void
}

const CANVAS_SIZE = 400

export default function AttentionMatrix({
  tokens,
  weights,
  mode,
  onModeChange,
  selectedHead,
  numHeads,
  onHeadChange,
}: AttentionMatrixProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // ── Draw heatmap ──────────────────────────────────────────────────────────
  const drawHeatmap = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const seqLen = tokens.length
      const cellW = w / seqLen
      const cellH = (h - 30) / seqLen // reserve 30px for labels
      const labelOffset = 30

      // Background
      ctx.fillStyle = COLORS.background
      ctx.fillRect(0, 0, w, h)

      // Cell rendering
      for (let i = 0; i < seqLen; i++) {
        for (let j = 0; j < seqLen; j++) {
          const weight = weights[i]?.[j] ?? 0
          ctx.fillStyle = viridisHex(weight)
          ctx.fillRect(
            labelOffset + j * cellW,
            labelOffset + i * cellH,
            cellW - 1,
            cellH - 1,
          )
        }
      }

      // Grid lines
      ctx.strokeStyle = COLORS.gridLine
      ctx.lineWidth = 0.5
      for (let i = 0; i <= seqLen; i++) {
        ctx.beginPath()
        ctx.moveTo(labelOffset + i * cellW, labelOffset)
        ctx.lineTo(labelOffset + i * cellW, labelOffset + seqLen * cellH)
        ctx.stroke()

        ctx.beginPath()
        ctx.moveTo(labelOffset, labelOffset + i * cellH)
        ctx.lineTo(labelOffset + seqLen * cellW, labelOffset + i * cellH)
        ctx.stroke()
      }

      // Token labels (top)
      ctx.fillStyle = COLORS.text
      ctx.font = '9px monospace'
      ctx.textAlign = 'center'
      for (let j = 0; j < seqLen; j++) {
        const label = tokens[j]?.slice(0, 5) ?? ''
        ctx.save()
        ctx.translate(labelOffset + j * cellW + cellW / 2, labelOffset - 4)
        ctx.rotate(-Math.PI / 4)
        ctx.fillText(label, 0, 0)
        ctx.restore()
      }

      // Token labels (left)
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < seqLen; i++) {
        const label = tokens[i]?.slice(0, 5) ?? ''
        ctx.fillText(label, labelOffset - 4, labelOffset + i * cellH + cellH / 2)
      }
    },
    [tokens, weights],
  )

  // ── Draw arcs ─────────────────────────────────────────────────────────────
  const drawArcs = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const seqLen = tokens.length
      const spacing = w / (seqLen + 1)
      const baseY = h * 0.7

      // Background
      ctx.fillStyle = COLORS.background
      ctx.fillRect(0, 0, w, h)

      // Draw token boxes
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      for (let i = 0; i < seqLen; i++) {
        const x = spacing * (i + 1)
        // Box
        ctx.fillStyle = COLORS.token
        ctx.fillRect(x - 20, baseY - 12, 40, 24)
        // Label
        ctx.fillStyle = '#FFFFFF'
        ctx.fillText(tokens[i]?.slice(0, 5) ?? '', x, baseY + 4)
      }

      // Draw arcs
      for (let i = 0; i < seqLen; i++) {
        for (let j = 0; j < seqLen; j++) {
          if (i === j) continue
          const weight = weights[i]?.[j] ?? 0
          if (weight < LIMITS.attentionThreshold) continue

          const x1 = spacing * (i + 1)
          const x2 = spacing * (j + 1)
          const arcHeight = Math.abs(x2 - x1) * 0.4

          ctx.beginPath()
          ctx.moveTo(x1, baseY - 12)
          ctx.quadraticCurveTo(
            (x1 + x2) / 2,
            baseY - 12 - arcHeight,
            x2,
            baseY - 12,
          )
          ctx.strokeStyle = viridisHex(weight)
          ctx.lineWidth = 1 + weight * 3
          ctx.globalAlpha = 0.4 + weight * 0.6
          ctx.stroke()
          ctx.globalAlpha = 1
        }
      }
    },
    [tokens, weights],
  )

  // ── Draw matrix (3D-ish cells) ────────────────────────────────────────────
  const drawMatrix = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const seqLen = tokens.length
      const cellSize = Math.min((w - 40) / seqLen, (h - 40) / seqLen)
      const offsetX = (w - seqLen * cellSize) / 2
      const offsetY = (h - seqLen * cellSize) / 2

      ctx.fillStyle = COLORS.background
      ctx.fillRect(0, 0, w, h)

      for (let i = 0; i < seqLen; i++) {
        for (let j = 0; j < seqLen; j++) {
          const weight = weights[i]?.[j] ?? 0
          const x = offsetX + j * cellSize
          const y = offsetY + i * cellSize

          // Cell with height based on weight
          const barH = weight * cellSize * 0.8
          const [r, g, b] = viridisRGB(weight)

          // Shadow
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.3)`
          ctx.fillRect(x + 2, y + 2, cellSize - 4, cellSize - 4)

          // Main cell
          ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
          ctx.fillRect(x + 2, y + (cellSize - 4 - barH), cellSize - 4, barH)

          // Border
          ctx.strokeStyle = 'rgba(255,255,255,0.15)'
          ctx.lineWidth = 0.5
          ctx.strokeRect(x + 1, y + 1, cellSize - 2, cellSize - 2)
        }
      }

      // Labels
      ctx.fillStyle = COLORS.text
      ctx.font = '8px monospace'
      ctx.textAlign = 'center'
      for (let j = 0; j < seqLen; j++) {
        ctx.fillText(
          tokens[j]?.slice(0, 4) ?? '',
          offsetX + j * cellSize + cellSize / 2,
          offsetY - 6,
        )
      }
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      for (let i = 0; i < seqLen; i++) {
        ctx.fillText(
          tokens[i]?.slice(0, 4) ?? '',
          offsetX - 4,
          offsetY + i * cellSize + cellSize / 2,
        )
      }
    },
    [tokens, weights],
  )

  // ── Render ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = CANVAS_SIZE * dpr
    canvas.height = CANVAS_SIZE * dpr
    ctx.scale(dpr, dpr)

    switch (mode) {
      case 'arc':
        drawArcs(ctx, CANVAS_SIZE, CANVAS_SIZE)
        break
      case 'matrix':
        drawMatrix(ctx, CANVAS_SIZE, CANVAS_SIZE)
        break
      case 'heatmap':
      default:
        drawHeatmap(ctx, CANVAS_SIZE, CANVAS_SIZE)
        break
    }
  }, [mode, drawHeatmap, drawArcs, drawMatrix])

  // ── Head labels for slider ────────────────────────────────────────────────
  const headMarks = useMemo(
    () =>
      Array.from({ length: numHeads }, (_, i) => ({
        value: i,
        label: `${i + 1}`,
      })),
    [numHeads],
  )

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Typography variant="subtitle2">Attention Weights</Typography>

        {/* Mode selector */}
        <ToggleButtonGroup
          value={mode}
          exclusive
          onChange={(_, v) => v && onModeChange(v as AttentionVizMode)}
          size="small"
          fullWidth
        >
          <ToggleButton value="heatmap">Heatmap</ToggleButton>
          <ToggleButton value="arc">Arcs</ToggleButton>
          <ToggleButton value="matrix">Matrix</ToggleButton>
        </ToggleButtonGroup>

        {/* Head selector */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Head {selectedHead + 1} / {numHeads}
          </Typography>
          <Slider
            value={selectedHead}
            min={0}
            max={numHeads - 1}
            step={1}
            marks={headMarks}
            onChange={(_, v) => onHeadChange(v as number)}
            size="small"
            sx={{ mt: 0.5 }}
          />
        </Box>

        {/* Canvas */}
        <Box
          sx={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            borderRadius: 1,
            overflow: 'hidden',
            bgcolor: COLORS.background,
          }}
        >
          <canvas
            ref={canvasRef}
            style={{
              width: CANVAS_SIZE,
              height: CANVAS_SIZE,
              maxWidth: '100%',
            }}
          />
        </Box>
      </Stack>
    </Paper>
  )
}
