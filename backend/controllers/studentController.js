const Lecture = require('../models/Lecture');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const { verifyQRCode } = require('../utils/qr');

// @desc    Mark attendance using QR code
// @route   POST /api/student/attendance
// @access  Private/Student
const markAttendance = async (req, res) => {
  try {
    const { qrData } = req.body;
    
    // Parse QR data
    let lectureData;
    try {
      lectureData = JSON.parse(qrData);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid QR code' });
    }
    
    // Verify QR code
    if (!verifyQRCode(lectureData)) {
      return res.status(400).json({ message: 'QR code is expired or invalid' });
    }
    
    // Get lecture from database
    const lecture = await Lecture.findById(lectureData.lectureId);
    
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }
    
    // Check if lecture is expired
    if (lecture.qrExpired || new Date() > lecture.endTime) {
      return res.status(400).json({ message: 'Lecture has ended or QR code is expired' });
    }
    
    // Check if student already marked attendance
    const existingAttendance = await Attendance.findOne({
      lecture: lecture._id,
      student: req.user._id,
    });
    
    if (existingAttendance) {
      return res.status(400).json({ message: 'Attendance already marked for this lecture' });
    }
    
    // Determine if student is late
    const now = new Date();
    const lateThreshold = new Date(lecture.startTime);
    lateThreshold.setMinutes(lateThreshold.getMinutes() + 15); // 15 minutes grace period
    
    const status = now > lateThreshold ? 'late' : 'present';
    
    // Create attendance record
    const attendance = await Attendance.create({
      lecture: lecture._id,
      student: req.user._id,
      timestamp: now,
      status,
    });
    
    res.status(201).json({
      message: `Attendance marked successfully as ${status}`,
      attendance,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's attendance history
// @route   GET /api/student/attendance
// @access  Private/Student
const getAttendanceHistory = async (req, res) => {
  try {
    const { startDate, endDate, course, subject } = req.query;
    
    // Build query
    const query = { student: req.user._id };
    
    // Get attendance records
    const attendanceRecords = await Attendance.find(query)
      .populate({
        path: 'lecture',
        select: 'subject course startTime endTime room faculty',
        populate: {
          path: 'faculty',
          select: 'name',
        },
      })
      .sort({ 'lecture.startTime': -1 });
    
    // Filter by date if provided
    let filteredRecords = attendanceRecords;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filteredRecords = attendanceRecords.filter(record => {
        const lectureDate = new Date(record.lecture.startTime);
        return lectureDate >= start && lectureDate <= end;
      });
    }
    
    // Filter by course if provided
    if (course) {
      filteredRecords = filteredRecords.filter(record => 
        record.lecture.course.toLowerCase() === course.toLowerCase()
      );
    }
    
    // Filter by subject if provided
    if (subject) {
      filteredRecords = filteredRecords.filter(record => 
        record.lecture.subject.toLowerCase() === subject.toLowerCase()
      );
    }
    
    res.json(filteredRecords);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get student's attendance percentage
// @route   GET /api/student/attendance/percentage
// @access  Private/Student
const getAttendancePercentage = async (req, res) => {
  try {
    // Get all attendance records for this student
    const attendanceRecords = await Attendance.find({ student: req.user._id })
      .populate('lecture', 'subject course');
    
    // Get all courses the student has attended
    const courses = {};
    attendanceRecords.forEach(record => {
      const course = record.lecture.course;
      const subject = record.lecture.subject;
      
      if (!courses[course]) {
        courses[course] = {
          course,
          subjects: {},
          totalAttended: 0,
          totalLectures: 0,
          percentage: 0,
        };
      }
      
      if (!courses[course].subjects[subject]) {
        courses[course].subjects[subject] = {
          subject,
          attended: 0,
          total: 0,
          percentage: 0,
        };
      }
      
      courses[course].subjects[subject].attended += 1;
      courses[course].totalAttended += 1;
    });
    
    // Get total lectures for each course and subject
    const allLectures = await Lecture.find({
      endTime: { $lt: new Date() }, // Only count past lectures
    }).select('course subject');
    
    allLectures.forEach(lecture => {
      const course = lecture.course;
      const subject = lecture.subject;
      
      if (courses[course]) {
        courses[course].totalLectures += 1;
        
        if (courses[course].subjects[subject]) {
          courses[course].subjects[subject].total += 1;
        }
      }
    });
    
    // Calculate percentages
    Object.values(courses).forEach(course => {
      course.percentage = (course.totalAttended / course.totalLectures) * 100 || 0;
      
      Object.values(course.subjects).forEach(subject => {
        subject.percentage = (subject.attended / subject.total) * 100 || 0;
      });
      
      // Convert subjects object to array
      course.subjects = Object.values(course.subjects);
    });
    
    // Calculate overall percentage
    const overallAttended = attendanceRecords.length;
    const overallTotal = allLectures.length;
    const overallPercentage = (overallAttended / overallTotal) * 100 || 0;
    
    res.json({
      overall: {
        attended: overallAttended,
        total: overallTotal,
        percentage: overallPercentage,
      },
      courses: Object.values(courses),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  markAttendance,
  getAttendanceHistory,
  getAttendancePercentage,
};