const mongoose = require('mongoose');

// Lesson Schema
const lessonSchema = mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to User model
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User', // Reference to User model
    },
    dateTime: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'completed', 'canceled'],
      default: 'pending',
    },
    studentConfirmed: {
      type: Boolean,
      default: false,
    },
    instructorConfirmed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Lesson = mongoose.model('Lesson', lessonSchema);

module.exports = Lesson;
