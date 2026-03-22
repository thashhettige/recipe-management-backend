const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const db = require('./models');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
db.sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connection established');
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Make sure MySQL is running and credentials are correct');
  });

// Sync database (development only)
if (process.env.NODE_ENV === 'development') {
  db.sequelize.sync({ alter: false })
    .then(() => console.log('✅ Database synced'))
    .catch(err => console.error('❌ Database sync failed:', err.message));
}

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to FOODSHARE API',
    version: '1.0.0',
    status: 'Server is running',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me (requires token)'
      },
      users: {
        list: 'GET /api/users',
        show: 'GET /api/users/:id',
        follow: 'POST /api/users/:id/follow (requires token)'
      },
      recipes: {
        list: 'GET /api/recipes',
        create: 'POST /api/recipes (requires token)',
        show: 'GET /api/recipes/:id',
        like: 'POST /api/recipes/:id/like (requires token)'
      }
    }
  });
});

// ====================================
// IMPORT ROUTES
// ====================================
// Try to load routes with different possible names
let authRoutes, userRoutes, recipeRoutes;

try {
  // Try auth.js first, then authRoutes.js
  try {
    authRoutes = require('./routes/auth');
    console.log('✅ Loaded routes/auth.js');
  } catch (e) {
    authRoutes = require('./routes/authRoutes');
    console.log('✅ Loaded routes/authRoutes.js');
  }
} catch (error) {
  console.error('❌ Could not load auth routes:', error.message);
  console.error('   Expected: routes/auth.js or routes/authRoutes.js');
}

try {
  // Try users.js first, then userRoutes.js
  try {
    userRoutes = require('./routes/users');
    console.log('✅ Loaded routes/users.js');
  } catch (e) {
    userRoutes = require('./routes/userRoutes');
    console.log('✅ Loaded routes/userRoutes.js');
  }
} catch (error) {
  console.error('❌ Could not load user routes:', error.message);
  console.error('   Expected: routes/users.js or routes/userRoutes.js');
}

try {
  // Try recipes.js first, then recipeRoutes.js
  try {
    recipeRoutes = require('./routes/recipes');
    console.log('✅ Loaded routes/recipes.js');
  } catch (e) {
    recipeRoutes = require('./routes/recipeRoutes');
    console.log('✅ Loaded routes/recipeRoutes.js');
  }
} catch (error) {
  console.error('❌ Could not load recipe routes:', error.message);
  console.error('   Expected: routes/recipes.js or routes/recipeRoutes.js');
}

// ====================================
// USE ROUTES
// ====================================
if (authRoutes) {
  app.use('/api/auth', authRoutes);
  console.log('✅ Mounted /api/auth routes');
}

if (userRoutes) {
  app.use('/api/users', userRoutes);
  console.log('✅ Mounted /api/users routes');
}

if (recipeRoutes) {
  app.use('/api/recipes', recipeRoutes);
  console.log('✅ Mounted /api/recipes routes');
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      requested: `${req.method} ${req.url}`,
      status: 404
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log('\n🚀 ======================================');
  console.log(`   FOODSHARE API Server`);
  console.log('   ======================================');
  console.log(`   📍 URL: http://localhost:${PORT}`);
  console.log(`   🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('   ======================================\n');
  
  if (authRoutes) {
    console.log('   📝 Test registration:');
    console.log(`   curl -X POST http://localhost:${PORT}/api/auth/register \\`);
    console.log(`     -H "Content-Type: application/json" \\`);
    console.log(`     -d '{"first_name":"John","last_name":"Doe","email":"test@test.com","password":"password123"}'`);
    console.log('\n   ======================================\n');
  } else {
    console.log('   ⚠️  Auth routes not loaded - check routes folder\n');
  }
});

module.exports = app;