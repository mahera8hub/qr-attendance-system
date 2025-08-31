import React, { useState, useEffect, useContext } from 'react';
import { facultyAPI } from '../services/api';
import { AuthContext } from '../context/AuthContext';

const FacultyDashboard = () => {
  const { user } = useContext(AuthContext);
  const [lectures, setLectures] = useState([]);
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form states for creating a new lecture
  const [showLectureForm, setShowLectureForm] = useState(false);
  const [subject, setSubject] = useState('');
  const [course, setCourse] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [room, setRoom] = useState('');
  
  // Report states
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportCourse, setReportCourse] = useState('');
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');
  const [reportData, setReportData] = useState(null);

  // Load lectures
  useEffect(() => {
    const fetchLectures = async () => {
      try {
        setLoading(true);
        const response = await facultyAPI.getLectures();
        setLectures(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching lectures:', err);
        setError('Failed to load lectures. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLectures();
  }, []);

  // Load attendance records for selected lecture
  useEffect(() => {
    const fetchAttendanceRecords = async () => {
      if (!selectedLecture) return;
      
      try {
        setLoading(true);
        const response = await facultyAPI.getLectureAttendance(selectedLecture._id);
        setAttendanceRecords(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching attendance records:', err);
        setError('Failed to load attendance records. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchAttendanceRecords();
  }, [selectedLecture]);

  // Create a new lecture
  const handleCreateLecture = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!subject || !course || !startTime || !endTime || !room) {
        setError('Please fill in all fields');
        setLoading(false);
        return;
      }
      
      // Create lecture
      const response = await facultyAPI.createLecture({
        subject,
        course,
        startTime,
        endTime,
        room,
      });
      
      // Add new lecture to state
      setLectures([response.data, ...lectures]);
      
      // Reset form
      setSubject('');
      setCourse('');
      setStartTime('');
      setEndTime('');
      setRoom('');
      setShowLectureForm(false);
      
      // Select the new lecture
      setSelectedLecture(response.data);
    } catch (err) {
      console.error('Error creating lecture:', err);
      setError(err.response?.data?.message || 'Failed to create lecture. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Expire a lecture QR code
  const handleExpireLecture = async (lectureId) => {
    try {
      setLoading(true);
      await facultyAPI.expireLecture(lectureId);
      
      // Update lectures state
      setLectures(lectures.map(lecture => {
        if (lecture._id === lectureId) {
          return { ...lecture, qrExpired: true };
        }
        return lecture;
      }));
      
      // Update selected lecture if it's the one being expired
      if (selectedLecture && selectedLecture._id === lectureId) {
        setSelectedLecture({ ...selectedLecture, qrExpired: true });
      }
    } catch (err) {
      console.error('Error expiring lecture:', err);
      setError('Failed to expire lecture QR code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate attendance report
  const handleGenerateReport = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      setError(null);
      
      // Validate form
      if (!reportCourse) {
        setError('Please select a course');
        setLoading(false);
        return;
      }
      
      // Get report data
      const response = await facultyAPI.getCourseReport(
        reportCourse,
        reportStartDate || undefined,
        reportEndDate || undefined
      );
      
      setReportData(response.data);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate attendance report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export attendance data as CSV
  const exportToCSV = (data, filename) => {
    // Create CSV content
    let csvContent = 'data:text/csv;charset=utf-8,';
    
    // Add headers
    csvContent += 'Student Name,Roll Number,Department,Attended Lectures,Total Lectures,Attendance Percentage\n';
    
    // Add rows
    data.students.forEach(student => {
      const row = [
        student.student.name,
        student.student.identifier,
        student.student.department,
        student.attendedLectures,
        student.totalLectures,
        `${student.percentage.toFixed(2)}%`
      ];
      csvContent += row.join(',') + '\n';
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    
    // Clean up
    document.body.removeChild(link);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Faculty Dashboard</h1>
      
      {/* Faculty Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Faculty Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600">Name:</p>
            <p className="font-medium">{user?.name}</p>
          </div>
          <div>
            <p className="text-gray-600">Faculty ID:</p>
            <p className="font-medium">{user?.identifier}</p>
          </div>
          <div>
            <p className="text-gray-600">Department:</p>
            <p className="font-medium">{user?.department}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lectures Section */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Lectures</h2>
            <button 
              onClick={() => setShowLectureForm(!showLectureForm)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
            >
              {showLectureForm ? 'Cancel' : 'Create New Lecture'}
            </button>
          </div>
          
          {/* Create Lecture Form */}
          {showLectureForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Create New Lecture</h3>
              <form onSubmit={handleCreateLecture}>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                    <input 
                      type="text" 
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                    <input 
                      type="text" 
                      value={course}
                      onChange={(e) => setCourse(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
                    <input 
                      type="text" 
                      value={room}
                      onChange={(e) => setRoom(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                    <input 
                      type="datetime-local" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                    <input 
                      type="datetime-local" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      required
                    />
                  </div>
                  <div>
                    <button 
                      type="submit"
                      disabled={loading}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                    >
                      {loading ? 'Creating...' : 'Create Lecture'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-4 bg-red-100 text-red-800 rounded-md">
              {error}
            </div>
          )}
          
          {/* Lectures List */}
          {loading && !lectures.length ? (
            <p>Loading lectures...</p>
          ) : lectures.length === 0 ? (
            <p>No lectures found. Create your first lecture!</p>
          ) : (
            <div className="overflow-y-auto max-h-96">
              <ul className="divide-y divide-gray-200">
                {lectures.map((lecture) => (
                  <li 
                    key={lecture._id} 
                    className={`py-4 cursor-pointer ${selectedLecture?._id === lecture._id ? 'bg-indigo-50' : ''}`}
                    onClick={() => setSelectedLecture(lecture)}
                  >
                    <div className="flex justify-between">
                      <div>
                        <h3 className="text-lg font-medium">{lecture.subject}</h3>
                        <p className="text-sm text-gray-500">{lecture.course}</p>
                        <p className="text-sm text-gray-500">Room: {lecture.room}</p>
                        <p className="text-sm text-gray-500">
                          {formatDate(lecture.startTime)} - {formatDate(lecture.endTime)}
                        </p>
                      </div>
                      <div className="flex flex-col justify-between items-end">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${new Date() > new Date(lecture.endTime) || lecture.qrExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                          {new Date() > new Date(lecture.endTime) ? 'Ended' : lecture.qrExpired ? 'QR Expired' : 'Active'}
                        </span>
                        {!lecture.qrExpired && new Date() <= new Date(lecture.endTime) && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExpireLecture(lecture._id);
                            }}
                            className="mt-2 text-xs bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded"
                          >
                            Expire QR
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        {/* QR Code and Attendance Section */}
        <div>
          {selectedLecture ? (
            <div className="bg-white shadow rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Lecture Details</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-gray-600">Subject:</p>
                  <p className="font-medium">{selectedLecture.subject}</p>
                </div>
                <div>
                  <p className="text-gray-600">Course:</p>
                  <p className="font-medium">{selectedLecture.course}</p>
                </div>
                <div>
                  <p className="text-gray-600">Room:</p>
                  <p className="font-medium">{selectedLecture.room}</p>
                </div>
                <div>
                  <p className="text-gray-600">Start Time:</p>
                  <p className="font-medium">{formatDate(selectedLecture.startTime)}</p>
                </div>
                <div>
                  <p className="text-gray-600">End Time:</p>
                  <p className="font-medium">{formatDate(selectedLecture.endTime)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status:</p>
                  <p className="font-medium">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${new Date() > new Date(selectedLecture.endTime) || selectedLecture.qrExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                      {new Date() > new Date(selectedLecture.endTime) ? 'Ended' : selectedLecture.qrExpired ? 'QR Expired' : 'Active'}
                    </span>
                  </p>
                </div>
              </div>
              
              {/* QR Code */}
              <div className="mb-6">
                <h3 className="text-lg font-medium mb-2">QR Code</h3>
                {selectedLecture.qrExpired || new Date() > new Date(selectedLecture.endTime) ? (
                  <div className="bg-red-100 text-red-800 p-4 rounded-md">
                    QR code has expired or lecture has ended.
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <img 
                      src={selectedLecture.qrCode} 
                      alt="QR Code" 
                      className="w-64 h-64 border border-gray-200 rounded-md"
                    />
                    <p className="mt-2 text-sm text-gray-500">
                      Show this QR code to students to mark attendance
                    </p>
                    <button 
                      onClick={() => handleExpireLecture(selectedLecture._id)}
                      className="mt-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded"
                    >
                      Expire QR Code
                    </button>
                  </div>
                )}
              </div>
              
              {/* Attendance Records */}
              <div>
                <h3 className="text-lg font-medium mb-2">Attendance Records</h3>
                {loading ? (
                  <p>Loading attendance records...</p>
                ) : attendanceRecords.length === 0 ? (
                  <p>No attendance records found for this lecture.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {attendanceRecords.map((record) => (
                          <tr key={record._id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {record.student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {record.student.identifier}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(record.timestamp)}
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
          ) : (
            <div className="bg-white shadow rounded-lg p-6 mb-8 flex items-center justify-center h-64">
              <p className="text-gray-500">Select a lecture to view details</p>
            </div>
          )}
          
          {/* Attendance Report Section */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Attendance Reports</h2>
              <button 
                onClick={() => setShowReportForm(!showReportForm)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
              >
                {showReportForm ? 'Cancel' : 'Generate Report'}
              </button>
            </div>
            
            {/* Report Form */}
            {showReportForm && (
              <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                <h3 className="text-lg font-medium mb-4">Generate Attendance Report</h3>
                <form onSubmit={handleGenerateReport}>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                      <input 
                        type="text" 
                        value={reportCourse}
                        onChange={(e) => setReportCourse(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date (Optional)</label>
                      <input 
                        type="date" 
                        value={reportStartDate}
                        onChange={(e) => setReportStartDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date (Optional)</label>
                      <input 
                        type="date" 
                        value={reportEndDate}
                        onChange={(e) => setReportEndDate(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      >
                        {loading ? 'Generating...' : 'Generate Report'}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Report Results */}
            {reportData && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Report: {reportData.course}</h3>
                  <button 
                    onClick={() => exportToCSV(reportData, `attendance_report_${reportData.course}`)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                  >
                    Export to CSV
                  </button>
                </div>
                
                <p className="mb-4">Total Lectures: {reportData.totalLectures}</p>
                
                {reportData.students.length === 0 ? (
                  <p>No attendance records found for this course.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll Number</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attendance</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {reportData.students.map((student, index) => (
                          <tr key={index}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {student.student.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.student.identifier}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.student.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {student.attendedLectures} / {student.totalLectures}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${student.percentage >= 75 ? 'bg-green-100 text-green-800' : student.percentage >= 60 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                                {student.percentage.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;