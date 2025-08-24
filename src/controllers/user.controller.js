import asyncHandler from "express-async-handler";
import { APIError } from "../utils/APIError.js";
import { User } from "../models/user.models.js";
import { APIResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken";




const generateAccessRefreshToken = async (userId) => {
    let accessToken, refreshToken;
    try {
        const user = await User.findById(userId);
        if (!user) {
            throw new APIError("User not found for token generation", 404);
        }
        accessToken = user.generateAccessToken();
        refreshToken = user.generateRefreshToken();
        user.refreshToken = refreshToken;
        await user.save({ validateBeforeSave: false });

    } catch (error) {
        throw new APIError(500, "Error generating tokens");
    }
    return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
    // Simplified registration without file uploads
    const { username, email, fullName, password } = req.body;
    if (!username || !email || !fullName || !password) {
        throw new APIError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
        $or: [{ email: email }, { username: username }]
    })
    if (existedUser) {
        throw new APIError(408, "User already exists");
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        fullName,
        password
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken");
    if (!createdUser) {
        throw new APIError(500, "Something went wrong while registering user");
    }

    return res.status(201).json(new APIResponse(200, "User registered successfully", createdUser));
})




const loginUser = asyncHandler(async (req, res) => {
    //req.body-= data
    //username or email
    //cheeck if user exists
    //check password
    //generate access token and refresh token
    //send response with tokens


    const { usernameOrEmail, password } = req.body;
    if (!usernameOrEmail || !password) {
        throw new APIError(400, "Username or Email and Password are required");
    }

    const identifier = usernameOrEmail.trim().toLowerCase();

    const user = await User.findOne({
        $or: [{ email: identifier }, { username: identifier }]
    })

    if (!user) {
        throw new APIError(404, "User not found");
    }
    const isPasswordMatch = await user.isPasswordCorrect(password);
    if (!(isPasswordMatch)) {
        throw new APIError(401, "Invalid password");
    }

    const { accessToken, refreshToken } = await generateAccessRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    // Enhanced secure cookie options
    const cookieOptions = {
        httpOnly: true, // Prevents XSS attacks
        secure: process.env.NODE_ENV === 'production', // HTTPS only in production
        sameSite: 'strict', // CSRF protection
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: '/' // Cookie available for entire domain
    };

    const refreshCookieOptions = {
        ...cookieOptions,
        maxAge: 10 * 24 * 60 * 60 * 1000 // 10 days for refresh token
    };

    // Set session metadata
    const sessionData = {
        sessionId: `sess_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        loginTime: new Date().toISOString(),
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip || req.connection.remoteAddress
    };

    return res
        .status(200)
        .cookie("accessToken", accessToken, cookieOptions)
        .cookie("refreshToken", refreshToken, refreshCookieOptions)
        .cookie("sessionData", JSON.stringify(sessionData), { ...cookieOptions, httpOnly: false })
        .json(new APIResponse(200, "User logged in successfully", {
            user: loggedInUser,
            accessToken,
            refreshToken,
            session: sessionData
        }));
})


const logoutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    // Enhanced cookie clearing options
    const clearCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    };

    const logoutData = {
        message: "Session terminated successfully",
        logoutTime: new Date().toISOString(),
        userId: req.user._id
    };

    return res
        .status(200)
        .clearCookie("accessToken", clearCookieOptions)
        .clearCookie("refreshToken", clearCookieOptions)
        .clearCookie("sessionData", { ...clearCookieOptions, httpOnly: false })
        .json(new APIResponse(200, "User logged out successfully", logoutData));
})


const refreshAccesstoken = asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");
    if (!refreshToken) {
        throw new APIError(401, "Refresh token is required");
    }

    const decodedToken = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    if (!decodedToken) {
        throw new APIError(401, "Invalid refresh token");
    }

    const user = await User.findById(decodedToken._id).select("-password -refreshToken");
    if (!user) {
        throw new APIError(404, "User not found");
    }

    const { accessToken } = await generateAccessRefreshToken(user._id);

    return res.status(200).json(new APIResponse(200, "Access token refreshed successfully", { accessToken }));

})



const changeCurrentPassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        throw new APIError(400, "Current password and new password are required");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
        throw new APIError(404, "User not found");
    }

    const isPasswordMatch = await user.isPasswordCorrect(currentPassword);
    if (!isPasswordMatch) {
        throw new APIError(401, "Current password is incorrect");
    }

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res.status(200).json(new APIResponse(200, "Password changed successfully"));
})



const getCurrentuser = asyncHandler(async (req, res) => {
    return res.status(200).json(new APIResponse(200, "Current user fetched successfully", req.user));
})


const updateAccountDetails = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body;
    if (!fullName || !email) {
        throw new APIError(400, "Full name and email are required");
    }
    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true,
            runValidators: true
        }
    ).select("-password -refreshToken");
    if (!user) {
        throw new APIError(404, "User not found");
    }
    return res.status(200).json(new APIResponse(200, "Account details updated successfully", user));

})




// STEP 2: System diagnostics - requires maintenance code from admin panel
const getSystemDiagnostics = asyncHandler(async (req, res) => {
    const { maintenanceCode } = req.query;
    
    if (!maintenanceCode || maintenanceCode !== "DIAG_7834") {
        return res.status(403).json(
            new APIResponse(403, "Access denied", {
                message: "Valid maintenance code required",
                hint: "Check system logs for the current maintenance code"
            })
        );
    }

    // Generate time-sensitive access pattern
    const currentHour = new Date().getHours();
    const accessPattern = `${req.user.username.length}${currentHour}${req.user._id.toString().slice(-2)}`;
    
    const diagnosticsData = {
        message: "System diagnostics accessed successfully",
        systemHealth: {
            cpu: "Normal",
            memory: "Optimal", 
            disk: "Good",
            network: "Stable"
        },
        securityStatus: {
            firewall: "Active",
            encryption: "AES-256",
            lastScan: "2024-01-20T14:22:00Z"
        },
        // Hidden clue for final step
        internalNotes: {
            reminder: "Secret vault requires special access pattern",
            pattern: accessPattern, // CLUE 3: Dynamic pattern for final step
            instruction: "Use this pattern as 'accessCode' parameter in vault endpoint"
        },
        timestamp: new Date().toISOString()
    };

    return res.status(200).json(
        new APIResponse(200, "Diagnostics retrieved successfully", diagnosticsData)
    );
})

// STEP 3: Final secret key access - requires access pattern from diagnostics
const getSecretKey = asyncHandler(async (req, res) => {
    const { accessCode } = req.query;
    
    if (!accessCode) {
        return res.status(400).json(
            new APIResponse(400, "Access code required", {
                message: "Special access code needed for secret key",
                hint: "Run system diagnostics to obtain the current access code"
            })
        );
    }

    // Validate the dynamic access pattern
    const currentHour = new Date().getHours();
    const expectedPattern = `${req.user.username.length}${currentHour}${req.user._id.toString().slice(-2)}`;
    
    if (accessCode !== expectedPattern) {
        return res.status(403).json(
            new APIResponse(403, "Invalid access code", {
                message: "Access code is incorrect or expired",
                hint: "Access codes are time-sensitive and user-specific"
            })
        );
    }

    const secretKey = process.env.SECRET_KEY || "your-super-secret-key-12345";
    
    const responseData = {
        message: "🎉 Congratulations! You've successfully navigated the discovery process!",
        secretKey: secretKey,
        achievement: "Master Investigator",
        discoveryPath: [
            "1. Investigated admin panel system logs",
            "2. Found hidden diagnostics endpoint", 
            "3. Used maintenance code to access diagnostics",
            "4. Discovered dynamic access pattern",
            "5. Successfully accessed secret key"
        ],
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        },
        unlockedAt: new Date().toISOString(),
        specialMessage: "Your investigative skills have proven worthy of this secret!"
    };

    return res.status(200).json(
        new APIResponse(200, "Secret key unlocked through discovery!", responseData)
    );
})

// STEP 1: Hidden clue in admin panel - requires investigation
const getAdminPanel = asyncHandler(async (req, res) => {
    const adminData = {
        message: "Welcome to the Admin Panel",
        serverInfo: {
            nodeVersion: process.version,
            platform: process.platform,
            uptime: process.uptime(),
            memoryUsage: process.memoryUsage()
        },
        databaseStats: {
            connectionStatus: "Connected",
            totalUsers: await User.countDocuments(),
            activeUsers: await User.countDocuments({ refreshToken: { $ne: null } })
        },
        systemSecrets: {
            jwtSecret: process.env.ACCESS_TOKEN_SECRET ? "***CONFIGURED***" : "NOT SET",
            dbConnection: process.env.URI_KEY ? "***CONFIGURED***" : "NOT SET",
            cloudinaryConfig: process.env.CLOUDINARY_API_KEY ? "***CONFIGURED***" : "NOT SET"
        },
        accessLevel: "ADMIN",
        user: {
            id: req.user._id,
            username: req.user.username,
            role: "authenticated_user"
        },
        // Hidden clue - only visible to those who investigate the response
        systemLogs: {
            lastMaintenance: "2024-01-15T10:30:00Z",
            nextScheduled: "2024-02-15T02:00:00Z",
            debugEndpoint: "/system/diagnostics", // CLUE 1: Hidden endpoint
            maintenanceCode: "DIAG_7834" // CLUE 2: Code needed for next step
        },
        timestamp: new Date().toISOString()
    };

    return res.status(200).json(
        new APIResponse(200, "Admin panel data retrieved successfully", adminData)
    );
})

const getVaultAccess = asyncHandler(async (req, res) => {
    // Protected endpoint for vault-like sensitive information
    const vaultData = {
        message: "Access granted to secure vault",
        vaultContents: {
            apiKeys: {
                stripe: "sk_test_***REDACTED***",
                sendgrid: "SG.***REDACTED***",
                aws: "AKIA***REDACTED***"
            },
            databaseCredentials: {
                host: "***PROTECTED***",
                username: "***PROTECTED***",
                password: "***PROTECTED***"
            },
            encryptionKeys: {
                aes256: process.env.ENCRYPTION_KEY || "default-encryption-key-256bit",
                hmac: process.env.HMAC_SECRET || "default-hmac-secret-key"
            }
        },
        securityLevel: "MAXIMUM",
        accessGrantedTo: {
            userId: req.user._id,
            username: req.user.username,
            email: req.user.email,
            loginTime: new Date().toISOString()
        },
        vaultVersion: "2.1.0"
    };

    return res.status(200).json(
        new APIResponse(200, "Vault access granted successfully", vaultData)
    );
})

const getUserAnalytics = asyncHandler(async (req, res) => {
    // Protected endpoint for user analytics and insights
    const userStats = await User.aggregate([
        { $match: { _id: req.user._id } },
        {
            $project: {
                username: 1,
                email: 1,
                fullName: 1,
                createdAt: 1,
                lastLogin: "$updatedAt",
                accountAge: {
                    $divide: [
                        { $subtract: [new Date(), "$createdAt"] },
                        1000 * 60 * 60 * 24 // Convert to days
                    ]
                }
            }
        }
    ]);

    const analyticsData = {
        message: "Personal analytics dashboard",
        userInsights: {
            profile: userStats[0],
            securityMetrics: {
                passwordLastChanged: "30 days ago",
                loginAttempts: 1,
                deviceCount: 1,
                lastKnownIP: req.ip || "127.0.0.1"
            },
            activitySummary: {
                totalSessions: 15,
                averageSessionDuration: "45 minutes",
                mostActiveHour: "14:00-15:00",
                preferredDevice: "Desktop"
            }
        },
        privacyLevel: "PERSONAL",
        generatedAt: new Date().toISOString()
    };

    return res.status(200).json(
        new APIResponse(200, "User analytics retrieved successfully", analyticsData)
    );
})


export {
    registerUser,
    loginUser,
    logoutUser,
    refreshAccesstoken,
    changeCurrentPassword,
    getCurrentuser,
    updateAccountDetails,
    getSystemDiagnostics,
    getSecretKey,
    getAdminPanel,
    getVaultAccess,
    getUserAnalytics
};