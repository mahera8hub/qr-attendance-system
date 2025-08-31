const mongoose = require('mongoose');

const LectureSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: [true, 'Please provide subject name'],
    trim: true,
  },
  course: {
    type: String,
    required: [true, 'Please provide course name'],
    trim: true,
  },
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Please provide faculty ID'],
  },
  startTime: {
    type: Date,
    required: [true, 'Please provide lecture start time'],
  },
  endTime: {
    type: Date,
    required: [true, 'Please provide lecture end time'],
  },
  qrCode: {
    type: String,
    required: true,
  },
  qrExpired: {
    type: Boolean,
    default: false,
  },
  room: {
    type: String,
    required: [true, 'Please provide room number'],
  },
}, { timestamps: true });

// Virtual for checking if QR code is expired
LectureSchema.virtual('isExpired').get(function() {
  return this.qrExpired || new Date() > this.endTime;
});

module.exports = mongoose.model('Lecture', LectureSchema);