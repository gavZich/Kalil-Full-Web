const mongoose = require('mongoose');

// Define Purchase schema
const purchaseSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',  // Reference to the User model
      required: true,
    },
    program: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Program',  // Reference to the Program model
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,  // Automatically add createdAt and updatedAt fields
  }
);

const Purchase = mongoose.model('Purchase', purchaseSchema);

module.exports = Purchase;
