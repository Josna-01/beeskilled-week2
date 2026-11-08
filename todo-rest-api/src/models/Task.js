const mongoose = require('mongoose');

/**
 * Task Schema Definition
 */
const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: 'Status must be either "pending" or "completed"'
      },
      default: 'pending'
    }
  },
  {
    timestamps: true // Automatically manages createdAt and updatedAt
  }
);

module.exports = mongoose.model('Task', taskSchema);

