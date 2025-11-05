import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TableData, TableState, ColumnConfig, ImportResult } from '@/types';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';

const initialData: TableData[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', age: 30, role: 'Developer', department: 'Engineering', location: 'New York', salary: 85000, hireDate: '2023-01-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', age: 28, role: 'Designer', department: 'Design', location: 'San Francisco', salary: 75000, hireDate: '2023-02-20' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', age: 35, role: 'Manager', department: 'Management', location: 'Austin', salary: 95000, hireDate: '2022-11-10' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', age: 32, role: 'QA Engineer', department: 'Quality Assurance', location: 'Seattle', salary: 70000, hireDate: '2023-03-05' },
  { id: '5', name: 'Charlie Wilson', email: 'charlie@example.com', age: 29, role: 'Product Manager', department: 'Product', location: 'Boston', salary: 90000, hireDate: '2023-04-12' },
  { id: '6', name: 'Diana Davis', email: 'diana@example.com', age: 27, role: 'Frontend Developer', department: 'Engineering', location: 'Chicago', salary: 80000, hireDate: '2023-05-18' },
  { id: '7', name: 'Eve Martinez', email: 'eve@example.com', age: 33, role: 'Backend Developer', department: 'Engineering', location: 'Denver', salary: 82000, hireDate: '2022-12-01' },
  { id: '8', name: 'Frank Garcia', email: 'frank@example.com', age: 31, role: 'DevOps Engineer', department: 'Operations', location: 'Miami', salary: 88000, hireDate: '2023-06-22' },
  { id: '9', name: 'Grace Lee', email: 'grace@example.com', age: 26, role: 'UX Researcher', department: 'Design', location: 'Portland', salary: 72000, hireDate: '2023-07-08' },
  { id: '10', name: 'Henry Taylor', email: 'henry@example.com', age: 34, role: 'Data Scientist', department: 'Data', location: 'Atlanta', salary: 95000, hireDate: '2022-10-15' },
  { id: '11', name: 'Ivy Anderson', email: 'ivy@example.com', age: 29, role: 'Sales Manager', department: 'Sales', location: 'Phoenix', salary: 78000, hireDate: '2023-08-14' },
  { id: '12', name: 'Jack White', email: 'jack@example.com', age: 36, role: 'CTO', department: 'Executive', location: 'Los Angeles', salary: 150000, hireDate: '2020-01-01' },
  { id: '13', name: 'Kara Thomas', email: 'kara@example.com', age: 28, role: 'Marketing Specialist', department: 'Marketing', location: 'Dallas', salary: 65000, hireDate: '2023-09-03' },
  { id: '14', name: 'Liam Harris', email: 'liam@example.com', age: 30, role: 'Mobile Developer', department: 'Engineering', location: 'Houston', salary: 83000, hireDate: '2023-01-20' },
  { id: '15', name: 'Mia Clark', email: 'mia@example.com', age: 25, role: 'Content Writer', department: 'Marketing', location: 'Philadelphia', salary: 62000, hireDate: '2023-10-11' },
];

const initialColumns: ColumnConfig[] = [
  { key: 'name', label: 'Name', visible: true, sortable: true, editable: true, type: 'text' },
  { key: 'email', label: 'Email', visible: true, sortable: true, editable: true, type: 'email' },
  { key: 'age', label: 'Age', visible: true, sortable: true, editable: true, type: 'number' },
  { key: 'role', label: 'Role', visible: true, sortable: true, editable: true, type: 'text' },
  { key: 'department', label: 'Department', visible: true, sortable: true, editable: true, type: 'text' },
  { key: 'location', label: 'Location', visible: true, sortable: true, editable: true, type: 'text' },
  { key: 'salary', label: 'Salary', visible: false, sortable: true, editable: true, type: 'number' },
  { key: 'hireDate', label: 'Hire Date', visible: false, sortable: true, editable: true, type: 'date' },
];

const initialState: TableState = {
  data: initialData,
  columns: initialColumns,
  visibleColumns: initialColumns.filter(col => col.visible).map(col => col.key as string),
  sort: { column: null, direction: 'asc' },
  searchTerm: '',
  pagination: { page: 0, pageSize: 10, totalPages: Math.ceil(initialData.length / 10) },
  editingRows: new Set(),
  rowEdits: {},
};

// Thunk for importing CSV
export const importCSV = createAsyncThunk(
  'table/importCSV',
  async (file: File, { getState, dispatch }) => {
    return new Promise<ImportResult>((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results: any) => {
          const { data, errors } = results;
          const importErrors: Array<{ row: number; error: string }> = [];
          const importedData: TableData[] = [];

          data.forEach((row: any, index: number) => {
            try {
              const validatedRow = validateRow(row, index + 2);
              if (validatedRow) {
                importedData.push(validatedRow);
              } else {
                importErrors.push({ row: index + 2, error: 'Validation failed' });
              }
            } catch (error: any) {
              importErrors.push({ row: index + 2, error: error.message });
            }
          });

          resolve({
            success: importedData.length,
            errors: importErrors,
            data: importedData,
          });
        },
        error: (error: any) => {
          reject(new Error(`CSV parsing failed: ${error}`));
        },
      });
    });
  }
);

