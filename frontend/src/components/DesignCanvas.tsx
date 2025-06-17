import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import type { Database } from '../types/supabase';
import { ElementControls } from './ElementControls';
import { ImageEditor } from './ImageEditor';
import { ImageCropModal } from './ImageCropModal';
import { ExcalidrawToolbar, type ToolType } from './ExcalidrawToolbar';
import { useDesignStore } from '../store/designStore';
import { uploadService } from '../services/upload.service';

type Design = Database['public']['Tables']['designs']['Row'];

interface DesignCanvasProps {
  design: Design;
}

interface CanvasElement {
  id: string;
  type: 'text' | 'rectangle' | 'circle' | 'diamond' | 'arrow' | 'line' | 'freedraw' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  content?: string;
  color?: string;
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  fontSize?: number;
  fontFamily?: string;
  src?: string;
  rotation?: number;
  opacity?: number;
  roughness?: number;
  strokeStyle?: 'solid' | 'dashed' | 'dotted';
  points?: { x: number; y: number }[];
  endX?: number;
  endY?: number;
  filters?: {
    brightness?: number;
    contrast?: number;
    saturate?: number;
    blur?: number;
  };
}

export const DesignCanvas: React.FC<DesignCanvasProps> = ({ design }) => {
  const { updateDesignLocally } = useDesignStore();
  const [windowSize, setWindowSize] = useState({ width: 1200, height: 800 });
  
  // Sync elements with design.canvas_data.elements
  const [elements, setElements] = useState<CanvasElement[]>(() => {
    if (!design || !design.canvas_data) {
      return []; // Return empty array if design not ready
    }
    const canvasData = design.canvas_data as any;
    const canvasElements = canvasData?.elements;
    if (Array.isArray(canvasElements) && canvasElements.length > 0) {
      return canvasElements;
    }
    return [
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
  ];
  });

  // Update elements when design changes
  useEffect(() => {
    const canvasData = design.canvas_data as any;
    const canvasElements = canvasData?.elements;
    if (Array.isArray(canvasElements) && canvasElements.length > 0) {
      setElements(canvasElements);
    }
  }, [design.canvas_data]);

  // Helper function to update canvas data in the store - moved before usage
  const updateCanvasData = useCallback((newElements: CanvasElement[]) => {
    if (!design) return; // Don't update if design not ready
    
    updateDesignLocally({
      canvas_data: {
        ...(design.canvas_data as any),
        elements: newElements
      }
    });
  }, [updateDesignLocally, design]);

  // Auto-sync elements to store when they change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateCanvasData(elements);
    }, 100); // Debounce to avoid excessive updates

    return () => clearTimeout(timeoutId);
  }, [elements, updateCanvasData]);

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizing, setResizing] = useState<{ elementId: string; handle: string } | null>(null);
  const [rotating, setRotating] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [croppingImage, setCroppingImage] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState<string[]>([]); // IDs de imágenes siendo subidas
  
  // Excalidraw-style states
  const [activeTool, setActiveTool] = useState<ToolType>('select');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState<{ x: number; y: number }[]>([]);
  const [strokeColor, setStrokeColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);


  useEffect(() => {
    const updateWindowSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    
    updateWindowSize();
    window.addEventListener('resize', updateWindowSize);
    return () => window.removeEventListener('resize', updateWindowSize);
  }, []);

  const handleElementClick = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(elementId);
  };

  const handleMouseDown = (elementId: string, e: React.MouseEvent) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
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
    } else if (resizing) {
      handleResizeMove(e);
    } else if (rotating) {
      handleRotateMove(e);
    }
  };

  const handleMouseUp = () => {
    setDraggedElement(null);
    setDragOffset({ x: 0, y: 0 });
    setResizing(null);
    setRotating(null);
  };

  const handleResize = (elementId: string, handle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setResizing({ elementId, handle });
  };

  const handleRotate = (elementId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRotating(elementId);
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (resizing) {
      const element = elements.find(el => el.id === resizing.elementId);
      if (!element) return;

      const canvasRect = e.currentTarget.getBoundingClientRect();
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      let newWidth = element.width;
      let newHeight = element.height;
      let newX = element.x;
      let newY = element.y;

      switch (resizing.handle) {
        case 'se': // southeast
          newWidth = Math.max(20, mouseX - element.x);
          newHeight = Math.max(20, mouseY - element.y);
          break;
        case 'sw': // southwest
          newWidth = Math.max(20, element.x + element.width - mouseX);
          newHeight = Math.max(20, mouseY - element.y);
          newX = Math.min(mouseX, element.x + element.width - 20);
          break;
        case 'ne': // northeast
          newWidth = Math.max(20, mouseX - element.x);
          newHeight = Math.max(20, element.y + element.height - mouseY);
          newY = Math.min(mouseY, element.y + element.height - 20);
          break;
        case 'nw': // northwest
          newWidth = Math.max(20, element.x + element.width - mouseX);
          newHeight = Math.max(20, element.y + element.height - mouseY);
          newX = Math.min(mouseX, element.x + element.width - 20);
          newY = Math.min(mouseY, element.y + element.height - 20);
          break;
      }

      setElements(prev => prev.map(el => 
        el.id === resizing.elementId 
          ? { ...el, width: newWidth, height: newHeight, x: newX, y: newY }
          : el
      ));
    }
  };

  const handleRotateMove = (e: React.MouseEvent) => {
    if (rotating) {
      const element = elements.find(el => el.id === rotating);
      if (!element) return;

      const canvasRect = e.currentTarget.getBoundingClientRect();
      const centerX = element.x + element.width / 2;
      const centerY = element.y + element.height / 2;
      const mouseX = e.clientX - canvasRect.left;
      const mouseY = e.clientY - canvasRect.top;

      const angle = Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI);
      
      setElements(prev => prev.map(el => 
        el.id === rotating 
          ? { ...el, rotation: angle }
          : el
      ));
    }
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

  const handleDeleteElement = (elementId: string) => {
    setElements(prev => prev.filter(el => el.id !== elementId));
    setSelectedElement(null);
  };

  const handleDuplicateElement = (elementId: string) => {
    const element = elements.find(el => el.id === elementId);
    if (element) {
      const newElement = {
        ...element,
        id: `${element.type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        x: element.x + 20,
        y: element.y + 20
      };
      setElements(prev => [...prev, newElement]);
    }
  };

  const handleEditElement = (elementId: string) => {
    setEditingImage(elementId);
  };

  const handleCropElement = (elementId: string) => {
    setCroppingImage(elementId);
  };

  const handleCropComplete = (elementId: string, croppedImageUrl: string) => {
    const newElements = elements.map(el => 
      el.id === elementId 
        ? { ...el, content: croppedImageUrl }
        : el
    );
    setElements(newElements);
    updateCanvasData(newElements);
    setCroppingImage(null);
  };

  const handleUpdateElement = (elementId: string, updates: any) => {
    const newElements = elements.map(el => 
      el.id === elementId 
        ? { ...el, ...updates }
        : el
    );
    setElements(newElements);
    // Update the design in the store
    updateCanvasData(newElements);
  };

  const createNewElement = (type: CanvasElement['type'], x: number, y: number, width = 100, height = 100): CanvasElement => {
    return {
      id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      x,
      y,
      width,
      height,
      strokeColor,
      fillColor: fillColor === 'transparent' ? undefined : fillColor,
      strokeWidth,
      opacity: 1,
      rotation: 0
    };
  };

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'select') return;

    const canvasRect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - canvasRect.left;
    const y = e.clientY - canvasRect.top;

    setIsDrawing(true);
    setStartPoint({ x, y });

    if (activeTool === 'freedraw') {
      setCurrentPath([{ x, y }]);
    } else if (activeTool === 'text') {
      const newElement = createNewElement('text', x, y, 200, 50);
      newElement.content = 'Doble clic para editar';
      newElement.fontSize = 16;
      newElement.fontFamily = 'Arial';
      const newElements = [...elements, newElement];
      setElements(newElements);
      updateCanvasData(newElements);
      // Don't automatically switch back to select for text
      // User can manually switch tools
    }
  };

  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - canvasRect.left;
    const currentY = e.clientY - canvasRect.top;

    if (activeTool === 'freedraw') {
      setCurrentPath(prev => [...prev, { x: currentX, y: currentY }]);
    }
  };

  const handleCanvasMouseUp = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint) return;

    const canvasRect = e.currentTarget.getBoundingClientRect();
    const endX = e.clientX - canvasRect.left;
    const endY = e.clientY - canvasRect.top;

    const width = Math.abs(endX - startPoint.x);
    const height = Math.abs(endY - startPoint.y);
    const x = Math.min(startPoint.x, endX);
    const y = Math.min(startPoint.y, endY);

    let newElement: CanvasElement | null = null;

    switch (activeTool) {
      case 'rectangle':
        newElement = createNewElement('rectangle', x, y, width, height);
        break;
      case 'circle':
        newElement = createNewElement('circle', x, y, width, height);
        break;
      case 'diamond':
        newElement = createNewElement('diamond', x, y, width, height);
        break;
      case 'line':
        newElement = createNewElement('line', startPoint.x, startPoint.y, width, height);
        newElement.endX = endX;
        newElement.endY = endY;
        break;
      case 'arrow':
        newElement = createNewElement('arrow', startPoint.x, startPoint.y, width, height);
        newElement.endX = endX;
        newElement.endY = endY;
        break;
      case 'freedraw':
        if (currentPath.length > 1) {
          newElement = createNewElement('freedraw', startPoint.x, startPoint.y, width, height);
          newElement.points = currentPath;
        }
        break;
    }

    if (newElement && (width > 5 || height > 5 || activeTool === 'freedraw')) {
      const newElements = [...elements, newElement];
      setElements(newElements);
      updateCanvasData(newElements);
    }

    setIsDrawing(false);
    setStartPoint(null);
    setCurrentPath([]);
    // Don't automatically switch back to select for freedraw
    if (activeTool !== 'freedraw') {
      setActiveTool('select');
    }
  };

  const handleCanvasDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.type.startsWith('image/')) {
        const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        try {
          console.log('Uploading image:', file.name);
          
          // Agregar imagen temporal con loading
          const tempElement: CanvasElement = {
            id: tempId,
            type: 'image' as const,
            content: URL.createObjectURL(file), // URL temporal para preview
            x: 150 + Math.random() * 200,
            y: 150 + Math.random() * 200,
            width: 200,
            height: 150,
            rotation: 0,
            opacity: 0.5 // Opacidad reducida mientras sube
          };

          // Agregar al estado de subida
          setUploadingImages(prev => [...prev, tempId]);
          setElements(prev => [...prev, tempElement]);
          
          // Optimizar imagen antes de subir
          const optimizedFile = await uploadService.optimizeImage(file, 1920, 1080, 0.8);
          console.log('Image optimized, original size:', file.size, 'optimized size:', optimizedFile.size);
          
          // Subir a Supabase Storage
          const fileUrl = await uploadService.uploadImage(optimizedFile, 'designs');
          console.log('Image uploaded successfully:', fileUrl);
          
          // Actualizar elemento con URL real y opacidad completa
          setElements(prev => prev.map(el => 
            el.id === tempId 
              ? { ...el, content: fileUrl, opacity: 1 }
              : el
          ));
          
          // Remover de estado de subida
          setUploadingImages(prev => prev.filter(id => id !== tempId));
          
          // Actualizar canvas data
          const updatedElements = elements.map(el => 
            el.id === tempId 
              ? { ...el, content: fileUrl, opacity: 1 }
              : el
          );
          updateCanvasData([...updatedElements, { ...tempElement, content: fileUrl, opacity: 1 }]);
          
        } catch (error) {
          console.error('Error uploading file:', error);
          
          // Remover elemento temporal en caso de error
          setElements(prev => prev.filter(el => el.id !== tempId));
          setUploadingImages(prev => prev.filter(id => id !== tempId));
          
          // TODO: Mostrar notificación de error al usuario
          alert(`Error subiendo imagen: ${(error as any)?.message || 'Error desconocido'}`);
        }
      }
    }
  }, [elements, updateCanvasData]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleCanvasDrop,
    accept: {
      'image/*': []
    },
    multiple: true,
    noClick: true // Disable click to open file dialog
  });

  const renderElement = (element: CanvasElement) => {
    // Determinar si deshabilitar pointer events para este elemento
    const shouldDisablePointerEvents = 
      activeTool !== 'select' || 
      (draggedElement && draggedElement !== element.id) ||
      isDrawing;

    const commonStyle = {
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation || 0}deg)`,
      opacity: element.opacity ?? 1,
      cursor: shouldDisablePointerEvents 
        ? 'default' 
        : (draggedElement === element.id ? 'grabbing' : 'grab'),
      pointerEvents: shouldDisablePointerEvents ? 'none' as const : 'auto' as const,
      zIndex: selectedElement === element.id ? 1000 : 1,
      userSelect: 'none' as const
    };

    // Props comunes para eventos
    const eventProps = shouldDisablePointerEvents ? {} : {
      onClick: (e: React.MouseEvent) => handleElementClick(element.id, e),
      onMouseDown: (e: React.MouseEvent) => handleMouseDown(element.id, e)
    };
    
    switch (element.type) {
      case 'text':
        return (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              ...commonStyle,
              color: element.strokeColor || element.color,
              fontSize: element.fontSize,
              fontFamily: element.fontFamily,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent'
            }}
            className="select-none"
            {...eventProps}
            onDoubleClick={shouldDisablePointerEvents ? undefined : () => handleElementDoubleClick(element.id)}
            whileHover={shouldDisablePointerEvents ? {} : { scale: 1.02 }}
          >
            {element.content}
          </motion.div>
        );

      case 'rectangle':
        return (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              ...commonStyle,
              border: `${element.strokeWidth || 2}px solid ${element.strokeColor || '#000'}`,
              backgroundColor: element.fillColor || 'transparent'
            }}
            className="rounded-lg"
            {...eventProps}
            whileHover={shouldDisablePointerEvents ? {} : { scale: 1.02 }}
          />
        );

      case 'circle':
        return (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              ...commonStyle,
              border: `${element.strokeWidth || 2}px solid ${element.strokeColor || '#000'}`,
              backgroundColor: element.fillColor || 'transparent',
              borderRadius: '50%'
            }}
            {...eventProps}
            whileHover={shouldDisablePointerEvents ? {} : { scale: 1.02 }}
          />
        );

      case 'diamond':
        return (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{
              ...commonStyle,
              border: `${element.strokeWidth || 2}px solid ${element.strokeColor || '#000'}`,
              backgroundColor: element.fillColor || 'transparent',
              transform: `${commonStyle.transform} rotate(45deg)`
            }}
            {...eventProps}
            whileHover={shouldDisablePointerEvents ? {} : { scale: 1.02 }}
          />
        );

      case 'image':
        const imageFilters = element.filters ? 
          `brightness(${element.filters.brightness || 100}%) contrast(${element.filters.contrast || 100}%) saturate(${element.filters.saturate || 100}%) blur(${element.filters.blur || 0}px)` 
          : 'none';

        const isUploading = uploadingImages.includes(element.id);

        return (
          <div key={element.id} style={commonStyle} className="relative">
            <motion.img
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              src={element.content || element.src}
              alt="Design element"
              style={{
                width: '100%',
                height: '100%',
                filter: imageFilters,
                opacity: isUploading ? 0.6 : 1
              }}
              className="object-cover rounded"
              {...eventProps}
              whileHover={shouldDisablePointerEvents ? {} : { scale: 1.02 }}
              onError={(e) => {
                console.error('Error loading image:', element.content || element.src);
                e.currentTarget.style.background = '#f3f4f6';
              }}
              draggable={false}
            />
            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded">
                <div className="flex flex-col items-center text-white">
                  <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
                  <span className="text-xs">Subiendo...</span>
                </div>
              </div>
            )}
          </div>
        );

      case 'line':
        return (
          <svg
            key={element.id}
            style={{
              position: 'absolute',
              left: Math.min(element.x, element.endX || element.x),
              top: Math.min(element.y, element.endY || element.y),
              width: Math.abs((element.endX || element.x) - element.x) + (element.strokeWidth || 2) * 2,
              height: Math.abs((element.endY || element.y) - element.y) + (element.strokeWidth || 2) * 2,
              pointerEvents: 'auto',
              cursor: activeTool === 'select' ? 'grab' : 'default'
            }}
            onClick={(e) => handleElementClick(element.id, e)}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
          >
            <line
              x1={element.x - Math.min(element.x, element.endX || element.x) + (element.strokeWidth || 2)}
              y1={element.y - Math.min(element.y, element.endY || element.y) + (element.strokeWidth || 2)}
              x2={(element.endX || element.x) - Math.min(element.x, element.endX || element.x) + (element.strokeWidth || 2)}
              y2={(element.endY || element.y) - Math.min(element.y, element.endY || element.y) + (element.strokeWidth || 2)}
              stroke={element.strokeColor || '#000'}
              strokeWidth={element.strokeWidth || 2}
              opacity={element.opacity ?? 1}
            />
          </svg>
        );

      case 'arrow':
        const arrowX1 = element.x - Math.min(element.x, element.endX || element.x) + (element.strokeWidth || 2);
        const arrowY1 = element.y - Math.min(element.y, element.endY || element.y) + (element.strokeWidth || 2);
        const arrowX2 = (element.endX || element.x) - Math.min(element.x, element.endX || element.x) + (element.strokeWidth || 2);
        const arrowY2 = (element.endY || element.y) - Math.min(element.y, element.endY || element.y) + (element.strokeWidth || 2);
        
        const angle = Math.atan2(arrowY2 - arrowY1, arrowX2 - arrowX1);
        const arrowLength = 15;
        const arrowAngle = Math.PI / 6;
        
        return (
          <svg
            key={element.id}
            style={{
              position: 'absolute',
              left: Math.min(element.x, element.endX || element.x),
              top: Math.min(element.y, element.endY || element.y),
              width: Math.abs((element.endX || element.x) - element.x) + (element.strokeWidth || 2) * 2,
              height: Math.abs((element.endY || element.y) - element.y) + (element.strokeWidth || 2) * 2,
              pointerEvents: 'auto',
              cursor: activeTool === 'select' ? 'grab' : 'default'
            }}
            onClick={(e) => handleElementClick(element.id, e)}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
          >
            <line
              x1={arrowX1}
              y1={arrowY1}
              x2={arrowX2}
              y2={arrowY2}
              stroke={element.strokeColor || '#000'}
              strokeWidth={element.strokeWidth || 2}
              opacity={element.opacity ?? 1}
            />
            <line
              x1={arrowX2}
              y1={arrowY2}
              x2={arrowX2 - arrowLength * Math.cos(angle - arrowAngle)}
              y2={arrowY2 - arrowLength * Math.sin(angle - arrowAngle)}
              stroke={element.strokeColor || '#000'}
              strokeWidth={element.strokeWidth || 2}
              opacity={element.opacity ?? 1}
            />
            <line
              x1={arrowX2}
              y1={arrowY2}
              x2={arrowX2 - arrowLength * Math.cos(angle + arrowAngle)}
              y2={arrowY2 - arrowLength * Math.sin(angle + arrowAngle)}
              stroke={element.strokeColor || '#000'}
              strokeWidth={element.strokeWidth || 2}
              opacity={element.opacity ?? 1}
            />
          </svg>
        );

      case 'freedraw':
        if (!element.points || element.points.length < 2) return null;
        
        const minX = Math.min(...element.points.map(p => p.x));
        const minY = Math.min(...element.points.map(p => p.y));
        const maxX = Math.max(...element.points.map(p => p.x));
        const maxY = Math.max(...element.points.map(p => p.y));
        
        const pathData = element.points.reduce((path, point, index) => {
          if (index === 0) {
            return `M ${point.x - minX} ${point.y - minY}`;
          }
          return `${path} L ${point.x - minX} ${point.y - minY}`;
        }, '');

        return (
          <svg
            key={element.id}
            style={{
              position: 'absolute',
              left: minX,
              top: minY,
              width: maxX - minX + (element.strokeWidth || 2),
              height: maxY - minY + (element.strokeWidth || 2),
              pointerEvents: 'auto',
              cursor: activeTool === 'select' ? 'grab' : 'default'
            }}
            onClick={(e) => handleElementClick(element.id, e)}
            onMouseDown={(e) => handleMouseDown(element.id, e)}
          >
            <path
              d={pathData}
              stroke={element.strokeColor || '#000'}
              strokeWidth={element.strokeWidth || 2}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={element.opacity ?? 1}
            />
          </svg>
        );

      default:
        return null;
    }
  };

  // Show loading if design is not ready
  if (!design) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Preparando canvas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full w-full flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden max-w-full max-h-full">
        <div
          {...getRootProps()}
          className={`relative bg-white transition-colors duration-200 ${
            isDragActive ? 'bg-blue-50 border-2 border-dashed border-blue-400' : ''
          } ${activeTool !== 'select' ? 'cursor-crosshair bg-blue-50/20' : ''}`}
          style={{ 
            width: Math.min(1000, windowSize.width - 400), 
            height: Math.min(700, windowSize.height - 200),
            minWidth: 600,
            minHeight: 400
          }}
          onMouseMove={activeTool === 'select' ? handleMouseMove : handleCanvasMouseMove}
          onMouseUp={activeTool === 'select' ? handleMouseUp : handleCanvasMouseUp}
          onMouseLeave={activeTool === 'select' ? handleMouseUp : handleCanvasMouseUp}
          onMouseDown={activeTool !== 'select' ? handleCanvasMouseDown : undefined}
          onClick={activeTool === 'select' ? () => setSelectedElement(null) : undefined}
        >
          <input {...getInputProps()} />
          {/* Grid background */}
          <div 
            className="absolute inset-0 opacity-5 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, #000 1px, transparent 1px),
                linear-gradient(to bottom, #000 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}
          />

          {/* Drop zone indicator */}
          {isDragActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-50/80 pointer-events-none">
              <div className="text-center">
                <div className="text-2xl text-blue-500 mb-2">📸</div>
                <p className="text-lg font-medium text-blue-600">Suelta las imágenes aquí</p>
                <p className="text-sm text-blue-500">Se agregarán al canvas automáticamente</p>
              </div>
            </div>
          )}

          {/* Render elements */}
          {elements.map(renderElement)}

          {/* Preview while drawing */}
          {isDrawing && startPoint && activeTool === 'freedraw' && currentPath.length > 1 && (
            <svg
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none'
              }}
            >
              <path
                d={currentPath.reduce((path, point, index) => {
                  if (index === 0) {
                    return `M ${point.x} ${point.y}`;
                  }
                  return `${path} L ${point.x} ${point.y}`;
                }, '')}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={0.7}
              />
            </svg>
          )}

          {/* Render controls for selected element */}
          {selectedElement && (
            (() => {
              const element = elements.find(el => el.id === selectedElement);
              return element ? (
                <ElementControls
                  elementId={element.id}
                  x={element.x}
                  y={element.y}
                  width={element.width}
                  height={element.height}
                  rotation={element.rotation}
                  elementType={element.type}
                  onResize={handleResize}
                  onRotate={handleRotate}
                  onDelete={handleDeleteElement}
                  onDuplicate={handleDuplicateElement}
                  onEdit={handleEditElement}
                  onCrop={handleCropElement}
                />
              ) : null;
            })()
          )}

          {/* Tool indicator */}
          {activeTool !== 'select' && (
            <div className="absolute top-4 left-4 bg-blue-500 text-white rounded-lg px-3 py-2 text-sm font-medium shadow-lg z-10">
              {activeTool === 'freedraw' ? '🖊️ Dibujo libre - Mantén presionado para dibujar' :
               activeTool === 'text' ? '📝 Texto - Haz clic para agregar texto' :
               activeTool === 'rectangle' ? '⬜ Rectángulo - Arrastra para dibujar' :
               activeTool === 'circle' ? '⭕ Círculo - Arrastra para dibujar' :
               activeTool === 'diamond' ? '🔹 Diamante - Arrastra para dibujar' :
               activeTool === 'line' ? '📏 Línea - Arrastra para dibujar' :
               activeTool === 'arrow' ? '➡️ Flecha - Arrastra para dibujar' :
               `Herramienta: ${activeTool}`}
            </div>
          )}

          {/* Selection info */}
          {selectedElement && activeTool === 'select' && (
            <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-700 shadow-lg z-10">
              Elemento seleccionado: {elements.find(el => el.id === selectedElement)?.type}
            </div>
          )}

          {/* Design info */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-sm text-gray-600 shadow-lg z-10">
            {design.title}
          </div>
        </div>
      </div>

      {/* Image Editor Modal */}
      {editingImage && (
        (() => {
          const element = elements.find(el => el.id === editingImage);
          return element ? (
            <ImageEditor
              elementId={element.id}
              opacity={element.opacity}
              filters={element.filters}
              onUpdateElement={handleUpdateElement}
              onClose={() => setEditingImage(null)}
            />
          ) : null;
        })()
      )}

      {/* Image Crop Modal */}
      {croppingImage && (
        (() => {
          const element = elements.find(el => el.id === croppingImage);
          return element ? (
            <ImageCropModal
              imageUrl={element.content || element.src || ''}
              onCropComplete={(croppedUrl) => handleCropComplete(element.id, croppedUrl)}
              onClose={() => setCroppingImage(null)}
            />
          ) : null;
        })()
      )}

      {/* Excalidraw Toolbar */}
      <ExcalidrawToolbar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onImageUpload={() => {/* implement image upload */}}
        strokeColor={strokeColor}
        fillColor={fillColor}
        strokeWidth={strokeWidth}
        onStrokeColorChange={setStrokeColor}
        onFillColorChange={setFillColor}
        onStrokeWidthChange={setStrokeWidth}
      />
    </div>
  );
};