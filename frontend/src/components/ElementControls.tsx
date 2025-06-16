import React from 'react';
import { RotateCw, Copy, Trash2, Settings, Crop } from 'lucide-react';

interface ElementControlsProps {
  elementId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  elementType?: string;
  onResize: (elementId: string, handle: string, e: React.MouseEvent) => void;
  onRotate: (elementId: string, e: React.MouseEvent) => void;
  onDelete?: (elementId: string) => void;
  onDuplicate?: (elementId: string) => void;
  onEdit?: (elementId: string) => void;
  onCrop?: (elementId: string) => void;
}

export const ElementControls: React.FC<ElementControlsProps> = ({
  elementId,
  x,
  y,
  width,
  height,
  rotation = 0,
  elementType,
  onResize,
  onRotate,
  onDelete,
  onDuplicate,
  onEdit,
  onCrop
}) => {
  const controlSize = 8;
  const buttonSize = 24;

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: x - controlSize / 2,
        top: y - controlSize / 2,
        width: width + controlSize,
        height: height + controlSize,
        transform: `rotate(${rotation}deg)`,
        transformOrigin: `${width / 2 + controlSize / 2}px ${height / 2 + controlSize / 2}px`
      }}
    >
      {/* Selection border */}
      <div className="absolute inset-0 border-2 border-blue-500 border-dashed pointer-events-none" />

      {/* Resize handles */}
      <div
        className="absolute bg-blue-500 border-2 border-white rounded-sm cursor-nw-resize pointer-events-auto hover:bg-blue-600"
        style={{
          width: controlSize,
          height: controlSize,
          left: -controlSize / 2,
          top: -controlSize / 2
        }}
        onMouseDown={(e) => onResize(elementId, 'nw', e)}
      />
      
      <div
        className="absolute bg-blue-500 border-2 border-white rounded-sm cursor-ne-resize pointer-events-auto hover:bg-blue-600"
        style={{
          width: controlSize,
          height: controlSize,
          right: -controlSize / 2,
          top: -controlSize / 2
        }}
        onMouseDown={(e) => onResize(elementId, 'ne', e)}
      />
      
      <div
        className="absolute bg-blue-500 border-2 border-white rounded-sm cursor-sw-resize pointer-events-auto hover:bg-blue-600"
        style={{
          width: controlSize,
          height: controlSize,
          left: -controlSize / 2,
          bottom: -controlSize / 2
        }}
        onMouseDown={(e) => onResize(elementId, 'sw', e)}
      />
      
      <div
        className="absolute bg-blue-500 border-2 border-white rounded-sm cursor-se-resize pointer-events-auto hover:bg-blue-600"
        style={{
          width: controlSize,
          height: controlSize,
          right: -controlSize / 2,
          bottom: -controlSize / 2
        }}
        onMouseDown={(e) => onResize(elementId, 'se', e)}
      />

      {/* Rotation handle */}
      <div
        className="absolute bg-green-500 border-2 border-white rounded-full cursor-pointer pointer-events-auto hover:bg-green-600 flex items-center justify-center"
        style={{
          width: controlSize + 4,
          height: controlSize + 4,
          left: width / 2 - (controlSize + 4) / 2,
          top: -controlSize - 20
        }}
        onMouseDown={(e) => onRotate(elementId, e)}
        title="Rotar"
      >
        <RotateCw className="w-3 h-3 text-white" />
      </div>

      {/* Action buttons */}
      <div
        className="absolute flex space-x-1 pointer-events-auto"
        style={{
          right: -10,
          top: -buttonSize - 10
        }}
      >
        {onCrop && elementType === 'image' && (
          <button
            className="bg-green-500 text-white p-1 rounded hover:bg-green-600 transition-colors"
            style={{ width: buttonSize, height: buttonSize }}
            onClick={() => onCrop(elementId)}
            title="Recortar imagen"
          >
            <Crop className="w-3 h-3" />
          </button>
        )}

        {onEdit && elementType === 'image' && (
          <button
            className="bg-blue-500 text-white p-1 rounded hover:bg-blue-600 transition-colors"
            style={{ width: buttonSize, height: buttonSize }}
            onClick={() => onEdit(elementId)}
            title="Editar imagen"
          >
            <Settings className="w-3 h-3" />
          </button>
        )}

        {onDuplicate && (
          <button
            className="bg-gray-700 text-white p-1 rounded hover:bg-gray-800 transition-colors"
            style={{ width: buttonSize, height: buttonSize }}
            onClick={() => onDuplicate(elementId)}
            title="Duplicar"
          >
            <Copy className="w-3 h-3" />
          </button>
        )}
        
        {onDelete && (
          <button
            className="bg-red-500 text-white p-1 rounded hover:bg-red-600 transition-colors"
            style={{ width: buttonSize, height: buttonSize }}
            onClick={() => onDelete(elementId)}
            title="Eliminar"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
};