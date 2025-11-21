import { Download, Database, Filter } from 'lucide-react';

interface ExportModalProps {
  onClose: () => void;
  onExport: (data: any[]) => void;
  filteredData: any[];
  allData: any[];
  columns: string[];
}

export function ExportModal({ onClose, onExport, filteredData, allData, columns }: ExportModalProps) {
  const handleExportFiltered = () => {
    onExport(filteredData);
    onClose();
  };

  const handleExportAll = () => {
    onExport(allData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="p-6">
          <h2 className="text-xl mb-4">Export Data</h2>
          <p className="text-gray-600 text-sm mb-6">
            Choose which data you'd like to export to CSV:
          </p>

          <div className="space-y-3">
            {/* Export Filtered Data */}
            <button
              onClick={handleExportFiltered}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                <Filter className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-900">Current Filtered Selection</div>
                <div className="text-sm text-gray-500">
                  {filteredData.length} row{filteredData.length !== 1 ? 's' : ''} × {columns.length} column{columns.length !== 1 ? 's' : ''}
                </div>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </button>

            {/* Export All Data */}
            <button
              onClick={handleExportAll}
              className="w-full flex items-center gap-4 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all group"
            >
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <Database className="w-6 h-6 text-green-600" />
              </div>
              <div className="flex-1 text-left">
                <div className="text-gray-900">Entire Data Set</div>
                <div className="text-sm text-gray-500">
                  {allData.length} row{allData.length !== 1 ? 's' : ''} × {columns.length} column{columns.length !== 1 ? 's' : ''}
                </div>
              </div>
              <Download className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-4 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
