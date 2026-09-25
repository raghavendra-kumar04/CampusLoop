import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import BottomNavbar from './components/BottomNavbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Marketplace from './pages/Marketplace';
import ItemDetails from './pages/ItemDetails';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import CreateListing from './pages/CreateListing';
import Auth from './pages/Auth';
import Notifications from './pages/Notifications';
import Review from './pages/Review';
import AIAssistant from './components/AIAssistant';

const Background3D = React.lazy(() => import('./components/Background3D'));

// Protected Route Guard
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <span className="material-symbols-outlined text-[48px] text-primary animate-spin">sync</span>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#1b1b24',
            color: '#ffffff',
            borderRadius: '0.85rem',
            border: '1px solid rgba(199, 196, 216, 0.2)',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            fontSize: '14px',
            fontFamily: 'Plus Jakarta Sans, sans-serif'
          }
        }}
      />
      <div className="min-h-screen bg-background text-on-background flex flex-col font-sans select-none pb-16 md:pb-0 relative">
        <React.Suspense fallback={null}>
          <Background3D />
        </React.Suspense>
        <Navbar />
        
        <main className="flex-1 relative z-10">
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/marketplace" element={<Marketplace />} />
            <Route path="/item/:id" element={<ItemDetails />} />
            <Route path="/auth" element={<Auth />} />

            {/* Protected routes */}
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Chat />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile/:id"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/sell"
              element={
                <ProtectedRoute>
                  <CreateListing />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notifications"
              element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              }
            />
            <Route
              path="/review/:sellerId"
              element={
                <ProtectedRoute>
                  <Review />
                </ProtectedRoute>
              }
            />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        
        <Footer />
        <BottomNavbar />
        <AIAssistant />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <NotificationProvider>
          <AppContent />
        </NotificationProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
