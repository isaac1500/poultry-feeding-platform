// frontend/src/App.jsx - COMPLETE WITH PWA & I18N COMPONENTS
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next'; // ADD THIS
import i18n from './i18n/i18n'; // ADD THIS
import { AuthProvider } from "./contexts/AuthContext.jsx";
import Navbar from './components/common/Navbar/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import NetworkStatus from './components/common/NetworkStatus';
import InstallPrompt from './components/common/InstallPrompt';
import LanguageSwitcher from './components/common/LanguageSwitcher'; // NEW COMPONENT
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import FlockList from './pages/Flocks/FlockList';
import FlockForm from './pages/Flocks/FlockForm';
import RecommendationList from './pages/Recommendations/RecommendationList';
import RecommendationForm from './pages/Recommendations/RecommendationForm';
import RecommendationDetail from './pages/Recommendations/RecommendationDetail';
import Progress from './pages/Tracking/Progress';
import Settings from './pages/Settings/Settings';

import './App.css';

function App() {
  return (
    <I18nextProvider i18n={i18n}> {/* WRAP EVERYTHING WITH I18N PROVIDER */}
      <Router>
        <AuthProvider>
          <div className="App">
            {/* PWA Components */}
            <NetworkStatus />
            <InstallPrompt />
            <LanguageSwitcher /> {/* ADD LANGUAGE SWITCHER */}
            
            <Navbar />
            <main className="container">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* Protected Routes */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/flocks" element={
                  <ProtectedRoute>
                    <FlockList />
                  </ProtectedRoute>
                } />
                
                <Route path="/flocks/new" element={
                  <ProtectedRoute>
                    <FlockForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/flocks/:id/edit" element={
                  <ProtectedRoute>
                    <FlockForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/recommendations" element={
                  <ProtectedRoute>
                    <RecommendationList />
                  </ProtectedRoute>
                } />
                
                <Route path="/recommendations/new" element={
                  <ProtectedRoute>
                    <RecommendationForm />
                  </ProtectedRoute>
                } />
                
                <Route path="/recommendations/:id" element={
                  <ProtectedRoute>
                    <RecommendationDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/progress" element={
                  <ProtectedRoute>
                    <Progress />
                  </ProtectedRoute>
                } />
                
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } />
                
                {/* 404 Route */}
                <Route path="*" element={
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <h1>404 - Page Not Found</h1>
                    <p>The page you're looking for doesn't exist.</p>
                    <a href="/dashboard" style={{ color: '#3498db' }}>Go to Dashboard</a>
                  </div>
                } />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </I18nextProvider>
  );
}

export default App;