import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';

interface FileDropzoneProps {
  onFileUpload: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  className?: string;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileUpload,
  accept = 'image/*',
  multiple = true,
  className = ''
}) => {
  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    if (rejectedFiles.length > 0) {
      alert(`Algunos archivos fueron rechazados. Solo se permiten archivos de tipo: ${accept}`);
    }
    
    // Validate file size (max 5MB)
    const validFiles = acceptedFiles.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`El archivo ${file.name} es muy grande. Tamaño máximo: 5MB`);
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      onFileUpload(validFiles);
    }
  }, [onFileUpload, accept]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      [accept]: []
    },
    multiple,
    maxSize: 5 * 1024 * 1024 // 5MB
  });

  return (
    <div
      {...getRootProps()}
      className={`
        border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer
        transition-colors duration-200 hover:border-blue-400 hover:bg-blue-50/50
        ${isDragActive ? 'border-blue-500 bg-blue-50' : ''}
        ${className}
      `}
    >
      <input {...getInputProps()} />
      <Upload className="mx-auto mb-4 h-12 w-12 text-gray-400" />
      {isDragActive ? (
        <p className="text-blue-600 font-medium">Suelta los archivos aquí...</p>
      ) : (
        <div>
          <p className="text-gray-600 font-medium mb-2">
            Arrastra archivos aquí o haz clic para seleccionar
          </p>
          <p className="text-sm text-gray-500">
            Soporta imágenes JPG, PNG, GIF, SVG
          </p>
        </div>
      )}
    </div>
  );
};