import { asyncHandler } from '../utils/asyncHandler.js';
import { APIError } from '../utils/APIError.js';

// Enhanced session tracking middleware
export const trackSession = asyncHandler(async (req, res, next) => {
    // Add session tracking information to request
    req.sessionInfo = {
        sessionId: req.cookies?.sessionData ? JSON.parse(req.cookies.sessionData).sessionId : null,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress,
        timestamp: new Date().toISOString(),
        requestPath: req.path,
        method: req.method
    };

    // Log session activity (in production, this would go to a proper logging service)
    if (req.user) {
        console.log(`Session Activity: User ${req.user.username} accessed ${req.path} from ${req.sessionInfo.ipAddress}`);
    }

    next();
});

// Middleware to validate session integrity
export const validateSession = asyncHandler(async (req, res, next) => {
    if (req.cookies?.sessionData) {
        try {
            const sessionData = JSON.parse(req.cookies.sessionData);
            
            // Check if session is too old (24 hours)
            const sessionAge = Date.now() - new Date(sessionData.loginTime).getTime();
            const maxAge = 24 * 60 * 60 * 1000; // 24 hours
            
            if (sessionAge > maxAge) {
                throw new APIError(401, "Session expired. Please login again.");
            }

            // Add session data to request
            req.sessionData = sessionData;
        } catch (error) {
            throw new APIError(401, "Invalid session data. Please login again.");
        }
    }
    
    next();
});

// Rate limiting middleware for sensitive endpoints
export const rateLimitSensitive = asyncHandler(async (req, res, next) => {
    const clientId = req.user?._id || req.ip;
    const key = `rate_limit_${clientId}`;
    
    // In production, use Redis or similar for rate limiting
    // For now, we'll use a simple in-memory approach
    if (!global.rateLimitStore) {
        global.rateLimitStore = new Map();
    }
    
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 10; // Max 10 requests per window
    
    const clientData = global.rateLimitStore.get(key) || { count: 0, resetTime: now + windowMs };
    
    if (now > clientData.resetTime) {
        clientData.count = 1;
        clientData.resetTime = now + windowMs;
    } else {
        clientData.count++;
    }
    
    global.rateLimitStore.set(key, clientData);
    
    if (clientData.count > maxRequests) {
        throw new APIError(429, "Too many requests. Please try again later.");
    }
    
    // Add rate limit headers
    res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(0, maxRequests - clientData.count),
        'X-RateLimit-Reset': new Date(clientData.resetTime).toISOString()
    });
    
    next();
});