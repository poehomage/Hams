import { useState } from 'react';
import { Pencil, Upload, Check, X } from 'lucide-react';

interface EditableCellProps {
  row: any;
  column: string;
  value: string;
  onUpdate: (row: any, column: string, value: string) => void;
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

export function EditableCell({ row, column, value, onUpdate, recipeTable }: EditableCellProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || '');
  const [showHover, setShowHover] = useState(false);

  const handleSave = () => {
    if (column === 'Recipe') {
      // Handle recipe lookup
      const blankSilo = row['Blank Silo'];
      if (blankSilo && editValue) {
        const recipeEntry = recipeTable.find(entry => entry.blankSilo === blankSilo);
        if (recipeEntry && editValue in recipeEntry) {
          // Use the recipe value from the lookup table (not the letter)
          const recipeValue = recipeEntry[editValue];
          onUpdate(row, column, recipeValue || '');
        } else {
          // If no matching recipe or letter not in lookup table, leave blank
          onUpdate(row, column, '');
        }
      } else {
        onUpdate(row, column, editValue || '');
      }
    } else {
      onUpdate(row, column, editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value || '');
    setIsEditing(false);
  };

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setEditValue(url);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
        {column === 'Recipe' ? (
          <select
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            autoFocus
          >
            <option value="">Select Recipe</option>
            {['A', 'B', 'C', 'D', 'E'].map(letter => {
              const recipe = recipeTable.find(entry => entry.blankSilo === row['Blank Silo']);
              const recipeValue = recipe ? recipe[letter] : '';
              return (
                <option key={letter} value={letter}>
                  {letter}{recipeValue ? ` - ${recipeValue}` : ''}
                </option>
              );
            })}
          </select>
        ) : (
          <input
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            className="px-2 py-1 border border-blue-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm flex-1 min-w-0"
            placeholder={`Enter ${column}`}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSave();
              if (e.key === 'Escape') handleCancel();
            }}
          />
        )}
        {EDITABLE_URL_FIELDS.includes(column) && (
          <label className="p-1 hover:bg-gray-100 rounded cursor-pointer" title="Upload file">
            <Upload className="w-4 h-4 text-gray-600" />
            <input
              type="file"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
              accept="image/*,.pdf"
            />
          </label>
        )}
        <button
          onClick={handleSave}
          className="p-1 hover:bg-green-100 rounded text-green-600"
          title="Save"
        >
          <Check className="w-4 h-4" />
        </button>
        <button
          onClick={handleCancel}
          className="p-1 hover:bg-red-100 rounded text-red-600"
          title="Cancel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative group flex items-center gap-2"
      onMouseEnter={() => setShowHover(true)}
      onMouseLeave={() => setShowHover(false)}
      onClick={handleClick}
    >
      <div className="truncate max-w-xs flex-1" title={value}>
        {value || <span className="text-gray-400 italic">Click to edit</span>}
      </div>
      {showHover && (
        <button
          className="p-1 bg-blue-100 rounded text-blue-600"
          title="Edit"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}