import React, { useState } from 'react';

interface ImageUploaderProps {
  currentImage: string | null;
  onImageChange: (dataUrl: string | null) => void;
  aspectRatio?: 'square' | 'landscape' | 'portrait' | 'banner';
  label?: string;
  placeholder?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageChange,
  aspectRatio = 'square',
  label = 'Upload Image',
  placeholder = 'No image'
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Calculate container dimensions based on aspect ratio
  const getContainerStyle = () => {
    switch (aspectRatio) {
      case 'landscape':
        return { paddingBottom: '56.25%' }; // 16:9 ratio
      case 'portrait':
        return { paddingBottom: '150%' }; // 2:3 ratio
      case 'banner':
        return { paddingBottom: '25%' }; // 4:1 ratio
      case 'square':
      default:
        return { paddingBottom: '100%' }; // 1:1 ratio
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    onImageChange(null);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">{label}</label>
      )}
      
      <div 
        className={`relative w-full border-2 rounded-lg overflow-hidden ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-50' 
            : currentImage 
              ? 'border-gray-200' 
              : 'border-dashed border-gray-300 bg-gray-50'
        }`}
        style={getContainerStyle()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {currentImage ? (
          <>
            <img 
              src={currentImage} 
              alt="Preview" 
              className="absolute top-0 left-0 w-full h-full object-cover"
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                type="button"
                onClick={removeImage}
                className="bg-red-500 hover:bg-red-600 text-white p-1 rounded-full"
                title="Remove image"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
            <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 mb-2">{placeholder}</p>
            <p className="text-xs text-gray-400">Drag & drop an image or click to browse</p>
          </div>
        )}
        
        {/* Hidden file input */}
        <input 
          type="file" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          onChange={handleFileSelect}
          accept="image/*"
        />
      </div>
    </div>
  );
}; 