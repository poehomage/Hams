import { useState, useEffect, useRef } from 'react';
import { DataTableView } from './components/DataTableView';
import { ReportsView } from './components/ReportsView';
import { SettingsView } from './components/SettingsView';
import { Upload, BarChart3, Settings } from 'lucide-react';
import logoImage from 'figma:asset/cf7a4147c08e334fdaa8c5b3a4f979427e6594bd.png';
import { projectId, publicAnonKey } from './utils/supabase/info.tsx';

export default function App() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start as true to load from DB
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

  // Use ref for debouncing
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const recipeSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-load data from Supabase on mount
  useEffect(() => {
    loadDataFromSupabase();
  }, []);

  // Debounced save function
  const debouncedSave = (dataToSave: any[]) => {
    // Clear any existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    // Set a new timeout to save after 1 second of inactivity
    saveTimeoutRef.current = setTimeout(() => {
      saveDataToSupabase(dataToSave);
    }, 1000);
  };

  // Debounced save for recipes
  const debouncedRecipeSave = (recipesToSave: any[]) => {
    // Clear any existing timeout
    if (recipeSaveTimeoutRef.current) {
      clearTimeout(recipeSaveTimeoutRef.current);
    }
    
    // Set a new timeout to save after 1 second of inactivity
    recipeSaveTimeoutRef.current = setTimeout(() => {
      saveRecipesToSupabase(recipesToSave);
    }, 1000);
  };

  const loadDataFromSupabase = async () => {
    setIsLoading(true);
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-0d1e2a2d`;
      
      // Load main data table
      console.log('Loading data from Supabase...');
      const dataResponse = await fetch(`${serverUrl}/load-data`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (dataResponse.ok) {
        const { data: loadedData } = await dataResponse.json();
        if (loadedData && loadedData.length > 0) {
          setData(loadedData);
          console.log(`✅ Loaded ${loadedData.length} rows from Supabase`);
        } else {
          console.log('No data found in Supabase');
        }
      } else {
        console.error('Failed to load data from Supabase');
      }
      
      // Load recipe table
      console.log('Loading recipes from Supabase...');
      const recipeResponse = await fetch(`${serverUrl}/load-recipes`, {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      });
      
      if (recipeResponse.ok) {
        const { recipes: loadedRecipes } = await recipeResponse.json();
        if (loadedRecipes && loadedRecipes.length > 0) {
          setRecipeTable(loadedRecipes);
          console.log(`✅ Loaded ${loadedRecipes.length} recipes from Supabase`);
        } else {
          console.log('No recipes found in Supabase');
        }
      } else {
        console.error('Failed to load recipes from Supabase');
      }
    } catch (error) {
      console.error('Error loading from Supabase:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveDataToSupabase = async (dataToSave: any[]) => {
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-0d1e2a2d`;
      
      const response = await fetch(`${serverUrl}/save-data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ data: dataToSave })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Data saved to Supabase:', result.message);
        return true;
      } else {
        const error = await response.json();
        console.error('Failed to save data:', error);
        return false;
      }
    } catch (error) {
      console.error('Error saving to Supabase:', error);
      return false;
    }
  };

  const saveRecipesToSupabase = async (recipesToSave: any[]) => {
    try {
      const serverUrl = `https://${projectId}.supabase.co/functions/v1/make-server-0d1e2a2d`;
      
      const response = await fetch(`${serverUrl}/save-recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ recipes: recipesToSave })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Recipes saved to Supabase:', result.message);
        return true;
      } else {
        const error = await response.json();
        console.error('Failed to save recipes:', error);
        return false;
      }
    } catch (error) {
      console.error('Error saving recipes to Supabase:', error);
      return false;
    }
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

  const parseCSV = (text: string) => {
    const lines = text.split('\n');
    const headers = parseCSVLine(lines[0]); // Use parseCSVLine for headers too
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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      const text = e.target?.result as string;
      const rows = parseCSV(text);
      setData(rows);
      
      // Auto-save to Supabase
      await saveDataToSupabase(rows);
      
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
                    Loading data from Supabase...
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
                      <li>Upload a CSV file to get started</li>
                      <li>Data is automatically saved to Supabase</li>
                      <li>Your data persists across sessions</li>
                    </ul>
                  </div>
                </div>
              </div>
            ) : (
              <DataTableView 
                data={data} 
                setData={(newData) => {
                  setData(newData);
                  debouncedSave(newData);
                }} 
                onReload={() => setData([])} 
                recipeTable={recipeTable} 
                colors={colors} 
              />
            )}
          </>
        ) : currentPage === 'reports' ? (
          <ReportsView data={data} />
        ) : (
          <SettingsView 
            recipeTable={recipeTable} 
            setRecipeTable={(newRecipes) => {
              setRecipeTable(newRecipes);
              debouncedRecipeSave(newRecipes);
            }}
            colors={colors}
            setColors={setColors}
          />
        )}
      </div>
    </div>
  );
}