// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./models');

const app = express();

// ============================================
// MIDDLEWARE
// ============================================
// Enable CORS for your frontend - Allow multiple origins
app.use(cors({
  origin: [
    'http://localhost:5173',  // Vite default
    'http://localhost:5174',  // Vite alternative
    'http://localhost:3000',  // React default
    'http://localhost:3001',  // React alternative
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware (helpful for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ============================================
// ROUTES
// ============================================
// Import auth routes
const authRoutes = require('./routes/auth');

// Use auth routes
app.use('/api/auth', authRoutes);

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'API is running',
    endpoints: {
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      me: 'GET /api/auth/me'
    }
  });
});

// ============================================
// ERROR HANDLING
// ============================================
// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ 
    error: err.message || 'Internal server error' 
  });
});

// ============================================
// DATABASE & SERVER START
// ============================================
const PORT = process.env.PORT || 3000;

// Sync database and start server
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log('✅ Database synced successfully');
    app.listen(PORT, () => {
      console.log(`🚀 Server is running on http://localhost:${PORT}`);
      console.log(`📝 API Endpoints:`);
      console.log(`   POST http://localhost:${PORT}/api/auth/register`);
      console.log(`   POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
    });
  })
  .catch(err => {
    console.error('❌ Unable to sync database:', err);
    process.exit(1);
  });

module.exports = app;