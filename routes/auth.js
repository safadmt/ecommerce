import express from 'express';
import { dirname } from 'path';
const router = express.Router()
import {fileURLToPath} from 'url'
import { adminLogin, getAdminLogin } from '../controllers/admin.js';
import { googleCallback, 
    otpverify, 
    passportLogin,
    getLoginPage, 
    resendOTP, 
    userSignup, 
    verfiyEmail,
    logout,
    getSignupPage } from '../controllers/users.js';
import passport from 'passport';

const currentFilePath = fileURLToPath(import.meta.url)
console.log(currentFilePath)
const __dirname = dirname(currentFilePath)



router.get('/login', getLoginPage)

router.post('/login', passportLogin)
router.get('/signup', getSignupPage)
router.get('/logout', logout)
router.get('/admin/login', getAdminLogin)
router.post('/admin/login', adminLogin)
router.post('/verify-email',verfiyEmail )
router.post('/signup', userSignup)
router.get('/verify/email', otpverify)
router.get('/resend-otp', resendOTP)
router.get('/google-oauth', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',googleCallback)
// router.get('/cart', )
export default router