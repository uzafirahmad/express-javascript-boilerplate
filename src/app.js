import express from 'express';
import cors from 'cors';
import redisService from './config/redis.js';
import http from 'http';
import { Server } from 'socket.io';
import authRoutes from './routes/auth.routes.js';
import passport from 'passport';
import socketRoutes from './routes/socket.routes.js';
import postgreSQLService from './config/postgresql.js';

const app = express();

app.use(cors({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "http://127.0.0.1:3002",
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
}));
app.use(passport.initialize());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
});

// mongoDBService.connect()

postgreSQLService.connect()

redisService.connect()

// REST routes
app.use('/auth', authRoutes);

// SOCKET Routes
socketRoutes(io);

export { app, server, io };