const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');


router.post('/login',authController.login);

router.post('/signup',authController.signup);

router.post('/verifyEmail', authController.verifyEmail);

router.post('/resendOtp', authController.resendOTP);

router.get("/check-auth", authMiddleware, (req, res) => {
  res.json({ loggedIn: true, user: req.user });
});

router.get('/getAllProfiles',authController.getAllProfiles);

module.exports = router;