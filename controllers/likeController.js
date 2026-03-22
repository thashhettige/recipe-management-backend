const { Like, Recipe } = require('../models');

// POST /api/recipes/:id/like - Like a recipe
const likeRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    const existingLike = await Like.findOne({
      where: { user_id: userId, recipe_id: recipeId },
    });

    if (existingLike) {
      return res.status(409).json({ error: 'You have already liked this recipe.' });
    }

    const like = await Like.create({
      user_id: userId,
      recipe_id: recipeId,
    });

    const likesCount = await Like.count({ where: { recipe_id: recipeId } });

    res.status(201).json({
      message: 'Recipe liked successfully.',
      like,
      likes_count: likesCount,
    });
  } catch (error) {
    console.error('Like recipe error:', error);
    res.status(500).json({ error: 'Failed to like recipe.' });
  }
};

// DELETE /api/recipes/:id/like - Unlike a recipe
const unlikeRecipe = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const userId = req.user.id;

    const like = await Like.findOne({
      where: { user_id: userId, recipe_id: recipeId },
    });

    if (!like) {
      return res.status(404).json({ error: 'You have not liked this recipe.' });
    }

    await like.destroy();

    const likesCount = await Like.count({ where: { recipe_id: recipeId } });

    res.json({
      message: 'Recipe unliked successfully.',
      likes_count: likesCount,
    });
  } catch (error) {
    console.error('Unlike recipe error:', error);
    res.status(500).json({ error: 'Failed to unlike recipe.' });
  }
};

// GET /api/recipes/:id/likes - Get likes for a recipe
const getRecipeLikes = async (req, res) => {
  try {
    const recipeId = req.params.id;

    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    const likes = await Like.findAll({
      where: { recipe_id: recipeId },
      include: [
        {
          model: require('../models').User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    res.json({
      likes,
      likes_count: likes.length,
    });
  } catch (error) {
    console.error('Get recipe likes error:', error);
    res.status(500).json({ error: 'Failed to fetch likes.' });
  }
};

module.exports = {
  likeRecipe,
  unlikeRecipe,
  getRecipeLikes,
};
