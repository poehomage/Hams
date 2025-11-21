import { useState } from 'react';
import { Pencil, Check, X, Upload } from 'lucide-react';

interface Color {
  id: string;
  name: string;
  hex: string;
}

interface ColorsViewProps {
  colors: Color[];
  setColors: (colors: Color[]) => void;
}

export function ColorsView({ colors, setColors }: ColorsViewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editHex, setEditHex] = useState('');

  const handleStartEdit = (color: Color) => {
    setEditingId(color.id);
    setEditName(color.name);
    setEditHex(color.hex);
  };

  const handleSave = () => {
    if (!editingId) return;

    setColors(
      colors.map(color =>
        color.id === editingId
          ? { ...color, name: editName, hex: editHex }
          : color
      )
    );
    setEditingId(null);
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditName('');
    setEditHex('');
  };

  const handleAddNew = () => {
    const newColor: Color = {
      id: `color-${Date.now()}`,
      name: '',
      hex: '#000000'
    };
    setColors([...colors, newColor]);
    handleStartEdit(newColor);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this color?')) {
      setColors(colors.filter(color => color.id !== id));
    }
  };

  const handleExport = () => {
    const csv = ['Color Name,Hex Value', ...colors.map(c => `${c.name},${c.hex}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `homage-colors-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n');
      const newColors: Color[] = lines
        .slice(1) // Skip header
        .filter(line => line.trim())
        .map((line, index) => {
          const [name, hex] = line.split(',').map(s => s.trim().replace(/^\"|\"$/g, ''));
          return {
            id: `color-${Date.now()}-${index}`,
            name: name || '',
            hex: hex || '#000000'
          };
        });
      setColors(newColors);
    };
    reader.readAsText(file);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="mb-1">HOMAGE Colors</h3>
            <p className="text-gray-600">Manage garment background hex values for preview displays</p>
          </div>
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
              <Upload className="w-4 h-4" />
              Import CSV
              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Export CSV
            </button>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Color
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto max-h-[calc(100vh-280px)]">
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
            <tr>
              <th className="text-left p-3 border-b border-gray-200 bg-gray-50 w-16">Preview</th>
              <th className="text-left p-3 border-b border-gray-200 bg-gray-50">Color Name</th>
              <th className="text-left p-3 border-b border-gray-200 bg-gray-50">Hex Value</th>
              <th className="text-left p-3 border-b border-gray-200 bg-gray-50 w-32">Actions</th>
            </tr>
          </thead>
          <tbody>
            {colors.map((color) => (
              <tr
                key={color.id}
                className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
              >
                {editingId === color.id ? (
                  <>
                    {/* Preview while editing */}
                    <td className="p-3">
                      <div
                        className="w-12 h-12 rounded border border-gray-300"
                        style={{ backgroundColor: editHex }}
                      />
                    </td>
                    {/* Edit Name */}
                    <td className="p-3">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-3 py-2 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Color name..."
                        autoFocus
                      />
                    </td>
                    {/* Edit Hex */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={editHex}
                          onChange={(e) => setEditHex(e.target.value)}
                          className="w-12 h-10 rounded border border-gray-300 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={editHex}
                          onChange={(e) => setEditHex(e.target.value)}
                          className="flex-1 px-3 py-2 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                          placeholder="#000000"
                        />
                      </div>
                    </td>
                    {/* Save/Cancel */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleSave}
                          className="p-2 hover:bg-green-100 rounded text-green-600"
                          title="Save"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                          title="Cancel"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                ) : (
                  <>
                    {/* Preview */}
                    <td className="p-3">
                      <div
                        className="w-12 h-12 rounded border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                        title={color.hex}
                      />
                    </td>
                    {/* Name */}
                    <td className="p-3">
                      <span className="capitalize">{color.name}</span>
                    </td>
                    {/* Hex */}
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">
                          {color.hex}
                        </code>
                      </div>
                    </td>
                    {/* Actions */}
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleStartEdit(color)}
                          className="p-2 hover:bg-blue-100 rounded text-blue-600"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(color.id)}
                          className="p-2 hover:bg-red-100 rounded text-red-600"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {colors.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p className="mb-4">No colors defined yet</p>
            <button
              onClick={handleAddNew}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Your First Color
            </button>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <p className="text-sm text-gray-600">
          💡 These color values are used for the background in image previews to simulate how graphics appear on actual garments.
        </p>
      </div>
    </div>
  );
}