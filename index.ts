export interface TableData {
  id: string;
  name: string;
  email: string;
  age: number;
  role: string;
  department?: string;
  location?: string;
  salary?: number;
  hireDate?: string;
}

export interface ColumnConfig {
  key: keyof TableData;
  label: string;
  visible: boolean;
  sortable: boolean;
  editable: boolean;
  type: 'text' | 'number' | 'date' | 'email';
}

export interface TableState {
  data: TableData[];
  columns: ColumnConfig[];
  visibleColumns: string[];
  sort: {
    column: keyof TableData | null;
    direction: 'asc' | 'desc';
  };
  searchTerm: string;
  pagination: {
    page: number;
    pageSize: number;
    totalPages: number;
  };
  editingRows: Set<string>;
  rowEdits: Partial<Record<string, Partial<TableData>>>;
}

export interface ImportResult {
  success: number;
  errors: Array<{ row: number; error: string }>;
  data: TableData[];
}

export interface ColumnManagerState {
  open: boolean;
  draggedColumn: string | null;
}
