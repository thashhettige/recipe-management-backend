const { SharedPost, Recipe, User } = require('../models');

// POST /api/recipes/:id/share - Share a recipe (only recipe owner)
const shareRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    // Only the recipe owner can share
    if (recipe.user_id !== userId) {
      return res.status(403).json({ error: 'Only the recipe owner can share this recipe.' });
    }

    // Check if already shared
    const existingShare = await SharedPost.findOne({
      where: { user_id: userId, recipe_id: recipeId },
    });

    if (existingShare) {
      return res.status(409).json({ error: 'Recipe has already been shared.' });
    }

    // Mark recipe as shared
    recipe.is_shared = true;
    await recipe.save();

    const sharedPost = await SharedPost.create({
      user_id: userId,
      recipe_id: recipeId,
      shared_at: new Date(),
    });

    res.status(201).json({
      message: 'Recipe shared successfully.',
      shared_post: sharedPost,
    });
  } catch (error) {
    console.error('Share recipe error:', error);
    res.status(500).json({ error: 'Failed to share recipe.' });
  }
};

// DELETE /api/recipes/:id/share - Unshare a recipe
const unshareRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    if (recipe.user_id !== userId) {
      return res.status(403).json({ error: 'Only the recipe owner can unshare this recipe.' });
    }

    const sharedPost = await SharedPost.findOne({
      where: { user_id: userId, recipe_id: recipeId },
    });

    if (!sharedPost) {
      return res.status(404).json({ error: 'Recipe is not shared.' });
    }

    await sharedPost.destroy();

    recipe.is_shared = false;
    await recipe.save();

    res.json({ message: 'Recipe unshared successfully.' });
  } catch (error) {
    console.error('Unshare recipe error:', error);
    res.status(500).json({ error: 'Failed to unshare recipe.' });
  }
};

// GET /api/shared-posts - Get all shared posts
const getSharedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { count, rows: sharedPosts } = await SharedPost.findAndCountAll({
      include: [
        {
          model: Recipe,
          as: 'recipe',
          include: [
            {
              model: User,
              as: 'author',
              attributes: ['id', 'first_name', 'last_name', 'email'],
            },
          ],
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['shared_at', 'DESC']],
      limit,
      offset,
    });

    res.json({
      shared_posts: sharedPosts,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get shared posts error:', error);
    res.status(500).json({ error: 'Failed to fetch shared posts.' });
  }
};

module.exports = {
  shareRecipe,
  unshareRecipe,
  getSharedPosts,
};
