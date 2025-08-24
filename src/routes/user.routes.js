import { Router } from "express";   
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {registerUser,loginUser,changeCurrentPassword,getCurrentuser,logoutUser,refreshAccesstoken,updateAccountDetails,getSystemDiagnostics,getSecretKey,getAdminPanel,getVaultAccess,getUserAnalytics} from "../controllers/user.controller.js";
const router = Router();

// Health check endpoint for deployment platforms
router.route('/health').get((req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

router.route("/register").post(registerUser);
router.route('/login').post(loginUser);

//secured routes
router.route('/logout').post(verifyJWT, logoutUser);
router.route('/refresh-token').post(refreshAccesstoken);
router.route('/change-password').post(verifyJWT, changeCurrentPassword);
router.route('/current-user').get(verifyJWT, getCurrentuser);
router.route('/update-account-details').put(verifyJWT, updateAccountDetails);

// Protected endpoints with hidden information - Enhanced security
router.route('/admin-panel').get(verifyJWT, getAdminPanel);
router.route('/system/diagnostics').get(verifyJWT, getSystemDiagnostics);
router.route('/secret-key').get(verifyJWT, getSecretKey);
router.route('/vault-access').get(verifyJWT, getVaultAccess);
router.route('/analytics').get(verifyJWT, getUserAnalytics);



export default router;