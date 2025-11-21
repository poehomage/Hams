import { useState, useEffect } from 'react';
import { DataTableView } from './components/DataTableView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { Upload, BarChart3, Settings } from 'lucide-react';
import logoImage from 'figma:asset/cf7a4147c08e334fdaa8c5b3a4f979427e6594bd.png';

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start as true since we load on mount
  const [currentPage, setCurrentPage] = useState<'data' | 'reports' | 'settings'>('data');
  const [recipeTable, setRecipeTable] = useState<any[]>([]);
  const [previousInternalIds, setPreviousInternalIds] = useState<Set<string>>(new Set());
  const [colors, setColors] = useState<any[]>([
    { id: '1', name: 'black', hex: '#000000' },
    { id: '2', name: 'white', hex: '#ffffff' },
    { id: '3', name: 'ash', hex: '#cccccb' },
    { id: '4', name: 'brown', hex: '#624c46' },
    { id: '5', name: 'charcoal', hex: '#2b2c30' },
    { id: '6', name: 'gold', hex: '#ffcc66' },
    { id: '7', name: 'green', hex: '#319966' },
    { id: '8', name: 'grey', hex: '#97979b' },
    { id: '9', name: 'light blue', hex: '#82a3d1' },
    { id: '10', name: 'navy', hex: '#2e354e' },
    { id: '11', name: 'orange', hex: '#f79868' },
    { id: '12', name: 'pine', hex: '#346734' },
    { id: '13', name: 'red', hex: '#cc3333' },
    { id: '14', name: 'stone', hex: '#d0c9bd' },
    { id: '15', name: 'royal blue', hex: '#4272ab' },
    { id: '16', name: 'royal purple', hex: '#855b8e' },
    { id: '17', name: 'teal', hex: '#00a3b4' },
    { id: '18', name: 'wine', hex: '#6f2f32' }
  ]);

  // Auto-load CSV files from GitHub on mount
  useEffect(() => {
    loadCSVFromGitHub();
  }, []);

  const loadCSVFromGitHub = async () => {
    setIsLoading(true);
    try {
      // Try multiple URL formats
      const dataFileVariants = [
        'https://raw.githubusercontent.com/poehomage/Hams/main/MASTER%20MONSTER%20-%20SAMPLE.csv',
        'https://raw.githubusercontent.com/poehomage/Hams/master/MASTER%20MONSTER%20-%20SAMPLE.csv',
        `https://raw.githubusercontent.com/poehomage/Hams/main/${encodeURIComponent('MASTER MONSTER - SAMPLE.csv')}`,
      ];
      
      const recipeFileVariants = [
        'https://raw.githubusercontent.com/poehomage/Hams/main/MASTER%20MONSTER%20-%20RECIPES%20SAMPLE.csv',
        'https://raw.githubusercontent.com/poehomage/Hams/master/MASTER%20MONSTER%20-%20RECIPES%20SAMPLE.csv',
        `https://raw.githubusercontent.com/poehomage/Hams/main/${encodeURIComponent('MASTER MONSTER - RECIPES SAMPLE.csv')}`,
      ];
      
      // Try to load main data table CSV
      console.log('Fetching data table CSV...');
      let dataLoaded = false;
      for (const url of dataFileVariants) {
        console.log('Trying:', url);
        const dataResponse = await fetch(url);
        console.log('Response status:', dataResponse.status);
        
        if (dataResponse.ok) {
          const dataText = await dataResponse.text();
          console.log('Data text length:', dataText.length);
          const rows = parseCSV(dataText);
          console.log('Parsed rows:', rows.length);
          setData(rows);
          dataLoaded = true;
          console.log('✅ Data loaded successfully from:', url);
          break;
        }
      }
      
      if (!dataLoaded) {
        console.error('❌ Failed to load data CSV from any variant');
      }

      // Try to load recipe table CSV
      console.log('Fetching recipe table CSV...');
      let recipeLoaded = false;
      for (const url of recipeFileVariants) {
        console.log('Trying:', url);
        const recipeResponse = await fetch(url);
        console.log('Response status:', recipeResponse.status);
        
        if (recipeResponse.ok) {
          const recipeText = await recipeResponse.text();
          console.log('Recipe text length:', recipeText.length);
          const recipeRows = parseRecipeCSV(recipeText);
          console.log('Parsed recipe rows:', recipeRows.length);
          setRecipeTable(recipeRows);
          recipeLoaded = true;
          console.log('✅ Recipe loaded successfully from:', url);
          break;
        }
      }
      
      if (!recipeLoaded) {
        console.error('❌ Failed to load recipe CSV from any variant');
      }
    } catch (error) {
      console.error('Failed to load CSV files from GitHub:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseRecipeCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    
    return lines.slice(1)
      .filter(line => line.trim())
      .map((line, index) => {
        const values = parseCSVLine(line);
        return {
          id: `recipe-${index}`,
          blankSilo: values[0] || '',
          materialType: values[1] || '',
          A: values[2] || '',
          B: values[3] || '',
          C: values[4] || '',
          D: values[5] || '',
          E: values[6] || ''
        };
      });
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-4">
          <div className="flex items-center gap-4">
            <div className="flex flex-col gap-2 mr-8">
              <img src={logoImage} alt="Homage Logo" className="w-[13.3rem] h-auto" />
              <h1 className="whitespace-nowrap">Artwork Management System</h1>
            </div>
            <button
              onClick={() => setCurrentPage('data')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'data'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              Master Table
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
            <button
              onClick={() => setCurrentPage('settings')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'settings'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {currentPage === 'data' ? (
          <>
            {isLoading ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="mb-2">Loading Data...</h2>
                  <p className="text-gray-600">
                    Loading CSV files from GitHub
                  </p>
                </div>
              </div>
            ) : data.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12">
                <div className="max-w-md mx-auto text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-blue-600" />
                  </div>
                  <h2 className="mb-2">No Data Available</h2>
                  <p className="text-gray-600 mb-6">
                    Upload a CSV file or check your GitHub repository
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
                      <li>Data automatically loads from GitHub on startup</li>
                      <li>Or manually upload a CSV file from your computer</li>
                      <li>For large datasets, filter to a manageable size before exporting</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <DataTableView data={data} setData={setData} onReload={() => setData([])} recipeTable={recipeTable} colors={colors} />
            )}
          </>
        ) : currentPage === 'reports' ? (
          <ReportsView data={data} />
        ) : (
          <SettingsView 
            recipeTable={recipeTable} 
            setRecipeTable={setRecipeTable}
            colors={colors}
            setColors={setColors}
          />
        )}
      </div>
    </div>
  );
}