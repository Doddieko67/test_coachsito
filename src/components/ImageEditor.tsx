import React, { useState } from 'react';
import { Sliders, Eye } from 'lucide-react';

interface ImageEditorProps {
  elementId: string;
  opacity?: number;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    blur?: number;
  };
  onUpdateElement: (elementId: string, updates: any) => void;
  onClose: () => void;
}

export const ImageEditor: React.FC<ImageEditorProps> = ({
  elementId,
  opacity = 1,
  filters = {},
  onUpdateElement,
  onClose
}) => {
  const [localOpacity, setLocalOpacity] = useState(opacity * 100);
  const [localFilters, setLocalFilters] = useState({
    brightness: filters.brightness || 100,
    contrast: filters.contrast || 100,
    saturate: filters.saturate || 100,
    blur: filters.blur || 0
  });

  const handleOpacityChange = (value: number) => {
    setLocalOpacity(value);
    onUpdateElement(elementId, { opacity: value / 100 });
  };

  const handleFilterChange = (filterType: string, value: number) => {
    const newFilters = { ...localFilters, [filterType]: value };
    setLocalFilters(newFilters);
    onUpdateElement(elementId, { filters: newFilters });
  };

  const resetFilters = () => {
    const resetFilters = { brightness: 100, contrast: 100, saturate: 100, blur: 0 };
    setLocalFilters(resetFilters);
    setLocalOpacity(100);
    onUpdateElement(elementId, { 
      filters: resetFilters,
      opacity: 1
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-80 max-w-[90vw] shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
            <Sliders className="w-5 h-5 mr-2" />
            Editor de Imagen
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-xl"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-6">
          {/* Opacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <Eye className="w-4 h-4 mr-1" />
              Opacidad: {Math.round(localOpacity)}%
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={localOpacity}
              onChange={(e) => handleOpacityChange(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Brightness */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Brillo: {Math.round(localFilters.brightness)}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={localFilters.brightness}
              onChange={(e) => handleFilterChange('brightness', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Contrast */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraste: {Math.round(localFilters.contrast)}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={localFilters.contrast}
              onChange={(e) => handleFilterChange('contrast', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Saturation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Saturación: {Math.round(localFilters.saturate)}%
            </label>
            <input
              type="range"
              min="0"
              max="200"
              value={localFilters.saturate}
              onChange={(e) => handleFilterChange('saturate', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Blur */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Desenfoque: {Math.round(localFilters.blur)}px
            </label>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={localFilters.blur}
              onChange={(e) => handleFilterChange('blur', Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
        
        <div className="flex justify-between mt-6">
          <button
            onClick={resetFilters}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Restablecer
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Aplicar
          </button>
        </div>
      </div>

      <style>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }

        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
};