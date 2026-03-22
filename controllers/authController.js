// controllers/AuthController.js
// This is EXACTLY like Laravel's AuthController!

const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  /**
   * Register a new user
   * Like Laravel: public function register(Request $request)
   */
  async register(req, res) {
    try {
      const { first_name, last_name, email, password } = req.body;

      // Validate (like Laravel's $request->validate())
      if (!first_name || !last_name || !email || !password) {
        return res.status(400).json({
          error: 'All fields are required'
        });
      }

      // Check if exists (like Laravel's User::where('email', $email)->first())
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already registered' });
      }

      // Create user (like Laravel's User::create($data))
      const user = await User.create({
        first_name,
        last_name,
        email,
        password // Will be hashed automatically in the model
      });

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Return response (like Laravel's return response()->json())
      return res.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Login user
   * Like Laravel: public function login(Request $request)
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          error: 'Email and password are required'
        });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValid = await user.validatePassword(password);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      return res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: error.message });
    }
  }

  /**
   * Get current user
   * Like Laravel: public function me(Request $request)
   */
  async me(req, res) {
    try {
      // req.user is set by auth middleware (like Laravel's Auth::user())
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] },
        include: [
          { model: User, as: 'followers' },
          { model: User, as: 'following' }
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
}

// Export instance (so we can use authController.register)
module.exports = new AuthController();