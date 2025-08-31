import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import './index.css';

// Protected route component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = React.useContext(AuthContext);
  
  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has allowed role
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard based on role
    if (user.role === 'student') {
      return <Navigate to="/student" replace />;
    } else if (user.role === 'faculty') {
      return <Navigate to="/faculty" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route 
              path="/student" 
              element={
                <ProtectedRoute allowedRoles={['student']}>
                  <StudentDashboard />
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/faculty" 
              element={
                <ProtectedRoute allowedRoles={['faculty']}>
                  <FacultyDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Redirect to login by default */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;