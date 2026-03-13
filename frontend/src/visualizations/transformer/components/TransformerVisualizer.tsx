/**
 * Transformer Visualizer — Main Container
 *
 * Full-page interactive transformer visualization.
 * Combines the 3D BabylonJS scene with 2D info panels,
 * stage stepping controls, and attention matrix view.
 *
 * Layout:
 *   Left sidebar  — input, controls, configuration
 *   Center        — 3D transformer scene
 *   Right panel   — contextual info (embeddings, attention, FFN, etc.)
 */

import PageContainer from '@/components/common/PageContainer';
import {
  Psychology as BrainIcon,
  Settings as ConfigIcon,
  ExpandMore as ExpandMoreIcon,
  Layers as LayersIcon,
  AccountTree as ModelIcon,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Slider,
  Stack,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_CONFIG, MODEL_CONFIGS, MODEL_LABELS, type ModelPreset } from '../constants';
import { runTransformer } from '../engine/TransformerEngine';
import type { AttentionVizMode, TransformerConfig, TransformerState } from '../types';
import { TransformerStage } from '../types';
import AttentionMatrix from './AttentionMatrix';
import FeedForwardView from './FeedForwardView';
import PositionalEncodingView from './PositionalEncodingView';
import ResidualConnectionView from './ResidualConnectionView';
import StageControls from './StageControls';
import TokenEmbeddingView from './TokenEmbeddingView';
import TokenInput from './TokenInput';
import TransformerScene from './TransformerScene';

// ─── Model Selector ───────────────────────────────────────────────────────────

interface ModelSelectorProps {
  selectedModel: ModelPreset;
  onModelChange: (model: ModelPreset) => void;
}

function ModelSelector({ selectedModel, onModelChange }: ModelSelectorProps) {
  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ModelIcon fontSize="small" color="primary" />
          <Typography variant="subtitle2">Model Preset</Typography>
        </Stack>
        <FormControl fullWidth size="small">
          <InputLabel id="model-preset-label">Architecture</InputLabel>
          <Select
            labelId="model-preset-label"
            value={selectedModel}
            label="Architecture"
            onChange={(e) => onModelChange(e.target.value as ModelPreset)}
          >
            <MenuItem value="custom">{MODEL_LABELS.custom}</MenuItem>
            <MenuItem value="bert_base">{MODEL_LABELS.bert_base}</MenuItem>
            <MenuItem value="gpt2">{MODEL_LABELS.gpt2}</MenuItem>
          </Select>
        </FormControl>
        {selectedModel !== 'custom' && (
          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
            Using {MODEL_LABELS[selectedModel]} configuration
          </Typography>
        )}
      </Stack>
    </Paper>
  );
}

// ─── Config panel ─────────────────────────────────────────────────────────────

interface ConfigPanelProps {
  config: TransformerConfig;
  onConfigChange: (config: TransformerConfig) => void;
  disabled?: boolean;
  lockedToModel?: string;
}

