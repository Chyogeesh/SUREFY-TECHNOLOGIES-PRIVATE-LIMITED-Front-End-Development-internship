import { TableData, TableState } from '@/types';

export function filterData(data: TableData[], searchTerm: string, visibleColumns: string[]): TableData[] {
  if (!searchTerm.trim()) return data;
  
  const searchLower = searchTerm.toLowerCase();
  return data.filter(row => 
    visibleColumns.some(column => {
      const value = row[column as keyof TableData];
      return value?.toString().toLowerCase().includes(searchLower);
    })
  );
}

export function sortData(data: TableData[], sort: { column: keyof TableData | null; direction: 'asc' | 'desc' }): TableData[] {
  if (!sort.column) return data;
  
  return [...data].sort((a, b) => {
    const aValue = a[sort.column!];
    const bValue = b[sort.column!];
    
    if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function paginateData(data: TableData[], page: number, pageSize: number): TableData[] {
  const startIndex = page * pageSize;
  return data.slice(startIndex, startIndex + pageSize);
}

export function getDisplayData(state: TableState): TableData[] {
  let filteredData = filterData(state.data, state.searchTerm, state.visibleColumns);
  let sortedData = sortData(filteredData, state.sort);
  return paginateData(sortedData, state.pagination.page, state.pagination.pageSize);
}

export function getTotalPages(data: TableData[], pageSize: number): number {
  return Math.ceil(data.length / pageSize);
}
