import { useState, useEffect } from 'react';
import { Login } from './components/Login';
import { TemplateGallery } from './components/TemplateGallery';
import { DesignEditor } from './components/DesignEditor';
import { useAuthStore } from './store/authStore';
import { useDesignStore } from './store/designStore';

type AppView = 'login' | 'templates' | 'editor';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const { loadUserDesigns } = useDesignStore();

  // Initialize the app
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Load user designs when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadUserDesigns();
      setCurrentView('templates');
    }
  }, [isAuthenticated, loadUserDesigns]);

  const handleLoginSuccess = () => {
    setCurrentView('templates');
  };

  const handleCreateDesign = () => {
    setCurrentView('editor');
  };

  const handleBackToTemplates = () => {
    setCurrentView('templates');
  };

  if (!isAuthenticated) {
    return <Login onSuccess={handleLoginSuccess} />;
  }

  switch (currentView) {
    case 'templates':
      return <TemplateGallery onCreateDesign={handleCreateDesign} />;
    case 'editor':
      return <DesignEditor onBack={handleBackToTemplates} />;
    default:
      return <Login onSuccess={handleLoginSuccess} />;
  }
}

export default App
