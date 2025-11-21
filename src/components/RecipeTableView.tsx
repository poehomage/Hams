import { useState } from 'react';
import { Plus, Trash2, Save, Upload, Download, X } from 'lucide-react';

interface RecipeTableViewProps {
  recipeTable: any[];
  setRecipeTable: (table: any[]) => void;
}

interface RecipeEntry {
  id: string;
  blankSilo: string;
  materialType: string;
  A: string;
  B: string;
  C: string;
  D: string;
  E: string;
}

export function RecipeTableView({ recipeTable, setRecipeTable }: RecipeTableViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<RecipeEntry>({
    id: '',
    blankSilo: '',
    materialType: '',
    A: '',
    B: '',
    C: '',
    D: '',
    E: ''
  });

  const handleAdd = () => {
    const newEntry: RecipeEntry = {
      id: Date.now().toString(),
      blankSilo: '',
      materialType: '',
      A: '',
      B: '',
      C: '',
      D: '',
      E: ''
    };
    setRecipeTable([...recipeTable, newEntry]);
    setEditingId(newEntry.id);
    setEditValues(newEntry);
  };

  const handleSave = (id: string) => {
    setRecipeTable(recipeTable.map(entry => 
      entry.id === id ? { ...editValues } : entry
    ));
    setEditingId(null);
  };

  const handleEdit = (entry: RecipeEntry) => {
    setEditingId(entry.id);
    setEditValues(entry);
  };

  const handleDelete = (id: string) => {
    setRecipeTable(recipeTable.filter(entry => entry.id !== id));
  };

  const handleExport = () => {
    const csv = [
      'Blank Silo,Material Type,A,B,C,D,E',
      ...recipeTable.map(entry => 
        `${entry.blankSilo},${entry.materialType},${entry.A},${entry.B},${entry.C},${entry.D},${entry.E}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `recipe-lookup-table-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const entries = lines.slice(1)
        .filter(line => line.trim())
        .map((line, index) => {
          const parts = line.split(',').map(s => s.trim());
          return {
            id: `imported-${Date.now()}-${index}`,
            blankSilo: parts[0] || '',
            materialType: parts[1] || '',
            A: parts[2] || '',
            B: parts[3] || '',
            C: parts[4] || '',
            D: parts[5] || '',
            E: parts[6] || ''
          };
        });
      setRecipeTable([...recipeTable, ...entries]);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-1">Recipe Lookup Table</h3>
            <p className="text-gray-600">Manage recipe values by Blank Silo and Material Type</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload className="w-5 h-5" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExport}
              disabled={recipeTable.length === 0}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Entry
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-350px)]">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0">
            <tr>
              <th className="text-left p-3 border-b border-gray-200 min-w-[150px]">
                Blank Silo
              </th>
              <th className="text-left p-3 border-b border-gray-200 min-w-[120px]">
                Material Type
              </th>
              <th className="text-left p-3 border-b border-gray-200 min-w-[150px] bg-blue-50">
                Recipe A
              </th>
              <th className="text-left p-3 border-b border-gray-200 min-w-[150px] bg-blue-50">
                Recipe B
              </th>
              <th className="text-left p-3 border-b border-gray-200 min-w-[150px] bg-blue-50">
                Recipe C
              </th>
              <th className="text-left p-3 border-b border-gray-200 min-w-[150px] bg-blue-50">
                Recipe D
              </th>
              <th className="text-left p-3 border-b border-gray-200 min-w-[150px] bg-blue-50">
                Recipe E
              </th>
              <th className="text-left p-3 border-b border-gray-200 w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {recipeTable.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-gray-500">
                  No entries yet. Click "Add Entry" to create your first recipe lookup.
                </td>
              </tr>
            ) : (
              recipeTable.map((entry: RecipeEntry) => (
                <tr key={entry.id} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="p-3">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editValues.blankSilo}
                        onChange={(e) => setEditValues({ ...editValues, blankSilo: e.target.value })}
                        placeholder="e.g., Cotton"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                    ) : (
                      <span className="font-medium">{entry.blankSilo || <span className="text-gray-400">Not set</span>}</span>
                    )}
                  </td>
                  <td className="p-3">
                    {editingId === entry.id ? (
                      <select
                        value={editValues.materialType}
                        onChange={(e) => setEditValues({ ...editValues, materialType: e.target.value })}
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Type</option>
                        <option value="Tee">Tee</option>
                        <option value="Fleece">Fleece</option>
                      </select>
                    ) : (
                      <span className="text-sm text-gray-600">{entry.materialType || <span className="text-gray-400">-</span>}</span>
                    )}
                  </td>
                  <td className="p-3 bg-blue-50/50">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editValues.A}
                        onChange={(e) => setEditValues({ ...editValues, A: e.target.value })}
                        placeholder="Recipe A value"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm">{entry.A || <span className="text-gray-400">-</span>}</span>
                    )}
                  </td>
                  <td className="p-3 bg-blue-50/50">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editValues.B}
                        onChange={(e) => setEditValues({ ...editValues, B: e.target.value })}
                        placeholder="Recipe B value"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm">{entry.B || <span className="text-gray-400">-</span>}</span>
                    )}
                  </td>
                  <td className="p-3 bg-blue-50/50">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editValues.C}
                        onChange={(e) => setEditValues({ ...editValues, C: e.target.value })}
                        placeholder="Recipe C value"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm">{entry.C || <span className="text-gray-400">-</span>}</span>
                    )}
                  </td>
                  <td className="p-3 bg-blue-50/50">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editValues.D}
                        onChange={(e) => setEditValues({ ...editValues, D: e.target.value })}
                        placeholder="Recipe D value"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm">{entry.D || <span className="text-gray-400">-</span>}</span>
                    )}
                  </td>
                  <td className="p-3 bg-blue-50/50">
                    {editingId === entry.id ? (
                      <input
                        type="text"
                        value={editValues.E}
                        onChange={(e) => setEditValues({ ...editValues, E: e.target.value })}
                        placeholder="Recipe E value"
                        className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <span className="text-sm">{entry.E || <span className="text-gray-400">-</span>}</span>
                    )}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {editingId === entry.id ? (
                        <>
                          <button
                            onClick={() => handleSave(entry.id)}
                            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Save"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                            title="Cancel"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(entry)}
                            className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            title="Edit"
                          >
                            ✎
                          </button>
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="p-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
