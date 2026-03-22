const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { deleteComment } = require('../controllers/commentController');

// DELETE /api/comments/:id
router.delete('/:id', authenticate, deleteComment);

module.exports = router;
