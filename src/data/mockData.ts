export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinedAt: Date;
}

export interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai' | 'team';
  senderId?: string;
  timestamp: Date;
  userName?: string;
  avatar?: string;
  suggestions?: string[];
  type?: 'text' | 'design_suggestion' | 'system';
}

export interface Design {
  id: string;
  name: string;
  thumbnail: string;
  elements: any[];
  createdAt: Date;
  updatedAt: Date;
  ownerId: string;
  collaborators: string[];
  isPublic: boolean;
  category: string;
}

export interface ChatHistory {
  designId: string;
  messages: ChatMessage[];
  participants: string[];
}

// Usuarios ficticios
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana@designhub.com',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'Diseñadora Principal',
    joinedAt: new Date('2023-01-15')
  },
  {
    id: '2',
    name: 'Carlos Mendoza',
    email: 'carlos@designhub.com',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'Director Creativo',
    joinedAt: new Date('2022-11-08')
  },
  {
    id: '3',
    name: 'Sofia Morales',
    email: 'sofia@designhub.com',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    role: 'UX Designer',
    joinedAt: new Date('2023-03-22')
  },
  {
    id: '4',
    name: 'Miguel Torres',
    email: 'miguel@designhub.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    role: 'Desarrollador Frontend',
    joinedAt: new Date('2023-02-10')
  },
  {
    id: '5',
    name: 'Laura Vásquez',
    email: 'laura@designhub.com',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    role: 'Brand Manager',
    joinedAt: new Date('2023-04-05')
  }
];

// Diseños ficticios por usuario
export const mockDesigns: Design[] = [
  // Diseños de Ana García
  {
    id: 'design-1',
    name: 'Campaña Verano 2024',
    thumbnail: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=300&h=200&fit=crop',
    elements: [],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-15'),
    ownerId: '1',
    collaborators: ['2', '3'],
    isPublic: true,
    category: 'Marketing'
  },
  {
    id: 'design-2',
    name: 'Identidad Visual Startup',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
    elements: [],
    createdAt: new Date('2024-01-05'),
    updatedAt: new Date('2024-01-12'),
    ownerId: '1',
    collaborators: ['4'],
    isPublic: false,
    category: 'Branding'
  },
  
  // Diseños de Carlos Mendoza
  {
    id: 'design-3',
    name: 'Presentación Q1 2024',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=300&h=200&fit=crop',
    elements: [],
    createdAt: new Date('2024-01-08'),
    updatedAt: new Date('2024-01-18'),
    ownerId: '2',
    collaborators: ['1', '5'],
    isPublic: true,
    category: 'Presentación'
  },
  {
    id: 'design-4',
    name: 'Rediseño Web Principal',
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=300&h=200&fit=crop',
    elements: [],
    createdAt: new Date('2024-01-12'),
    updatedAt: new Date('2024-01-20'),
    ownerId: '2',
    collaborators: ['3', '4'],
    isPublic: false,
    category: 'Web Design'
  },

  // Diseños de Sofia Morales
  {
    id: 'design-5',
    name: 'App Mobile Prototipo',
    thumbnail: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=300&h=200&fit=crop',
    elements: [],
    createdAt: new Date('2024-01-14'),
    updatedAt: new Date('2024-01-22'),
    ownerId: '3',
    collaborators: ['4'],
    isPublic: true,
    category: 'UI/UX'
  },
  {
    id: 'design-6',
    name: 'Sistema de Iconos',
    thumbnail: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=300&h=200&fit=crop',
    elements: [],
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-24'),
    ownerId: '3',
    collaborators: ['1', '2'],
    isPublic: false,
    category: 'Iconografía'
  },

  // Diseños de Miguel Torres
  {
    id: 'design-7',
    name: 'Landing Page Producto',
    thumbnail: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=300&h=200&fit=crop',
    elements: [],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-25'),
    ownerId: '4',
    collaborators: ['2', '3'],
    isPublic: true,
    category: 'Web Design'
  },

  // Diseños de Laura Vásquez
  {
    id: 'design-8',
    name: 'Guía de Marca 2024',
    thumbnail: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=300&h=200&fit=crop',
    elements: [],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-26'),
    ownerId: '5',
    collaborators: ['1', '2'],
    isPublic: false,
    category: 'Branding'
  }
];

