import express from 'express';
import cors from 'cors';
import connectToDatabase from './config/mongodb.js';
import { redisConnection } from './config/redis.js';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes.js';
import socketRoutes from './routes/socket.routes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server for both Express and Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
    cors: {
        origin: '*', // Allow all origins for testing purposes
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'] // added for authorization headers
    }
});

// Database connection
connectToDatabase();

// Redis connection
redisConnection();

// REST routes
app.use('/auth', authRoutes);

// SOCKET Routes
socketRoutes(io);

export { app, server, io };