import express from 'express';
import { dirname } from 'path';
const router = express.Router()
import {fileURLToPath} from 'url'
import { adminLogin, getAdminLogin ,adminLogout} from '../controllers/admin.js';
import { googleCallback, 
    otpverify, 
    userLogin,
    getLoginPage, 
    resendOTP, 
    userSignup, 
    verfiyEmail,
    logout,
    getSignupPage, 
    getForgotPasswordPage,
    forgotPassword,
    resetPassword,
    verifyForgotPasswordOTP,
    getResetPasswordPage} from '../controllers/users.js';
import passport from 'passport';
import { ensureAdminauthenticated, ensureUserauthenticated } from '../middleware/authorization.js';


// Route to get the user login page
router.get('/login', ensureUserauthenticated, getLoginPage);

// Route to handle user login authentication
router.post('/login', userLogin);

// Route to get signup page
router.get('/signup',ensureUserauthenticated, getSignupPage);

// Route to handle logout
router.get('/logout-user', logout);

// Route to handle logout
router.get('/logout-admin', adminLogout);

// Route to get the admin login page
router.get('/admin/login',ensureAdminauthenticated, getAdminLogin);

// Route to handle the admin login authentication
router.post('/admin/login', adminLogin);

// Route to handle user verify email
router.post('/verify-email',verfiyEmail );

// Route to create new User 
router.post('/signup', userSignup);

//Route  to get the verify otp page
router.get('/verify/email', otpverify);

// Route to handle resend otp
router.get('/resend-otp', resendOTP);

// Route to authenticate using google oauth
router.get('/google-oauth', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Route to handle the google callback url
router.get('/google/callback',googleCallback);
// router.get('/cart', )

// Route to get the forgot password page
router.get('/forgot-password', getForgotPasswordPage)

//Route to handle forgot password
router.post('/forgot-password', forgotPassword)

// Route to handle verify otp
router.post('/forgot-password/verify-otp', verifyForgotPasswordOTP)

// Route to get the reset password page
router.get('/reset-password', getResetPasswordPage)

// Router to handle reset password 
router.post('/reset-password', resetPassword)

export default router