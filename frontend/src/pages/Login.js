import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState('');
  
  const { login, error, loading, isAuthenticated, isStudent, isFaculty } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect if already logged in
    if (isAuthenticated) {
      if (isStudent) {
        navigate('/student/dashboard');
      } else if (isFaculty) {
        navigate('/faculty/dashboard');
      }
    }
  }, [isAuthenticated, isStudent, isFaculty, navigate]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    
    // Validate form
    if (!identifier || !password) {
      setFormError('Please enter both ID and password');
      return;
    }
    
    // Attempt login
    const success = await login(identifier, password);
    
    if (success) {
      // Redirect based on role (handled by useEffect)
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {(error || formError) && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-red-700">{error || formError}</p>
              </div>
            )}
            
            <div>
              <label htmlFor="identifier" className="block text-sm font-medium text-gray-700">
                Roll Number / Faculty ID
              </label>
              <div className="mt-1">
                <input
                  id="identifier"
                  name="identifier"
                  type="text"
                  autoComplete="username"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;