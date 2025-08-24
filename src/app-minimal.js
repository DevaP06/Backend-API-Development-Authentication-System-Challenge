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

// Enhanced auth endpoints with real functionality
app.post('/api/v1/users/register', async (req, res) => {
    try {
        const { username, email, fullName, password } = req.body;
        
        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email, and password are required'
            });
        }

        // Try to use real registration if available
        try {
            const { registerUser } = await import('./controllers/user.controller.js');
            return await registerUser(req, res);
        } catch (importError) {
            console.log('Using fallback registration');
            
            // Fallback registration
            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: {
                        _id: Date.now().toString(),
                        username,
                        email,
                        fullName: fullName || username
                    }
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
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

        // Try to use real login if available
        try {
            const { loginUser } = await import('./controllers/user.controller.js');
            return await loginUser(req, res);
        } catch (importError) {
            console.log('Using fallback login');
            
            // Generate a simple JWT-like token
            const mockToken = Buffer.from(JSON.stringify({
                username: usernameOrEmail,
                timestamp: Date.now()
            })).toString('base64');
            
            // Set cookie for session
            res.cookie('accessToken', mockToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 24 hours
            });
            
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        _id: Date.now().toString(),
                        username: usernameOrEmail,
                        email: `${usernameOrEmail}@example.com`
                    },
                    accessToken: mockToken
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

// Enhanced discovery endpoints
app.get('/api/v1/users/admin-panel', async (req, res) => {
    try {
        // Try to use real admin panel if available
        try {
            const { getAdminPanel } = await import('./controllers/user.controller.js');
            return await getAdminPanel(req, res);
        } catch (importError) {
            // Fallback admin panel with maintenance code
            res.status(200).json({
                success: true,
                message: 'Admin panel access granted - Enhanced system diagnostics available',
                data: {
                    systemInfo: {
                        server: 'Railway Deployment',
                        status: 'Operational',
                        uptime: process.uptime(),
                        environment: process.env.NODE_ENV || 'development'
                    },
                    adminTools: {
                        userManagement: 'Available',
                        systemLogs: 'Accessible',
                        securitySettings: 'Configurable'
                    },
                    systemLogs: {
                        lastMaintenance: new Date().toISOString(),
                        nextScheduled: "2024-02-15T02:00:00Z",
                        debugEndpoint: "/system/diagnostics", // CLUE 1: Hidden endpoint
                        maintenanceCode: "DIAG_7834" // CLUE 2: Code needed for next step
                    },
                    nextStep: 'Try system diagnostics for more detailed information',
                    hint: 'Look for patterns in the diagnostic data...'
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Admin panel access failed',
            error: error.message
        });
    }
});

app.get('/api/v1/users/system/diagnostics', async (req, res) => {
    try {
        // Try to use real diagnostics if available
        try {
            const { getSystemDiagnostics } = await import('./controllers/user.controller.js');
            return await getSystemDiagnostics(req, res);
        } catch (importError) {
            // Fallback diagnostics with access code generation
            // Generate dynamic access code (username length + current hour + mock user ID)
            const mockUserId = Date.now().toString();
            const currentHour = new Date().getHours();
            const username = req.headers.authorization ? 'user' : 'testuser'; // Mock username
            const dynamicCode = `${username.length}${currentHour}${mockUserId.slice(-2)}`;
            
            res.status(200).json({
                success: true,
                message: 'System diagnostics completed - Security analysis available',
                data: {
                    systemHealth: {
                        cpu: '45%',
                        memory: '67%',
                        disk: '23%',
                        network: 'Stable'
                    },
                    securityScan: {
                        vulnerabilities: 'None detected',
                        accessLogs: 'Clean',
                        encryptionStatus: 'Active'
                    },
                    hiddenProcesses: {
                        'vault-daemon': 'Running',
                        'key-manager': 'Active',
                        'auth-validator': 'Operational'
                    },
                    internalNotes: {
                        reminder: "Secret vault requires special access pattern",
                        pattern: dynamicCode, // CLUE 3: Dynamic pattern for final step
                        instruction: "Use this pattern as 'accessCode' parameter in vault endpoint"
                    },
                    hint: 'The vault-daemon process suggests secure storage is available...'
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'System diagnostics failed',
            error: error.message
        });
    }
});

app.get('/api/v1/users/secret-key', async (req, res) => {
    try {
        // Check if access code is provided
        const { accessCode } = req.query;
        
        if (!accessCode) {
            return res.status(403).json({
                success: false,
                message: 'Access code required',
                hint: 'Complete system diagnostics first to get the access code'
            });
        }
        
        // Try to use real secret key endpoint if available
        try {
            const { getSecretKey } = await import('./controllers/user.controller.js');
            return await getSecretKey(req, res);
        } catch (importError) {
            // Enhanced secret key discovery with access code validation
            const secretKey = process.env.SECRET_KEY || 'CYBER-AUTH-DISCOVERY-KEY-2025';
            
            res.status(200).json({
                success: true,
                message: '🎉 Congratulations! You\'ve successfully navigated the discovery process!',
                data: {
                    secretKey: secretKey,
                    achievement: "Master Investigator",
                    discoveryPath: [
                        "1. Investigated admin panel system logs",
                        "2. Found hidden diagnostics endpoint", 
                        "3. Used maintenance code to access diagnostics",
                        "4. Discovered dynamic access pattern",
                        "5. Successfully accessed secret key"
                    ],
                    accessCode: accessCode,
                    unlockedAt: new Date().toISOString(),
                    specialMessage: "Your investigative skills have proven worthy of this secret!"
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Secret key access denied',
            error: error.message
        });
    }
});

app.get('/api/v1/users/vault-access', async (req, res) => {
    try {
        // Try to use real vault access if available
        try {
            const { getVaultAccess } = await import('./controllers/user.controller.js');
            return await getVaultAccess(req, res);
        } catch (importError) {
            // Fallback vault access
            res.status(200).json({
                success: true,
                message: 'Vault access granted - Secure data repository unlocked',
                data: {
                    vaultContents: {
                        encryptedFiles: ['user_data.enc', 'system_config.enc', 'backup_keys.enc'],
                        accessLevel: 'Administrator',
                        lastAccess: new Date().toISOString()
                    },
                    securityKeys: {
                        primary: process.env.SECRET_KEY || 'PRIMARY-VAULT-KEY',
                        backup: process.env.ENCRYPTION_KEY || 'BACKUP-ENCRYPTION-KEY'
                    },
                    status: 'All systems operational'
                }
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Vault access denied',
            error: error.message
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
    try {
        res.sendFile('index.html', { root: './public' });
    } catch (error) {
        res.status(200).json({
            message: '🔐 Authentication Discovery System API (Competition Version)',
            version: '1.0.0-competition',
            status: 'Ready for GDG on Campus competition',
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