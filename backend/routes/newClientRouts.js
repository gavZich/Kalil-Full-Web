const express = require('express');
const router = express.Router();
const NewClient = require('../models/NewClient');
const { protect, admin } = require('../middleware/authMiddleware');  // Import protect middleware


// Rout to get all new clients with thire details
// // @desc    Get all new clients
// @route   GET /api/newClients
// @access  Private/Admin

// Rout to  add new client
// @desc    Add new client
// @route   POST /api/newClients
// @access  

// Rout to delete new client
// @desc    Delete a new client
// @route   DELETE /api/newClients/:id
// @access  


// Rout to update new client
// @desc    Update a new client
// @route   PUT /api/newClients/:id
// @access