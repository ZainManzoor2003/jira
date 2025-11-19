const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');


router.post('/signup',authController.signup);

router.post('/verifyEmail', authController.verifyEmail);

router.post('/resendOtp', authController.resendOTP);

router.get('/getAllProfiles',authController.getAllProfiles);

module.exports = router;