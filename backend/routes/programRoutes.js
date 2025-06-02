const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const { protect, admin } = require('../middleware/authMiddleware');
const mongoose = require('mongoose');



// Route to get all programs with optional type filtering
router.get('/', async (req, res) => {
    try {
      const type = req.query.type; // Extract the type from the query string
      let programs;
  
      if (type) {
        // If a type is provided, filter by it
        programs = await Program.find({ type });
      } else {
        // If no type is provided, return all programs
        programs = await Program.find({});
      }
  
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

// Route to create a new program (POST)
// @desc    Create a new learning program
// @route   POST /api/programs
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
  const { name, description, price, type, phoneCalls } = req.body;

  const program = new Program({
    name,
    description,
    price,
    type,
    phoneCalls,
  });

  try {
    const createdProgram = await program.save(); // Save the new program to the database
    res.status(201).json(createdProgram);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to update a program by ID (PUT)
// @desc    Update a program by ID
// @route   PUT /api/programs/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
  const programId = req.params.id; // Get the program ID from the request parameters
  const { name, description, price, type, phoneCalls } = req.body;

  try {
    const program = await Program.findById(programId); // Find the program by ID

    if (program) {
      // Update the program fields
      program.name = name || program.name;
      program.description = description || program.description;
      program.price = price || program.price;
      program.type = type || program.type;
      program.phoneCalls = phoneCalls || program.phoneCalls;

      const updatedProgram = await program.save(); // Save the updated program to the database
      res.json(updatedProgram);
    } else {
      res.status(404).json({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a program by ID (DELETE)
// @desc    Delete a program by ID
// @route   DELETE /api/programs/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  const programId = req.params.id; // Get the program ID from the request parameters

  try {
    const program = await Program.findById(programId); // Find the program by ID

    if (program) {
      await Program.deleteOne({ _id: programId }); // Delete the program from the database
      res.json({ message: 'Program deleted successfully' });
    } else {
      res.status(404).json({ message: 'Program not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// @desc    Get all files for a program
// @route   GET /api/programs/:id/files
// @access  Private/Admin
router.get('/:id/files', protect, admin, async (req, res) => {
  const programId = req.params.id;

  // Validate the programId format
  if (!mongoose.Types.ObjectId.isValid(programId)) {
    return res.status(400).json({ message: 'Invalid program ID format.' });
  }

  try {
    // Find the program by ID and only return the lesson files field
    const program = await Program.findById(programId).select('lessonFiles');

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    // Respond with the lesson files
    res.status(200).json({ 
      message: 'Files fetched successfully', 
      files: program.lessonFiles 
    });
  } catch (error) {
    console.error(`Error fetching files for program ${programId}:`, error);
    res.status(500).json({ message: 'Failed to fetch program files. Please try again later.' });
  }
});


  // Route to get all programs, with an optional type filter (GET)
router.get('/', async (req, res) => {
    const type = req.query.type; // Get the 'type' query parameter if provided
  
    try {
      // If a type is provided in the query, filter by it, otherwise return all programs
      const programs = type 
        ? await Program.find({ type }) 
        : await Program.find({});
  
      res.json(programs);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

  // Route to get a program by ID
router.get('/:id', async (req, res) => {
    try {
      const program = await Program.findById(req.params.id);
      if (program) {
        res.json(program);
      } else {
        res.status(404).json({ message: 'Program not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  });
  
  

module.exports = router;
