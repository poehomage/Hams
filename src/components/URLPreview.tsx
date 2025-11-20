import { useState, useEffect } from 'react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface URLPreviewProps {
  url: string;
  position: { x: number; y: number };
}

export function URLPreview({ url, position }: URLPreviewProps) {
  const [isImage, setIsImage] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    const isImageUrl = imageExtensions.some(ext => url.toLowerCase().includes(ext));
    setIsImage(isImageUrl);
    setImageError(false);
  }, [url]);

  return (
    <div
      className="fixed z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 max-w-md"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translateY(-50%)'
      }}
    >
      <div className="mb-2">
        <p className="text-sm break-all text-gray-600">{url}</p>
      </div>
      
      {isImage && !imageError ? (
        <div className="mt-2 bg-gray-100 rounded overflow-hidden">
          <ImageWithFallback
            src={url}
            alt="Preview"
            className="max-w-full h-auto max-h-64 object-contain"
            onError={() => setImageError(true)}
          />
        </div>
      ) : (
        <div className="mt-2 p-4 bg-gray-50 rounded text-center text-sm text-gray-500">
          Preview not available
        </div>
      )}
    </div>
  );
}
