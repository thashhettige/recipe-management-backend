// controllers/UserController.js
// Like Laravel's UserController

const { User, Recipe, UserFollow } = require('../models');

class UserController {
  /**
   * Get all users
   * Like Laravel: public function index()
   */
  async index(req, res) {
    try {
      const { limit = 20, offset = 0 } = req.query;

      const users = await User.findAndCountAll({
        attributes: { exclude: ['password'] },
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['created_at', 'DESC']]
      });

      return res.json({
        users: users.rows,
        total: users.count
      });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get single user
   * Like Laravel: public function show($id)
   */
  async show(req, res) {
    try {
      const user = await User.findByPk(req.params.id, {
        attributes: { exclude: ['password'] },
        include: [
          {
            model: Recipe,
            as: 'recipes',
            limit: 10
          },
          {
            model: User,
            as: 'followers',
            attributes: ['id', 'first_name', 'last_name']
          },
          {
            model: User,
            as: 'following',
            attributes: ['id', 'first_name', 'last_name']
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      return res.json(user);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Follow a user
   * Like Laravel: public function follow($id)
   */
  async follow(req, res) {
    try {
      const userToFollow = await User.findByPk(req.params.id);

      if (!userToFollow) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Can't follow yourself
      if (req.user.id === parseInt(req.params.id)) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
      }

      // Check if already following
      const existingFollow = await UserFollow.findOne({
        where: {
          follower_id: req.user.id,
          following_id: req.params.id
        }
      });

      if (existingFollow) {
        return res.status(400).json({ error: 'Already following' });
      }

      const follow = await UserFollow.create({
        follower_id: req.user.id,
        following_id: req.params.id
      });

      return res.status(201).json({ message: 'User followed', follow });
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
  }

  /**
   * Unfollow a user
   * Like Laravel: public function unfollow($id)
   */
  async unfollow(req, res) {
    try {
      const follow = await UserFollow.findOne({
        where: {
          follower_id: req.user.id,
          following_id: req.params.id
        }
      });

      if (!follow) {
        return res.status(404).json({ error: 'Not following this user' });
      }

      await follow.destroy();

      return res.json({ message: 'User unfollowed' });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get user's recipes
   * Like Laravel: public function recipes($id)
   */
  async recipes(req, res) {
    try {
      const recipes = await Recipe.findAll({
        where: { user_id: req.params.id },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'first_name', 'last_name']
        }],
        order: [['created_at', 'DESC']]
      });

      return res.json({ recipes });
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  }
}

module.exports = new UserController();