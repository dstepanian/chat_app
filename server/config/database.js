const mongoose = require('mongoose');

const connectDB = async () => {
  const maxRetries = 5;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      console.log(`Attempting MongoDB connection (attempt ${retryCount + 1}/${maxRetries})...`);
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000
      });
      console.log('Successfully connected to MongoDB');
      return;
    } catch (error) {
      console.error('MongoDB connection error:', {
        message: error.message,
        code: error.code,
        name: error.name
      });
      retryCount++;
      
      if (retryCount === maxRetries) {
        console.error('Failed to connect to MongoDB after maximum retries');
        process.exit(1);
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
    }
  }
};

module.exports = { connectDB }; 