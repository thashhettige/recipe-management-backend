// controllers/RecipeController.js
// Like Laravel's RecipeController

const { Recipe, User, Like, Comment } = require('../models');

class RecipeController {
  /**
   * Get all recipes
   * Like Laravel: public function index()
   */
  async index(req, res) {
    try {
      const { limit = 20, offset = 0, type, user_id } = req.query;
      
      const where = {};
      if (type) where.recipe_type = type;
      if (user_id) where.user_id = user_id;

      const recipes = await Recipe.findAndCountAll({
        where,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name']
          }
        ],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.json({
        recipes: recipes.rows,
        total: recipes.count,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get single recipe
   * Like Laravel: public function show($id)
   */
  async show(req, res) {
    try {
      const recipe = await Recipe.findByPk(req.params.id, {
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'first_name', 'last_name']
          },
          {
            model: Like,
            as: 'likes',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name']
            }]
          },
          {
            model: Comment,
            as: 'comments',
            include: [{
              model: User,
              as: 'user',
              attributes: ['id', 'first_name', 'last_name']
            }]
          }
        ]
      });

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      return res.json(recipe);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Create new recipe
   * Like Laravel: public function store(Request $request)
   */
  async store(req, res) {
    try {
      // req.user comes from auth middleware (like Laravel's Auth::user())
      const recipeData = {
        ...req.body,
        user_id: req.user.id
      };

      const recipe = await Recipe.create(recipeData);

      const createdRecipe = await Recipe.findByPk(recipe.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name']
        }]
      });

      return res.status(201).json(createdRecipe);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Update recipe
   * Like Laravel: public function update(Request $request, $id)
   */
  async update(req, res) {
    try {
      const recipe = await Recipe.findByPk(req.params.id);

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Check ownership (like Laravel's policy)
      if (recipe.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await recipe.update(req.body);

      const updatedRecipe = await Recipe.findByPk(recipe.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name']
        }]
      });

      return res.json(updatedRecipe);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Delete recipe
   * Like Laravel: public function destroy($id)
   */
  async destroy(req, res) {
    try {
      const recipe = await Recipe.findByPk(req.params.id);

      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      if (recipe.user_id !== req.user.id) {
        return res.status(403).json({ error: 'Not authorized' });
      }

      await recipe.destroy();

      return res.json({ message: 'Recipe deleted successfully' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Like a recipe
   * Like Laravel: public function like($id)
   */
  async like(req, res) {
    try {
      const { Like } = require('../models');
      
      const recipe = await Recipe.findByPk(req.params.id);
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      // Check if already liked
      const existingLike = await Like.findOne({
        where: {
          user_id: req.user.id,
          recipe_id: req.params.id
        }
      });

      if (existingLike) {
        return res.status(400).json({ error: 'Already liked' });
      }

      const like = await Like.create({
        user_id: req.user.id,
        recipe_id: req.params.id
      });

      return res.status(201).json({ message: 'Recipe liked', like });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Unlike a recipe
   * Like Laravel: public function unlike($id)
   */
  async unlike(req, res) {
    try {
      const { Like } = require('../models');
      
      const like = await Like.findOne({
        where: {
          user_id: req.user.id,
          recipe_id: req.params.id
        }
      });

      if (!like) {
        return res.status(404).json({ error: 'Like not found' });
      }

      await like.destroy();

      return res.json({ message: 'Recipe unliked' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Add comment
   * Like Laravel: public function addComment(Request $request, $id)
   */
  async addComment(req, res) {
    try {
      const { comment_text } = req.body;

      const recipe = await Recipe.findByPk(req.params.id);
      if (!recipe) {
        return res.status(404).json({ error: 'Recipe not found' });
      }

      const comment = await Comment.create({
        user_id: req.user.id,
        recipe_id: req.params.id,
        comment_text
      });

      const createdComment = await Comment.findByPk(comment.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name']
        }]
      });

      return res.status(201).json(createdComment);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new RecipeController();