const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  lecture: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lecture',
    required: [true, 'Please provide lecture ID'],
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide student ID'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    default: 'present',
  },
}, { timestamps: true });

// Compound index to ensure a student can only mark attendance once per lecture
AttendanceSchema.index({ lecture: 1, student: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);