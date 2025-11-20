import { useState, useMemo } from 'react';
import { Search, Download, Upload, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { DataTable } from './DataTable';
import { SidePanel } from './SidePanel';
import { AISearchModal } from './AISearchModal';

interface DataTableViewProps {
  data: any[];
  setData: (data: any[]) => void;
  onReload: () => void;
  recipeTable: any[];
}

export function DataTableView({ data, setData, onReload, recipeTable }: DataTableViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRow, setSelectedRow] = useState<any | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [showFilters, setShowFilters] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  const [isPanelMinimized, setIsPanelMinimized] = useState(false);
  const [panelWidth, setPanelWidth] = useState(400);

  const columns = useMemo(() => {
    if (data.length === 0) return [];
    return Object.keys(data[0]).filter(key => key !== '_id');
  }, [data]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(query)
        )
      );
    }

    // Apply column filters
    Object.entries(columnFilters).forEach(([column, filterValue]) => {
      if (filterValue) {
        result = result.filter(row =>
          String(row[column]).toLowerCase().includes(filterValue.toLowerCase())
        );
      }
    });

    // Apply sorting
    if (sortConfig) {
      result.sort((a, b) => {
        const aVal = String(a[sortConfig.key]).toLowerCase();
        const bVal = String(b[sortConfig.key]).toLowerCase();
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchQuery, columnFilters, sortConfig]);

  const handleSort = (column: string) => {
    setSortConfig(current => {
      if (current?.key === column) {
        if (current.direction === 'asc') return { key: column, direction: 'desc' };
        return null;
      }
      return { key: column, direction: 'asc' };
    });
  };

  const handleColumnFilter = (column: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [column]: value
    }));
  };

  const handleExport = () => {
    const headers = columns.join(',');
    const rows = filteredAndSortedData.map(row =>
      columns.map(col => {
        const value = String(row[col]);
        return value.includes(',') ? `"${value}"` : value;
      }).join(',')
    );
    
    const csv = [headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleAISearch = (query: string) => {
    setSearchQuery(query);
    setShowAISearch(false);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setColumnFilters({});
    setSortConfig(null);
  };

  const activeFilterCount = Object.values(columnFilters).filter(v => v).length + (searchQuery ? 1 : 0);

  const handleRowUpdate = (updatedRow: any) => {
    setData(data.map(row => row._id === updatedRow._id ? updatedRow : row));
    setSelectedRow(updatedRow);
  };

  return (
    <div className="flex gap-4">
      {/* Side Panel */}
      {selectedRow && (
        <SidePanel
          row={selectedRow}
          columns={columns}
          isMinimized={isPanelMinimized}
          onMinimize={() => setIsPanelMinimized(!isPanelMinimized)}
          onClose={() => {
            setSelectedRow(null);
            setIsPanelMinimized(false);
          }}
          width={panelWidth}
          onWidthChange={setPanelWidth}
        />
      )}

      <div className={`flex-1 transition-all ${selectedRow && !isPanelMinimized ? 'ml-0' : ''}`}>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search across all columns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={() => setShowAISearch(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
              >
                <Sparkles className="w-5 h-5" />
                AI Search
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
                  showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-600 text-white rounded-full text-xs">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Download className="w-5 h-5" />
                Export
              </button>
              <button
                onClick={onReload}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-5 h-5" />
                New File
              </button>
            </div>

            {activeFilterCount > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">
                  {filteredAndSortedData.length} of {data.length} rows
                </span>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Clear filters
                </button>
              </div>
            )}
          </div>

          {/* Table */}
          <DataTable
            data={filteredAndSortedData}
            columns={columns}
            sortConfig={sortConfig}
            onSort={handleSort}
            onRowSelect={setSelectedRow}
            selectedRow={selectedRow}
            showFilters={showFilters}
            columnFilters={columnFilters}
            onColumnFilter={handleColumnFilter}
            onUpdate={handleRowUpdate}
            recipeTable={recipeTable}
          />
        </div>
      </div>

      {/* AI Search Modal */}
      {showAISearch && (
        <AISearchModal
          onClose={() => setShowAISearch(false)}
          onSearch={handleAISearch}
          columns={columns}
        />
      )}
    </div>
  );
}