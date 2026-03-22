const express = require('express');
const router = express.Router();
const { getSharedPosts } = require('../controllers/sharedPostController');

// GET /api/shared-posts
router.get('/', getSharedPosts);

module.exports = router;
