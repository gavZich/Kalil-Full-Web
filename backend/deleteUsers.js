const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');  // Import the User model
const connectDB = require('./config/db');  // Import the database connection

dotenv.config();  // Load environment variables

connectDB();  // Connect to MongoDB

// Function to delete all users
const deleteAllUsers = async () => {
  try {
    const result = await User.deleteMany();  // Delete all users in the collection
    console.log(`All users have been deleted. Total: ${result.deletedCount} users.`);
    process.exit();  // Exit the script when done
  } catch (error) {
    console.error(`Error deleting users: ${error.message}`);
    process.exit(1);  // Exit with failure
  }
};

deleteAllUsers();  // Call the function to delete users
