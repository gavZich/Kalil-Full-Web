const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');  // Import bcrypt for password comparison
const jwt = require('jsonwebtoken');  // Import JWT for token creation
const User = require('../models/User');  // Import the User model
const { protect, admin } = require('../middleware/authMiddleware');  // Import protect middleware
const BlacklistToken = require('../models/BlacklistToken');


// Route to get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({});  // Fetch all users from the database
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete a user by ID
router.delete('/:id', protect, admin, async (req, res) => {
  const userId = req.params.id;  // Extract user ID from the URL parameters
  console.log(`Attempting to delete user with ID: ${userId}`);  // Add this to check the ID

  try {
    const user = await User.findById(userId);  // Find the user by ID
    
    if (user) {
      await User.deleteOne({ _id: userId });  // Use `deleteOne` to remove the user by ID
      res.json({ message: 'User removed successfully' });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};
// Route to handle user login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        isPurchasing: user.isPurchasing,
        token: generateToken(user._id), // Include the token in the response
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc Register a new user
// @route POST /api/users
// @access Public
router.post('/', async (req, res) => {
  const { name, email, password, phone, role } = req.body; // Extract phone along with name, email, password, and role

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Validate phone number
    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Initialize user properties based on the role
    let userData = {
      name,
      email,
      password,
      phone, // Add phone number to user data
      role: role || 'student', // Default to 'student' if no role is provided
      isAdmin: role === 'admin', // Only admins have isAdmin set to true
      lessonsRemaining: role === 'student' ? 0 : undefined, // Only students have lessonsRemaining
      lessonsCompleted: role === 'student' ? 0 : undefined,
      lessonsTaught: role === 'instructor' ? 0 : undefined, // Only instructors track lessonsTaught
      purchasedPrograms: role === 'student' ? [] : undefined, // Programs only relevant for students
    };

    // Create and save the new user
    const user = new User(userData);
    await user.save();

    // Generate a token for the new user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '30d' });

    // Return the new user's details and token
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone, // Return phone number
      role: user.role,
      isAdmin: user.isAdmin,
      lessonsRemaining: user.lessonsRemaining, // Relevant for students
      lessonsCompleted: user.lessonsCompleted, // Relevant for students
      lessonsTaught: user.lessonsTaught, // Relevant for instructors
      purchasedPrograms: user.purchasedPrograms, // Relevant for students
      token: token,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// Route to get user profile - GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    // Find the user based on the ID from the token
    const user = await User.findById(req.user._id);

    if (user) {
      // Return user information including the 'role'
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,  // Add the role to the response
        lessonsRemaining: user.lessonsRemaining,  // Adding lessonsRemaining for future use
        lessonsCompleted: user.lessonsCompleted  // Adding lessonsCompleted for future use
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to update user profile - PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    // Find the user based on the ID from the token
    const user = await User.findById(req.user._id);

    if (user) {
      // Update user details if they are provided
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;

      if (req.body.password) {
        user.password = req.body.password;  // The password will be hashed in the User model
      }

      const updatedUser = await user.save();  // Save the updated user details

      // Return the updated user information
      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isAdmin: updatedUser.isAdmin,
        token: jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, { expiresIn: '30d' }),
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to logout user - POST /api/users/logout
router.post('/logout', protect, async (req, res) => {
  try {
    // Get the token from the request headers
    const token = req.headers.authorization.split(' ')[1];

    // Decode the token to get the expiration date
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000); // Convert expiration to Date

    // Save the token to the blacklist
    await BlacklistToken.create({ token, expiresAt });

    // Respond to the client
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Logout failed' });
  }
});

// Route to get all instructors
// @desc    Get all instructors
// @route   GET /api/instructors
// @access  Private/Students
router.get('/instructors', protect, async (req, res) => {
  try {
    const instructors = await User.find({ role: 'instructor' }).select('name email');
    res.json(instructors);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch instructors' });
  }
});


// Route to get user's purchased programs
// @desc    Get user's purchased programs and lessons
// @route   GET /api/users/my-programs
// @access  Private
router.get('/my-programs', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('purchasedPrograms');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get the programs and add the lessonFiles manually
    const programsWithLessons = user.purchasedPrograms.map(program => ({
      _id: program._id,
      name: program.name,
      lessonFiles: program.lessonFiles
    }));

    res.status(200).json(programsWithLessons);
  } catch (error) {
    console.error('Failed to fetch user programs:', error);
    res.status(500).json({ message: 'Failed to fetch user programs' });
  }
});


module.exports = router;  // Export the router
