import { useState, useEffect } from 'react';
import { DataTableView } from './components/DataTableView';
import { RecipeTableView } from './components/RecipeTableView';
import { ReportsView } from './components/ReportsView';
import { Upload, FlaskConical, BarChart3 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState<'data' | 'recipes' | 'reports'>('data');
  const [recipeTable, setRecipeTable] = useState<any[]>([]);
  const [previousInternalIds, setPreviousInternalIds] = useState<Set<string>>(new Set());

  const loadFromGoogleSheets = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      // Extract sheet ID and gid from the URL
      const sheetIdMatch = googleSheetsUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      const gidMatch = googleSheetsUrl.match(/gid=([0-9]+)/);
      
      if (!sheetIdMatch) {
        throw new Error('Invalid Google Sheets URL');
      }
      
      const sheetId = sheetIdMatch[1];
      const gid = gidMatch ? gidMatch[1] : '0';
      
      // Construct CSV export URL
      const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv&gid=${gid}`;
      
      // Fetch the CSV data
      const response = await fetch(csvUrl);
      
      if (!response.ok) {
        throw new Error('Failed to fetch Google Sheets data. Make sure the sheet is shared with "Anyone with the link can view".');
      }
      
      const text = await response.text();
      const rows = parseCSV(text);
      setData(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load Google Sheets data');
    } finally {
      setIsLoading(false);
    }
  };

  // Removed auto-load - data is too large for client-side loading

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setData(rows);
      setIsLoading(false);
    };
    
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const currentDate = new Date().toISOString();
    
    const newRows = lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = parseCSVLine(line);
        const row: any = { _id: index };
        headers.forEach((header, i) => {
          row[header] = values[i] || '';
        });
        
        // Check if this is a new item (not in previous data)
        const internalId = row['Internal ID'];
        const isNew = internalId && !previousInternalIds.has(internalId);
        
        if (isNew) {
          row._isNew = true;
          row._addedDate = currentDate;
        }
        
        return row;
      });
    
    // Update the set of known Internal IDs
    const newInternalIds = new Set(
      newRows
        .map(row => row['Internal ID'])
        .filter(id => id)
    );
    setPreviousInternalIds(newInternalIds);
    
    return newRows;
  };

  const parseCSVLine = (line: string) => {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim().replace(/^"|"$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim().replace(/^"|"$/g, ''));
    return result;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center gap-4">
            <h1 className="mr-8">Homage Artwork Management System</h1>
            <button
              onClick={() => setCurrentPage('data')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'data'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Data Table
            </button>
            <button
              onClick={() => setCurrentPage('recipes')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'recipes'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <FlaskConical className="w-4 h-4" />
              Recipe Lookup Table
            </button>
            <button
              onClick={() => setCurrentPage('reports')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'reports'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Reports
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {currentPage === 'data' ? (
          <>
            {data.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="mb-2">Upload CSV File</h2>
                  <p className="text-gray-600 mb-6">
                    Select a filtered CSV export to get started
                  </p>
                  <label className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                    <Upload className="w-5 h-5 mr-2" />
                    Choose File
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  
                  <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg text-sm text-left">
                    <p className="text-blue-900 mb-2"><strong>💡 Getting Started:</strong></p>
                    <ul className="text-blue-800 space-y-1 list-disc list-inside">
                      <li>Export a filtered subset from your Google Sheet as CSV</li>
                      <li>For large datasets, filter to a manageable size before exporting</li>
                      <li>This app will connect to a live database in production</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <DataTableView data={data} setData={setData} onReload={() => setData([])} recipeTable={recipeTable} />
            )}
          </>
        ) : currentPage === 'recipes' ? (
          <RecipeTableView recipeTable={recipeTable} setRecipeTable={setRecipeTable} />
        ) : (
          <ReportsView data={data} />
        )}
      </div>
    </div>
  );
}