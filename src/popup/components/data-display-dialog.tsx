import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Chip,
  List,
  ListItem,
  ListItemText,
  Tooltip,
  IconButton,
  Button,
  Theme,
} from '@mui/material';
import { Close as CloseIcon, ContentCopy as ContentCopyIcon } from '@mui/icons-material';

interface DataDisplayDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any>;
  theme: Theme;
}

const DataDisplayDialog: React.FC<DataDisplayDialogProps> = ({
  open,
  onClose,
  title,
  data,
  theme,
}) => {
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Could add a toast notification here if desired
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const renderDataValue = (value: any) => {
    if (Array.isArray(value)) {
      return (
        <List dense sx={{ pl: 2 }}>
          {value.map((item, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                        fontSize: '0.8rem',
                        backgroundColor: 'rgba(0, 0, 0, 0.1)',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        wordBreak: 'break-all',
                        flex: 1,
                      }}
                    >
                      {String(item)}
                    </Typography>
                    <Tooltip title="Copy to clipboard">
                      <IconButton
                        size="small"
                        onClick={() => copyToClipboard(String(item))}
                        sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
                      >
                        <ContentCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                }
              />
            </ListItem>
          ))}
        </List>
      );
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <Box sx={{ pl: 2 }}>
          <Typography
            variant="body2"
            sx={{
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              fontSize: '0.9rem',
              backgroundColor: 'rgba(0, 0, 0, 0.1)',
              padding: '4px 8px',
              borderRadius: '4px',
              wordBreak: 'break-all',
              whiteSpace: 'pre-wrap',
            }}
          >
            {JSON.stringify(value, null, 2)}
          </Typography>
          <Tooltip title="Copy to clipboard">
            <IconButton
              size="small"
              onClick={() => copyToClipboard(JSON.stringify(value, null, 2))}
              sx={{ opacity: 0.7, '&:hover': { opacity: 1 }, mt: 0.5 }}
            >
              <ContentCopyIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      );
    }

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 2 }}>
        <Typography
          variant="body2"
          sx={{
            fontFamily: 'Monaco, Consolas, "Courier New", monospace',
            fontSize: '0.9rem',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            padding: '4px 8px',
            borderRadius: '4px',
            wordBreak: 'break-all',
            flex: 1,
          }}
        >
          {String(value)}
        </Typography>
        <Tooltip title="Copy to clipboard">
          <IconButton
            size="small"
            onClick={() => copyToClipboard(String(value))}
            sx={{ opacity: 0.7, '&:hover': { opacity: 1 } }}
          >
            <ContentCopyIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    );
  };

  const getValueTypeDescription = (value: any) => {
    if (Array.isArray(value)) {
      return `${value.length} items`;
    }
    if (typeof value === 'object' && value !== null) {
      return 'object';
    }
    return typeof value;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          maxHeight: '80vh',
          backgroundColor: theme.palette.background.paper,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6">{title}</Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {Object.entries(data).map(([key, value]) => (
            <Box key={key} sx={{ mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, gap: 1 }}>
                <Chip
                  label={key}
                  variant="outlined"
                  size="small"
                  sx={{
                    fontFamily: 'Monaco, Consolas, "Courier New", monospace',
                    fontSize: '0.75rem',
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  {getValueTypeDescription(value)}
                </Typography>
              </Box>
              {renderDataValue(value)}
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default DataDisplayDialog;
