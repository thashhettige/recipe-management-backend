const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const RegisterRequest = require('../Requests/RegisterRequest');
const LoginRequest = require('../Requests/LoginRequest');

router.post('/register', RegisterRequest, (req, res, next) => {
  authController.register(req, res).catch(next);
});

router.post('/login', LoginRequest, (req, res, next) => {
  authController.login(req, res).catch(next);
});

router.get('/me', authMiddleware, (req, res, next) => {
  authController.me(req, res).catch(next);
});

module.exports = router