// Thunk for exporting CSV
export const exportCSV = createAsyncThunk(
  'table/exportCSV',
  (state: TableState, { getState }) => {
    const { visibleColumns, data, columns } = state;
    const visibleData = data.map(row => {
      const exportRow: any = {};
      visibleColumns.forEach(key => {
        const column = columns.find(col => col.key === key);
        if (column) {
          exportRow[column.label] = row[key as keyof TableData] ?? '';
        }
      });
      return exportRow;
    });

    const csv = Papa.unparse(visibleData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `table_export_${new Date().toISOString().split('T')[0]}.csv`);
  }
);

function validateRow(row: any, rowNumber: number): TableData | null {
  const validated: Partial<TableData> = { id: `imported-${Date.now()}-${Math.random()}` };
  
  if (row.name && row.name.trim()) validated.name = row.name.trim();
  else throw new Error('Name is required');
  
  if (row.email && row.email.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(row.email)) throw new Error('Invalid email format');
    validated.email = row.email.trim();
  } else {
    throw new Error('Email is required');
  }
  
  if (row.age) {
    const age = parseInt(row.age);
    if (isNaN(age) || age < 18 || age > 100) throw new Error('Age must be between 18 and 100');
    validated.age = age;
  }
  
  if (row.role && row.role.trim()) validated.role = row.role.trim();
  if (row.department && row.department.trim()) validated.department = row.department.trim();
  if (row.location && row.location.trim()) validated.location = row.location.trim();
  if (row.salary) {
    const salary = parseFloat(row.salary);
    if (isNaN(salary) || salary < 0) throw new Error('Salary must be a positive number');
    validated.salary = salary;
  }
  if (row.hireDate) validated.hireDate = new Date(row.hireDate).toISOString().split('T')[0];

  return validated as TableData;
}

const tableSlice = createSlice({
  name: 'table',
  initialState,
  reducers: {
    setSearchTerm: (state, action: PayloadAction<string>) => {
      state.searchTerm = action.payload;
      state.pagination.page = 0;
    },
    setSort: (state, action: PayloadAction<{ column: keyof TableData; direction: 'asc' | 'desc' }>) => {
      state.sort = action.payload;
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.pagination.page = action.payload;
    },
    toggleColumnVisibility: (state, action: PayloadAction<keyof TableData>) => {
      const index = state.visibleColumns.indexOf(action.payload);
      if (index > -1) {
        state.visibleColumns.splice(index, 1);
      } else {
        state.visibleColumns.push(action.payload);
      }
      localStorage.setItem('visibleColumns', JSON.stringify(state.visibleColumns));
    },
    setVisibleColumns: (state, action: PayloadAction<string[]>) => {
      state.visibleColumns = action.payload;
      localStorage.setItem('visibleColumns', JSON.stringify(action.payload));
    },
    startEditingRow: (state, action: PayloadAction<string>) => {
      state.editingRows.add(action.payload);
    },
    cancelEditingRow: (state, action: PayloadAction<string>) => {
      state.editingRows.delete(action.payload);
      delete state.rowEdits[action.payload];
    },
    updateRowEdit: (state, action: PayloadAction<{ rowId: string; field: keyof TableData; value: any }>) => {
      const { rowId, field, value } = action.payload;
      if (!state.rowEdits[rowId]) {
        state.rowEdits[rowId] = {};
      }
      state.rowEdits[rowId]![field] = value;
    },
    saveAllEdits: (state) => {
      state.editingRows.forEach(rowId => {
        if (state.rowEdits[rowId]) {
          state.data = state.data.map(row => 
            row.id === rowId ? { ...row, ...state.rowEdits[rowId] } : row
          );
          delete state.rowEdits[rowId];
        }
      });
      state.editingRows.clear();
    },
    cancelAllEdits: (state) => {
      state.editingRows.clear();
      state.rowEdits = {};
    },
    deleteRow: (state, action: PayloadAction<string>) => {
      state.data = state.data.filter(row => row.id !== action.payload);
      state.pagination.totalPages = Math.ceil(state.data.length / state.pagination.pageSize);
      if (state.pagination.page >= state.pagination.totalPages && state.pagination.totalPages > 0) {
        state.pagination.page = state.pagination.totalPages - 1;
      }
    },
    reorderColumns: (state, action: PayloadAction<{ oldIndex: number; newIndex: number }>) => {
      const { oldIndex, newIndex } = action.payload;
      const columnKeys = [...state.visibleColumns];
      const [movedColumn] = columnKeys.splice(oldIndex, 1);
      columnKeys.splice(newIndex, 0, movedColumn);
      state.visibleColumns = columnKeys;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(importCSV.fulfilled, (state, action) => {
        if (action.payload.success > 0) {
          state.data = [...state.data, ...action.payload.data];
          state.pagination.totalPages = Math.ceil(state.data.length / state.pagination.pageSize);
        }
      });
  },
});

export const {
  setSearchTerm,
  setSort,
  setPage,
  toggleColumnVisibility,
  setVisibleColumns,
  startEditingRow,
  cancelEditingRow,
  updateRowEdit,
  saveAllEdits,
  cancelAllEdits,
  deleteRow,
  reorderColumns,
} = tableSlice.actions;

export default tableSlice.reducer;
