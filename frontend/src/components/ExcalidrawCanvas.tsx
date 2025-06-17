import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useDesignStore } from '../store/designStore';
import { CanvasToolsService } from '../services/canvas-tools.service';

interface Point {
  x: number;
  y: number;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'arrow' | 'line' | 'freedraw';
  x: number;
  y: number;
  width?: number;
  height?: number;
  points?: Point[];
  text?: string;
  fontSize?: number;
  color?: string;
  strokeWidth?: number;
  roughness?: number;
  isSelected?: boolean;
}

interface ExcalidrawCanvasProps {
  design: any;
}

export const ExcalidrawCanvas: React.FC<ExcalidrawCanvasProps> = ({ design }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTool, setSelectedTool] = useState<'select' | 'text' | 'rectangle' | 'circle' | 'arrow' | 'freedraw'>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [editingText, setEditingText] = useState<string | null>(null);
  const [textInput, setTextInput] = useState('');
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const { updateDesignLocally } = useDesignStore();
  
  // Canvas Tools Service for AI
  const canvasToolsRef = useRef<CanvasToolsService | null>(null);

  // Load elements from design
  useEffect(() => {
    if (design?.canvas_data?.elements) {
      setElements(design.canvas_data.elements);
    }
  }, [design]);

  // Save elements to design store
  const saveElements = useCallback((newElements: CanvasElement[]) => {
    setElements(newElements);
    updateDesignLocally({
      canvas_data: {
        ...design.canvas_data,
        elements: newElements
      }
    });
  }, [design, updateDesignLocally]);

  // Initialize Canvas Tools Service
  useEffect(() => {
    if (!canvasToolsRef.current) {
      canvasToolsRef.current = new CanvasToolsService(saveElements);
    }
    canvasToolsRef.current.setElements(elements);
  }, [elements, saveElements]);

  // Expose canvas tools to window for AI access
  useEffect(() => {
    if (canvasToolsRef.current) {
      (window as any).canvasTools = canvasToolsRef.current;
    }
    return () => {
      delete (window as any).canvasTools;
    };
  }, []);

  // Drawing functions
  const drawElement = (ctx: CanvasRenderingContext2D, element: CanvasElement) => {
    ctx.save();
    ctx.strokeStyle = element.color || '#000';
    ctx.fillStyle = element.color || '#000';
    ctx.lineWidth = element.strokeWidth || 2;

    switch (element.type) {
      case 'rectangle':
        if (element.width && element.height) {
          ctx.strokeRect(element.x, element.y, element.width, element.height);
          if (element.isSelected) {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = '#3B82F6';
            ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
          }
        }
        break;

      case 'circle':
        if (element.width && element.height) {
          const centerX = element.x + element.width / 2;
          const centerY = element.y + element.height / 2;
          const radius = Math.min(element.width, element.height) / 2;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          ctx.stroke();
          if (element.isSelected) {
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = '#3B82F6';
            ctx.strokeRect(element.x - 2, element.y - 2, element.width + 4, element.height + 4);
          }
        }
        break;

      case 'line':
        if (element.points && element.points.length >= 2) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          ctx.lineTo(element.points[1].x, element.points[1].y);
          ctx.stroke();
        }
        break;

      case 'freedraw':
        if (element.points && element.points.length > 1) {
          ctx.beginPath();
          ctx.moveTo(element.points[0].x, element.points[0].y);
          for (let i = 1; i < element.points.length; i++) {
            ctx.lineTo(element.points[i].x, element.points[i].y);
          }
          ctx.stroke();
        }
        break;

      case 'text':
        ctx.font = `${element.fontSize || 16}px Arial`;
        ctx.fillText(element.text || '', element.x, element.y);
        if (element.isSelected) {
          const metrics = ctx.measureText(element.text || '');
          ctx.setLineDash([5, 5]);
          ctx.strokeStyle = '#3B82F6';
          ctx.strokeRect(element.x - 2, element.y - element.fontSize! - 2, metrics.width + 4, element.fontSize! + 4);
        }
        break;
    }
    ctx.restore();
  };

  // Render canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw all elements
    elements.forEach(element => drawElement(ctx, element));
  }, [elements]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (selectedTool === 'select') {
      // Check if clicking on an element
      const clickedElement = elements.find(el => {
        if (el.type === 'text') {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d')!;
          ctx.font = `${el.fontSize || 16}px Arial`;
          const metrics = ctx.measureText(el.text || '');
          return x >= el.x && x <= el.x + metrics.width && 
                 y >= el.y - (el.fontSize || 16) && y <= el.y;
        } else if (el.width && el.height) {
          return x >= el.x && x <= el.x + el.width && 
                 y >= el.y && y <= el.y + el.height;
        }
        return false;
      });

      if (clickedElement) {
        // Select element
        const newElements = elements.map(el => ({
          ...el,
          isSelected: el.id === clickedElement.id
        }));
        setElements(newElements);
        setSelectedElement(clickedElement.id);
        setDragStart({ x, y });
      } else {
        // Deselect all
        const newElements = elements.map(el => ({ ...el, isSelected: false }));
        setElements(newElements);
        setSelectedElement(null);
      }
    } else {
      setIsDrawing(true);
      const newElement: CanvasElement = {
        id: `element-${Date.now()}`,
        type: selectedTool,
        x,
        y,
        color: '#000',
        strokeWidth: 2
      };

      if (selectedTool === 'text') {
        newElement.text = 'Texto';
        newElement.fontSize = 16;
        setEditingText(newElement.id);
        setTextInput('Texto');
      } else if (selectedTool === 'freedraw') {
        newElement.points = [{ x, y }];
      } else {
        newElement.width = 0;
        newElement.height = 0;
      }

      setElements([...elements, newElement]);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing && elements.length > 0) {
      const currentElement = elements[elements.length - 1];
      const newElements = [...elements];

      if (currentElement.type === 'freedraw') {
        newElements[newElements.length - 1] = {
          ...currentElement,
          points: [...(currentElement.points || []), { x, y }]
        };
      } else if (currentElement.type !== 'text') {
        newElements[newElements.length - 1] = {
          ...currentElement,
          width: x - currentElement.x,
          height: y - currentElement.y
        };
      }

      setElements(newElements);
    } else if (selectedElement && dragStart) {
      // Drag selected element
      const dx = x - dragStart.x;
      const dy = y - dragStart.y;
      
      const newElements = elements.map(el => 
        el.id === selectedElement 
          ? { ...el, x: el.x + dx, y: el.y + dy }
          : el
      );
      
      setElements(newElements);
      setDragStart({ x, y });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      setIsDrawing(false);
      saveElements(elements);
    }
    setDragStart(null);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if double-clicking on text
    const textElement = elements.find(el => {
      if (el.type === 'text') {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        ctx.font = `${el.fontSize || 16}px Arial`;
        const metrics = ctx.measureText(el.text || '');
        return x >= el.x && x <= el.x + metrics.width && 
               y >= el.y - (el.fontSize || 16) && y <= el.y;
      }
      return false;
    });

    if (textElement) {
      setEditingText(textElement.id);
      setTextInput(textElement.text || '');
    }
  };

  const handleTextSubmit = () => {
    if (editingText) {
      const newElements = elements.map(el => 
        el.id === editingText 
          ? { ...el, text: textInput }
          : el
      );
      saveElements(newElements);
      setEditingText(null);
      setTextInput('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTextSubmit();
    } else if (e.key === 'Escape') {
      setEditingText(null);
      setTextInput('');
    }
  };

  return (
    <div className="relative w-full h-full bg-white">
      {/* Toolbar */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2 z-10">
        {[
          { tool: 'select', icon: '↖️', label: 'Seleccionar' },
          { tool: 'text', icon: 'T', label: 'Texto' },
          { tool: 'rectangle', icon: '▢', label: 'Rectángulo' },
          { tool: 'circle', icon: '○', label: 'Círculo' },
          { tool: 'freedraw', icon: '✏️', label: 'Dibujo libre' }
        ].map(({ tool, icon, label }) => (
          <button
            key={tool}
            onClick={() => setSelectedTool(tool as any)}
            className={`p-2 rounded-md transition-all ${
              selectedTool === tool 
                ? 'bg-blue-500 text-white' 
                : 'hover:bg-gray-100'
            }`}
            title={label}
          >
            {icon}
          </button>
        ))}
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={1200}
        height={800}
        className="border border-gray-200 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDoubleClick={handleDoubleClick}
      />

      {/* Text Editor Modal */}
      {editingText && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h3 className="text-lg font-semibold mb-4">Editar Texto</h3>
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              placeholder="Escribe tu texto..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={handleTextSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditingText(null);
                  setTextInput('');
                }}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};