function ConfigPanel({
  config,
  onConfigChange,
  disabled = false,
  lockedToModel,
}: ConfigPanelProps) {
  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <ConfigIcon fontSize="small" />
          <Typography variant="subtitle2">Configuration</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails
        sx={{
          bgcolor: disabled ? 'action.disabledBackground' : 'transparent',
          opacity: disabled ? 0.7 : 1,
          transition: 'all 0.2s ease',
        }}
      >
        <Stack spacing={2}>
          {disabled && lockedToModel && (
            <Typography variant="caption" color="warning.main" sx={{ fontWeight: 500 }}>
              🔒 Locked to {lockedToModel} preset. Select "Custom" to adjust parameters.
            </Typography>
          )}
          <Box>
            <Typography variant="caption" color="text.secondary">
              Model Dimension (d_model): {config.dModel}
            </Typography>
            <Slider
              value={config.dModel}
              min={16}
              max={128}
              step={16}
              size="small"
              disabled={disabled}
              onChange={(_, v) => onConfigChange({ ...config, dModel: v as number })}
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Attention Heads: {config.numHeads}
            </Typography>
            <Slider
              value={config.numHeads}
              min={1}
              max={8}
              step={1}
              size="small"
              marks
              disabled={disabled}
              onChange={(_, v) => onConfigChange({ ...config, numHeads: v as number })}
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              FFN Dimension (d_ff): {config.dFF}
            </Typography>
            <Slider
              value={config.dFF}
              min={32}
              max={512}
              step={32}
              size="small"
              disabled={disabled}
              onChange={(_, v) => onConfigChange({ ...config, dFF: v as number })}
            />
          </Box>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Number of Layers: {config.numLayers}
            </Typography>
            <Slider
              value={config.numLayers}
              min={1}
              max={6}
              step={1}
              size="small"
              marks
              disabled={disabled}
              onChange={(_, v) => onConfigChange({ ...config, numLayers: v as number })}
            />
          </Box>
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

// ─── Architecture legend ──────────────────────────────────────────────────────

const LEGEND_ITEMS = [
  { color: '#3498DB', label: 'Tokens' },
  { color: '#9B59B6', label: 'Embeddings' },
  { color: '#8E44AD', label: 'Positional Enc.' },
  { color: '#3498DB', label: 'Attention Heads' },
  { color: '#E74C3C', label: 'Q (Query)' },
  { color: '#F39C12', label: 'K (Key)' },
  { color: '#2ECC71', label: 'V (Value)' },
  { color: '#E67E22', label: 'Feed-Forward' },
  { color: '#BD10E0', label: 'Layer Norm' },
  { color: '#1ABC9C', label: 'Residual Skip' },
];

function TransformerLegend() {
  return (
    <Accordion defaultExpanded>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <LayersIcon fontSize="small" />
          <Typography variant="subtitle2">Legend</Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails>
        <Stack spacing={0.5}>
          {LEGEND_ITEMS.map((item) => (
            <Stack key={item.label} direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 12,
                  height: 12,
                  borderRadius: '2px',
                  backgroundColor: item.color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="caption">{item.label}</Typography>
            </Stack>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function TransformerVisualizer() {
  // State
  const [selectedModel, setSelectedModel] = useState<ModelPreset>('custom');
  const [config, setConfig] = useState<TransformerConfig>({ ...DEFAULT_CONFIG });
  const [transformerState, setTransformerState] = useState<TransformerState | null>(null);
  const [currentStage, setCurrentStage] = useState<TransformerStage>(TransformerStage.INPUT);
  const [selectedLayer, setSelectedLayer] = useState(0);
  const [selectedHead, setSelectedHead] = useState(0);
  const [attentionMode, setAttentionMode] = useState<AttentionVizMode>('heatmap');

  // ── Handle model preset change ──────────────────────────────────────────
  const handleModelChange = useCallback((model: ModelPreset) => {
    setSelectedModel(model);
    setConfig({ ...MODEL_CONFIGS[model] });
    // Reset transformer state to force re-computation with new config
    setTransformerState(null);
    setCurrentStage(TransformerStage.INPUT);
  }, []);

  // ── Handle text input ───────────────────────────────────────────────────
  const handleTextChange = useCallback(
    (text: string) => {
      if (!text.trim()) {
        setTransformerState(null);
        setCurrentStage(TransformerStage.INPUT);
        return;
      }
      const state = runTransformer(text, config);
      setTransformerState(state);
      // Auto-advance to tokenization
      if (currentStage === TransformerStage.INPUT) {
        setCurrentStage(TransformerStage.TOKENIZATION);
      }
    },
    [config, currentStage]
  );

  // ── Memoized data for current view ──────────────────────────────────────
  const currentLayerData = useMemo(() => {
    if (!transformerState || transformerState.layers.length === 0) return null;
    return transformerState.layers[selectedLayer] ?? null;
  }, [transformerState, selectedLayer]);

  const currentAttentionWeights = useMemo(() => {
    if (!currentLayerData) return [];
    const head = currentLayerData.selfAttention.heads[selectedHead];
    return head?.weights ?? [];
  }, [currentLayerData, selectedHead]);

  const tokenLabels = useMemo(
    () => transformerState?.tokens.map((t) => t.text) ?? [],
    [transformerState]
  );

  // ── Right panel content based on current stage ──────────────────────────
  const renderContextPanel = () => {
    if (!transformerState) {
      return (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <BrainIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Enter text to begin visualizing the transformer pipeline
          </Typography>
        </Paper>
      );
    }

    return (
      <Stack spacing={2}>
        {/* Embeddings — visible from EMBEDDING stage */}
        {currentStage >= TransformerStage.EMBEDDING && (
          <TokenEmbeddingView tokens={transformerState.tokens} />
        )}

        {/* Positional encoding — visible from PE stage */}
        {currentStage >= TransformerStage.POSITIONAL_ENCODING && (
          <PositionalEncodingView tokens={transformerState.tokens} />
        )}

        {/* Attention matrix — visible from SELF_ATTENTION stage */}
        {currentStage >= TransformerStage.SELF_ATTENTION && currentLayerData && (
          <AttentionMatrix
            tokens={tokenLabels}
            weights={currentAttentionWeights}
            mode={attentionMode}
            onModeChange={setAttentionMode}
            selectedHead={selectedHead}
            numHeads={config.numHeads}
            onHeadChange={setSelectedHead}
          />
        )}

        {/* Residual 1 — visible from ADD_NORM_1 stage */}
        {currentStage >= TransformerStage.RESIDUAL_ADD_NORM_1 && currentLayerData && (
          <ResidualConnectionView
            residual={currentLayerData.attentionResidual}
            label="Add & Norm (Post-Attention)"
            tokenLabels={tokenLabels}
          />
        )}

        {/* FFN — visible from FEED_FORWARD stage */}
        {currentStage >= TransformerStage.FEED_FORWARD && currentLayerData && (
          <FeedForwardView
            ffn={currentLayerData.feedForward}
            dModel={config.dModel}
            dFF={config.dFF}
          />
        )}

        {/* Residual 2 — visible from ADD_NORM_2 stage */}
        {currentStage >= TransformerStage.RESIDUAL_ADD_NORM_2 && currentLayerData && (
          <ResidualConnectionView
            residual={currentLayerData.ffnResidual}
            label="Add & Norm (Post-FFN)"
            tokenLabels={tokenLabels}
          />
        )}

        {/* Final output info */}
        {currentStage >= TransformerStage.FINAL_OUTPUT && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" color="success.main" gutterBottom>
              Transformer Complete
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {transformerState.tokens.length} tokens processed through {config.numLayers} encoder
              layer{config.numLayers > 1 ? 's' : ''}, each with {config.numHeads}-head attention and
              FFN ({config.dModel}→{config.dFF}→{config.dModel}).
            </Typography>
          </Paper>
        )}
      </Stack>
    );
  };

  return (
    <PageContainer
      title="Transformer Visualizer"
      subtitle="Interactive step-by-step visualization of the Transformer encoder architecture"
    >
      <Grid container spacing={2}>
        {/* ── Left Sidebar ─────────────────────────────────────────────────── */}
        <Grid item xs={12} md={3}>
          <Stack spacing={2}>
            {/* Model Preset Selector */}
            <ModelSelector selectedModel={selectedModel} onModelChange={handleModelChange} />

            <TokenInput onTextChange={handleTextChange} />

            <StageControls
              currentStage={currentStage}
              onStageChange={setCurrentStage}
              selectedLayer={selectedLayer}
              numLayers={config.numLayers}
              onLayerChange={setSelectedLayer}
            />

            <ConfigPanel
              config={config}
              onConfigChange={setConfig}
              disabled={selectedModel !== 'custom'}
              lockedToModel={selectedModel !== 'custom' ? MODEL_LABELS[selectedModel] : undefined}
            />

            <TransformerLegend />

            {/* Architecture info */}
            {transformerState && (
              <Paper sx={{ p: 2 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  <Chip
                    label={`${transformerState.tokens.length} tokens`}
                    size="small"
                    color="primary"
                  />
                  <Chip label={`${config.numLayers} layers`} size="small" color="secondary" />
                  <Chip label={`${config.numHeads} heads`} size="small" color="info" />
                  <Chip label={`d=${config.dModel}`} size="small" color="success" />
                </Stack>
              </Paper>
            )}
          </Stack>
        </Grid>

        {/* ── Center: 3D Scene ─────────────────────────────────────────────── */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ overflow: 'hidden', borderRadius: 2 }}>
            <TransformerScene
              transformerState={transformerState}
              currentStage={currentStage}
              selectedLayer={selectedLayer}
              selectedHead={selectedHead}
              height="calc(100vh - 160px)"
            />
          </Paper>
        </Grid>

        {/* ── Right Panel: Context Info ────────────────────────────────────── */}
        <Grid item xs={12} md={4}>
          <Box sx={{ maxHeight: 'calc(100vh - 160px)', overflowY: 'auto', pr: 0.5 }}>
            {renderContextPanel()}
          </Box>
        </Grid>
      </Grid>
    </PageContainer>
  );
}

// Made with Bob
