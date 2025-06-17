// Canvas Tools Service - Functions that AI can call to manipulate the canvas

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
}

export interface CanvasToolsAPI {
  // Text operations
  addText(x: number, y: number, text: string, fontSize?: number, color?: string): string;
  editText(elementId: string, newText: string): boolean;
  moveText(elementId: string, x: number, y: number): boolean;
  
  // Shape operations
  addRectangle(x: number, y: number, width: number, height: number, color?: string): string;
  addCircle(x: number, y: number, radius: number, color?: string): string;
  addArrow(fromX: number, fromY: number, toX: number, toY: number, color?: string): string;
  
  // General operations
  deleteElement(elementId: string): boolean;
  moveElement(elementId: string, x: number, y: number): boolean;
  changeElementColor(elementId: string, color: string): boolean;
  
  // Canvas operations
  clearCanvas(): boolean;
  getElements(): CanvasElement[];
  findElementsByText(searchText: string): CanvasElement[];
  findElementsByType(type: string): CanvasElement[];
  
  // Layout operations
  alignElementsHorizontally(elementIds: string[]): boolean;
  alignElementsVertically(elementIds: string[]): boolean;
  distributeElementsEvenly(elementIds: string[], direction: 'horizontal' | 'vertical'): boolean;
  
  // AI-specific operations
  addMindMapNode(parentId: string | null, text: string, x?: number, y?: number): string;
  connectElements(elementId1: string, elementId2: string): string;
  createFlowChart(nodes: { text: string; x?: number; y?: number }[], connections: { from: number; to: number }[]): string[];
}

export class CanvasToolsService implements CanvasToolsAPI {
  private elements: CanvasElement[] = [];
  private onElementsChange: (elements: CanvasElement[]) => void;

  constructor(onElementsChange: (elements: CanvasElement[]) => void) {
    this.onElementsChange = onElementsChange;
  }

  setElements(elements: CanvasElement[]) {
    this.elements = elements;
  }

