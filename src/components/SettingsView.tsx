import { useState } from 'react';
import { FlaskConical, Palette } from 'lucide-react';
import { RecipeTableView } from './RecipeTableView';
import { ColorsView } from './ColorsView';

interface SettingsViewProps {
  recipeTable: any[];
  setRecipeTable: (table: any[]) => void;
  colors: any[];
  setColors: (colors: any[]) => void;
}

export function SettingsView({ recipeTable, setRecipeTable, colors, setColors }: SettingsViewProps) {
  const [activeTab, setActiveTab] = useState<'recipes' | 'colors'>('recipes');

  return (
    <div className="space-y-4">
      {/* Settings Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="mb-2">Settings</h2>
        <p className="text-gray-600">Manage system configuration and lookup tables</p>
      </div>

      {/* Settings Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200 px-6">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('recipes')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'recipes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FlaskConical className="w-5 h-5" />
              Recipe Lookup Table
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`flex items-center gap-2 px-4 py-4 border-b-2 transition-colors ${
                activeTab === 'colors'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Palette className="w-5 h-5" />
              HOMAGE Colors
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'recipes' ? (
            <RecipeTableView recipeTable={recipeTable} setRecipeTable={setRecipeTable} />
          ) : (
            <ColorsView colors={colors} setColors={setColors} />
          )}
        </div>
      </div>
    </div>
  );
}
