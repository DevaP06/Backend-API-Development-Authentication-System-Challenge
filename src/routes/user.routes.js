import { Router } from "express";   
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { trackSession, validateSession, rateLimitSensitive } from "../middlewares/session.middleware.js";
import {registerUser,loginUser,changeCurrentPassword,getCurrentuser,logoutUser,refreshAccesstoken,updateAccountDetails,getSystemDiagnostics,getSecretKey,getAdminPanel,getVaultAccess,getUserAnalytics} from "../controllers/user.controller.js";
const router = Router();

router.route("/register").post(registerUser);


router.route('/login').post(loginUser);

//secured routes with session tracking
router.route('/logout').post(verifyJWT, trackSession, logoutUser);
router.route('/refresh-token').post(validateSession, refreshAccesstoken);
router.route('/change-password').post(verifyJWT, trackSession, rateLimitSensitive, changeCurrentPassword);
router.route('/current-user').get(verifyJWT, trackSession, getCurrentuser);
router.route('/update-account-details').put(verifyJWT, trackSession, updateAccountDetails);

// Protected endpoints with hidden information - Enhanced security
router.route('/admin-panel').get(verifyJWT, trackSession, validateSession, rateLimitSensitive, getAdminPanel);
router.route('/system/diagnostics').get(verifyJWT, trackSession, validateSession, rateLimitSensitive, getSystemDiagnostics);
router.route('/secret-key').get(verifyJWT, trackSession, validateSession, rateLimitSensitive, getSecretKey);
router.route('/vault-access').get(verifyJWT, trackSession, validateSession, rateLimitSensitive, getVaultAccess);
router.route('/analytics').get(verifyJWT, trackSession, getUserAnalytics);



export default router;