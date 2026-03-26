const jwt = require('jsonwebtoken');
const { User } = require('../models');

class AuthController {
  async register(request, response) {
    try {
      const { first_name, last_name, email, password } = request.body;

      //If user exist
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        return response.status(400).json({ error: 'Email already registered' });
      }

      //create user
      const user = await User.create({
        first_name,
        last_name,
        email,
        password
      });

      //generate token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );

      //return response
      return response.status(201).json({
        message: 'User registered successfully',
        token,
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email
        }
      });
    } catch (error) {
      console.error('Registration error:', error);
      return response.status(500).json({ error: error.message });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

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