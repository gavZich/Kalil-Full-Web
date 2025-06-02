const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);  // No additional options needed
    console.log(`MongoDB Connected: ${conn.connection.host}`);  // Log the host of the connection
  } catch (error) {
    console.error(`Error: ${error.message}`);  // Print error message
    process.exit(1);  // Exit process if connection fails
  }
};

module.exports = connectDB;  // Export the connection function
