/**
 * Layer Explanation Sidebar
 *
 * Educational sidebar that explains what each layer type does in plain English.
 * Shows when a user clicks a layer in the 3D visualization.
 */

import type { ArchitectureLayer } from '@/types/api';
import { Close as CloseIcon, Info as InfoIcon } from '@mui/icons-material';
import { Box, Chip, Divider, Drawer, IconButton, Paper, Stack, Typography } from '@mui/material';

interface LayerExplanationSidebarProps {
  open: boolean;
  layer: ArchitectureLayer | null;
  onClose: () => void;
}

// Plain English explanations for each layer type
const LAYER_EXPLANATIONS: Record<string, { name: string; explanation: string }> = {
  // Convolutional layers
  Conv1d: {
    name: 'Feature Detector',
    explanation:
      'Scans the input for patterns like edges, textures, and shapes using sliding filters.',
  },
  Conv2d: {
    name: 'Feature Detector',
    explanation:
      'Scans the image for patterns like edges, textures, and shapes using sliding filters.',
  },
  Conv3d: {
    name: 'Feature Detector',
    explanation:
      'Scans 3D data (like video) for patterns across space and time using sliding filters.',
  },
  ConvTranspose2d: {
    name: 'Upsampler',
    explanation:
      'Increases the spatial resolution of feature maps, often used in image generation.',
  },
  ConvTranspose1d: {
    name: 'Upsampler',
    explanation: 'Increases the resolution of 1D sequences, reversing the effect of convolution.',
  },

  // Normalization layers
  BatchNorm1d: {
    name: 'Normalizer',
    explanation:
      'Keeps values stable so training is faster and more reliable by normalizing across batches.',
  },
  BatchNorm2d: {
    name: 'Normalizer',
    explanation:
      'Keeps values stable so training is faster and more reliable by normalizing across batches.',
  },
  BatchNorm3d: {
    name: 'Normalizer',
    explanation:
      'Keeps values stable so training is faster and more reliable by normalizing across batches.',
  },
  LayerNorm: {
    name: 'Stabilizer',
    explanation:
      'Similar to BatchNorm but used in transformer models. Normalizes across features instead of batches.',
  },
  GroupNorm: {
    name: 'Normalizer',
    explanation: 'Normalizes features in groups, useful when batch sizes are small.',
  },
  InstanceNorm2d: {
    name: 'Normalizer',
    explanation: 'Normalizes each sample independently, commonly used in style transfer.',
  },

  // Activation functions
  ReLU: {
    name: 'Gate',
    explanation: 'Discards negative signals, keeps positive ones. Adds non-linearity to the model.',
  },
  ReLU6: {
    name: 'Gate',
    explanation: 'Like ReLU but caps values at 6, useful for mobile and embedded devices.',
  },
  LeakyReLU: {
    name: 'Gate',
    explanation:
      'Like ReLU but allows small negative values to pass through, preventing dead neurons.',
  },
  Sigmoid: {
    name: 'Squasher',
    explanation: 'Squashes values between 0 and 1, often used for binary classification.',
  },
  Tanh: {
    name: 'Squasher',
    explanation: 'Squashes values between -1 and 1, centering outputs around zero.',
  },
  Softmax: {
    name: 'Confidence Scorer',
    explanation:
      'Converts raw outputs into probabilities that sum to 100%, used for classification.',
  },
  GELU: {
    name: 'Gate',
    explanation: 'Smooth activation function used in transformers, allows gradual transitions.',
  },
  ELU: {
    name: 'Gate',
    explanation: 'Exponential activation that can output negative values, helping with learning.',
  },
  SiLU: {
    name: 'Gate',
    explanation: 'Smooth activation (also called Swish) that multiplies input by its sigmoid.',
  },
  Mish: {
    name: 'Gate',
    explanation: 'Smooth activation function that often improves accuracy in deep networks.',
  },

  // Pooling layers
  MaxPool1d: {
    name: 'Downsampler',
    explanation: 'Shrinks the data by keeping only the strongest signal in each region.',
  },
  MaxPool2d: {
    name: 'Downsampler',
    explanation: 'Shrinks the data by keeping only the strongest signal in each region.',
  },
  MaxPool3d: {
    name: 'Downsampler',
    explanation: 'Shrinks 3D data by keeping only the strongest signal in each region.',
  },
  AvgPool1d: {
    name: 'Downsampler',
    explanation: 'Shrinks the data by averaging values in each region.',
  },
  AvgPool2d: {
    name: 'Downsampler',
    explanation: 'Shrinks the data by averaging values in each region.',
  },
  AvgPool3d: {
    name: 'Downsampler',
    explanation: 'Shrinks 3D data by averaging values in each region.',
  },
  AdaptiveAvgPool2d: {
    name: 'Downsampler',
    explanation: 'Automatically adjusts pooling to produce a fixed output size.',
  },
  AdaptiveMaxPool2d: {
    name: 'Downsampler',
    explanation: 'Automatically adjusts pooling to produce a fixed output size using max values.',
  },

  // Dense/Linear layers
  Linear: {
    name: 'Decision Maker',
    explanation:
      'Combines all learned features to produce a final output using weighted connections.',
  },
  Dense: {
    name: 'Decision Maker',
    explanation:
      'Combines all learned features to produce a final output using weighted connections.',
  },

  // Regularization
  Dropout: {
    name: 'Regularizer',
    explanation: 'Randomly ignores some neurons during training to prevent overfitting.',
  },
  Dropout2d: {
    name: 'Regularizer',
    explanation: 'Randomly drops entire feature maps during training to prevent overfitting.',
  },
  Dropout3d: {
    name: 'Regularizer',
    explanation: 'Randomly drops entire 3D feature volumes during training to prevent overfitting.',
  },

  // Reshape layers
  Flatten: {
    name: 'Reshaper',
    explanation: 'Converts multi-dimensional data into a flat 1D vector for dense layers.',
  },
  Reshape: {
    name: 'Reshaper',
    explanation: 'Changes the shape of data without modifying its content.',
  },

  // Transformer components
  MultiHeadAttention: {
    name: 'Attention',
    explanation:
      'Lets the model focus on the most relevant parts of the input simultaneously across multiple perspectives.',
  },
  Embedding: {
    name: 'Translator',
    explanation: 'Converts tokens (words/patches) into numeric vectors the model can process.',
  },

  // Special layers
  Input: {
    name: 'Input Layer',
    explanation: 'Entry point where data enters the neural network.',
  },
  Output: {
    name: 'Output Layer',
    explanation: "Final layer that produces the model's predictions.",
  },
  Output1d: {
    name: 'Output Layer',
    explanation: "Final layer that produces the model's predictions.",
  },
};

