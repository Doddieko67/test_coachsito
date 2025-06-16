import React, { useState } from 'react';
import { Save, ArrowLeft, Users, MessageSquare, Type, Square, Circle, Image, Download } from 'lucide-react';
import { useDesignStore } from '../store/designStore';
import { useAuthStore } from '../store/authStore';
import { ChatPanel } from './ChatPanel';
import { DesignCanvas } from './DesignCanvas';
import { FileDropzone } from './FileDropzone';

interface DesignEditorProps {
  onBack: () => void;
}

export const DesignEditor: React.FC<DesignEditorProps> = ({ onBack }) => {
  const [isChatOpen, setIsChatOpen] = useState(true);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const { currentDesign, saveDesign, updateDesign, uploadFile } = useDesignStore();
  const { user } = useAuthStore();

  const handleSave = () => {
    if (currentDesign) {
      saveDesign(currentDesign);
    }
  };

  const handleNameChange = (newName: string) => {
    if (currentDesign) {
      updateDesign({ name: newName });
    }
  };

  const handleFileUpload = async (files: File[]) => {
    for (const file of files) {
      try {
        const fileUrl = await uploadFile(file);
        
        // Add image element to canvas
        const newElement = {
          id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'image',
          content: fileUrl,
          x: 100,
          y: 100,
          width: 200,
          height: 150,
          rotation: 0,
          style: {}
        };

        if (currentDesign) {
          updateDesign({ 
            elements: [...(currentDesign.elements || []), newElement] 
          });
        }
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    setShowFileUpload(false);
  };

  if (!currentDesign) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No hay diseño seleccionado</h2>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold"
          >
            Volver a Plantillas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-white/30 backdrop-blur-xl border-b border-white/20 flex-shrink-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700" />
              </button>
              
              <input
                type="text"
                value={currentDesign.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="text-lg font-semibold bg-transparent border-none focus:outline-none focus:bg-white/20 rounded-lg px-2 py-1 text-gray-800 min-w-0"
              />
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setIsChatOpen(!isChatOpen)}
                className={`p-2 rounded-lg transition-all ${
                  isChatOpen 
                    ? 'bg-purple-500 text-white' 
                    : 'hover:bg-white/20 text-gray-700'
                }`}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
              
              <div className="flex items-center space-x-1 bg-white/20 rounded-lg px-2 py-1">
                <Users className="w-4 h-4 text-gray-600" />
                <img
                  src={user?.avatar}
                  alt={user?.name}
                  className="w-6 h-6 rounded-full"
                />
              </div>

              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-purple-500 to-cyan-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Design Canvas Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Toolbar */}
          <div className="bg-white/20 backdrop-blur-sm border-b border-white/20 px-4 py-2 flex-shrink-0">
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 bg-white/30 rounded-lg p-1">
                <button className="p-2 hover:bg-white/30 rounded-md transition-all">
                  <Type className="w-4 h-4 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-white/30 rounded-md transition-all">
                  <Square className="w-4 h-4 text-gray-700" />
                </button>
                <button className="p-2 hover:bg-white/30 rounded-md transition-all">
                  <Circle className="w-4 h-4 text-gray-700" />
                </button>
                <button 
                  onClick={() => setShowFileUpload(true)}
                  className="p-2 hover:bg-white/30 rounded-md transition-all"
                  title="Subir imagen"
                >
                  <Image className="w-4 h-4 text-gray-700" />
                </button>
              </div>
              
              <div className="flex-1" />
              
              <button className="p-2 hover:bg-white/30 rounded-lg transition-all text-gray-700">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 p-4 overflow-auto">
            <DesignCanvas design={currentDesign} />
          </div>
        </div>

        {/* Chat Panel */}
        {isChatOpen && (
          <div className="w-80 bg-white/30 backdrop-blur-xl border-l border-white/20 flex-shrink-0">
            <ChatPanel designId={currentDesign.id} />
          </div>
        )}
      </div>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 max-w-[90vw] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Subir Imágenes</h3>
              <button
                onClick={() => setShowFileUpload(false)}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>
            
            <FileDropzone
              onFileUpload={handleFileUpload}
              accept="image/*"
              multiple={true}
              className="mb-4"
            />
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowFileUpload(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};