// Conversaciones ficticias del chat por diseño
export const mockChatHistory: ChatHistory[] = [
  // Chat para Campaña Verano 2024
  {
    designId: 'design-1',
    participants: ['1', '2', '3'],
    messages: [
      {
        id: 'msg-1',
        content: '¡Hola equipo! He empezado con el concepto de la campaña de verano. ¿Qué opinan de estos colores?',
        sender: 'team',
        senderId: '1',
        timestamp: new Date('2024-01-10T09:00:00'),
        userName: 'Ana García',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      },
      {
        id: 'msg-2',
        content: 'Me encantan los tonos! Sugiero agregar más contraste en el texto principal para mejor legibilidad.',
        sender: 'team',
        senderId: '2',
        timestamp: new Date('2024-01-10T09:15:00'),
        userName: 'Carlos Mendoza',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      },
      {
        id: 'msg-3',
        content: 'Estoy de acuerdo con Carlos. También podríamos ajustar el espaciado entre elementos para mejorar la composición.',
        sender: 'team',
        senderId: '3',
        timestamp: new Date('2024-01-10T09:30:00'),
        userName: 'Sofia Morales',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      },
      {
        id: 'msg-4',
        content: 'Perfecto! He detectado que pueden mejorar el contraste del texto. ¿Les ayudo a aplicar las mejores prácticas de accesibilidad?',
        sender: 'ai',
        timestamp: new Date('2024-01-10T09:32:00'),
        suggestions: ['Aumentar contraste', 'Aplicar WCAG 2.1', 'Revisar legibilidad', 'Sugerir colores'],
        type: 'design_suggestion'
      },
      {
        id: 'msg-5',
        content: 'Sí por favor! Aplica las mejoras de contraste.',
        sender: 'team',
        senderId: '1',
        timestamp: new Date('2024-01-10T09:35:00'),
        userName: 'Ana García',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      },
      {
        id: 'msg-6',
        content: '¡Excelente! He aplicado las mejoras de contraste siguiendo las pautas WCAG. El texto ahora tiene un ratio de contraste de 4.8:1.',
        sender: 'ai',
        timestamp: new Date('2024-01-10T09:36:00'),
        type: 'design_suggestion'
      }
    ]
  },

  // Chat para Presentación Q1 2024
  {
    designId: 'design-3',
    participants: ['2', '1', '5'],
    messages: [
      {
        id: 'msg-7',
        content: 'Equipo, necesitamos tener lista la presentación para el lunes. He preparado la estructura base.',
        sender: 'team',
        senderId: '2',
        timestamp: new Date('2024-01-08T10:00:00'),
        userName: 'Carlos Mendoza',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      },
      {
        id: 'msg-8',
        content: 'Perfecto Carlos! ¿Quieres que trabaje en los gráficos de datos del Q4?',
        sender: 'team',
        senderId: '1',
        timestamp: new Date('2024-01-08T10:15:00'),
        userName: 'Ana García',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      },
      {
        id: 'msg-9',
        content: 'Sí, por favor. Y Laura, ¿puedes revisar que esté alineado con nuestro branding?',
        sender: 'team',
        senderId: '2',
        timestamp: new Date('2024-01-08T10:18:00'),
        userName: 'Carlos Mendoza',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      },
      {
        id: 'msg-10',
        content: '¡Por supuesto! Veo que están trabajando en una presentación corporativa. ¿Les ayudo con algunas plantillas profesionales?',
        sender: 'ai',
        timestamp: new Date('2024-01-08T10:20:00'),
        suggestions: ['Plantillas corporativas', 'Gráficos de datos', 'Paleta empresarial', 'Iconos profesionales'],
        type: 'design_suggestion'
      },
      {
        id: 'msg-11',
        content: 'Claro que sí! Los gráficos de datos serían geniales.',
        sender: 'team',
        senderId: '5',
        timestamp: new Date('2024-01-08T10:25:00'),
        userName: 'Laura Vásquez',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      }
    ]
  },

  // Chat para App Mobile Prototipo
  {
    designId: 'design-5',
    participants: ['3', '4'],
    messages: [
      {
        id: 'msg-12',
        content: 'Miguel, he estado trabajando en el flujo de usuario para la app. ¿Qué opinas de esta navegación?',
        sender: 'team',
        senderId: '3',
        timestamp: new Date('2024-01-14T14:00:00'),
        userName: 'Sofia Morales',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      },
      {
        id: 'msg-13',
        content: 'Se ve muy bien Sofia! Desde el punto de vista técnico, este flujo es perfectamente implementable.',
        sender: 'team',
        senderId: '4',
        timestamp: new Date('2024-01-14T14:10:00'),
        userName: 'Miguel Torres',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      },
      {
        id: 'msg-14',
        content: 'Excelente trabajo en el prototipo! Noto que están diseñando una interfaz móvil. ¿Les ayudo a optimizar para diferentes tamaños de pantalla?',
        sender: 'ai',
        timestamp: new Date('2024-01-14T14:12:00'),
        suggestions: ['Responsive design', 'Touch targets', 'Navegación móvil', 'Optimizar rendimiento'],
        type: 'design_suggestion'
      },
      {
        id: 'msg-15',
        content: 'Perfecto! Sí, ayúdanos con los touch targets por favor.',
        sender: 'team',
        senderId: '3',
        timestamp: new Date('2024-01-14T14:15:00'),
        userName: 'Sofia Morales',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
        type: 'text'
      }
    ]
  }
];

