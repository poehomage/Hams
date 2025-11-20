import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { URLCell } from './URLCell';
import { EditableCell } from './EditableCell';

interface DataTableProps {
  data: any[];
  columns: string[];
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  onSort: (column: string) => void;
  onRowSelect: (row: any) => void;
  selectedRow: any | null;
  showFilters: boolean;
  columnFilters: Record<string, string>;
  onColumnFilter: (column: string, value: string) => void;
  onUpdate: (updatedRow: any) => void;
  recipeTable: any[];
}

const EDITABLE_URL_FIELDS = [
  'Production Folder',
  'AW_Front',
  'AW_Back',
  'AW_LS',
  'AW_RS',
  'AW_Neck',
  'Spec_Sheet',
  'Spec_Sheet 2'
];

const EDITABLE_TEXT_FIELDS = [
  'Placement from Collar',
  'Back from Collar'
];

export function DataTable({
  data,
  columns,
  sortConfig,
  onSort,
  onRowSelect,
  selectedRow,
  showFilters,
  columnFilters,
  onColumnFilter,
  onUpdate,
  recipeTable
}: DataTableProps) {
  const isURL = (value: string) => {
    if (!value) return false;
    const str = String(value).toLowerCase();
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.');
  };

  const getSortIcon = (column: string) => {
    if (sortConfig?.key !== column) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ArrowUp className="w-4 h-4 text-blue-600" />
      : <ArrowDown className="w-4 h-4 text-blue-600" />;
  };

  const isEditableField = (column: string) => {
    return EDITABLE_URL_FIELDS.includes(column) || 
           EDITABLE_TEXT_FIELDS.includes(column) || 
           column === 'Recipe';
  };

  const handleCellUpdate = (row: any, column: string, value: string) => {
    const updatedRow = { ...row, [column]: value };
    onUpdate(updatedRow);
  };

  return (
    <div className="overflow-auto max-h-[calc(100vh-280px)]">
      <table className="w-full border-collapse">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            {columns.map(column => (
              <th key={column} className="text-left p-3 border-b border-gray-200 min-w-[150px]">
                <div className="space-y-2">
                  <button
                    onClick={() => onSort(column)}
                    className="flex items-center gap-2 hover:text-blue-600 transition-colors w-full"
                  >
                    <span className="truncate">{column}</span>
                    {getSortIcon(column)}
                  </button>
                  {showFilters && (
                    <input
                      type="text"
                      placeholder="Filter..."
                      value={columnFilters[column] || ''}
                      onChange={(e) => onColumnFilter(column, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={row._id || index}
              onClick={() => onRowSelect(row)}
              className={`border-b border-gray-200 hover:bg-blue-50 cursor-pointer transition-colors ${
                selectedRow?._id === row._id ? 'bg-blue-100' : ''
              }`}
            >
              {columns.map(column => (
                <td key={column} className="p-3">
                  {isEditableField(column) ? (
                    <EditableCell
                      row={row}
                      column={column}
                      value={row[column]}
                      onUpdate={handleCellUpdate}
                      recipeTable={recipeTable}
                    />
                  ) : isURL(row[column]) ? (
                    <URLCell url={row[column]} />
                  ) : (
                    <div className="truncate max-w-xs" title={String(row[column] || '')}>
                      {row[column]}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No data found matching your filters
        </div>
      )}
    </div>
  );
}