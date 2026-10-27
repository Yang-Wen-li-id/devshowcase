const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { requireAuth } = require('../middleware/authMiddleware');

router.post('/login', authController.login);
router.get('/me', requireAuth, authController.getProfile);
router.post('/logout', authController.logout);

module.exports = router;
