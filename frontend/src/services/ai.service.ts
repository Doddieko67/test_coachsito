import { GoogleGenerativeAI } from '@google/generative-ai';

// Configurar Gemini AI
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

if (!GEMINI_API_KEY) {
  console.warn('VITE_GEMINI_API_KEY no está configurada. El chat con IA no funcionará.');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Configuración del modelo
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 1000,
  },
});

export interface DesignElement {
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
  fontSize?: number;
}

export interface DesignAnalysis {
  elementCount: number;
  hasText: boolean;
  hasImages: boolean;
  hasShapes: boolean;
  dominantColors: string[];
  layout: 'scattered' | 'centered' | 'structured';
  complexity: 'simple' | 'moderate' | 'complex';
}

export const aiService = {
  /**
   * Analiza los elementos del canvas para entender el diseño actual
   */
  analyzeDesign(elements: DesignElement[]): DesignAnalysis {
    const elementCount = elements.length;
    const hasText = elements.some(el => el.type === 'text');
    const hasImages = elements.some(el => el.type === 'image');
    const hasShapes = elements.some(el => ['rectangle', 'circle', 'diamond'].includes(el.type));
    
    // Extraer colores dominantes
    const colors = elements
      .map(el => el.color || el.fillColor || el.strokeColor)
      .filter(Boolean) as string[];
    const dominantColors = [...new Set(colors)].slice(0, 3);
    
    // Analizar layout basado en posiciones
    const avgX = elements.reduce((sum, el) => sum + el.x, 0) / elementCount;
    const avgY = elements.reduce((sum, el) => sum + el.y, 0) / elementCount;
    const centerX = 500; // Asumiendo canvas de ~1000px
    const centerY = 350; // Asumiendo canvas de ~700px
    
    const isCentered = Math.abs(avgX - centerX) < 100 && Math.abs(avgY - centerY) < 100;
    const layout = isCentered ? 'centered' : 'scattered';
    
    // Determinar complejidad
    let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
    if (elementCount > 10) complexity = 'complex';
    else if (elementCount > 5) complexity = 'moderate';
    
    return {
      elementCount,
      hasText,
      hasImages,
      hasShapes,
      dominantColors,
      layout,
      complexity
    };
  },

  /**
   * Genera un prompt contextual basado en el análisis del diseño
   */
  generateContextualPrompt(analysis: DesignAnalysis, userMessage: string): string {
    const context = `
Contexto del diseño actual:
- Elementos: ${analysis.elementCount} (${analysis.complexity})
- Contiene: ${[
  analysis.hasText && 'texto',
  analysis.hasImages && 'imágenes', 
  analysis.hasShapes && 'formas'
].filter(Boolean).join(', ') || 'elementos básicos'}
- Layout: ${analysis.layout}
- Colores principales: ${analysis.dominantColors.join(', ') || 'colores por defecto'}

Eres un asistente experto en diseño gráfico que ayuda a mejorar diseños digitales.
Responde de manera concisa y práctica. Siempre da sugerencias específicas y accionables.

Usuario: ${userMessage}

Respuesta:`;

    return context;
  },

  /**
   * Envía mensaje a Gemini AI con contexto del diseño
   */
  async sendMessage(
    userMessage: string, 
    elements: DesignElement[] = [],
    conversationHistory: Array<{role: 'user' | 'assistant', content: string}> = []
  ): Promise<string> {
    try {
      if (!GEMINI_API_KEY) {
        return 'Lo siento, el chat con IA no está configurado. Necesitas agregar tu API key de Gemini.';
      }

      // Analizar el diseño actual
      const analysis = this.analyzeDesign(elements);
      
      // Generar prompt con contexto
      const contextualPrompt = this.generateContextualPrompt(analysis, userMessage);
      
      // Crear historial de conversación para el modelo
      const chat = model.startChat({
        history: conversationHistory.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }))
      });

      // Enviar mensaje
      const result = await chat.sendMessage(contextualPrompt);
      const response = await result.response;
      
      return response.text();
      
    } catch (error) {
      console.error('Error communicating with Gemini AI:', error);
      
      // Respuestas de fallback inteligentes basadas en palabras clave
      const message = userMessage.toLowerCase();
      
      if (message.includes('color')) {
        return 'Te sugiero experimentar con colores complementarios. Puedes usar herramientas como Adobe Color para encontrar paletas armoniosas.';
      } else if (message.includes('texto') || message.includes('font')) {
        return 'Para mejorar la tipografía, considera usar máximo 2 fuentes diferentes y asegúrate de que haya buen contraste con el fondo.';
      } else if (message.includes('layout') || message.includes('organizar')) {
        return 'Te recomiendo aplicar la regla de los tercios y agrupar elementos relacionados. Deja suficiente espacio en blanco para que respire el diseño.';
      } else {
        return 'Lo siento, hubo un problema conectando con la IA. Por favor intenta de nuevo o verifica tu conexión.';
      }
    }
  },

  /**
   * Sugerencias rápidas basadas en el análisis del diseño
   */
  getQuickSuggestions(elements: DesignElement[]): string[] {
    const analysis = this.analyzeDesign(elements);
    const suggestions: string[] = [];

    if (analysis.elementCount === 0) {
      suggestions.push('Comienza agregando un título principal');
      suggestions.push('Agrega una imagen de fondo');
      suggestions.push('Crea formas básicas para estructura');
    } else {
      if (!analysis.hasText) {
        suggestions.push('Agrega texto descriptivo');
      }
      if (!analysis.hasImages) {
        suggestions.push('Incluye imágenes relevantes');
      }
      if (analysis.layout === 'scattered') {
        suggestions.push('Organiza los elementos de forma más estructurada');
      }
      if (analysis.dominantColors.length < 2) {
        suggestions.push('Experimenta con más variedad de colores');
      }
      if (analysis.complexity === 'simple') {
        suggestions.push('Agrega más elementos para enriquecer el diseño');
      }
    }

    return suggestions.slice(0, 3); // Máximo 3 sugerencias
  }
};