import React, { useState } from 'react';

interface ImageUploaderProps {
  currentImage?: string;
  onImageUpload: (file: File) => Promise<void>;
  onImageRemove?: () => void;
  accept?: string;
  className?: string;
  disabled?: boolean;
  label?: string;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentImage,
  onImageUpload,
  onImageRemove,
  accept = 'image/*',
  className = '',
  disabled = false,
  label = '이미지 업로드'
}) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      await onImageUpload(file);
    } catch (error) {
      console.error('Image upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 font-pretendard">
          {label}
        </label>
      )}
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragOver
            ? 'border-orange-400 bg-orange-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        {uploading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="w-5 h-5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
            <span className="text-sm text-gray-600">업로드 중...</span>
          </div>
        ) : currentImage ? (
          <div className="space-y-3">
            <img
              src={currentImage}
              alt="미리보기"
              className="w-full h-48 object-cover rounded-lg border border-gray-200"
            />
            {onImageRemove && (
              <button
                type="button"
                onClick={onImageRemove}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                이미지 제거
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-gray-400">
              <svg className="mx-auto h-12 w-12" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-orange-600 hover:text-orange-500">
                클릭하여 업로드
              </span>
              {' '}또는 드래그 앤 드롭
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF 최대 10MB</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUploader; 