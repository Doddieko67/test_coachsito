import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Filter, Grid3X3, Clock, Users, ChevronDown } from 'lucide-react';
import { useDesignStore } from '../store/designStore';
import { useAuthStore } from '../store/authStore';

interface TemplateGalleryProps {
  onCreateDesign: () => void;
}

export const TemplateGallery: React.FC<TemplateGalleryProps> = ({ onCreateDesign }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [activeTab, setActiveTab] = useState<'templates' | 'designs'>('designs');
  const [showUserSelector, setShowUserSelector] = useState(false);
  const { templates, createDesign, userDesigns, loadDesign } = useDesignStore();
  const { user, logout, allUsers, switchUser } = useAuthStore();

  const categories = ['Todos', ...Array.from(new Set([
    ...templates.map(t => t.category),
    ...userDesigns.map(d => d.category)
  ]))];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredDesigns = userDesigns.filter(design => {
    const matchesSearch = design.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todos' || design.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (templateId: string) => {
    createDesign(templateId);
    onCreateDesign();
  };

  const handleCreateBlank = () => {
    createDesign();
    onCreateDesign();
  };

  const handleDesignSelect = (designId: string) => {
    loadDesign(designId);
    onCreateDesign();
  };

  const handleUserSwitch = (userId: string) => {
    switchUser(userId);
    setShowUserSelector(false);
  };

  // Close user selector when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showUserSelector) {
        setShowUserSelector(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserSelector]);

  return (
    <div 
      className="min-h-screen"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)'
      }}
    >
      {/* Header */}
      <div 
        className="border-b border-white/20"
        style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)'
        }}
      >
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  <Grid3X3 className="w-5 h-5 text-white" />
                </div>
                <h1 
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  DesignHub
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* User Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowUserSelector(!showUserSelector)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-xl transition-all hover:bg-white/10"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-8 h-8 rounded-full border-2 border-white/30"
                  />
                  <div className="text-left">
                    <div className="text-sm font-medium text-white">{user?.name}</div>
                    <div className="text-xs text-white/70">{user?.role}</div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-white/60" />
                </button>

                {showUserSelector && (
                  <div 
                    className="absolute top-full right-0 mt-2 w-64 rounded-xl border border-white/20 shadow-2xl z-50"
                    style={{
                      background: 'rgba(255, 255, 255, 0.25)',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div className="p-3">
                      <div className="text-xs font-medium text-white/80 mb-2">Cambiar Usuario</div>
                      {allUsers.map((userOption) => (
                        <button
                          key={userOption.id}
                          onClick={() => handleUserSwitch(userOption.id)}
                          className={`w-full flex items-center space-x-3 p-2 rounded-lg transition-all ${
                            userOption.id === user?.id 
                              ? 'bg-white/20 text-white' 
                              : 'hover:bg-white/10 text-white/80'
                          }`}
                        >
                          <img
                            src={userOption.avatar}
                            alt={userOption.name}
                            className="w-8 h-8 rounded-full border border-white/30"
                          />
                          <div className="text-left flex-1">
                            <div className="text-sm font-medium">{userOption.name}</div>
                            <div className="text-xs text-white/60">{userOption.role}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={logout}
                className="text-sm text-white/80 hover:text-white px-4 py-2 rounded-xl transition-all hover:bg-white/10"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="mb-8">
          <div className="flex items-center space-x-1 mb-6">
            <button
              onClick={() => setActiveTab('designs')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'designs'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
              style={{
                background: activeTab === 'designs' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'transparent',
                backdropFilter: activeTab === 'designs' ? 'blur(20px)' : 'none'
              }}
            >
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span>Mis Diseños</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {userDesigns.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                activeTab === 'templates'
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80'
              }`}
              style={{
                background: activeTab === 'templates' 
                  ? 'rgba(255, 255, 255, 0.2)' 
                  : 'transparent',
                backdropFilter: activeTab === 'templates' ? 'blur(20px)' : 'none'
              }}
            >
              <div className="flex items-center space-x-2">
                <Grid3X3 className="w-4 h-4" />
                <span>Plantillas</span>
              </div>
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder={`Buscar ${activeTab === 'designs' ? 'diseños' : 'plantillas'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-white/30 focus:outline-none focus:border-white/50 transition-all text-white placeholder-white/60"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(20px)'
                  }}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-white/80" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 rounded-xl border border-white/30 focus:outline-none focus:border-white/50 text-white"
                style={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(20px)'
                }}
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-800 text-white">{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Create Blank Design (only in templates tab) */}
        {activeTab === 'templates' && (
          <div className="mb-8">
            <motion.div
              whileHover={{ scale: 1.02, y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateBlank}
              className="border-2 border-dashed border-white/40 rounded-2xl p-8 cursor-pointer group transition-all duration-300"
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="text-center">
                <div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300"
                  style={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
                  }}
                >
                  <Plus className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Crear Diseño en Blanco</h3>
                <p className="text-white/80 text-lg">Comienza desde cero con un lienzo vacío</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeTab === 'templates' 
            ? filteredTemplates.map((template, index) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleTemplateSelect(template.id)}
                  className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={template.thumbnail}
                      alt={template.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-white mb-1 text-lg">{template.name}</h3>
                    <p className="text-white/70">{template.category}</p>
                  </div>
                </motion.div>
              ))
            : filteredDesigns.map((design, index) => (
                <motion.div
                  key={design.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDesignSelect(design.id)}
                  className="rounded-2xl overflow-hidden cursor-pointer group transition-all duration-300"
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <img
                      src={design.thumbnail}
                      alt={design.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-white text-lg">{design.name}</h3>
                      {design.collaborators.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-white/60" />
                          <span className="text-xs text-white/60">{design.collaborators.length}</span>
                        </div>
                      )}
                    </div>
                    <p className="text-white/70 text-sm">{design.category}</p>
                    <p className="text-white/50 text-xs mt-1">
                      Actualizado {design.updatedAt instanceof Date 
                        ? design.updatedAt.toLocaleDateString()
                        : new Date(design.updatedAt).toLocaleDateString()
                      }
                    </p>
                  </div>
                </motion.div>
              ))
          }
        </div>

        {/* Empty States */}
        {activeTab === 'templates' && filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-6">
              <Search className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-3">No se encontraron plantillas</h3>
            <p className="text-white/70 text-lg">Intenta con otros términos de búsqueda</p>
          </div>
        )}

        {activeTab === 'designs' && filteredDesigns.length === 0 && (
          <div className="text-center py-12">
            <div className="text-white/60 mb-6">
              <Clock className="w-16 h-16 mx-auto mb-4" />
            </div>
            <h3 className="text-2xl font-medium text-white mb-3">No tienes diseños aún</h3>
            <p className="text-white/70 text-lg mb-6">¡Comienza creando tu primer diseño!</p>
            <button
              onClick={() => setActiveTab('templates')}
              className="px-6 py-3 rounded-xl font-medium text-white transition-all hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)'
              }}
            >
              Ver Plantillas
            </button>
          </div>
        )}
      </div>
    </div>
  );
};