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

// Remove fallback routes - use real authentication only

// Import and use real authentication routes with better error handling
try {
    console.log('Attempting to load user routes...');
    
    // Import routes in a safer way
    const userRoutes = await import('./routes/user.routes.js');
    const userRouter = userRoutes.default;
    
    // Test the router before using it
    if (userRouter && typeof userRouter === 'function') {
        app.use('/api/v1/users', userRouter);
        console.log('✅ User routes loaded successfully');
    } else {
        throw new Error('Invalid router export');
    }
} catch (error) {
    console.error('❌ CRITICAL: Failed to load user routes:', error.message);
    console.error('Full error:', error);
    console.log('🚨 Using secure fallback authentication');
    
    // Secure fallback authentication that actually works
    app.post('/api/v1/users/register', async (req, res) => {
        try {
            const { username, email, fullName, password } = req.body;
            
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'All fields are required'
                });
            }

            // Try to import and use real registration
            const { registerUser } = await import('./controllers/user.controller.js');
            return await registerUser(req, res);
        } catch (importError) {
            console.error('Registration fallback failed:', importError.message);
            res.status(503).json({
                success: false,
                message: 'Registration system temporarily unavailable',
                error: 'Please try again later'
            });
        }
    });

    app.post('/api/v1/users/login', async (req, res) => {
        try {
            const { usernameOrEmail, password } = req.body;
            
            if (!usernameOrEmail || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username/email and password are required'
                });
            }

            // Try to import and use real login
            const { loginUser } = await import('./controllers/user.controller.js');
            return await loginUser(req, res);
        } catch (importError) {
            console.error('Login fallback failed:', importError.message);
            res.status(503).json({
                success: false,
                message: 'Authentication system temporarily unavailable',
                error: 'Please try again later'
            });
        }
    });

    // Discovery endpoints fallback
    app.get('/api/v1/users/admin-panel', async (req, res) => {
        try {
            const { getAdminPanel } = await import('./controllers/user.controller.js');
            return await getAdminPanel(req, res);
        } catch (error) {
            res.status(503).json({
                success: false,
                message: 'Admin panel temporarily unavailable'
            });
        }
    });

    app.get('/api/v1/users/system/diagnostics', async (req, res) => {
        try {
            const { getSystemDiagnostics } = await import('./controllers/user.controller.js');
            return await getSystemDiagnostics(req, res);
        } catch (error) {
            res.status(503).json({
                success: false,
                message: 'System diagnostics temporarily unavailable'
            });
        }
    });

    app.get('/api/v1/users/secret-key', async (req, res) => {
        try {
            const { getSecretKey } = await import('./controllers/user.controller.js');
            return await getSecretKey(req, res);
        } catch (error) {
            res.status(503).json({
                success: false,
                message: 'Secret key access temporarily unavailable'
            });
        }
    });
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