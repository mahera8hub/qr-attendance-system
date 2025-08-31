const Lecture = require('../models/Lecture');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { generateQRCode } = require('../utils/qr');

// @desc    Generate QR code for a lecture
// @route   POST /api/faculty/lectures
// @access  Private/Faculty
const createLecture = async (req, res) => {
  try {
    const { subject, course, startTime, endTime, room } = req.body;

    // Create a new lecture
    const lecture = new Lecture({
      subject,
      course,
      faculty: req.user._id,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      room,
      qrCode: '', // Placeholder, will be updated after creation
    });

    // Generate QR code with lecture data
    const qrCodeImage = await generateQRCode(lecture);
    lecture.qrCode = qrCodeImage;

    // Save lecture with QR code
    await lecture.save();

    res.status(201).json({
      _id: lecture._id,
      subject: lecture.subject,
      course: lecture.course,
      startTime: lecture.startTime,
      endTime: lecture.endTime,
      room: lecture.room,
      qrCode: lecture.qrCode,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all lectures by faculty
// @route   GET /api/faculty/lectures
// @access  Private/Faculty
const getLectures = async (req, res) => {
  try {
    const lectures = await Lecture.find({ faculty: req.user._id })
      .sort({ startTime: -1 });

    res.json(lectures);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get attendance for a specific lecture
// @route   GET /api/faculty/lectures/:id/attendance
// @access  Private/Faculty
const getLectureAttendance = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Check if faculty owns this lecture
    if (lecture.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Get attendance records for this lecture
    const attendanceRecords = await Attendance.find({ lecture: req.params.id })
      .populate('student', 'name identifier department');

    res.json(attendanceRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get attendance report for a course
// @route   GET /api/faculty/reports/course/:course
// @access  Private/Faculty
const getCourseAttendanceReport = async (req, res) => {
  try {
    const { course } = req.params;
    const { startDate, endDate } = req.query;

    // Find all lectures for this course by this faculty
    const query = {
      faculty: req.user._id,
      course,
    };

    // Add date range if provided
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const lectures = await Lecture.find(query);
    const lectureIds = lectures.map(lecture => lecture._id);

    // Get all students who attended these lectures
    const attendanceRecords = await Attendance.find({
      lecture: { $in: lectureIds },
    }).populate('student', 'name identifier department');

    // Group attendance by student
    const studentAttendance = {};
    attendanceRecords.forEach(record => {
      const studentId = record.student._id.toString();
      if (!studentAttendance[studentId]) {
        studentAttendance[studentId] = {
          student: record.student,
          attendedLectures: 0,
          totalLectures: lectures.length,
          percentage: 0,
        };
      }
      studentAttendance[studentId].attendedLectures += 1;
    });

    // Calculate attendance percentage
    Object.values(studentAttendance).forEach(record => {
      record.percentage = (record.attendedLectures / record.totalLectures) * 100;
    });

    res.json({
      course,
      totalLectures: lectures.length,
      students: Object.values(studentAttendance),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Mark a lecture as expired
// @route   PUT /api/faculty/lectures/:id/expire
// @access  Private/Faculty
const expireLecture = async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    // Check if faculty owns this lecture
    if (lecture.faculty.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    lecture.qrExpired = true;
    await lecture.save();

    res.json({ message: 'Lecture QR code expired successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createLecture,
  getLectures,
  getLectureAttendance,
  getCourseAttendanceReport,
  expireLecture,
};