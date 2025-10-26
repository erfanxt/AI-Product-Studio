
import React, { useCallback, useState, useEffect } from 'react';

interface ImageUploaderProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
}

const UploadIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
  </svg>
);

export const ImageUploader: React.FC<ImageUploaderProps> = ({ file, onFileChange }) => {
  const [preview, setPreview] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileChange(selectedFile);
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onFileChange(null);
  }

  return (
    <div className="mt-2">
      <label htmlFor="file-upload" className="relative cursor-pointer bg-slate-900 border-2 border-dashed border-slate-600 rounded-lg flex justify-center items-center h-48 text-center hover:border-purple-500 transition-colors">
        {preview ? (
          <>
            <img src={preview} alt="Product preview" className="object-contain h-full w-full rounded-lg p-1" />
            <button 
              onClick={handleRemoveImage} 
              className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 leading-none hover:bg-opacity-75"
              aria-label="حذف تصویر"
            >
              &#x2715;
            </button>
          </>
        ) : (
          <div className="flex flex-col items-center">
            <UploadIcon />
            <span className="mt-2 text-sm text-slate-400">
              <span className="font-semibold text-purple-400">برای بارگذاری کلیک کنید</span> یا بکشید و رها کنید
            </span>
            <p className="text-xs text-slate-500">PNG, JPG, GIF تا ۱۰ مگابایت</p>
          </div>
        )}
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileSelect} accept="image/png, image/jpeg, image/gif" />
      </label>
    </div>
  );
};
