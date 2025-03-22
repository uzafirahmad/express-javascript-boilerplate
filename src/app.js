import express from 'express';
import cors from 'cors';
import mongoDBService from './config/mongodb.js';
import redisService from './config/redis.js';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes.js';
import socketRoutes from './routes/socket.routes.js';

const app = express();

// app.use(cors({
//     origin: ["*"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true
// }));
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
mongoDBService.connect()

// Redis connection
redisService.connect()

// REST routes
app.use('/auth', authRoutes);

// SOCKET Routes
socketRoutes(io);

export { app, server, io };