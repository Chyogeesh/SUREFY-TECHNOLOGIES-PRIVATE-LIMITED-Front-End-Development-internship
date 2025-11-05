'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  CloudUpload as CloudUploadIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { importCSV } from '@/store/tableSlice';
import { ImportResult } from '@/types';

interface ImportModalProps {
  open: boolean;
  onClose: () => void;
}

const ImportModal: React.FC<ImportModalProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [showResults, setShowResults] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setImportResult(null);
    setShowResults(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      handleFileSelect(droppedFile);
    }
  };

  const handleImport = async () => {
    if (!file) return;
    
    setImporting(true);
    try {
      const result = await dispatch(importCSV(file)) as any;
      setImportResult(result.payload);
      setShowResults(true);
    } catch (error) {
      console.error('Import failed:', error);
      setImportResult({
        success: 0,
        errors: [{ row: 1, error: 'Failed to parse CSV file' }],
        data: [],
      });
      setShowResults(true);
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setImportResult(null);
    setShowResults(false);
    setImporting(false);
    onClose();
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
  };

  if (!open) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Import CSV Data</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          {!file && !showResults && (
            <Box
              sx={{
                border: 2,
                borderColor: dragging ? 'primary.main' : 'grey.300',
                borderStyle: 'dashed',
                borderRadius: 2,
                p: 4,
                textAlign: 'center',
                transition: 'all 0.2s',
                cursor: 'pointer',
                bgcolor: dragging ? 'primary.50' : 'grey.50',
                '&:hover': { bgcolor: 'grey.100' },
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                style={{ display: 'none' }}
              />
              <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Drop CSV file here, or click to browse
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Supports standard CSV format with headers
              </Typography>
            </Box>
          )}

          {file && !showResults && (
            <Box sx={{ p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected: <strong>{file.name}</strong> ({(file.size / 1024).toFixed(1)} KB)
              </Typography>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  onClick={handleImport}
                  disabled={importing}
                  startIcon={importing ? <CircularProgress size={16} /> : undefined}
                >
                  {importing ? 'Importing...' : 'Import Data'}
                </Button>
              </Box>
            </Box>
          )}

          {showResults && importResult && (
            <Box sx={{ mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
                <Chip
                  label={`Success: ${importResult.success} rows`}
                  color={importResult.success > 0 ? 'success' : 'default'}
                  icon={importResult.success > 0 ? <CloudUploadIcon /> : undefined}
                />
                {importResult.errors.length > 0 && (
                  <Chip
                    label={`Errors: ${importResult.errors.length}`}
                    color="error"
                    icon={<ErrorIcon />}
                  />
                )}
              </Box>

              {importResult.errors.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Some rows failed to import. Check the format and try again.
                  </Typography>
                  <Box sx={{ mt: 1, maxHeight: 200, overflow: 'auto' }}>
                    {importResult.errors.slice(0, 5).map((error, index) => (
                      <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 0.5 }}>
                        <Typography variant="caption" color="error.main">
                          Row {error.row}:
                        </Typography>
                        <Typography variant="caption" sx={{ wordBreak: 'break-word' }}>
                          {error.error}
                        </Typography>
                      </Box>
                    ))}
                    {importResult.errors.length > 5 && (
                      <Typography variant="caption" color="text.secondary">
                        ... and {importResult.errors.length - 5} more
                      </Typography>
                    )}
                  </Box>
                </Alert>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button onClick={() => setShowResults(false)} variant="outlined">
                  Import Another
                </Button>
                <Button onClick={handleClose} variant="contained">
                  Done
                </Button>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default ImportModal;
