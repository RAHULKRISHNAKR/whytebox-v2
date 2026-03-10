/**
 * Token Input Component
 *
 * Text input field with tokenization preview.
 * Shows resulting tokens as chips below the input.
 */

import { useState, useCallback } from 'react'
import {
  Box,
  TextField,
  Typography,
  Chip,
  Stack,
  Paper,
  InputAdornment,
  IconButton,
} from '@mui/material'
import {
  TextFields as TextIcon,
  Clear as ClearIcon,
} from '@mui/icons-material'
import { tokenize } from '../utils/tokenizer'
import { LIMITS } from '../constants'

interface TokenInputProps {
  onTextChange: (text: string, tokens: string[]) => void
  disabled?: boolean
}

export default function TokenInput({ onTextChange, disabled }: TokenInputProps) {
  const [text, setText] = useState('The cat sat on the mat')
  const [tokens, setTokens] = useState<string[]>(() => tokenize('The cat sat on the mat'))

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value
      setText(value)
      const newTokens = tokenize(value)
      setTokens(newTokens)
      onTextChange(value, newTokens)
    },
    [onTextChange],
  )

  const handleClear = useCallback(() => {
    setText('')
    const newTokens = tokenize('')
    setTokens(newTokens)
    onTextChange('', newTokens)
  }, [onTextChange])

  return (
    <Paper sx={{ p: 2 }}>
      <Stack spacing={1.5}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <TextIcon color="primary" fontSize="small" />
          <Typography variant="subtitle2">Input Text</Typography>
          <Chip
            label={`${tokens.length}/${LIMITS.maxTokens} tokens`}
            size="small"
            color={tokens.length >= LIMITS.maxTokens ? 'warning' : 'default'}
            sx={{ fontSize: '0.65rem', height: 20 }}
          />
        </Stack>

        <TextField
          fullWidth
          size="small"
          value={text}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Enter text to visualize..."
          InputProps={{
            endAdornment: text ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : undefined,
          }}
        />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {tokens.map((token, idx) => (
            <Chip
              key={idx}
              label={token}
              size="small"
              variant={token.startsWith('[') ? 'filled' : 'outlined'}
              color={token.startsWith('[') ? 'secondary' : 'primary'}
              sx={{ fontSize: '0.7rem', height: 22 }}
            />
          ))}
        </Box>
      </Stack>
    </Paper>
  )
}
