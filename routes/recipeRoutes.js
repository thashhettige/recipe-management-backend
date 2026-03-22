// routes/recipeRoutes.js
// Like Laravel's routes/api.php for recipes

const express = require('express');
const router = express.Router();
const recipeController = require('../controllers/RecipeController');
const { authenticate } = require('../middleware/auth');

// ====================================
// LARAVEL EQUIVALENT:
// ====================================
// Route::get('/recipes', [RecipeController::class, 'index']);
// Route::get('/recipes/{id}', [RecipeController::class, 'show']);
// Route::post('/recipes', [RecipeController::class, 'store'])->middleware('auth');
// Route::put('/recipes/{id}', [RecipeController::class, 'update'])->middleware('auth');
// Route::delete('/recipes/{id}', [RecipeController::class, 'destroy'])->middleware('auth');

// ====================================
// EXPRESS.JS (SAME STRUCTURE!):
// ====================================

// Public routes (no auth needed)
router.get('/', recipeController.index);           // GET /api/recipes
router.get('/:id', recipeController.show);         // GET /api/recipes/:id

// Protected routes (auth required)
router.post('/', authenticate, recipeController.store);         // POST /api/recipes
router.put('/:id', authenticate, recipeController.update);      // PUT /api/recipes/:id
router.delete('/:id', authenticate, recipeController.destroy);  // DELETE /api/recipes/:id

// Recipe actions
router.post('/:id/like', authenticate, recipeController.like);        // POST /api/recipes/:id/like
router.delete('/:id/like', authenticate, recipeController.unlike);    // DELETE /api/recipes/:id/like
router.post('/:id/comments', authenticate, recipeController.addComment); // POST /api/recipes/:id/comments

module.exports = router;