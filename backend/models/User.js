const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide name'],
    trim: true,
  },
  role: {
    type: String,
    enum: ['student', 'faculty'],
    required: [true, 'Please specify role'],
  },
  // Either rollNo for students or facultyId for faculty
  identifier: {
    type: String,
    required: [true, 'Please provide roll number or faculty ID'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide password'],
    minlength: 6,
  },
  department: {
    type: String,
    required: [true, 'Please provide department'],
    trim: true,
  },
  // Student-specific fields
  semester: {
    type: String,
    required: function() { return this.role === 'student'; },
    trim: true,
  },
  course: {
    type: String,
    required: function() { return this.role === 'student'; },
    trim: true,
  },
}, { timestamps: true });

// Hash password before saving
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);