const { Comment, Recipe, User } = require('../models');

// POST /api/recipes/:id/comments - Add a comment
const addComment = async (req, res) => {
  try {
    const recipeId = req.params.id;

    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    const comment = await Comment.create({
      user_id: req.user.id,
      recipe_id: recipeId,
      comment_text: req.body.comment_text,
    });

    const fullComment = await Comment.findByPk(comment.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
    });

    res.status(201).json({ comment: fullComment });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment.' });
  }
};

// GET /api/recipes/:id/comments - Get comments for a recipe
const getComments = async (req, res) => {
  try {
    const recipeId = req.params.id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;

    const recipe = await Recipe.findByPk(recipeId);
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    const { count, rows: comments } = await Comment.findAndCountAll({
      where: { recipe_id: recipeId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name'],
        },
      ],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });

    res.json({
      comments,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments.' });
  }
};

// DELETE /api/comments/:id - Delete a comment
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByPk(req.params.id);
    if (!comment) {
      return res.status(404).json({ error: 'Comment not found.' });
    }

    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only delete your own comments.' });
    }

    await comment.destroy();
    res.json({ message: 'Comment deleted successfully.' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Failed to delete comment.' });
  }
};

module.exports = {
  addComment,
  getComments,
  deleteComment,
};
