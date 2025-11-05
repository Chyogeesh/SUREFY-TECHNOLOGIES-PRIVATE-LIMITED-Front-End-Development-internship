'use client';

import React from 'react';
import {
  Pagination,
  PaginationItem,
  Box,
  Typography,
  Stack,
} from '@mui/material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/store/store';
import { setPage } from '@/store/tableSlice';

const PaginationControls: React.FC = () => {
  const dispatch = useDispatch();
  const { pagination, data, visibleColumns } = useSelector((state: RootState) => state.table);
  
  const filteredDataCount = data.filter(row =>
    visibleColumns.some(column =>
      row[column as keyof typeof row]?.toString().toLowerCase().includes(pagination.page.toLowerCase())
    )
  ).length;

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    dispatch(setPage(page - 1));
  };

  if (filteredDataCount === 0) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2, p: 2, bgcolor: 'background.paper' }}>
      <Typography variant="body2" color="text.secondary">
        Showing {pagination.page * pagination.pageSize + 1} to{' '}
        {Math.min((pagination.page + 1) * pagination.pageSize, filteredDataCount)} of{' '}
        {filteredDataCount} {filteredDataCount === 1 ? 'row' : 'rows'}
      </Typography>
      
      <Stack spacing={2}>
        <Pagination
          count={Math.ceil(filteredDataCount / pagination.pageSize)}
          page={pagination.page + 1}
          onChange={handlePageChange}
          siblingCount={1}
          boundaryCount={1}
          renderItem={(item) => (
            <PaginationItem
              slots={{ previous: () => <span>‹</span>, next: () => <span>›</span> }}
              {...item}
            />
          )}
          sx={{
            '& .MuiPaginationItem-root': {
              borderRadius: 1,
              minWidth: 36,
              height: 36,
            },
          }}
        />
      </Stack>
    </Box>
  );
};

export default PaginationControls;
