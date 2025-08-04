import React from "react";
import { X, Upload, Trash2 } from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: Array<{
    id: string;
    url: string;
    file?: File;
    name: string;
  }>;
  onRemoveImage: (id: string) => void;
  onUploadImages: () => void;
  isUploading: boolean;
}

export const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({ isOpen, onClose, images, onRemoveImage, onUploadImages, isUploading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-75" onClick={onClose} />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-4 bg-white rounded-lg shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Preview Gambar ({images.length})</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Images Grid */}
        <div className="p-4 max-h-96 overflow-y-auto">
          {images.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Tidak ada gambar dipilih</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => (
                <div key={image.id} className="relative group">
                  <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                    <img src={image.url} alt={image.name} className="w-full h-full object-cover" />
                  </div>

                  {/* Remove Button */}
                  <button onClick={() => onRemoveImage(image.id)} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Trash2 size={14} />
                  </button>

                  {/* Image Name */}
                  <p className="mt-1 text-xs text-gray-600 truncate">{image.name}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Batal
          </button>

          <button
            onClick={onUploadImages}
            disabled={images.length === 0 || isUploading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Mengupload...
              </>
            ) : (
              <>
                <Upload size={16} />
                Upload {images.length} Gambar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
