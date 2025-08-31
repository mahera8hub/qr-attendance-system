const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { name, role, identifier, password, department, semester, course } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ identifier });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user with base fields
    const userData = {
      name,
      role,
      identifier,
      password,
      department,
    };
    
    // Add student-specific fields if role is student
    if (role === 'student') {
      if (!semester || !course) {
        return res.status(400).json({ message: 'Semester and course are required for students' });
      }
      userData.semester = semester;
      userData.course = course;
    }
    
    const user = await User.create(userData);

    if (user) {
      // Create response object with base fields
      const responseData = {
        _id: user._id,
        name: user.name,
        role: user.role,
        identifier: user.identifier,
        department: user.department,
        token: generateToken(user._id),
      };
      
      // Add student-specific fields if role is student
      if (user.role === 'student') {
        responseData.semester = user.semester;
        responseData.course = user.course;
      }
      
      res.status(201).json(responseData);
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    // Check for user
    const user = await User.findOne({ identifier });

    if (user && (await user.comparePassword(password))) {
      // Create response object with base fields
      const responseData = {
        _id: user._id,
        name: user.name,
        role: user.role,
        identifier: user.identifier,
        department: user.department,
        token: generateToken(user._id),
      };
      
      // Add student-specific fields if role is student
      if (user.role === 'student') {
        responseData.semester = user.semester;
        responseData.course = user.course;
      }
      
      res.json(responseData);
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Create response object with base fields
      const responseData = {
        _id: user._id,
        name: user.name,
        role: user.role,
        identifier: user.identifier,
        department: user.department,
      };
      
      // Add student-specific fields if role is student
      if (user.role === 'student') {
        responseData.semester = user.semester;
        responseData.course = user.course;
      }
      
      res.json(responseData);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
};