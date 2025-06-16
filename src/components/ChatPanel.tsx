import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, Sparkles, Palette, Type, Image } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getDesignChat, saveDesignChat, mockUsers, type ChatMessage } from '../data/mockData';

interface ChatPanelProps {
  designId: string;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ designId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chat history when component mounts or designId changes
  useEffect(() => {
    const loadChatHistory = () => {
      const chatHistory = getDesignChat(designId);
      if (chatHistory && chatHistory.messages.length > 0) {
        setMessages(chatHistory.messages);
      } else {
        // Initialize with AI welcome message if no history exists
        const welcomeMessage: ChatMessage = {
          id: `msg-${Date.now()}`,
          content: '¡Hola! Soy tu asistente de diseño con IA. Puedo ayudarte a mejorar tu diseño. ¿Qué te gustaría hacer?',
          sender: 'ai',
          timestamp: new Date(),
          suggestions: [
            'Cambiar colores',
            'Agregar texto',
            'Mejorar composición',
            'Sugerir elementos'
          ],
          type: 'text'
        };
        setMessages([welcomeMessage]);
      }
      setIsInitialized(true);
    };

    if (designId && !isInitialized) {
      loadChatHistory();
    }
  }, [designId, isInitialized]);

  // Save messages whenever they change
  useEffect(() => {
    if (isInitialized && messages.length > 0) {
      saveDesignChat(designId, messages);
    }
  }, [messages, designId, isInitialized]);

  const simulateAIResponse = (userMessage: string): string => {
    const responses = {
      'colores': 'Puedo sugerir una paleta de colores más armoniosa. ¿Prefieres tonos cálidos, fríos o neutros?',
      'texto': 'Para mejorar la tipografía, te recomiendo usar máximo 2 fuentes diferentes y asegurar buen contraste.',
      'composición': 'La regla de los tercios puede mejorar tu composición. ¿Quieres que reposicione algunos elementos?',
      'elementos': 'Puedo sugerir iconos, formas o imágenes que complementen tu diseño. ¿Qué tipo de elementos necesitas?',
      'default': 'Entiendo que quieres mejorar tu diseño. Puedo ayudarte con colores, tipografía, composición o elementos visuales. ¿Por dónde empezamos?'
    };

    const lowerMessage = userMessage.toLowerCase();
    for (const [key, response] of Object.entries(responses)) {
      if (key !== 'default' && lowerMessage.includes(key)) {
        return response;
      }
    }
    return responses.default;
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      content: newMessage,
      sender: 'team',
      senderId: user.id,
      timestamp: new Date(),
      userName: user.name,
      avatar: user.avatar,
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsTyping(true);

    // Simular respuesta de IA
    setTimeout(() => {
      const aiResponse: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        content: simulateAIResponse(newMessage),
        sender: 'ai',
        timestamp: new Date(),
        suggestions: ['Aplicar cambios', 'Ver más opciones', 'Deshacer', 'Continuar'],
        type: 'design_suggestion'
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
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
            const isTeamMessage = message.sender === 'team';
            const isAiMessage = message.sender === 'ai';
            const isCurrentUser = message.senderId === user?.id;
            const memberInfo = message.senderId ? mockUsers.find(u => u.id === message.senderId) : null;
            
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
                  {isTeamMessage && !isCurrentUser && memberInfo && (
                    <div className="flex items-center space-x-2 mb-1">
                      <img
                        src={memberInfo.avatar}
                        alt={memberInfo.name}
                        className="w-6 h-6 rounded-full border border-white/30"
                      />
                      <span className="text-xs font-medium text-white/80">{memberInfo.name}</span>
                      <span className="text-xs text-white/60">{memberInfo.role}</span>
                    </div>
                  )}
                  
                  <div className={`rounded-2xl p-3 ${
                    isCurrentUser
                      ? 'bg-gradient-to-r from-purple-500 to-cyan-500 text-white'
                      : isAiMessage
                      ? 'bg-white/50 backdrop-blur-sm border border-white/30 text-gray-800'
                      : 'bg-white/30 backdrop-blur-sm border border-white/20 text-white'
                  }`}>
                    <p className="text-sm">{message.content}</p>
                  </div>
                  
                  {message.suggestions && (
                    <div className="mt-2 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="block w-full text-left text-xs bg-white/30 hover:bg-white/50 backdrop-blur-sm border border-white/20 rounded-lg px-2 py-1 text-white/80 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  <div className={`flex items-center mt-1 space-x-2 ${
                    isCurrentUser ? 'justify-end' : 'justify-start'
                  }`}>
                    {isAiMessage && (
                      <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 flex items-center justify-center">
                        <Bot className="w-3 h-3 text-white" />
                      </div>
                    )}
                    {isCurrentUser && user?.avatar && (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-5 h-5 rounded-full"
                      />
                    )}
                    <span className="text-xs text-white/60">
                      {message.timestamp instanceof Date 
                        ? message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                        : new Date(message.timestamp).toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })
                      }
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

      {/* Quick Actions */}
      <div className="p-3 border-t border-white/20 flex-shrink-0">
        <div className="grid grid-cols-3 gap-2 mb-3">
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