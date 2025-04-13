# Real-time Chat Application

A full-stack real-time chat application built with React, Node.js, Express, Socket.IO, and MongoDB.

## Features

- Real-time messaging using Socket.IO
- User authentication (login/register)
- Private chat rooms
- Typing indicators
- Message timestamps
- Responsive design with Chakra UI

## Tech Stack

### Frontend
- React
- Vite
- Chakra UI
- Socket.IO Client
- React Router
- Axios

### Backend
- Node.js
- Express
- Socket.IO
- MongoDB
- Mongoose
- JWT Authentication

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd chat_project
```

2. Install backend dependencies:
```bash
cd server
npm install
```

3. Install frontend dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```
MONGODB_URI=your_mongodb_uri
PORT=5000
JWT_SECRET=your_jwt_secret
```

## Running the Application

1. Start the backend server:
```bash
cd server
npm start
```

2. Start the frontend development server:
```bash
cd client
npm run dev
```

3. Open your browser and navigate to `http://localhost:5173`

## Deployment

### Backend Deployment
The backend can be deployed on any Node.js hosting platform (e.g., Heroku, Render).

### Frontend Deployment
The frontend can be deployed on Vercel:

1. Push your code to GitHub
2. Import your project in Vercel
3. Configure the build settings:
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Add environment variables if needed
5. Deploy!

## Environment Variables

### Server (.env)
- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)
- `JWT_SECRET`: Secret key for JWT token generation

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- GET `/api/auth/me` - Get current user info

### Messages
- GET `/api/messages` - Get all messages
- POST `/api/messages` - Send a new message

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 