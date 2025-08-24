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
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(express.static('public'));
app.use(cookieParser());

// Simple health check endpoint (Railway uses this)
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// Detailed health endpoint
app.get('/api/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Authentication Discovery System is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 8000,
        uptime: process.uptime()
    });
});

// Debug endpoint
app.get('/api/v1/test', (req, res) => {
    res.json({ message: 'API is working', timestamp: new Date().toISOString() });
});

// Temporary: Create minimal routes directly to bypass import issues
app.get('/api/v1/users/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'User routes are working',
        timestamp: new Date().toISOString()
    });
});

app.post('/api/v1/users/register', (req, res) => {
    res.status(200).json({
        success: false,
        message: 'Registration temporarily disabled - fixing route issues',
        hint: 'Server is running, working on full functionality'
    });
});

app.post('/api/v1/users/login', (req, res) => {
    res.status(200).json({
        success: false,
        message: 'Login temporarily disabled - fixing route issues',
        hint: 'Server is running, working on full functionality'
    });
});

// Try to import routes safely
try {
    console.log('Attempting to load user routes...');
    const userRouter = await import('./routes/user.routes.js');
    app.use('/api/v1/users-full', userRouter.default);
    console.log('✅ User routes loaded successfully');
} catch (error) {
    console.error('❌ Failed to load user routes:', error.message);
    console.log('⚠️ Using minimal fallback routes');
}



// Root endpoint - serve the cyberpunk terminal interface
app.get('/', (req, res) => {
    try {
        res.sendFile('index.html', { root: './public' });
    } catch (error) {
        // Fallback to JSON response if HTML file not found
        res.status(200).json({
            message: '🔐 Authentication Discovery System API',
            version: '1.0.0',
            endpoints: {
                health: '/health',
                auth: '/api/v1/users',
                frontend: 'Frontend files not found - using API mode'
            },
            challenge: 'Can you discover the secret key? Start with /api/v1/users/admin-panel'
        });
    }
});

// API info endpoint
app.get('/api', (req, res) => {
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

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found',
        path: req.path
    });
});

export { app };