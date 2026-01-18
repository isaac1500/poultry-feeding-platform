import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './components/common/authcontext.jsx';
import Navbar from './components/common/Navbar/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import FlockList from './pages/Flocks/FlockList';
import FlockForm from './pages/Flocks/FlockForm';
import RecommendationForm from './pages/Recommendations/RecommendationForm';
import Progress from './pages/Tracking/Progress';
import Settings from './pages/Settings/Settings';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="App">
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
                  <RecommendationForm />
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
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;