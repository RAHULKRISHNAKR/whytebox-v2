/**
 * Stage Controls Component
 *
 * Step-through controls for navigating transformer processing stages.
 * Shows a progress-like indicator and allows forward/backward navigation.
 */

import { useCallback, useMemo } from 'react'
import {
  Box,
  Typography,
  IconButton,
  Stack,
  Chip,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Tooltip,
} from '@mui/material'
import {
  SkipPrevious as PrevIcon,
  SkipNext as NextIcon,
  FirstPage as FirstIcon,
  LastPage as LastIcon,
} from '@mui/icons-material'
import { TransformerStage, STAGE_LABELS, TOTAL_STAGES } from '../types'

interface StageControlsProps {
  currentStage: TransformerStage
  onStageChange: (stage: TransformerStage) => void
  selectedLayer: number
  numLayers: number
  onLayerChange: (layer: number) => void
}

export default function StageControls({
  currentStage,
  onStageChange,
  selectedLayer,
  numLayers,
  onLayerChange,
}: StageControlsProps) {
  const canGoBack = currentStage > 0
  const canGoForward = currentStage < TOTAL_STAGES - 1

  const handlePrev = useCallback(() => {
    if (canGoBack) onStageChange(currentStage - 1)
  }, [canGoBack, currentStage, onStageChange])

  const handleNext = useCallback(() => {
    if (canGoForward) onStageChange(currentStage + 1)
  }, [canGoForward, currentStage, onStageChange])

  const handleFirst = useCallback(() => {
    onStageChange(TransformerStage.INPUT)
  }, [onStageChange])

  const handleLast = useCallback(() => {
    onStageChange(TOTAL_STAGES - 1)
  }, [onStageChange])

  // Compact stepper labels for the major stages
  const majorStages = useMemo(
    () => [
      { stage: TransformerStage.INPUT, label: 'Input' },
      { stage: TransformerStage.EMBEDDING, label: 'Embed' },
      { stage: TransformerStage.SELF_ATTENTION, label: 'Attention' },
      { stage: TransformerStage.FEED_FORWARD, label: 'FFN' },
      { stage: TransformerStage.FINAL_OUTPUT, label: 'Output' },
    ],
    [],
  )

  const activeStepIndex = useMemo(() => {
    for (let i = majorStages.length - 1; i >= 0; i--) {
      if (currentStage >= majorStages[i]!.stage) return i
    }
    return 0
  }, [currentStage, majorStages])

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        {/* Header with stage name */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" color="primary">
            Stage {currentStage + 1}/{TOTAL_STAGES}
          </Typography>
          <Chip
            label={STAGE_LABELS[currentStage]}
            size="small"
            color="primary"
            sx={{ fontSize: '0.7rem' }}
          />
        </Stack>

        {/* Compact stepper */}
        <Stepper activeStep={activeStepIndex} alternativeLabel sx={{ '& .MuiStepLabel-label': { fontSize: '0.65rem' } }}>
          {majorStages.map((s) => (
            <Step key={s.stage} completed={currentStage >= s.stage}>
              <StepLabel
                sx={{ cursor: 'pointer' }}
                onClick={() => onStageChange(s.stage)}
              >
                {s.label}
              </StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Navigation buttons */}
        <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
          <Tooltip title="First stage">
            <span>
              <IconButton size="small" onClick={handleFirst} disabled={!canGoBack}>
                <FirstIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Previous stage">
            <span>
              <IconButton size="small" onClick={handlePrev} disabled={!canGoBack}>
                <PrevIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Next stage">
            <span>
              <IconButton size="small" onClick={handleNext} disabled={!canGoForward}>
                <NextIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Last stage">
            <span>
              <IconButton size="small" onClick={handleLast} disabled={!canGoForward}>
                <LastIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>

        {/* Layer selector (when viewing per-layer stages) */}
        {currentStage >= TransformerStage.SELF_ATTENTION &&
          currentStage <= TransformerStage.LAYER_OUTPUT &&
          numLayers > 1 && (
            <Stack direction="row" alignItems="center" spacing={1} justifyContent="center">
              <Typography variant="caption" color="text.secondary">
                Layer:
              </Typography>
              {Array.from({ length: numLayers }, (_, i) => (
                <Chip
                  key={i}
                  label={i + 1}
                  size="small"
                  color={selectedLayer === i ? 'primary' : 'default'}
                  onClick={() => onLayerChange(i)}
                  sx={{ fontSize: '0.65rem', height: 20, minWidth: 28 }}
                />
              ))}
            </Stack>
          )}
      </Stack>
    </Paper>
  )
}
