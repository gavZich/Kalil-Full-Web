// models/Program.js

const mongoose = require('mongoose');

// Define the Program Schema
const programSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true, // Price of the program
    },
    type: {
      type: String,
      required: true, // For example: 'course', 'phone_calls', 'profession_specific'
    },
    phoneCalls: {
      type: Number,
      default: 0, // Number of phone calls included in the program
    },
    lessonFiles: [
      {
        fileName: String,
        fileUrl: String,
      },
    ],
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Create the Program model
const Program = mongoose.model('Program', programSchema);

module.exports = Program;
