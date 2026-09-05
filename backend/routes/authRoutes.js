// authRoutes.js
const express = require('express');
const router = express.Router();
const { sendOTP, verifyOTP, checkPhone } = require('../controllers/authController');
router.post('/send-otp', sendOTP);
router.post('/verify-otp', verifyOTP);
router.post('/check-phone', checkPhone);
module.exports = router;
