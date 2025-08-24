import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// CORS configuration
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://backend-api-development-authentication-system-ch-production.up.railway.app'
    : ['http://localhost:8000', 'http://localhost:3000'],
  credentials: true
}));

// Middleware
app.use(express.json({limit: '16kb'}));
app.use(express.urlencoded({extended: true, limit: '16kb'}));
app.use(express.static('public'));
app.use(cookieParser());

// Health check endpoint (Railway uses this)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// API endpoints
app.get('/api/v1/users/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        message: 'API is working',
        timestamp: new Date().toISOString()
    });
});

// Minimal auth endpoints for testing
app.post('/api/v1/users/register', (req, res) => {
    const { username, email, fullName, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username, email, and password are required'
        });
    }
    
    res.status(201).json({
        success: true,
        message: 'User registered successfully (minimal version)',
        data: {
            user: {
                username,
                email,
                fullName
            }
        }
    });
});

app.post('/api/v1/users/login', (req, res) => {
    const { username, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({
            success: false,
            message: 'Username and password are required'
        });
    }
    
    // Mock successful login
    res.status(200).json({
        success: true,
        message: 'Login successful (minimal version)',
        data: {
            user: {
                username,
                email: `${username}@example.com`
            },
            accessToken: 'mock-jwt-token-for-testing'
        }
    });
});

// Discovery endpoints (mock responses)
app.get('/api/v1/users/admin-panel', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Admin panel access granted (minimal version)',
        data: {
            systemInfo: 'Mock system information',
            hint: 'This is a minimal version - full functionality coming soon'
        }
    });
});

app.get('/api/v1/users/secret-key', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Secret key discovered (minimal version)!',
        data: {
            secretKey: 'MOCK-SECRET-KEY-FOR-TESTING-2025'
        }
    });
});

// Root endpoint
app.get('/', (req, res) => {
    try {
        res.sendFile('index.html', { root: './public' });
    } catch (error) {
        res.status(200).json({
            message: '🔐 Authentication Discovery System API (Minimal Version)',
            version: '1.0.0-minimal',
            status: 'Running in minimal mode while fixing route issues',
            endpoints: {
                health: '/health',
                auth: '/api/v1/users'
            }
        });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

export { app };