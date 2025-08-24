import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';

const app = express();

// CORS configuration - simplified to avoid any regex issues
app.use(cors({
    origin: process.env.NODE_ENV === 'production'
        ? 'https://backend-api-development-authentication-system-ch-production.up.railway.app'
        : true, // Allow all origins in development
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

// Simple health check for users API
app.get('/api/v1/users/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        message: 'Authentication system operational',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Basic fallback routes (will be replaced by real routes when controllers load)
app.post('/api/v1/users/register', (req, res) => {
    res.status(503).json({
        success: false,
        message: 'Authentication system loading...'
    });
});

app.post('/api/v1/users/login', (req, res) => {
    res.status(503).json({
        success: false,
        message: 'Authentication system loading...'
    });
});

// Function to setup authentication after app is created
export async function setupAuthentication(app) {
    try {
        console.log('🔧 Loading authentication system...');
        
        // Import controllers
        const controllers = await import('./controllers/user.controller.js');
        console.log('✅ Controllers loaded');
        
        // Import auth middleware  
        const auth = await import('./middlewares/auth.middleware.js');
        const verifyJWT = auth.verifyJWT;
        console.log('✅ Auth middleware loaded');
        
        // Replace fallback routes with real authentication
        app.post('/api/v1/users/register', controllers.registerUser);
        app.post('/api/v1/users/login', controllers.loginUser);
        
        // Protected user routes
        app.post('/api/v1/users/logout', verifyJWT, controllers.logoutUser);
        app.post('/api/v1/users/refresh-token', controllers.refreshAccesstoken);
        app.post('/api/v1/users/change-password', verifyJWT, controllers.changeCurrentPassword);
        app.get('/api/v1/users/current-user', verifyJWT, controllers.getCurrentuser);
        app.put('/api/v1/users/update-account-details', verifyJWT, controllers.updateAccountDetails);
        
        // Discovery system routes (protected)
        app.get('/api/v1/users/admin-panel', verifyJWT, controllers.getAdminPanel);
        app.get('/api/v1/users/system/diagnostics', verifyJWT, controllers.getSystemDiagnostics);
        app.get('/api/v1/users/secret-key', verifyJWT, controllers.getSecretKey);
        app.get('/api/v1/users/vault-access', verifyJWT, controllers.getVaultAccess);
        app.get('/api/v1/users/analytics', verifyJWT, controllers.getUserAnalytics);
        
        console.log('✅ Authentication system ready');
        return true;
        
    } catch (error) {
        console.error('❌ Authentication setup failed:', error.message);
        return false;
    }
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