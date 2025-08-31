import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register, error: authError, loading } = useContext(AuthContext);
  
  // Form state
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [course, setCourse] = useState('');
  const [error, setError] = useState('');
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error
    setError('');
    
    // Validate form
    if (!name || !identifier || !password || !confirmPassword || !department) {
      setError('Please fill in all fields');
      return;
    }
    
    // Validate student-specific fields
    if (role === 'student' && (!semester || !course)) {
      setError('Please fill in all student-specific fields');
      return;
    }
    
    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      // Register user
      const userData = {
        name,
        identifier,
        password,
        role,
        department
      };
      
      // Add student-specific fields
      if (role === 'student') {
        userData.semester = semester;
        userData.course = course;
      }
      
      await register(userData);
      
      // Redirect based on role
      if (role === 'student') {
        navigate('/student');
      } else {
        navigate('/faculty');
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    }
  };
  
  // List of departments
  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics',
    'Mechanical',
    'Civil',
    'Electrical',
    'Chemical',
    'Biotechnology',
    'Physics',
    'Mathematics',
    'Chemistry',
    'Other'
  ];
  
  // List of semesters
  const semesters = [
    '1st Semester',
    '2nd Semester',
    '3rd Semester',
    '4th Semester',
    '5th Semester',
    '6th Semester',
    '7th Semester',
    '8th Semester'
  ];
  
  // List of courses
  const courses = [
    'B.Tech',
    'M.Tech',
    'BCA',
    'MCA',
    'B.Sc',
    'M.Sc',
    'Ph.D',
    'Other'
  ];
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-md">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
              sign in to your account
            </Link>
          </p>
        </div>
        
        {/* Role Selection */}
        <div className="flex justify-center space-x-4 mt-4">
          <div className="flex items-center">
            <input
              id="student-role"
              name="role-selection"
              type="radio"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              checked={role === 'student'}
              onChange={() => setRole('student')}
            />
            <label htmlFor="student-role" className="ml-2 block text-sm text-gray-900">
              Student
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="faculty-role"
              name="role-selection"
              type="radio"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
              checked={role === 'faculty'}
              onChange={() => setRole('faculty')}
            />
            <label htmlFor="faculty-role" className="ml-2 block text-sm text-gray-900">
              Faculty
            </label>
          </div>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* Display errors */}
          {(error || authError) && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{error || authError}</span>
            </div>
          )}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="name" className="sr-only">Full Name</label>
              <input
                id="name"
                name="name"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="identifier" className="sr-only">
                {role === 'student' ? 'Roll Number' : 'Faculty ID'}
              </label>
              <input
                id="identifier"
                name="identifier"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder={role === 'student' ? 'Roll Number' : 'Faculty ID'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
            
            {/* Role selection moved to radio buttons above */}
            
            <div className="mb-4">
              <label htmlFor="department" className="sr-only">Department</label>
              <select
                id="department"
                name="department"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">Select Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            {/* Student-specific fields */}
            {role === 'student' && (
              <>
                <div className="mb-4">
                  <label htmlFor="course" className="sr-only">Course</label>
                  <select
                    id="course"
                    name="course"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                  >
                    <option value="">Select Course</option>
                    {courses.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label htmlFor="semester" className="sr-only">Semester</label>
                  <select
                    id="semester"
                    name="semester"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    <option value="">Select Semester</option>
                    {semesters.map((sem) => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
            
            {/* Faculty-specific fields can be added here if needed */}
            
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            
            <div>
              <label htmlFor="confirm-password" className="sr-only">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;