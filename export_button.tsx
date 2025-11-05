'use client';

import React from 'react';
import {
  Button,
  Tooltip,
  Box,
} from '@mui/material';
import {
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { exportCSV } from '@/store/tableSlice';

const ExportButton: React.FC = () => {
  const dispatch = useDispatch();
  const { visibleColumns, data } = useSelector((state: RootState) => state.table);

  const handleExport = () => {
    dispatch(exportCSV({ visibleColumns, data }));
  };

  const exportableColumns = visibleColumns.length;
  const rowCount = data.length;

  return (
    <Tooltip title={`Export ${rowCount} rows with ${exportableColumns} columns`}>
      <Box>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleExport}
          disabled={rowCount === 0}
          sx={{ textTransform: 'none' }}
        >
          Export CSV
          {rowCount > 0 && (
            <Box
              component="span"
              sx={{ ml: 1, fontSize: '0.75rem', color: 'text.secondary' }}
            >
              ({rowCount} rows)
            </Box>
          )}
        </Button>
      </Box>
    );
};

export default ExportButton;
