const express = require('express');
const { protect } = require('../middleware/authMiddleware'); // Import protect middleware
const User = require('../models/User');
const Program = require('../models/Program');
const router = express.Router();

// Purchase program route
router.post('/purchase', protect, async (req, res) => {
  const userId = req.user.id; // Using the user ID from protect middleware
  const programId = req.body.programId; // Program ID from request body

  try {
    // Find the user and program
    const user = await User.findById(userId);
    const program = await Program.findById(programId);

    if (!user || !program) {
      return res.status(404).json({ message: "User or Program not found" });
    }

    // Add program to user's purchased programs
    user.purchasedPrograms.push(programId);
    await user.save();

    return res.status(200).json({ message: "Program purchased successfully!" });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
});

// @desc    Purchase a program
// @route   POST /api/programs/:programId/purchase
// @access  Private
router.post('/programs/:programId/purchase', protect, async (req, res) => {
  try {
    const program = await Program.findById(req.params.programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.purchasedPrograms.push(program._id);
    await user.save();

    res.status(200).json({ message: 'Program purchased successfully' });
  } catch (error) {
    console.error('Failed to purchase program:', error);
    res.status(500).json({ message: 'Failed to purchase program' });
  }
});

module.exports = router;
