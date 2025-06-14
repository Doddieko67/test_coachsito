import { useState } from 'react';
import { Login } from './components/Login';
import { TemplateGallery } from './components/TemplateGallery';
import { DesignEditor } from './components/DesignEditor';
import { useAuthStore } from './store/authStore';

type AppView = 'login' | 'templates' | 'editor';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('login');
  const { isAuthenticated } = useAuthStore();

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
