import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { aiService, type DesignElement } from './ai.service';

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'];
type ChatMessageInsert = Database['public']['Tables']['chat_messages']['Insert'];

export const chatService = {
  async getMessagesByDesignId(designId: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .eq('design_id', designId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  },

  async sendMessage(message: ChatMessageInsert) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        ...message,
        user_id: message.is_ai ? null : user?.id
      })
      .select(`
        *,
        profiles:user_id (name, avatar_url)
      `)
      .single();

    if (error) throw error;
    return data;
  },

  async sendAIMessage(designId: string, message: string) {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert({
        design_id: designId,
        message,
        is_ai: true,
        user_id: null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Real-time subscription for chat messages
  subscribeToChat(designId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`chat:${designId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `design_id=eq.${designId}`
        },
        callback
      )
      .subscribe();
  },

  // Get AI response using Gemini AI directly
  async getAIResponse(
    designId: string, 
    message: string, 
    conversationHistory: ChatMessage[],
    currentElements: DesignElement[] = []
  ) {
    try {
      // Preparar historial de conversación
      const history = conversationHistory
        .filter(msg => msg.message) // Filtrar mensajes vacíos
        .map(msg => ({
          role: msg.is_ai ? 'assistant' as const : 'user' as const,
          content: msg.message
        }));

      // Obtener respuesta de Gemini AI
      const aiResponse = await aiService.sendMessage(message, currentElements, history);

      // Guardar respuesta de IA en la base de datos
      const savedMessage = await this.sendAIMessage(designId, aiResponse);

      return savedMessage;
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Respuesta de fallback
      const fallbackResponse = 'Lo siento, hubo un problema procesando tu mensaje. ¿Podrías intentar de nuevo?';
      const savedMessage = await this.sendAIMessage(designId, fallbackResponse);
      
      return savedMessage;
    }
  },

  // Obtener sugerencias rápidas basadas en el diseño actual
  getQuickSuggestions(elements: DesignElement[]): string[] {
    return aiService.getQuickSuggestions(elements);
  },

  // Delete a message (for moderation purposes)
  async deleteMessage(messageId: string) {
    const { error } = await supabase
      .from('chat_messages')
      .delete()
      .eq('id', messageId);

    if (error) throw error;
  }
};