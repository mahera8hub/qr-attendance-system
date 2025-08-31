const express = require('express');
const {
  createLecture,
  getLectures,
  getLectureAttendance,
  getCourseAttendanceReport,
  expireLecture,
} = require('../controllers/facultyController');
const { protect, facultyOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply middleware to all routes
router.use(protect, facultyOnly);

// Create a new lecture with QR code
router.post('/lectures', createLecture);

// Get all lectures by faculty
router.get('/lectures', getLectures);

// Get attendance for a specific lecture
router.get('/lectures/:id/attendance', getLectureAttendance);

// Get attendance report for a course
router.get('/reports/course/:course', getCourseAttendanceReport);

// Mark a lecture as expired
router.put('/lectures/:id/expire', expireLecture);

module.exports = router;