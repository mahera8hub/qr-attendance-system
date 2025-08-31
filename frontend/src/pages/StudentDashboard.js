import React, { useState, useEffect, useContext } from 'react';
import { studentAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';

const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [attendanceData, setAttendanceData] = useState(null);
  const [attendanceHistory, setAttendanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  
  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  // Load attendance data
  useEffect(() => {
    const fetchAttendanceData = async () => {
      try {
        setLoading(true);
        const response = await studentAPI.getAttendancePercentage();
        setAttendanceData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching attendance data:', err);
        setError('Failed to load attendance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceData();
  }, [scanSuccess]); // Reload when attendance is marked successfully

  // Load attendance history with filters
  useEffect(() => {
    const fetchAttendanceHistory = async () => {
      try {
        setLoading(true);
        const filters = {};
        if (startDate) filters.startDate = startDate;
        if (endDate) filters.endDate = endDate;
        if (courseFilter) filters.course = courseFilter;
        if (subjectFilter) filters.subject = subjectFilter;
        
        const response = await studentAPI.getAttendanceHistory(filters);
        setAttendanceHistory(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching attendance history:', err);
        setError('Failed to load attendance history. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceHistory();
  }, [startDate, endDate, courseFilter, subjectFilter, scanSuccess]);

  // Handle QR scan success
  const handleScanSuccess = async (decodedText) => {
    try {
      setScanResult({ status: 'processing', message: 'Processing QR code...' });
      
      // Mark attendance with scanned QR data
      const response = await studentAPI.markAttendance(decodedText);
      
      setScanResult({
        status: 'success',
        message: response.data.message,
      });
      setScanSuccess(true);
      setScannerOpen(false);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setScanResult({
        status: 'error',
        message: err.response?.data?.message || 'Failed to mark attendance. Please try again.',
      });
    }
  };

  // Handle QR scan error
  const handleScanError = (error) => {
    // Only set error for critical failures, not for normal scanning process
    if (error.toString().includes('starting') || error.toString().includes('initializing')) {
      setScanResult({
        status: 'error',
        message: `Scanner error: ${error}`,
      });
    }
  };

  // Reset scan state
  const resetScan = () => {
    setScanResult(null);
    setScanSuccess(false);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Student Dashboard</h1>
      
      {/* Student Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Student Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name:</p>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Roll Number:</p>
            <p className="font-medium">{user?.identifier}</p>
          </div>
          <div>
            <p className="text-gray-600">Department:</p>
            <p className="font-medium">{user?.department}</p>
          </div>
        </div>
      </div>
      
      {/* Attendance Scanner */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Mark Attendance</h2>
        
        {scannerOpen ? (
          <div className="mb-4">
            <QRScanner 
              onScanSuccess={handleScanSuccess} 
              onScanError={handleScanError} 
            />
            <button 
              onClick={() => setScannerOpen(false)}
              className="mt-4 bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
            >
              Close Scanner
            </button>
          </div>
        ) : (
          <button 
            onClick={() => {
              setScannerOpen(true);
              resetScan();
            }}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
          >
            Open QR Scanner
          </button>
        )}
        
        {scanResult && (
          <div className={`mt-4 p-4 rounded ${scanResult.status === 'success' ? 'bg-green-100 text-green-800' : scanResult.status === 'error' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {scanResult.message}
          </div>
        )}
      </div>
      
      {/* Attendance Percentage */}
      {attendanceData && (
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Attendance Overview</h2>
          
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Overall Attendance</h3>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div 
                className={`h-4 rounded-full ${attendanceData.overall.percentage >= 75 ? 'bg-green-500' : attendanceData.overall.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, attendanceData.overall.percentage)}%` }}
              ></div>
            </div>
            <p className="mt-2">
              <span className="font-medium">{attendanceData.overall.percentage.toFixed(1)}%</span> 
              ({attendanceData.overall.attended} out of {attendanceData.overall.total} lectures)
            </p>
          </div>
          
          <h3 className="text-lg font-medium mb-4">Course-wise Attendance</h3>
          
          {attendanceData.courses.map((course, index) => (
            <div key={index} className="mb-6">
              <h4 className="font-medium mb-2">{course.course}</h4>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div 
                  className={`h-4 rounded-full ${course.percentage >= 75 ? 'bg-green-500' : course.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(100, course.percentage)}%` }}
                ></div>
              </div>
              <p className="mb-4">
                <span className="font-medium">{course.percentage.toFixed(1)}%</span>
              </p>
              
              <div className="pl-4 border-l-2 border-gray-200">
                <h5 className="font-medium mb-2">Subject-wise Breakdown</h5>
                {course.subjects.map((subject, subIndex) => (
                  <div key={subIndex} className="mb-2">
                    <p className="text-sm">{subject.subject}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div 
                        className={`h-2 rounded-full ${subject.percentage >= 75 ? 'bg-green-500' : subject.percentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`}
                        style={{ width: `${Math.min(100, subject.percentage)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs">
                      <span className="font-medium">{subject.percentage.toFixed(1)}%</span> 
                      ({subject.attended} out of {subject.total})
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Attendance History */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Attendance History</h2>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <input 
              type="text" 
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              placeholder="Filter by course"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input 
              type="text" 
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              placeholder="Filter by subject"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        
        {/* History Table */}
        {loading ? (
          <p>Loading attendance history...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : attendanceHistory.length === 0 ? (
          <p>No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Faculty</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {attendanceHistory.map((record, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.timestamp)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.lecture.course}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.lecture.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {record.lecture.faculty.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${record.status === 'present' ? 'bg-green-100 text-green-800' : record.status === 'late' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;