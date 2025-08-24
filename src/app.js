import express from 'express';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';
import cors from'cors';

const app=express();
app.use(cors({
  origin: '*'
}));


app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

//routes import 
import userRouter from './routes/user.routes.js'


//routes declaration
app.use(('/api/v1/users'), userRouter);

// Health check endpoint for deployment monitoring
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Authentication Discovery System is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.status(200).json({
        message: '🔐 Authentication Discovery System API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            auth: '/api/v1/users',
            docs: 'Check AUTHENTICATION_API.md for full documentation'
        },
        challenge: 'Can you discover the secret key? Start with /api/v1/users/admin-panel'
    });
});

export {app};