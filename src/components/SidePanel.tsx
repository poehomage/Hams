import { useState, useRef, useEffect } from 'react';
import { X, Minimize2, Maximize2, GripVertical } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SidePanelProps {
  row: any;
  columns: string[];
  isMinimized: boolean;
  onMinimize: () => void;
  onClose: () => void;
  width: number;
  onWidthChange: (width: number) => void;
  colors: any[];
}

const PREVIEW_FIELDS = [
  'Production Folder',
  'AW_Front',
  'AW_Back',
  'AW_LS',
  'AW_RS',
  'AW_Neck',
  'Spec_Sheet',
  'Spec_Sheet 2'
];

export function SidePanel({ 
  row, 
  columns, 
  isMinimized, 
  onMinimize, 
  onClose, 
  width,
  onWidthChange,
  colors
}: SidePanelProps) {
  const [isResizing, setIsResizing] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);

  const isURL = (value: string) => {
    if (!value) return false;
    const str = String(value).toLowerCase();
    return str.startsWith('http://') || str.startsWith('https://') || str.startsWith('www.');
  };

  const isImage = (url: string) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  // Resize handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = width;
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      
      const deltaX = e.clientX - startXRef.current;
      const newWidth = Math.min(Math.max(startWidthRef.current + deltaX, 300), 800);
      onWidthChange(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, width, onWidthChange]);

  // Get background color from Shopify Display Color
  const getPreviewBackground = () => {
    const shopifyColor = row['Shopify Display Color'];
    if (!shopifyColor) return '#f3f4f6'; // default gray-100
    
    // If it's already a hex color, use it directly
    if (shopifyColor.startsWith('#')) return shopifyColor;
    
    // Look up the color in our dynamic colors array (case-insensitive)
    const colorKey = shopifyColor.toLowerCase().trim();
    const colorEntry = colors.find(c => c.name.toLowerCase() === colorKey);
    
    if (colorEntry) return colorEntry.hex;
    
    // Fallback to default gray if color not found
    return '#f3f4f6';
  };

  const previewBgColor = getPreviewBackground();

  // Get all preview fields that have values
  const previewFields = PREVIEW_FIELDS.filter(field => 
    columns.includes(field) && isURL(row[field]) && isImage(row[field])
  );

  if (isMinimized) {
    return (
      <div className="fixed left-4 top-4 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-40">
        <div className="flex items-center gap-2">
          <button
            onClick={onMinimize}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Maximize"
          >
            <Maximize2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={panelRef}
      className="bg-white rounded-lg shadow-lg border border-gray-200 flex flex-col max-h-[calc(100vh-64px)] sticky top-4 relative"
      style={{ width: `${width}px` }}
    >
      {/* Resize Handle */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors group"
        onMouseDown={handleMouseDown}
      >
        <div className="absolute right-1/2 top-1/2 translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h3>Preview</h3>
          {row['Shopify Display Color'] && (
            <div className="flex items-center gap-2 mt-1">
              <span 
                className="inline-block w-3 h-3 rounded border border-gray-300"
                style={{ backgroundColor: previewBgColor }}
              />
              <span className="text-xs text-gray-600">{row['Shopify Display Color']}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onMinimize}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Minimize"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {previewFields.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No image previews available</p>
            <p className="text-sm mt-2">Add image URLs to see previews here</p>
          </div>
        ) : (
          previewFields.map(field => (
            <div key={field} className="space-y-2">
              <label className="text-sm text-gray-700">{field}</label>
              <div 
                className="rounded-lg overflow-hidden border border-gray-200 p-4"
                style={{ backgroundColor: previewBgColor }}
              >
                <ImageWithFallback
                  src={row[field]}
                  alt={field}
                  className="w-full h-auto object-contain"
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}