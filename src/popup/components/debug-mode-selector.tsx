import React, { useState } from 'react';
import {
  Box,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import { ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import { Selectors } from '../../constants';
import { ExtensionSettings } from '../../types';
import ToggleSwitch from './toggle-switch';

interface DebugModeSelectorProps {
  debugMode: boolean;
  debugVisibleSelectors: (keyof Selectors)[];
  onDebugModeChange: (enabled: boolean) => void;
  onVisibleSelectorsChange: (selectors: (keyof Selectors)[]) => void;
  availableSelectors: Selectors;
}

const DebugModeSelector: React.FC<DebugModeSelectorProps> = ({
  debugMode,
  debugVisibleSelectors,
  onDebugModeChange,
  onVisibleSelectorsChange,
  availableSelectors,
}) => {
  const selectorKeys = Object.keys(availableSelectors).filter(
    key => key !== 'test' // Exclude test selector
  ) as (keyof Selectors)[];

  const handleSelectorToggle = (selectorName: keyof Selectors) => {
    const updated = debugVisibleSelectors.includes(selectorName)
      ? debugVisibleSelectors.filter(s => s !== selectorName)
      : [...debugVisibleSelectors, selectorName];
    onVisibleSelectorsChange(updated);
  };

  const handleSelectAll = () => {
    if (debugVisibleSelectors.length === selectorKeys.length) {
      onVisibleSelectorsChange([]);
    } else {
      onVisibleSelectorsChange([...selectorKeys]);
    }
  };

  if (!debugMode) {
    return null;
  }

  return (
    <Box sx={{ mt: 2, p: 2, bgcolor: 'rgba(255, 107, 107, 0.05)', borderRadius: 1 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Select Selectors to Visualize:
      </Typography>

      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={debugVisibleSelectors.length === selectorKeys.length}
              indeterminate={
                debugVisibleSelectors.length > 0 &&
                debugVisibleSelectors.length < selectorKeys.length
              }
              onChange={handleSelectAll}
            />
          }
          label="Select All"
          sx={{ fontWeight: 'bold', mb: 1 }}
        />

        {selectorKeys.map(selectorName => (
          <FormControlLabel
            key={String(selectorName)}
            control={
              <Checkbox
                checked={debugVisibleSelectors.includes(selectorName)}
                onChange={() => handleSelectorToggle(selectorName)}
              />
            }
            label={<Typography variant="body2">{String(selectorName)}</Typography>}
            sx={{ ml: 2 }}
          />
        ))}
      </FormGroup>

      <Typography variant="caption" sx={{ mt: 1, display: 'block', color: 'text.secondary' }}>
        🔍 Visualizes matched elements with colored outlines. No actions taken.
      </Typography>
    </Box>
  );
};

export default DebugModeSelector;
