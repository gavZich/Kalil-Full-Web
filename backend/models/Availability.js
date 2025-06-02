const mongoose = require('mongoose');

// Availability Schema
const availabilitySchema = mongoose.Schema(
  {
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    availableSlots: [
      {
        dateTime: {
          type: Date,
          required: true,
        },
        isRecurring: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Availability = mongoose.model('Availability', availabilitySchema);

module.exports = Availability;
