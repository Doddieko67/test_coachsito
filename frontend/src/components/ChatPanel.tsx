import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Sparkles, Palette, Type, Image } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useDesignStore } from '../store/designStore';
import { chatService } from '../services/chat.service';
import type { Database } from '../types/supabase';
import type { DesignElement } from '../services/ai.service';

interface ChatPanelProps {
  designId: string;
}

type ChatMessage = Database['public']['Tables']['chat_messages']['Row'] & {
  profiles?: { name: string; avatar_url: string | null } | null;
};

export const ChatPanel: React.FC<ChatPanelProps> = ({ designId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickSuggestions, setQuickSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { currentDesign } = useDesignStore();

  // Convertir elementos del diseño al formato esperado por IA
  const getCurrentElements = (): DesignElement[] => {
    if (!currentDesign?.canvas_data) return [];
    
    const canvasData = currentDesign.canvas_data as any;
    const elements = canvasData?.elements || [];
    
    return elements.map((el: any) => ({
      id: el.id,
      type: el.type,
      x: el.x,
      y: el.y,
      width: el.width,
      height: el.height,
      content: el.content,
      color: el.color,
      fillColor: el.fillColor,
      strokeColor: el.strokeColor,
      fontSize: el.fontSize
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Actualizar sugerencias cuando cambie el diseño
  useEffect(() => {
    const currentElements = getCurrentElements();
    const suggestions = chatService.getQuickSuggestions(currentElements);
    setQuickSuggestions(suggestions);
  }, [currentDesign?.canvas_data]);

  // Load chat history when component mounts or designId changes
  useEffect(() => {
    const loadChatHistory = async () => {
      try {
        const chatMessages = await chatService.getMessagesByDesignId(designId);
        
        if (chatMessages && chatMessages.length > 0) {
          setMessages(chatMessages);
        } else {
          // Initialize with AI welcome message if no history exists
          const welcomeMessage = await chatService.sendMessage({
            design_id: designId,
            message: '¡Hola! Soy tu asistente de diseño con IA. Puedo ayudarte a mejorar tu diseño. ¿Qué te gustaría hacer?',
            is_ai: true
          });
          setMessages([welcomeMessage]);
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    if (designId && !isInitialized) {
      loadChatHistory();

      // Subscribe to real-time chat updates
      const subscription = chatService.subscribeToChat(designId, (payload) => {
        if (payload.new) {
          setMessages(prev => [...prev, payload.new as ChatMessage]);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [designId, isInitialized]);



  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    try {
      setIsTyping(true);
      const messageText = newMessage;
      setNewMessage('');

      // Send user message
      await chatService.sendMessage({
        design_id: designId,
        message: messageText,
        is_ai: false
      });

      // Get AI response with current design elements
      setIsTyping(true);
      const currentElements = getCurrentElements();
      await chatService.getAIResponse(designId, messageText, messages, currentElements);
      
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setNewMessage(suggestion);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-white/20 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Chat de Equipo + IA</h3>
            <p className="text-xs text-gray-600">Colabora y mejora con IA</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => {
            const isAiMessage = message.is_ai;
            const isCurrentUser = message.user_id === user?.id;
            
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}
              >
                <div className={`max-w-[80%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  {/* Message header for team messages */}
                  {!isAiMessage && !isCurrentUser && message.profiles && (
                    <div className="flex items-center space-x-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
                        {message.profiles.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <span className="text-xs font-medium text-white/80">{message.profiles.name}</span>
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-3 ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                      : isAiMessage
                      ? 'bg-white/50 backdrop-blur-sm border border-white/30 text-gray-800'
                      : 'bg-white/30 backdrop-blur-sm border border-white/20 text-white'
                  }`}>
                    <p className="text-sm">{message.message}</p>
                  </div>
                  
                  <div className={`flex items-center mt-1 space-x-2 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}>
                    {isAiMessage && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {isCurrentUser && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-semibold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                    )}
                    <span className="text-xs text-white/60">
                      {new Date(message.created_at).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white/50 backdrop-blur-sm border border-white/30 rounded-2xl p-3 flex items-center space-x-2">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                <Bot className="w-3 h-3 text-white" />
              </div>
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Sugerencias Inteligentes */}
      <div className="p-3 border-t border-white/20 flex-shrink-0">
        {quickSuggestions.length > 0 && (
          <div className="mb-3">
            <div className="text-xs text-gray-600 mb-2 flex items-center">
              <Sparkles className="w-3 h-3 mr-1" />
              Sugerencias de IA
            </div>
            <div className="grid grid-cols-1 gap-1">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="p-2 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 hover:from-purple-500/20 hover:to-cyan-500/20 backdrop-blur-sm rounded-lg transition-all text-xs text-left border border-purple-200/30"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => handleSuggestionClick('Cambiar colores del diseño')}
            className="flex flex-col items-center p-2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-lg transition-all text-xs"
          >
            <Palette className="w-4 h-4 text-purple-600 mb-1" />
            <span className="text-gray-700">Colores</span>
          </button>
          <button
            onClick={() => handleSuggestionClick('Mejorar la tipografía')}
            className="flex flex-col items-center p-2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-lg transition-all text-xs"
          >
            <Type className="w-4 h-4 text-cyan-600 mb-1" />
            <span className="text-gray-700">Texto</span>
          </button>
          <button
            onClick={() => handleSuggestionClick('Agregar elementos visuales')}
            className="flex flex-col items-center p-2 bg-white/30 hover:bg-white/50 backdrop-blur-sm rounded-lg transition-all text-xs"
          >
            <Image className="w-4 h-4 text-green-600 mb-1" />
            <span className="text-gray-700">Elementos</span>
          </button>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/20 flex-shrink-0">
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <textarea
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Pregunta a la IA o chatea con tu equipo..."
              className="w-full px-3 py-2 bg-white/50 backdrop-blur-sm border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all resize-none text-sm"
              rows={2}
            />
          </div>
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="self-end p-2 bg-gradient-to-r from-purple-500 to-cyan-500 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};