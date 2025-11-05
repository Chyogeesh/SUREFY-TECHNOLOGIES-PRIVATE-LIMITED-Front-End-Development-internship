'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Settings as SettingsIcon,
  CloudUpload as CloudUploadIcon,
  ViewColumn as ViewColumnIcon,
} from '@mui/icons-material';
import { Provider, useSelector } from 'react-redux';
import { store, RootState } from '@/store/store';
import DataTable from '@/components/DataTable/DataTable';
import SearchBar from '@/components/DataTable/SearchBar';
import PaginationControls from '@/components/DataTable/PaginationControls';
import ColumnManager from '@/components/DataTable/ColumnManager';
import ImportModal from '@/components/ImportExport/ImportModal';
import ExportButton from '@/components/ImportExport/ExportButton';
import ThemeToggle from '@/components/ThemeToggle/ThemeToggle';
import {
  ViewList as ViewListIcon,
  Edit as EditIcon,
} from '@mui/icons-material';

function HomeContent() {
  const [columnManagerOpen, setColumnManagerOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [showEditControls, setShowEditControls] = useState(false);
  
  const { editingRows, data } = useSelector((state: RootState) => state.table);
  const hasEdits = editingRows.size > 0;

  useEffect(() => {
    // Load saved column preferences
    const savedColumns = localStorage.getItem('visibleColumns');
    if (savedColumns) {
      // Dispatch would go here in a real Redux setup
    }
  }, []);

  const handleSaveAll = () => {
    // Dispatch saveAllEdits
    setShowEditControls(false);
  };

  const handleCancelAll = () => {
    // Dispatch cancelAllEdits
    setShowEditControls(false);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.default' }}>
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ViewListIcon />
              <Typography variant="h6" component="div">
                Data Table Manager
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              {data.length} total records
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            {/* Edit Controls */}
            {hasEdits && (
              <Box sx={{ display: 'flex', gap: 1, mr: 2 }}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={handleSaveAll}
                  startIcon={<EditIcon />}
                >
                  Save All ({editingRows.size})
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={handleCancelAll}
                  color="inherit"
                >
                  Cancel All
                </Button>
              </Box>
            )}

            {/* Action Buttons */}
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => setImportModalOpen(true)}
              size="small"
            >
              Import CSV
            </Button>
            
            <ExportButton />
            
            <Button
              variant="outlined"
              startIcon={<ViewColumnIcon />}
              onClick={() => setColumnManagerOpen(true)}
              size="small"
            >
              Columns
            </Button>
            
            <ThemeToggle />
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 3, mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <SearchBar />
                <DataTable />
                <PaginationControls />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Modals */}
      <ColumnManager open={columnManagerOpen} onClose={() => setColumnManagerOpen(false)} />
      <ImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />
    </Box>
  );
}

export default function Home() {
  return (
    <Provider store={store}>
      <HomeContent />
    </Provider>
  );
}
