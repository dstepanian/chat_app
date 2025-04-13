const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const socketIO = require('socket.io');
const dotenv = require('dotenv');
const http = require('http');
const { validateEnv } = require('./config/env');
const { connectDB } = require('./config/database');
const { errorHandler } = require('./middleware/errorHandler');
const { router: authRouter } = require('./routes/auth');
const { router: messageRouter } = require('./routes/messages');

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

const app = express();

// Validate environment variables
validateEnv();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/messages', messageRouter);

// Basic route
app.get('/', (req, res) => {
  res.send('Chat Server is running');
});

// Health check endpoint
app.get('/health', (req, res) => {
  const status = {
    status: 'ok',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    uptime: process.uptime()
  };
  res.status(200).json(status);
});

// Error handling middleware
app.use(errorHandler);

// Get port from environment variable or use default
const PORT = process.env.PORT || 5000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = socketIO(server, {
  cors: {
    origin: '*', // Allow all origins in production
    methods: ['GET', 'POST']
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Handle joining a chat room
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`User ${socket.id} joined room ${room}`);
  });

  // Handle chat messages
  socket.on('send_message', (data) => {
    io.to(data.room).emit('receive_message', {
      message: data.message,
      author: data.author,
      room: data.room,
      timestamp: new Date()
    });
  });

  // Handle typing status
  socket.on('typing', (data) => {
    socket.to(data.room).emit('user_typing', data.author);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected:', socket.id);
  });
});

// Start server
const startServer = async () => {
  try {
    await connectDB();
    server.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log('Environment:', process.env.NODE_ENV || 'development');
      console.log('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
      console.log('JWT Secret:', process.env.JWT_SECRET ? 'Set' : 'Not set');
    });
  } catch (error) {
    console.error('Failed to start server:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    process.exit(1);
  }
};

startServer();
