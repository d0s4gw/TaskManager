const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true,
    default: null
  },
  due_date: {
    type: String,
    trim: true,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'none', ''],
    default: 'none'
  },
  category: {
    type: String,
    trim: true,
    default: null
  },
  completed: {
    type: Boolean,
    default: false
  },
  created_at: {
    type: String,
    default: () => new Date().toISOString()
  },
  userId: {
    type: String,
    required: true,
    index: true
  }
});

module.exports = mongoose.model('Task', TaskSchema);
