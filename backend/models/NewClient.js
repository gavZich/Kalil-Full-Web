const mongoose = require('mongoose');

const newClientSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        isPurchased: {
            type: Boolean,
            required: true,
            default: false,
        },
        InterestingProgram: {
            program: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Program', // Reference to the Program schema
          },
        },
    },
    {
        timestamps: true, // Automatically add createdAt and updatedAt fields
    }
);

// Create a model using the schema
const NewClientSchema = mongoose.model('NewClient', newClientSchema);

module.exports = newClientSchema;