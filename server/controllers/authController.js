const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { getEnv } = require('../config/env');

const generateToken = (userId) => {
  return jwt.sign({ userId }, getEnv('JWT_SECRET'), {
    expiresIn: '24h'
  });
};

const register = async (req, res) => {
  try {
    console.log('Registration attempt:', { body: req.body });
    
    const { username, email, password } = req.body;

    // Validate input
    if (!username || !email || !password) {
      console.log('Missing required fields:', { username, email, password: !!password });
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      console.log('User already exists:', { email, username });
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ 
      username, 
      email, 
      password 
    });

    console.log('Saving new user...');
    await user.save();
    console.log('User saved successfully');

    const token = generateToken(user._id);

    console.log('Registration successful for user:', { id: user._id, email });
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Registration error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      code: error.code,
      keyPattern: error.keyPattern,
      keyValue: error.keyValue
    });
    
    // Check for specific MongoDB errors
    if (error.name === 'MongoError') {
      console.error('MongoDB error code:', error.code);
      if (error.code === 11000) {
        return res.status(400).json({ 
          message: 'User with this email or username already exists',
          error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
      }
    }
    
    res.status(500).json({ 
      message: 'Server error during registration',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

const login = async (req, res) => {
  try {
    console.log('Login attempt:', { email: req.body.email });
    
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      console.log('Missing credentials:', { email: !!email, password: !!password });
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Invalid password for user:', email);
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Login error:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    res.status(500).json({ 
      message: 'Server error during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login
}; 