// routes/authRoutes.js
// This is like Laravel's routes/api.php

const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const { authenticate } = require('../middleware/auth');

// ====================================
// LARAVEL EQUIVALENT:
// ====================================
// Route::post('/auth/register', [AuthController::class, 'register']);
// Route::post('/auth/login', [AuthController::class, 'login']);
// Route::get('/auth/me', [AuthController::class, 'me'])->middleware('auth');

// ====================================
// EXPRESS.JS (SAME THING!):
// ====================================

/**
 * POST /api/auth/register
 * Public route - no auth required
 */
router.post('/register', authController.register);

/**
 * POST /api/auth/login
 * Public route - no auth required
 */
router.post('/login', authController.login);

/**
 * GET /api/auth/me
 * Protected route - requires authentication
 * Like Laravel's ->middleware('auth')
 */
router.get('/me', authenticate, authController.me);

module.exports = router;