import express from 'express';
import cors from 'cors';
import connectToDatabase from './config/db.js';
import { redisConnection } from './config/redis.js';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/authRoutes.js';
import socketRoutes from './routes/socketRoutes.js';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create HTTP server for Socket.IO
const socket = http.createServer(app);
// const io = new Server(socket);

const io = new Server(socket, {
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
app.use('/', authRoutes);

// SOCKET Routes
socketRoutes(io);

// SOCKET API routes
// const socketNamespace = io.of('/');
// socketRoutes(socketNamespace);

export { app, socket, io };
