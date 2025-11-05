npx create-next-app@latest datatable-manager --typescript --tailwind --eslint --app
cd datatable-manager
npm install @mui/material @emotion/react @emotion/styled @mui/icons-material @mui/x-data-grid
npm install @reduxjs/toolkit react-redux
npm install react-hook-form papaparse file-saver
npm install react-dnd react-dnd-html5-backend
npm install -D @types/file-saver

✅ Core Features:

 Table with Name, Email, Age, Role columns
 Sorting on all columns (ASC/DESC toggle)
 Global search across all fields
 Client-side pagination (10 rows/page)
 Dynamic columns with "Manage Columns" modal
 Show/hide columns with checkboxes
 CSV import with PapaParse and error handling
 CSV export with visible columns only
 LocalStorage persistence for column preferences

🎁 Bonus Features:

 Inline row editing with double-click
 Input validation (age as number, email format)
 Save All / Cancel All buttons
 Row actions: Edit, Delete with confirmation
 Theme toggle (Light/Dark mode)
 Column reordering via drag-and-drop
 Fully responsive design
 TypeScript throughout
 Redux Toolkit for state management

Sample Output
The application will display:

Header with stats: Shows total records and action buttons
Search bar: Real-time filtering across all columns
Interactive table:

Click headers to sort
Drag headers to reorder columns
Double-click cells to edit inline
Toggle column visibility
Delete rows with confirmation


Pagination: Navigate through results
Modals: Import CSV, Manage Columns
Export: Download current view as CSV

Key Technical Highlights

TypeScript: Full type safety for data, state, and props
Redux Toolkit: Modern state management with thunks for async operations
MUI v5: Consistent, accessible components with custom theming
React DnD: Smooth column reordering experience
PapaParse: Robust CSV import/export with error handling
Performance: Efficient filtering, sorting, and pagination
Accessibility: Proper ARIA labels, keyboard navigation
Responsive: Mobile-first design with CSS Grid and Flexbox
