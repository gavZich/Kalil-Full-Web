const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const User = require('../models/User');

// @desc    Get all instructors
// @route   GET /api/instructors
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    // Find all users with role 'instructor'
    const instructors = await User.find({ role: 'instructor' });

    if (instructors) {
      res.status(200).json(instructors);
    } else {
      res.status(404).json({ message: 'No instructors found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
