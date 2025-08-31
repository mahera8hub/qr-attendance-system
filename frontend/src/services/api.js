import axios from 'axios';

// Set base URL for API requests
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Add token to requests if available
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// API service for authentication
export const authAPI = {
  login: (identifier, password) => axios.post('/api/auth/login', { identifier, password }),
  register: (userData) => axios.post('/api/auth/register', userData),
  getProfile: () => axios.get('/api/auth/profile'),
};

// API service for faculty
export const facultyAPI = {
  createLecture: (lectureData) => axios.post('/api/faculty/lectures', lectureData),
  getLectures: () => axios.get('/api/faculty/lectures'),
  getLectureAttendance: (lectureId) => axios.get(`/api/faculty/lectures/${lectureId}/attendance`),
  getCourseReport: (course, startDate, endDate) => {
    let url = `/api/faculty/reports/course/${course}`;
    if (startDate && endDate) {
      url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return axios.get(url);
  },
  expireLecture: (lectureId) => axios.put(`/api/faculty/lectures/${lectureId}/expire`),
};

// API service for student
export const studentAPI = {
  markAttendance: (qrData) => axios.post('/api/student/attendance', { qrData }),
  getAttendanceHistory: (filters = {}) => {
    const { startDate, endDate, course, subject } = filters;
    let url = '/api/student/attendance';
    
    // Add query parameters if provided
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    if (course) params.append('course', course);
    if (subject) params.append('subject', subject);
    
    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
    
    return axios.get(url);
  },
  getAttendancePercentage: () => axios.get('/api/student/attendance/percentage'),
};