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

// CORS configuration
const corsOptions = {
  origin: [
    'http://localhost:5173', // Vite default port
    'https://chat-nnnlyfnza-dstepanians-projects.vercel.app', // Your previous Vercel domain
    'https://chat-app-steel-chi.vercel.app', // Your new Vercel domain
    'https://chatapp-production-1b1f.up.railway.app' // Your Railway domain
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Middleware
app.use(cors(corsOptions));
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

// Initialize Socket.IO with CORS
const io = socketIO(server, {
  cors: corsOptions
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
