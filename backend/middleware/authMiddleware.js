const jwt = require('jsonwebtoken');
const User = require('../models/User');
const BlacklistToken = require('../models/BlacklistToken');


// Middleware function to protect routes by verifying JWT token
const protect = async (req, res, next) => {
  console.log('Middleware protect is being called');  // Check if middleware is triggered
  console.log('Authorization header:', req.headers.authorization);  // Debugging to see if Authorization header exists

  let token;
  let decoded; // Declare decoded variable here

  // Check if the request has an Authorization header with a Bearer token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    console.log('Authorization header found, extracting token');  // Debugging token extraction
    // Extract the token from the Authorization header
    token = req.headers.authorization.split(' ')[1];
    console.log(`Extracted token: ${token}`);  // Check the extracted token

    // Check if token is blacklisted
    try {
      const blacklistedToken = await BlacklistToken.findOne({ token });
      if (blacklistedToken) {
        return res.status(401).json({ message: 'Not authorized, token is invalid' });
      }

      // Verify the token and extract the decoded user ID
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log(`Decoded user ID: ${decoded.id}`);  // Log decoded token for debugging

      // Find the user based on the decoded ID, excluding the password field
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        console.warn('User not found in database with decoded ID');
        return res.status(404).json({ message: 'User not found' });
      }
      console.log(`User found in protect middleware: ${req.user}`);  // Debug user lookup

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      console.error(`Error in protect middleware: ${error}`);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else {
    console.log("No token provided in the request headers.");
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};


// Middleware to check if user is an instructor
const instructor = (req, res, next) => {
  if (req.user && req.user.role === 'instructor') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an instructor' });
  }
};

// Middleware to allow access only to students
const student = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Students only' });
  }
};

// Middleware to allow access only to admins
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied: Admins only' });
  }
};

module.exports = { protect, student, instructor, admin };