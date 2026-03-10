/**
 * Residual Connection View
 *
 * Visualizes skip connections and layer normalization.
 * Shows the Add & Norm operation with before/after comparison.
 */

import { useMemo } from 'react'
import {
  Box,
  Typography,
  Stack,
  Paper,
  Tooltip,
} from '@mui/material'
import type { ResidualResult } from '../types'
import { viridisHex } from '../utils/colormap'
import { COLORS } from '../constants'

interface ResidualConnectionViewProps {
  residual: ResidualResult
  label: string
  tokenLabels: string[]
}

export default function ResidualConnectionView({
  residual,
  label,
  tokenLabels,
}: ResidualConnectionViewProps) {
  const visibleDims = 12

  // Normalize all three matrices to a shared scale
  const { skipNorm, preNormNorm, postNormNorm } = useMemo(() => {
    const all = [
      ...residual.skipInput.flat(),
      ...residual.preNorm.flat(),
      ...residual.postNorm.flat(),
    ]
    const min = Math.min(...all)
    const max = Math.max(...all)
    const range = max - min || 1
    const norm = (mat: number[][]) =>
      mat.map((row) => row.slice(0, visibleDims).map((v) => (v - min) / range))

    return {
      skipNorm: norm(residual.skipInput),
      preNormNorm: norm(residual.preNorm),
      postNormNorm: norm(residual.postNorm),
    }
  }, [residual])

  const cellSize = 16
  const seqLen = Math.min(tokenLabels.length, residual.skipInput.length)

  const renderGrid = (
    data: number[][],
    title: string,
    color: string,
  ) => (
    <Box>
      <Typography
        variant="caption"
        sx={{ fontWeight: 'bold', color, fontSize: '0.65rem', display: 'block', mb: 0.25 }}
      >
        {title}
      </Typography>
      {Array.from({ length: seqLen }, (_, t) => (
        <Stack key={t} direction="row" sx={{ mb: '1px' }}>
          {data[t]?.map((val, d) => (
            <Tooltip key={d} title={`dim ${d}: ${val.toFixed(3)}`} placement="top" arrow>
              <Box
                sx={{
                  width: cellSize,
                  height: cellSize,
                  backgroundColor: viridisHex(val),
                  border: '0.5px solid rgba(255,255,255,0.03)',
                }}
              />
            </Tooltip>
          ))}
        </Stack>
      ))}
    </Box>
  )

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1}>
        <Typography variant="subtitle2">{label}</Typography>
        <Typography variant="caption" color="text.secondary">
          output = LayerNorm(x + sublayer(x))
        </Typography>

        <Stack direction="row" spacing={1.5} alignItems="flex-start" sx={{ overflowX: 'auto' }}>
          {renderGrid(skipNorm, 'Skip (x)', COLORS.residual)}

          <Box sx={{ display: 'flex', alignItems: 'center', pt: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#999' }}>
              +
            </Typography>
          </Box>

          {renderGrid(preNormNorm, 'x + sublayer', '#999')}

          <Box sx={{ display: 'flex', alignItems: 'center', pt: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 'bold', color: COLORS.layerNorm }}>
              →LN→
            </Typography>
          </Box>

          {renderGrid(postNormNorm, 'Normalized', COLORS.layerNorm)}
        </Stack>
      </Stack>
    </Paper>
  )
}
