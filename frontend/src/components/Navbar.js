import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated, isStudent, isFaculty } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-xl">QR Attendance</span>
            </Link>
          </div>
          
          <div className="flex items-center">
            {isAuthenticated ? (
              <>
                <span className="mr-4">
                  Welcome, {user.name} ({user.role})
                </span>
                
                {isStudent && (
                  <Link 
                    to="/student/dashboard" 
                    className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium mr-2"
                  >
                    Dashboard
                  </Link>
                )}
                
                {isFaculty && (
                  <Link 
                    to="/faculty/dashboard" 
                    className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium mr-2"
                  >
                    Dashboard
                  </Link>
                )}
                
                <button
                  onClick={handleLogout}
                  className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-md text-sm font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link 
                  to="/login" 
                  className="text-white hover:bg-indigo-500 px-3 py-2 rounded-md text-sm font-medium mr-2"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-white text-indigo-600 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;