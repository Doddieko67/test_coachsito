import { create } from 'zustand';
import { getUserDesigns, addUserDesign, mockDesigns, getCurrentUser, type Design } from '../data/mockData';

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
  userDesigns: Design[];
  createDesign: (templateId?: string) => void;
  saveDesign: (design: Design) => void;
  loadDesign: (designId: string) => void;
  updateDesign: (updates: Partial<Design>) => void;
  loadUserDesigns: () => void;
  deleteDesign: (designId: string) => void;
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
  },
  {
    id: '5',
    name: 'Banner Web',
    category: 'Web Design',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    elements: []
  },
  {
    id: '6',
    name: 'Logo Moderno',
    category: 'Branding',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop',
    elements: []
  }
];

export const useDesignStore = create<DesignState>((set, get) => ({
  currentDesign: null,
  templates: mockTemplates,
  userDesigns: [],
  
  loadUserDesigns: () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      const designs = getUserDesigns(currentUser.id);
      set({ userDesigns: designs });
    }
  },

  createDesign: (templateId) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const template = templateId ? get().templates.find(t => t.id === templateId) : null;
    const newDesign: Design = {
      id: `design-${Date.now()}`,
      name: template ? `${template.name} - Copia` : 'Nuevo Diseño',
      thumbnail: template?.thumbnail || 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
      elements: template?.elements || [],
      createdAt: new Date(),
      updatedAt: new Date(),
      ownerId: currentUser.id,
      collaborators: [],
      isPublic: false,
      category: template?.category || 'General'
    };
    set({ currentDesign: newDesign });
  },

  saveDesign: (design) => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const userDesigns = get().userDesigns;
    const existingIndex = userDesigns.findIndex(d => d.id === design.id);
    
    const updatedDesign = { 
      ...design, 
      updatedAt: new Date(),
      ownerId: design.ownerId || currentUser.id 
    };
    
    if (existingIndex >= 0) {
      userDesigns[existingIndex] = updatedDesign;
    } else {
      userDesigns.push(updatedDesign);
      addUserDesign(updatedDesign);
    }
    
    set({ userDesigns: [...userDesigns], currentDesign: updatedDesign });
  },

  loadDesign: (designId) => {
    const userDesigns = get().userDesigns;
    const design = userDesigns.find(d => d.id === designId);
    if (design) {
      set({ currentDesign: design });
    }
  },

  updateDesign: (updates) => {
    const currentDesign = get().currentDesign;
    if (currentDesign) {
      const updatedDesign = { ...currentDesign, ...updates, updatedAt: new Date() };
      set({ currentDesign: updatedDesign });
    }
  },

  deleteDesign: (designId) => {
    const userDesigns = get().userDesigns.filter(d => d.id !== designId);
    set({ userDesigns });
    
    // Also remove from global mock data
    const globalIndex = mockDesigns.findIndex(d => d.id === designId);
    if (globalIndex >= 0) {
      mockDesigns.splice(globalIndex, 1);
    }
  }
}));