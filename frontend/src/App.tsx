import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './components/Login';
import { TemplateGallery } from './components/TemplateGallery';
import { DesignEditor } from './components/DesignEditor';
import { useAuthStore } from './store/authStore';
import { useDesignStore } from './store/designStore';

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuthStore();
  
  // console.log('ProtectedRoute: loading=', loading, 'isAuthenticated=', isAuthenticated);
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/80 text-lg">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // console.log('ProtectedRoute: Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // console.log('ProtectedRoute: Authenticated, rendering children');
  return <>{children}</>;
};

function App() {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const { loadUserDesigns, loadTemplates } = useDesignStore();

  // Initialize the app
  useEffect(() => {
    console.log('App useEffect: Initializing auth');
    initializeAuth();
  }, []); // ⬅️ QUITAR DEPENDENCIA

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log('App useEffect: User authenticated, loading data');
      loadUserDesigns();
      loadTemplates();
    }
  }, [isAuthenticated]); // ⬅️ SOLO isAuthenticated

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
          } 
        />
        
        {/* Protected routes */}
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <TemplateGallery />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/editor/:designId?" 
          element={
            <ProtectedRoute>
              <DesignEditor />
            </ProtectedRoute>
          } 
        />
        
        {/* Default redirects */}
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } 
        />
        
        {/* Catch all route */}
        <Route 
          path="*" 
          element={
            <ProtectedRoute>
              <Navigate to="/dashboard" replace />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;