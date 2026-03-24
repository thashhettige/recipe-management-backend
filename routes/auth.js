// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', (req, res, next) => {
  console.log('📝 Register request received:', req.body);
  authController.register(req, res).catch(next);
});

router.post('/login', (req, res, next) => {
  console.log('🔐 Login request received:', req.body.email);
  authController.login(req, res).catch(next);
});

// Protected routes
router.get('/me', authMiddleware, (req, res, next) => {
  console.log('👤 Get user request received');
  authController.me(req, res).catch(next);
});

module.exports = router;