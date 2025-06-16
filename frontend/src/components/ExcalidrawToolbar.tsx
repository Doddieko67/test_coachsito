import React from 'react';
import { 
  MousePointer2, 
  Square, 
  Circle, 
  Triangle,
  ArrowRight,
  Minus,
  Edit3,
  Type,
  Image,
  Eraser,
  Undo,
  Redo
} from 'lucide-react';

export type ToolType = 
  | 'select' 
  | 'rectangle' 
  | 'circle' 
  | 'diamond' 
  | 'arrow' 
  | 'line' 
  | 'freedraw' 
  | 'text' 
  | 'image' 
  | 'eraser';

interface ExcalidrawToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onImageUpload: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  strokeColor: string;
  fillColor: string;
  strokeWidth: number;
  onStrokeColorChange: (color: string) => void;
  onFillColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
}

const tools = [
  { id: 'select' as ToolType, icon: MousePointer2, label: 'Seleccionar (V)' },
  { id: 'rectangle' as ToolType, icon: Square, label: 'Rectángulo (R)' },
  { id: 'circle' as ToolType, icon: Circle, label: 'Círculo (O)' },
  { id: 'diamond' as ToolType, icon: Triangle, label: 'Diamante (D)' },
  { id: 'arrow' as ToolType, icon: ArrowRight, label: 'Flecha (A)' },
  { id: 'line' as ToolType, icon: Minus, label: 'Línea (L)' },
  { id: 'freedraw' as ToolType, icon: Edit3, label: 'Dibujo libre (P)' },
  { id: 'text' as ToolType, icon: Type, label: 'Texto (T)' },
  { id: 'image' as ToolType, icon: Image, label: 'Imagen (I)' },
  { id: 'eraser' as ToolType, icon: Eraser, label: 'Borrador (E)' }
];

const colors = [
  '#000000', '#ffffff', '#e03131', '#2f9e44', '#1971c2', '#f08c00',
  '#ae3ec9', '#ffd43b', '#495057', '#868e96', '#ff6b6b', '#51cf66',
  '#339af0', '#ff922b', '#be4bdb', '#69db7c'
];

const strokeWidths = [1, 2, 4, 8, 12];

export const ExcalidrawToolbar: React.FC<ExcalidrawToolbarProps> = ({
  activeTool,
  onToolChange,
  onImageUpload,
  onUndo,
  onRedo,
  strokeColor,
  fillColor,
  strokeWidth,
  onStrokeColorChange,
  onFillColorChange,
  onStrokeWidthChange
}) => {
  return (
    <div className="fixed left-4 top-1/2 transform -translate-y-1/2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 z-40 max-h-[90vh] overflow-y-auto">
      <div className="flex flex-col space-y-1">
        {/* Tools */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => tool.id === 'image' ? onImageUpload() : onToolChange(tool.id)}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-blue-50 ${
                  activeTool === tool.id 
                    ? 'bg-blue-100 text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-blue-600'
                }`}
                title={tool.label}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>

        {/* Undo/Redo */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          <button
            onClick={onUndo}
            className="w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 text-gray-600 hover:text-gray-800"
            title="Deshacer (Ctrl+Z)"
          >
            <Undo className="w-5 h-5" />
          </button>
          <button
            onClick={onRedo}
            className="w-10 h-10 flex items-center justify-center rounded-lg transition-all hover:bg-gray-50 text-gray-600 hover:text-gray-800"
            title="Rehacer (Ctrl+Y)"
          >
            <Redo className="w-5 h-5" />
          </button>
        </div>

        {/* Colors - More compact */}
        <div className="border-b border-gray-200 pb-2 mb-2">
          <div className="text-xs text-gray-500 mb-1 px-1">Trazo</div>
          <div className="grid grid-cols-4 gap-1 mb-2">
            {colors.slice(0, 8).map((color) => (
              <button
                key={`stroke-${color}`}
                onClick={() => onStrokeColorChange(color)}
                className={`w-5 h-5 rounded border ${
                  strokeColor === color ? 'border-blue-500 border-2' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={`Color de trazo: ${color}`}
              />
            ))}
          </div>

          <div className="text-xs text-gray-500 mb-1 px-1">Relleno</div>
          <div className="grid grid-cols-4 gap-1 mb-2">
            <button
              onClick={() => onFillColorChange('transparent')}
              className={`w-5 h-5 rounded border bg-white relative ${
                fillColor === 'transparent' ? 'border-blue-500 border-2' : 'border-gray-300'
              }`}
              title="Sin relleno"
            >
              <div className="absolute inset-0.5 border-r border-red-500 transform rotate-45"></div>
            </button>
            {colors.slice(1, 4).map((color) => (
              <button
                key={`fill-${color}`}
                onClick={() => onFillColorChange(color)}
                className={`w-5 h-5 rounded border ${
                  fillColor === color ? 'border-blue-500 border-2' : 'border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                title={`Color de relleno: ${color}`}
              />
            ))}
          </div>

          {/* Stroke Width - Horizontal */}
          <div className="text-xs text-gray-500 mb-1 px-1">Grosor</div>
          <div className="flex space-x-1">
            {strokeWidths.slice(0, 3).map((width) => (
              <button
                key={width}
                onClick={() => onStrokeWidthChange(width)}
                className={`w-6 h-5 flex items-center justify-center rounded border ${
                  strokeWidth === width ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                }`}
                title={`Grosor: ${width}px`}
              >
                <div 
                  className="bg-gray-800 rounded-full"
                  style={{ width: `${Math.min(width * 3, 12)}px`, height: `${width}px` }}
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};