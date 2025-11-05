'use client';

import React, { useEffect, useState, DragEvent } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Box,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIndicatorIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/store/store';
import { 
  setSort, 
  startEditingRow, 
  deleteRow,
  updateRowEdit,
  toggleColumnVisibility,
  reorderColumns,
} from '@/store/tableSlice';
import { getDisplayData, getTotalPages } from '@/lib/utils';
import { TableData, ColumnConfig } from '@/types';
import RowEditor from './RowEditor';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { getDisplayData as getReduxDisplayData } from '@/lib/utils';

interface DraggableHeaderProps {
  column: string;
  index: number;
  label: string;
  sort: { column: keyof TableData | null; direction: 'asc' | 'desc' };
  onSort: (column: keyof TableData) => void;
  onToggleVisibility: (column: keyof TableData) => void;
  onDrop: (item: { index: number }, newIndex: number) => void;
}

const DraggableHeader: React.FC<DraggableHeaderProps> = ({ 
  column, 
  index, 
  label, 
  sort, 
  onSort, 
  onToggleVisibility,
  onDrop 
}) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'column',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'column',
    hover: (item: { index: number }) => {
      if (item.index !== index) {
        onDrop(item, index);
        item.index = index;
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const isSorted = sort.column === column;
  const sortDirection = sort.direction;

  return (
    <TableCell
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        backgroundColor: isOver ? 'rgba(25, 118, 210, 0.04)' : 'inherit',
      }}
      sx={{ 
        position: 'relative',
        cursor: 'move',
        '&:hover .drag-icon': { opacity: 1 },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Tooltip title="Drag to reorder">
          <IconButton 
            size="small" 
            className="drag-icon"
            sx={{ opacity: 0, transition: 'opacity 0.2s', position: 'absolute', left: -8 }}
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Box 
          sx={{ 
            flex: 1, 
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center',
            gap: 0.5 
          }}
          onClick={() => onSort(column as keyof TableData)}
        >
          <Typography variant="body2" fontWeight="medium">
            {label}
          </Typography>
          {isSorted && (
            <Chip
              size="small"
              icon={
                sortDirection === 'asc' ? (
                  <ArrowUpwardIcon fontSize="small" />
                ) : (
                  <ArrowDownwardIcon fontSize="small" />
                )
              }
              label={sortDirection.toUpperCase()}
              sx={{ 
                height: 20, 
                fontSize: '0.65rem',
                backgroundColor: 'primary.light',
                color: 'primary.contrastText',
                ml: 0.5 
              }}
            />
          )}
        </Box>
        
        <Tooltip title={`Toggle ${label} visibility`}>
          <IconButton 
            size="small" 
            onClick={(e) => {
              e.stopPropagation();
              onToggleVisibility(column as keyof TableData);
            }}
          >
            <Box sx={{ width: 12, height: 12, borderRadius: '50%', border: 1, borderColor: 'grey.400' }} />
          </IconButton>
        </Tooltip>
      </Box>
    </TableCell>
  );
};

const DataTable: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const { 
    data, 
    columns, 
    visibleColumns, 
    sort, 
    pagination,
    editingRows 
  } = useSelector((state: RootState) => state.table);
  
  const displayData = getDisplayData(useSelector((state: RootState) => state.table));
  const totalPages = getTotalPages(data, pagination.pageSize);

  const handleSort = (column: keyof TableData) => {
    if (sort.column === column) {
      const newDirection = sort.direction === 'asc' ? 'desc' : 'asc';
      dispatch(setSort({ column, direction: newDirection }));
    } else {
      dispatch(setSort({ column, direction: 'asc' }));
    }
  };

  const handleToggleVisibility = (column: keyof TableData) => {
    dispatch(toggleColumnVisibility(column));
  };

  const handleDrop = (item: { index: number }, newIndex: number) => {
    dispatch(reorderColumns({ oldIndex: item.index, newIndex }));
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this row?')) {
      dispatch(deleteRow(id));
    }
  };

  const visibleColumnConfigs = columns.filter(col => visibleColumns.includes(col.key as string));

  return (
    <DndProvider backend={HTML5Backend}>
      <Paper elevation={1} sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                {visibleColumnConfigs.map((column, index) => (
                  <DraggableHeader
                    key={column.key as string}
                    column={column.key as string}
                    index={index}
                    label={column.label}
                    sort={sort}
                    onSort={handleSort}
                    onToggleVisibility={handleToggleVisibility}
                    onDrop={handleDrop}
                  />
                ))}
                <TableCell sx={{ width: 120, position: 'sticky', right: 0, backgroundColor: 'background.paper' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Actions
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {displayData.map((row) => (
                <TableRow
                  key={row.id}
                  hover
                  sx={{
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: editingRows.has(row.id) ? 'default' : 'pointer',
                    backgroundColor: editingRows.has(row.id) 
                      ? theme.palette.action.hover 
                      : 'inherit',
                  }}
                >
                  {visibleColumnConfigs.map((column) => (
                    <TableCell key={column.key} align="left">
                      {editingRows.has(row.id) ? (
                        <RowEditor
                          rowId={row.id}
                          field={column.key}
                          value={row[column.key as keyof TableData] ?? ''}
                          column={column}
                          onChange={(value) =>
                            dispatch(updateRowEdit({ rowId: row.id, field: column.key, value }))
                          }
                        />
                      ) : (
                        <Box
                          onDoubleClick={() => dispatch(startEditingRow(row.id))}
                          sx={{ cursor: 'pointer', minHeight: 40, display: 'flex', alignItems: 'center' }}
                        >
                          {formatCellValue(row[column.key as keyof TableData], column.type)}
                        </Box>
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="right" sx={{ position: 'sticky', right: 0, backgroundColor: 'background.paper' }}>
                    <Box sx={{ display: 'flex', gap: 0.5 }}>
                      <Tooltip title="Edit Row">
                        <IconButton
                          size="small"
                          onClick={() => dispatch(startEditingRow(row.id))}
                          disabled={editingRows.has(row.id)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Row">
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(row.id)}
                          disabled={editingRows.has(row.id)}
                        >
                          <DeleteIcon fontSize="small" color="error" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
              {displayData.length === 0 && (
                <TableRow>
                  <TableCell colSpan={visibleColumnConfigs.length + 1} align="center" sx={{ py: 4 }}>
                    <Box sx={{ textAlign: 'center', color: 'text.secondary' }}>
                      <Typography variant="h6" gutterBottom>
                        No data available
                      </Typography>
                      <Typography variant="body2">
                        {data.length === 0 
                          ? 'Import some data to get started' 
                          : 'Try adjusting your search or filters'
                        }
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </DndProvider>
  );
};

function formatCellValue(value: any, type: string): React.ReactNode {
  if (value === null || value === undefined || value === '') return '—';
  
  switch (type) {
    case 'number':
      return `$${value.toLocaleString()}`;
    case 'date':
      return new Date(value).toLocaleDateString();
    case 'email':
      return <a href={`mailto:${value}`} style={{ color: 'inherit', textDecoration: 'none' }}>{value}</a>;
    default:
      return value.toString();
  }
}

export default DataTable;
