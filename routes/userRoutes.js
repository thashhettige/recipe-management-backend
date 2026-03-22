// routes/userRoutes.js
// Like Laravel's routes/api.php for users

const express = require('express');
const router = express.Router();
const userController = require('../controllers/UserController');
const { authenticate } = require('../middleware/auth');

// ====================================
// LARAVEL EQUIVALENT:
// ====================================
// Route::get('/users', [UserController::class, 'index']);
// Route::get('/users/{id}', [UserController::class, 'show']);
// Route::post('/users/{id}/follow', [UserController::class, 'follow'])->middleware('auth');
// Route::delete('/users/{id}/follow', [UserController::class, 'unfollow'])->middleware('auth');

// ====================================
// EXPRESS.JS:
// ====================================

// Public routes
router.get('/', userController.index);              // GET /api/users
router.get('/:id', userController.show);            // GET /api/users/:id
router.get('/:id/recipes', userController.recipes); // GET /api/users/:id/recipes

// Protected routes
router.post('/:id/follow', authenticate, userController.follow);     // POST /api/users/:id/follow
router.delete('/:id/follow', authenticate, userController.unfollow); // DELETE /api/users/:id/follow

module.exports = router;