const jwt = require('jsonwebtoken');
const { getEnv, isDevelopment } = require('../config/env');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, getEnv('JWT_SECRET'));
    req.user = decoded;
    next();
  } catch (error) {
    console.error('Auth middleware error:', {
      message: error.message,
      name: error.name
    });
    
    res.status(401).json({ 
      message: 'Token is not valid',
      error: isDevelopment() ? error.message : undefined
    });
  }
};

module.exports = { auth }; 