export const getCurrentUser = (): User => {
  const savedUserId = localStorage.getItem('currentUserId');
  if (savedUserId) {
    const user = mockUsers.find(u => u.id === savedUserId);
    if (user) return user;
  }
  return mockUsers[0]; // Default to Ana García
};

export const setCurrentUser = (userId: string): void => {
  localStorage.setItem('currentUserId', userId);
};

export const getUserDesigns = (userId: string): Design[] => {
  return mockDesigns.filter(design => 
    design.ownerId === userId || design.collaborators.includes(userId)
  );
};

export const getDesignChat = (designId: string): ChatHistory | null => {
  return mockChatHistory.find(chat => chat.designId === designId) || null;
};

export const saveDesignChat = (designId: string, messages: ChatMessage[]): void => {
  const existingIndex = mockChatHistory.findIndex(chat => chat.designId === designId);
  if (existingIndex >= 0) {
    mockChatHistory[existingIndex].messages = messages;
  } else {
    mockChatHistory.push({
      designId,
      messages,
      participants: [getCurrentUser().id]
    });
  }
  
  // Save to localStorage for persistence
  localStorage.setItem('chatHistory', JSON.stringify(mockChatHistory));
};

export const addUserDesign = (design: Design): void => {
  mockDesigns.push(design);
  localStorage.setItem('userDesigns', JSON.stringify(mockDesigns));
};

// Load data from localStorage on startup
export const initializeData = (): void => {
  const savedChats = localStorage.getItem('chatHistory');
  if (savedChats) {
    try {
      const parsed = JSON.parse(savedChats);
      mockChatHistory.splice(0, mockChatHistory.length, ...parsed);
    } catch (e) {
      console.log('Error loading chat history');
    }
  }

  const savedDesigns = localStorage.getItem('userDesigns');
  if (savedDesigns) {
    try {
      const parsed = JSON.parse(savedDesigns);
      mockDesigns.splice(0, mockDesigns.length, ...parsed);
    } catch (e) {
      console.log('Error loading designs');
    }
  }
};