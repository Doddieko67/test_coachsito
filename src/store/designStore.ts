import { create } from 'zustand';

export interface Design {
  id: string;
  name: string;
  thumbnail: string;
  elements: any[];
  createdAt: Date;
  updatedAt: Date;
}

interface Template {
  id: string;
  name: string;
  category: string;
  thumbnail: string;
  elements: any[];
}

interface DesignState {
  currentDesign: Design | null;
  templates: Template[];
  savedDesigns: Design[];
  createDesign: (templateId?: string) => void;
  saveDesign: (design: Design) => void;
  loadDesign: (designId: string) => void;
  updateDesign: (updates: Partial<Design>) => void;
}

const mockTemplates: Template[] = [
  {
    id: '1',
    name: 'Presentación Empresarial',
    category: 'Presentación',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
    elements: []
  },
  {
    id: '2',
    name: 'Post de Instagram',
    category: 'Social Media',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
    elements: []
  },
  {
    id: '3',
    name: 'Flyer Evento',
    category: 'Marketing',
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop',
    elements: []
  },
  {
    id: '4',
    name: 'Tarjeta de Presentación',
    category: 'Negocio',
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    elements: []
  }
];

export const useDesignStore = create<DesignState>((set, get) => ({
  currentDesign: null,
  templates: mockTemplates,
  savedDesigns: [],
  createDesign: (templateId) => {
    const template = templateId ? get().templates.find(t => t.id === templateId) : null;
    const newDesign: Design = {
      id: Date.now().toString(),
      name: template ? `${template.name} - Copia` : 'Nuevo Diseño',
      thumbnail: template?.thumbnail || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      elements: template?.elements || [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    set({ currentDesign: newDesign });
  },
  saveDesign: (design) => {
    const savedDesigns = get().savedDesigns;
    const existingIndex = savedDesigns.findIndex(d => d.id === design.id);
    if (existingIndex >= 0) {
      savedDesigns[existingIndex] = { ...design, updatedAt: new Date() };
    } else {
      savedDesigns.push(design);
    }
    set({ savedDesigns: [...savedDesigns], currentDesign: design });
  },
  loadDesign: (designId) => {
    const design = get().savedDesigns.find(d => d.id === designId);
    if (design) {
      set({ currentDesign: design });
    }
  },
  updateDesign: (updates) => {
    const currentDesign = get().currentDesign;
    if (currentDesign) {
      set({ currentDesign: { ...currentDesign, ...updates, updatedAt: new Date() } });
    }
  }
}));