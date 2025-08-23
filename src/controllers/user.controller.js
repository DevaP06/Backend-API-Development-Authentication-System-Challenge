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




const getSecretKey = asyncHandler(async (req, res) => {
    // This endpoint is only accessible to authenticated users
    // The verifyJWT middleware ensures the user is authenticated

    const secretKey = process.env.SECRET_KEY || "your-super-secret-key-12345";

    const responseData = {
        message: "Access granted to authenticated user",
        secretKey: secretKey,
        user: {
            id: req.user._id,
            username: req.user.username,
            email: req.user.email
        },
        timestamp: new Date().toISOString()
    };

    return res.status(200).json(
        new APIResponse(200, "Secret key retrieved successfully", responseData)
    );
})

const getAdminPanel = asyncHandler(async (req, res) => {
    // Protected endpoint for admin-level information
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
    getSecretKey,
    getAdminPanel,
    getVaultAccess,
    getUserAnalytics
};