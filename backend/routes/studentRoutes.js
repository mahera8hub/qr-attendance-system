const express = require('express');
const {
  markAttendance,
  getAttendanceHistory,
  getAttendancePercentage,
} = require('../controllers/studentController');
const { protect, studentOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply middleware to all routes
router.use(protect, studentOnly);

// Mark attendance using QR code
router.post('/attendance', markAttendance);

// Get attendance history
router.get('/attendance', getAttendanceHistory);

// Get attendance percentage
router.get('/attendance/percentage', getAttendancePercentage);

module.exports = router;