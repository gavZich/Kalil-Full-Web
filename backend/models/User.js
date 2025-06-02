const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Define the User Schema
const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Each email must be unique
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true, // Adding phone number as a required field
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    purchasedPrograms: [
      {
        program: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Program', // Reference to the Program schema
        },
        lessonFiles: [
          {
            fileName: String,
            fileUrl: String,
          },
        ],
        phoneCalls: {
          type: Number,
          default: 0, // Number of phone calls included in the purchased program
        },
      },
    ],
    isPurchasing: {
      type: Boolean,
      default: false, // Default to false when user is not in the middle of purchasing
    },
    role: {
      type: String,
      required: true,
      enum: ['student', 'instructor', 'admin'],
      default: 'student',
    },
    lessonsRemaining: {
      type: Number,
      default: 0,
    },
    lessonsCompleted: {
      type: Number,
      default: 0,
    },
    lessonsTaught: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true, // Automatically add createdAt and updatedAt fields
  }
);

// Middleware to hash password before saving to the database
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Create the User model
const User = mongoose.model('User', userSchema);

module.exports = User;
