import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Navbar from './components/common/Navbar/Navbar';
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
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/flocks" element={<FlockList />} />
              <Route path="/flocks/new" element={<FlockForm />} />
              <Route path="/flocks/:id/edit" element={<FlockForm />} />
              <Route path="/recommendations" element={<RecommendationForm />} />
              <Route path="/progress" element={<Progress />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </main>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