// Fallback for unknown layer types
const DEFAULT_EXPLANATION = {
  name: 'Neural Network Layer',
  explanation: 'A computational unit that transforms input data as part of the neural network.',
};

function formatShape(shape: number[] | null | undefined): string {
  if (!shape || shape.length === 0) return 'Unknown';
  return `[${shape.join(' × ')}]`;
}

export default function LayerExplanationSidebar({
  open,
  layer,
  onClose,
}: LayerExplanationSidebarProps) {
  if (!layer) {
    return (
      <Drawer
        anchor="right"
        open={open}
        onClose={onClose}
        variant="persistent"
        sx={{
          width: 360,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 360,
            boxSizing: 'border-box',
            p: 3,
          },
        }}
      >
        <Stack spacing={2} alignItems="center" justifyContent="center" sx={{ height: '100%' }}>
          <InfoIcon sx={{ fontSize: 64, color: 'text.disabled' }} />
          <Typography variant="h6" color="text.secondary" textAlign="center">
            Click any layer to learn what it does
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            The 3D visualization shows the model's architecture. Each shape represents a different
            type of layer.
          </Typography>
        </Stack>
      </Drawer>
    );
  }

  const explanation = LAYER_EXPLANATIONS[layer.type] || DEFAULT_EXPLANATION;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      variant="persistent"
      sx={{
        width: 360,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 360,
          boxSizing: 'border-box',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold">
            Layer Details
          </Typography>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>

        <Divider sx={{ mb: 3 }} />

        {/* Plain English name */}
        <Typography variant="h5" fontWeight="bold" color="primary" gutterBottom>
          {explanation.name}
        </Typography>

        {/* Explanation */}
        <Typography variant="body1" color="text.primary" paragraph sx={{ lineHeight: 1.7 }}>
          {explanation.explanation}
        </Typography>

        <Divider sx={{ my: 3 }} />

        {/* Shape information */}
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Input Shape
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
              <Typography variant="body2" fontFamily="monospace">
                {formatShape(layer.input_shape)}
              </Typography>
            </Paper>
          </Box>

          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Output Shape
            </Typography>
            <Paper variant="outlined" sx={{ p: 1.5, bgcolor: 'background.default' }}>
              <Typography variant="body2" fontFamily="monospace">
                {formatShape(layer.output_shape)}
              </Typography>
            </Paper>
          </Box>

          {/* Parameters */}
          {layer.parameters > 0 && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Parameters
              </Typography>
              <Chip
                label={layer.parameters.toLocaleString()}
                size="small"
                color="secondary"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
          )}

          {/* Category */}
          <Box>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Category
            </Typography>
            <Chip
              label={layer.category}
              size="small"
              sx={{
                textTransform: 'capitalize',
                fontWeight: 'medium',
              }}
            />
          </Box>
        </Stack>

        <Divider sx={{ my: 3 }} />

        {/* Technical name */}
        <Box>
          <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
            Technical Name
          </Typography>
          <Typography variant="body2" color="text.secondary" fontFamily="monospace">
            {layer.name}
          </Typography>
          <Typography variant="caption" color="text.disabled" display="block" mt={0.5}>
            Type: {layer.type}
          </Typography>
        </Box>
      </Box>
    </Drawer>
  );
}

// Made with Bob
