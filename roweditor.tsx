import React from 'react';
import {
  TextField,
  InputAdornment,
  FormHelperText,
  Box,
} from '@mui/material';
import { ColumnConfig } from '@/types';
import { useFormContext, useController } from 'react-hook-form';

interface RowEditorProps {
  rowId: string;
  field: keyof any;
  value: any;
  column: ColumnConfig;
  onChange: (value: any) => void;
}

const RowEditor: React.FC<RowEditorProps> = ({ rowId, field, value, column, onChange }) => {
  const { control } = useFormContext();
  const { field: formField } = useController({
    name: `${rowId}.${field}`,
    control,
    rules: getValidationRules(column),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value;
    
    // Format based on column type
    switch (column.type) {
      case 'number':
        newValue = e.target.value.replace(/[^\d]/g, '');
        break;
      case 'email':
        // Basic email validation on input
        if (newValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newValue)) {
          return; // Don't allow invalid characters
        }
        break;
    }
    
    onChange(newValue);
    formField.onChange(newValue);
  };

  const error = formField.state?.error;

  return (
    <Box sx={{ minWidth: 120 }}>
      <TextField
        {...formField}
        size="small"
        fullWidth
        value={formField.value ?? value ?? ''}
        onChange={handleChange}
        error={!!error}
        InputProps={{
          startAdornment: column.type === 'number' && (
            <InputAdornment position="start">$</InputAdornment>
          ),
          endAdornment: column.type === 'date' && (
            <InputAdornment position="end">
              <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>YYYY-MM-DD</Box>
            </InputAdornment>
          ),
        }}
        sx={{ 
          '& .MuiInputBase-input': { 
            py: 0.75, 
            fontSize: '0.875rem' 
          }
        }}
      />
      {error && (
        <FormHelperText error sx={{ fontSize: '0.65rem', mt: 0.25 }}>
          {error.message}
        </FormHelperText>
      )}
    </Box>
  );
};

function getValidationRules(column: ColumnConfig) {
  const rules: any = {};
  
  switch (column.type) {
    case 'text':
      rules.required = `${column.label} is required`;
      rules.maxLength = { value: 100, message: 'Too long' };
      break;
    case 'email':
      rules.required = 'Email is required';
      rules.pattern = {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: 'Invalid email',
      };
      break;
    case 'number':
      rules.required = `${column.label} is required`;
      rules.min = { value: 0, message: 'Must be positive' };
      rules.max = { 
        value: column.key === 'age' ? 120 : 1000000, 
        message: 'Too high' 
      };
      rules.validate = (value: any) => !isNaN(Number(value)) || 'Must be a number';
      break;
    case 'date':
      rules.required = `${column.label} is required`;
      rules.validate = (value: string) => {
        const date = new Date(value);
        return !isNaN(date.getTime()) || 'Invalid date';
      };
  }
  
  return rules;
}

export default RowEditor;
