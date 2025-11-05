'use client';

import React, { useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  Box,
  Typography,
  Chip,
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setSearchTerm } from '@/store/tableSlice';
import { useDebounce } from '@/lib/hooks';

const SearchBar: React.FC = () => {
  const dispatch = useDispatch();
  const { searchTerm } = useSelector((state: RootState) => state.table);
  const [localSearch, setLocalSearch] = React.useState(searchTerm);
  const debouncedSearch = useDebounce(localSearch, 300);

  useEffect(() => {
    dispatch(setSearchTerm(debouncedSearch));
  }, [debouncedSearch, dispatch]);

  const handleClear = () => {
    setLocalSearch('');
  };

  const visibleCount = useSelector((state: RootState) => {
    const filteredData = state.table.data.filter(row =>
      state.table.visibleColumns.some(column =>
        row[column as keyof typeof row]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    return filteredData.length;
  });

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <TextField
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          placeholder="Search across all columns..."
          size="small"
          sx={{ flexGrow: 1, minWidth: 300 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
            endAdornment: localSearch && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={handleClear} edge="end">
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        
        {searchTerm && (
          <Chip
            label={`Found ${visibleCount} results`}
            size="small"
            color="primary"
            variant="outlined"
            onClick={handleClear}
            sx={{ cursor: 'pointer' }}
          />
        )}
      </Box>
      
      {searchTerm && (
        <Typography variant="caption" color="text.secondary">
          Searching for "{searchTerm}" in {visibleCount} visible columns
        </Typography>
      )}
    </Box>
  );
};

export default SearchBar;
