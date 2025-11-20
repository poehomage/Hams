import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { URLPreview } from './URLPreview';

interface URLCellProps {
  url: string;
}

export function URLCell({ url }: URLCellProps) {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  if (!url) return <span className="text-gray-400">-</span>;

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setShowPreview(true);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <>
      <button
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowPreview(false)}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:underline group"
      >
        <ExternalLink className="w-4 h-4" />
        <span className="truncate max-w-[200px]">{url}</span>
      </button>

      {showPreview && (
        <URLPreview url={url} position={previewPosition} />
      )}
    </>
  );
}
