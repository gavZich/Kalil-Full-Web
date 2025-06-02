const express = require('express');
const router = express.Router();
const { protect, instructor } = require('../middleware/authMiddleware');
const Availability = require('../models/Availability');

// @desc    Add or update instructor availability
// @route   POST /api/availability
// @access  Private/Instructors
router.post('/', protect, instructor, async (req, res) => {
  const { availableSlots } = req.body;

  try {
    // Validate available slots
    if (
      !Array.isArray(availableSlots) ||
      !availableSlots.every(
        (slot) => slot.dateTime && !isNaN(Date.parse(slot.dateTime))
      )
    ) {
      return res.status(400).json({ message: 'Invalid date format in available slots' });
    }

    let availability = await Availability.findOne({ instructor: req.user._id });

    if (availability) {
      availability.availableSlots = availableSlots;
    } else {
      availability = new Availability({
        instructor: req.user._id,
        availableSlots,
      });
    }

    await availability.save();
    res.status(200).json({ message: 'Availability updated successfully' });
  } catch (error) {
    console.error('Failed to update availability:', error);
    res.status(500).json({ message: 'Failed to update availability' });
  }
});


// @desc    Get instructor availability
// @route   GET /api/availability/:instructorId
// @access  Public
router.get('/:instructorId', async (req, res) => {
  try {
    const availability = await Availability.findOne({ instructor: req.params.instructorId });
    res.json(availability);
  } catch (error) {
    console.error('Failed to fetch availability:', error);
    res.status(500).json({ message: 'Failed to fetch availability' });
  }
});

module.exports = router;
