import React, { useRef } from 'react';
import {
  Button,
  Stack,
  Typography,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Save as SaveIcon,
  Upload as ImportIcon,
  Download as ExportIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { exportSave, importSave } from '../hooks/usePersistence';

export default function SaveManager() {
  const fileInputRef = useRef();

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      importSave(file);
    }
    // Reset input so the same file can be imported again
    event.target.value = '';
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete your save? This cannot be undone!')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Typography variant="h6">Save Management</Typography>
      
      <Stack direction="row" spacing={1}>
        <Tooltip title="Export Save">
          <IconButton 
            color="primary" 
            onClick={exportSave}
            aria-label="Export save"
          >
            <ExportIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Import Save">
          <IconButton
            color="primary"
            onClick={() => fileInputRef.current.click()}
            aria-label="Import save"
          >
            <ImportIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Delete Save">
          <IconButton
            color="error"
            onClick={handleDelete}
            aria-label="Delete save"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Stack>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".json"
        onChange={handleImport}
      />

      <Typography variant="caption" color="text.secondary">
        Tip: Export your save regularly to prevent data loss!
      </Typography>
    </Stack>
  );
}
