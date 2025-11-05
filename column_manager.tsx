'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControlLabel,
  Checkbox,
  Box,
  Divider,
  Typography,
  TextField,
  MenuItem,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { toggleColumnVisibility, setVisibleColumns } from '@/store/tableSlice';
import { ColumnConfig } from '@/types';

interface ColumnManagerProps {
  open: boolean;
  onClose: () => void;
}

const ColumnManager: React.FC<ColumnManagerProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const { columns, visibleColumns } = useSelector((state: RootState) => state.table);
  
  const [newColumn, setNewColumn] = useState({
    key: '',
    label: '',
    type: 'text' as const,
  });

  const handleToggleColumn = (columnKey: string) => {
    dispatch(toggleColumnVisibility(columnKey as any));
  };

  const handleSaveColumns = () => {
    dispatch(setVisibleColumns(visibleColumns));
    onClose();
  };

  const handleAddColumn = () => {
    if (newColumn.key && newColumn.label) {
      // In a real app, this would dispatch an action to add the column
      alert('Column added! (This would integrate with your data schema)');
      setNewColumn({ key: '', label: '', type: 'text' });
    }
  };

  const availableTypes = [
    { value: 'text', label: 'Text' },
    { value: 'number', label: 'Number' },
    { value: 'email', label: 'Email' },
    { value: 'date', label: 'Date' },
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Manage Columns</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, py: 1 }}>
          
          {/* Add New Column */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
              Add New Column
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'end', flexWrap: 'wrap' }}>
              <TextField
                label="Field Name"
                value={newColumn.label}
                onChange={(e) => setNewColumn({ ...newColumn, label: e.target.value })}
                size="small"
                sx={{ minWidth: 150 }}
              />
              <TextField
                select
                label="Type"
                value={newColumn.type}
                onChange={(e) => setNewColumn({ ...newColumn, type: e.target.value as any })}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {availableTypes.map((type) => (
                  <MenuItem key={type.value} value={type.value}>
                    {type.label}
                  </MenuItem>
                ))}
              </TextField>
              <Button
                variant="outlined"
                onClick={handleAddColumn}
                disabled={!newColumn.label}
                size="small"
              >
                Add
              </Button>
            </Box>
          </Box>

          <Divider />

          {/* Column Visibility */}
          <Box>
            <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'medium' }}>
              Column Visibility ({visibleColumns.length}/{columns.length})
            </Typography>
            <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
              {columns.map((column) => (
                <FormControlLabel
                  key={column.key as string}
                  control={
                    <Checkbox
                      checked={visibleColumns.includes(column.key as string)}
                      onChange={() => handleToggleColumn(column.key as string)}
                      size="small"
                    />
                  }
                  label={
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <Typography variant="body2">{column.label}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {column.type}
                      </Typography>
                    </Box>
                  }
                  sx={{ 
                    m: 0, 
                    '& .MuiFormControlLabel-label': { 
                      fontSize: '0.875rem',
                      flexGrow: 1,
                    } 
                  }}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveColumns} variant="contained">
          Save Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ColumnManager;
