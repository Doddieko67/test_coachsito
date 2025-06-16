import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { Design } from '../data/mockData';

interface DesignCanvasProps {
  design: Design;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'shape' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color?: string;
  fontSize?: number;
  src?: string;
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({ design }) => {
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  const [elements, setElements] = useState<CanvasElement[]>([
    {
      id: '1',
      type: 'text',
      x: 100,
      y: 100,
      width: 200,
      height: 50,
      content: 'Título Principal',
      color: '#333333',
      fontSize: 24
    },
    {
      id: '2',
      type: 'text',
      x: 100,
      y: 200,
      width: 300,
      height: 100,
      content: 'Subtítulo o descripción del diseño. Puedes editar este texto haciendo clic.',
      color: '#666666',
      fontSize: 16
    },
    {
      id: '3',
      type: 'shape',
      x: 400,
      y: 150,
      width: 100,
      height: 100,
      color: '#8B5CF6'
    }
  ]);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  const handleMouseDown = (elementId: string, e: React.MouseEvent) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      setSelectedElement(elementId);
      setDraggedElement(elementId);
      const rect = e.currentTarget.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedElement) {
      const canvasRect = e.currentTarget.getBoundingClientRect();
      const newX = e.clientX - canvasRect.left - dragOffset.x;
      const newY = e.clientY - canvasRect.top - dragOffset.y;

      setElements(prev => prev.map(el => 
        el.id === draggedElement 
          ? { ...el, x: Math.max(0, newX), y: Math.max(0, newY) }
          : el
      ));
    }
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleElementDoubleClick = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element && element.type === 'text') {
      const newContent = prompt('Editar texto:', element.content);
      if (newContent !== null) {
        setElements(prev => prev.map(el => 
          el.id === elementId 
            ? { ...el, content: newContent }
            : el
        ));
      }
    }
  };

  const renderElement = (element: CanvasElement) => {
    const isSelected = selectedElement === element.id;
    
    switch (element.type) {
      case 'text':
        return (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              color: element.color,
              fontSize: element.fontSize,
              cursor: draggedElement === element.id ? 'grabbing' : 'grab'
            }}
            className={`select-none p-2 rounded ${
              isSelected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
            }`}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
            onDoubleClick={() => handleElementDoubleClick(element.id)}
            whileHover={{ scale: 1.02 }}
          >
            {element.content}
          </motion.div>
        );

      case 'shape':
        return (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              backgroundColor: element.color,
              cursor: draggedElement === element.id ? 'grabbing' : 'grab'
            }}
            className={`rounded-lg ${
              isSelected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
            }`}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
            whileHover={{ scale: 1.02 }}
          />
        );

      case 'image':
        return (
          <motion.img
            key={element.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            src={element.src}
            alt="Design element"
            style={{
              position: 'absolute',
              left: element.x,
              top: element.y,
              width: element.width,
              height: element.height,
              cursor: draggedElement === element.id ? 'grabbing' : 'grab'
            }}
            className={`object-cover rounded ${
              isSelected ? 'ring-2 ring-purple-500 ring-opacity-50' : ''
            }`}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
            whileHover={{ scale: 1.02 }}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-full max-h-full">
        <div
          className="relative bg-white"
          style={{ 
            width: Math.min(1000, windowSize.width - 400), 
            height: Math.min(700, windowSize.height - 200),
            minWidth: 600,
            minHeight: 400
          }}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onClick={() => setSelectedElement(null)}
        >
          {/* Grid background */}
          <div 
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Render elements */}
          {elements.map(renderElement)}

          {/* Selection info */}
          {selectedElement && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-700 shadow-lg z-10">
              Elemento seleccionado: {elements.find(el => el.id === selectedElement)?.type}
            </div>
          )}

          {/* Design info */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600 shadow-lg z-10">
            {design.name}
          </div>
        </div>
      </div>
    </div>
  );
};