  private generateId(): string {
    return `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateElements() {
    this.onElementsChange(this.elements);
  }

  // Text operations
  addText(x: number, y: number, text: string, fontSize: number = 16, color: string = '#000'): string {
    const id = this.generateId();
    const element: CanvasElement = {
      id,
      type: 'text',
      x,
      y,
      text,
      fontSize,
      color
    };
    this.elements.push(element);
    this.updateElements();
    return id;
  }

  editText(elementId: string, newText: string): boolean {
    const element = this.elements.find(el => el.id === elementId && el.type === 'text');
    if (element) {
      element.text = newText;
      this.updateElements();
      return true;
    }
    return false;
  }

  moveText(elementId: string, x: number, y: number): boolean {
    return this.moveElement(elementId, x, y);
  }

  // Shape operations
  addRectangle(x: number, y: number, width: number, height: number, color: string = '#000'): string {
    const id = this.generateId();
    const element: CanvasElement = {
      id,
      type: 'rectangle',
      x,
      y,
      width,
      height,
      color,
      strokeWidth: 2
    };
    this.elements.push(element);
    this.updateElements();
    return id;
  }

  addCircle(x: number, y: number, radius: number, color: string = '#000'): string {
    const id = this.generateId();
    const element: CanvasElement = {
      id,
      type: 'circle',
      x: x - radius,
      y: y - radius,
      width: radius * 2,
      height: radius * 2,
      color,
      strokeWidth: 2
    };
    this.elements.push(element);
    this.updateElements();
    return id;
  }

  addArrow(fromX: number, fromY: number, toX: number, toY: number, color: string = '#000'): string {
    const id = this.generateId();
    const element: CanvasElement = {
      id,
      type: 'arrow',
      x: fromX,
      y: fromY,
      points: [{ x: fromX, y: fromY }, { x: toX, y: toY }],
      color,
      strokeWidth: 2
    };
    this.elements.push(element);
    this.updateElements();
    return id;
  }

  // General operations
  deleteElement(elementId: string): boolean {
    const initialLength = this.elements.length;
    this.elements = this.elements.filter(el => el.id !== elementId);
    if (this.elements.length !== initialLength) {
      this.updateElements();
      return true;
    }
    return false;
  }

  moveElement(elementId: string, x: number, y: number): boolean {
    const element = this.elements.find(el => el.id === elementId);
    if (element) {
      element.x = x;
      element.y = y;
      this.updateElements();
      return true;
    }
    return false;
  }

  changeElementColor(elementId: string, color: string): boolean {
    const element = this.elements.find(el => el.id === elementId);
    if (element) {
      element.color = color;
      this.updateElements();
      return true;
    }
    return false;
  }

  // Canvas operations
  clearCanvas(): boolean {
    this.elements = [];
    this.updateElements();
    return true;
  }

  getElements(): CanvasElement[] {
    return [...this.elements];
  }

  findElementsByText(searchText: string): CanvasElement[] {
    return this.elements.filter(el => 
      el.type === 'text' && el.text?.toLowerCase().includes(searchText.toLowerCase())
    );
  }

  findElementsByType(type: string): CanvasElement[] {
    return this.elements.filter(el => el.type === type);
  }

  // Layout operations
  alignElementsHorizontally(elementIds: string[]): boolean {
    const elementsToAlign = this.elements.filter(el => elementIds.includes(el.id));
    if (elementsToAlign.length < 2) return false;

    const averageY = elementsToAlign.reduce((sum, el) => sum + el.y, 0) / elementsToAlign.length;
    
    elementsToAlign.forEach(el => {
      el.y = averageY;
    });
    
    this.updateElements();
    return true;
  }

  alignElementsVertically(elementIds: string[]): boolean {
    const elementsToAlign = this.elements.filter(el => elementIds.includes(el.id));
    if (elementsToAlign.length < 2) return false;

    const averageX = elementsToAlign.reduce((sum, el) => sum + el.x, 0) / elementsToAlign.length;
    
    elementsToAlign.forEach(el => {
      el.x = averageX;
    });
    
    this.updateElements();
    return true;
  }

  distributeElementsEvenly(elementIds: string[], direction: 'horizontal' | 'vertical'): boolean {
    const elementsToDistribute = this.elements.filter(el => elementIds.includes(el.id));
    if (elementsToDistribute.length < 3) return false;

    if (direction === 'horizontal') {
      elementsToDistribute.sort((a, b) => a.x - b.x);
      const totalWidth = elementsToDistribute[elementsToDistribute.length - 1].x - elementsToDistribute[0].x;
      const spacing = totalWidth / (elementsToDistribute.length - 1);
      
      elementsToDistribute.forEach((el, index) => {
        if (index > 0 && index < elementsToDistribute.length - 1) {
          el.x = elementsToDistribute[0].x + spacing * index;
        }
      });
    } else {
      elementsToDistribute.sort((a, b) => a.y - b.y);
      const totalHeight = elementsToDistribute[elementsToDistribute.length - 1].y - elementsToDistribute[0].y;
      const spacing = totalHeight / (elementsToDistribute.length - 1);
      
      elementsToDistribute.forEach((el, index) => {
        if (index > 0 && index < elementsToDistribute.length - 1) {
          el.y = elementsToDistribute[0].y + spacing * index;
        }
      });
    }
    
    this.updateElements();
    return true;
  }

  // AI-specific operations
  addMindMapNode(parentId: string | null, text: string, x?: number, y?: number): string {
    let nodeX = x || Math.random() * 800 + 100;
    let nodeY = y || Math.random() * 600 + 100;
    
    // If parent exists, position relative to it
    if (parentId) {
      const parent = this.elements.find(el => el.id === parentId);
      if (parent) {
        nodeX = parent.x + 150 + Math.random() * 100;
        nodeY = parent.y + (Math.random() - 0.5) * 200;
      }
    }
    
    const nodeId = this.addText(nodeX, nodeY, text, 14, '#333');
    
    // Add connecting line if parent exists
    if (parentId) {
      const parent = this.elements.find(el => el.id === parentId);
      const node = this.elements.find(el => el.id === nodeId);
      if (parent && node) {
        this.addArrow(parent.x + 50, parent.y, node.x, node.y, '#666');
      }
    }
    
    return nodeId;
  }

  connectElements(elementId1: string, elementId2: string): string {
    const el1 = this.elements.find(el => el.id === elementId1);
    const el2 = this.elements.find(el => el.id === elementId2);
    
    if (el1 && el2) {
      const centerX1 = el1.x + (el1.width || 0) / 2;
      const centerY1 = el1.y + (el1.height || 0) / 2;
      const centerX2 = el2.x + (el2.width || 0) / 2;
      const centerY2 = el2.y + (el2.height || 0) / 2;
      
      return this.addArrow(centerX1, centerY1, centerX2, centerY2, '#666');
    }
    
    return '';
  }

  createFlowChart(nodes: { text: string; x?: number; y?: number }[], connections: { from: number; to: number }[]): string[] {
    const nodeIds: string[] = [];
    
    // Create nodes
    nodes.forEach((node, index) => {
      const x = node.x || 200 + (index % 3) * 200;
      const y = node.y || 150 + Math.floor(index / 3) * 150;
      
      const rectId = this.addRectangle(x - 50, y - 25, 100, 50, '#E5E7EB');
      const textId = this.addText(x - 25, y, node.text, 14, '#374151');
      
      nodeIds.push(rectId, textId);
    });
    
    // Create connections
    connections.forEach(conn => {
      if (conn.from < nodes.length && conn.to < nodes.length) {
        const fromNode = nodes[conn.from];
        const toNode = nodes[conn.to];
        
        const fromX = fromNode.x || 200 + (conn.from % 3) * 200;
        const fromY = fromNode.y || 150 + Math.floor(conn.from / 3) * 150;
        const toX = toNode.x || 200 + (conn.to % 3) * 200;
        const toY = toNode.y || 150 + Math.floor(conn.to / 3) * 150;
        
        const arrowId = this.addArrow(fromX + 50, fromY, toX - 50, toY, '#6B7280');
        nodeIds.push(arrowId);
      }
    });
    
    return nodeIds;
  }
}

// AI Tools Description for Function Calling
export const AI_CANVAS_TOOLS = {
  addText: {
    description: "Add text to the canvas at specified position",
    parameters: {
      x: "number - X coordinate",
      y: "number - Y coordinate", 
      text: "string - Text content",
      fontSize: "number - Font size (optional, default 16)",
      color: "string - Text color (optional, default '#000')"
    }
  },
  addRectangle: {
    description: "Add a rectangle to the canvas",
    parameters: {
      x: "number - X coordinate",
      y: "number - Y coordinate",
      width: "number - Rectangle width",
      height: "number - Rectangle height",
      color: "string - Border color (optional, default '#000')"
    }
  },
  addCircle: {
    description: "Add a circle to the canvas",
    parameters: {
      x: "number - Center X coordinate",
      y: "number - Center Y coordinate",
      radius: "number - Circle radius",
      color: "string - Border color (optional, default '#000')"
    }
  },
  addMindMapNode: {
    description: "Add a mind map node, optionally connected to parent",
    parameters: {
      parentId: "string|null - Parent node ID or null for root",
      text: "string - Node text",
      x: "number - X coordinate (optional, auto-positioned)",
      y: "number - Y coordinate (optional, auto-positioned)"
    }
  },
  createFlowChart: {
    description: "Create a flow chart with nodes and connections",
    parameters: {
      nodes: "array - Array of {text, x?, y?} objects",
      connections: "array - Array of {from: index, to: index} objects"
    }
  }
};