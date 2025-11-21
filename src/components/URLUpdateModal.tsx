import { useState, useEffect } from 'react';
import { X, Check, Upload } from 'lucide-react';

interface URLUpdateModalProps {
  currentURL: string;
  fieldName: string;
  onSave: (newURL: string) => void;
  onClose: () => void;
}

export function URLUpdateModal({ currentURL, fieldName, onSave, onClose }: URLUpdateModalProps) {
  const [newURL, setNewURL] = useState(currentURL || '');
  const [oldImageError, setOldImageError] = useState(false);
  const [newImageError, setNewImageError] = useState(false);

  useEffect(() => {
    setNewImageError(false);
  }, [newURL]);

  const handleSave = () => {
    onSave(newURL);
    onClose();
  };

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    setNewURL(url);
  };

  const isImageURL = (url: string) => {
    if (!url) return false;
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    return imageExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl">Update {fieldName}</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Input Section */}
          <div className="mb-6">
            <label className="block mb-2">New URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newURL}
                onChange={(e) => setNewURL(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new URL..."
                autoFocus
              />
              <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <Upload className="w-4 h-4" />
                Upload
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
            </div>
          </div>

          {/* Preview Comparison */}
          <div className="grid grid-cols-2 gap-6">
            {/* Old Preview */}
            <div>
              <h3 className="mb-3 text-gray-700">Current</h3>
              <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-[200px] flex items-center justify-center">
                {currentURL ? (
                  isImageURL(currentURL) && !oldImageError ? (
                    <img
                      src={currentURL}
                      alt="Current"
                      className="max-w-full max-h-[300px] object-contain"
                      onError={() => setOldImageError(true)}
                    />
                  ) : (
                    <div className="text-center">
                      <a
                        href={currentURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {currentURL}
                      </a>
                      {oldImageError && (
                        <p className="text-sm text-gray-500 mt-2">(Preview not available)</p>
                      )}
                    </div>
                  )
                ) : (
                  <span className="text-gray-400 italic">No current URL</span>
                )}
              </div>
            </div>

            {/* New Preview */}
            <div>
              <h3 className="mb-3 text-gray-700">New</h3>
              <div className="border border-gray-300 rounded-lg p-4 bg-blue-50 min-h-[200px] flex items-center justify-center">
                {newURL ? (
                  isImageURL(newURL) && !newImageError ? (
                    <img
                      src={newURL}
                      alt="New"
                      className="max-w-full max-h-[300px] object-contain"
                      onError={() => setNewImageError(true)}
                    />
                  ) : (
                    <div className="text-center">
                      <a
                        href={newURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {newURL}
                      </a>
                      {newImageError && (
                        <p className="text-sm text-gray-500 mt-2">(Preview not available)</p>
                      )}
                    </div>
                  )
                ) : (
                  <span className="text-gray-400 italic">Enter URL to preview</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Check className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
