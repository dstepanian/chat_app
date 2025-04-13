const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Validate required environment variables
const validateEnv = () => {
  const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
  const missingVars = [];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingVars.push(envVar);
    }
  }

  if (missingVars.length > 0) {
    console.error(`Missing required environment variables: ${missingVars.join(', ')}`);
    process.exit(1);
  }
};

const getEnv = (key) => process.env[key];

const isDevelopment = () => process.env.NODE_ENV === 'development';

module.exports = {
  validateEnv,
  getEnv,
  isDevelopment
}; 