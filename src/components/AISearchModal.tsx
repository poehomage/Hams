import { useState } from 'react';
import { X, Sparkles, Search } from 'lucide-react';

interface AISearchModalProps {
  onClose: () => void;
  onSearch: (query: string) => void;
  columns: string[];
}

export function AISearchModal({ onClose, onSearch, columns }: AISearchModalProps) {
  const [query, setQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const suggestions = [
    "Show me all items that need MD approval",
    "Find products with missing spec sheets",
    "Show active items with PLR type",
    "Find all items ready to activate",
    "Show products with HMG print notes"
  ];

  const processNaturalLanguageQuery = (naturalQuery: string): string => {
    const lowerQuery = naturalQuery.toLowerCase();
    let searchTerms: string[] = [];

    // Extract key terms and map to likely column values
    const keywords: Record<string, string[]> = {
      'md approval': ['MD APPROVED', 'approved', 'pending'],
      'spec sheet': ['Spec_Sheet', 'Spec_Sheet 2'],
      'missing': ['', 'null', 'n/a'],
      'active': ['MD Active', 'active', 'yes', 'true'],
      'ready': ['Ready to Activate', 'ready', 'yes'],
      'plr': ['PLR', 'PLR Type', 'PLR Bin ID'],
      'hmg': ['HMG Print Note', 'print note'],
      'shopify': ['Shopify Display Color'],
      'size': ['Size'],
      'color': ['Blank Color', 'Shopify Display Color'],
      'production': ['Production Folder'],
      'recipe': ['Recipe'],
      'master graphic': ['Master Graphic'],
      'sku': ['SKU ID', 'MD SKU'],
      'blank': ['BLANK ID', 'Blank Color', 'Blank Silo']
    };

    // Find matching keywords
    Object.entries(keywords).forEach(([key, values]) => {
      if (lowerQuery.includes(key)) {
        // If it's a "missing" query, look for empty values
        if (lowerQuery.includes('missing') || lowerQuery.includes('without') || lowerQuery.includes('no ')) {
          searchTerms.push(values[0]);
        } else {
          searchTerms.push(...values);
        }
      }
    });

    // If no keywords matched, extract quoted strings or significant words
    if (searchTerms.length === 0) {
      const quotedMatch = naturalQuery.match(/"([^"]+)"/);
      if (quotedMatch) {
        searchTerms.push(quotedMatch[1]);
      } else {
        // Extract words longer than 3 characters
        const words = naturalQuery.split(' ').filter(w => w.length > 3);
        searchTerms.push(...words);
      }
    }

    return searchTerms[0] || naturalQuery;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsProcessing(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const processedQuery = processNaturalLanguageQuery(query);
      onSearch(processedQuery);
      setIsProcessing(false);
    }, 500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2>AI-Powered Search</h2>
              <p className="text-sm text-gray-600">Describe what you're looking for in natural language</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-2">What are you looking for?</label>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g., Show me all products that need MD approval and are ready to activate..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                rows={4}
              />
            </div>

            <button
              type="submit"
              disabled={!query.trim() || isProcessing}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </form>

          {/* Suggestions */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Try these examples:</p>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-sm border border-gray-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>

          {/* Available Fields */}
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Available fields in your data:</p>
            <div className="flex flex-wrap gap-2 max-h-40 overflow-auto p-3 bg-gray-50 rounded-lg">
              {columns.map(col => (
                <span
                  key={col}
                  className="px-3 py-1 bg-white border border-gray-200 rounded-full text-xs"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
