const express = require('express');
const { body, param, validationResult } = require('express-validator');
const Task = require('../models/Task');
const requireAuth = require('../middleware/auth');

const router = express.Router();

// Apply auth middleware to all task routes
router.use(requireAuth);

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all tasks for the logged-in user
router.get('/', async (req, res, next) => {
  try {
    const tasks = await Task.find({ userId: req.user.uid });
    res.json({ tasks: tasks.map(t => ({ id: t._id, ...t.toObject(), _id: undefined })) });
  } catch (error) {
    next(error);
  }
});

// Create a task
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title must be under 255 characters'),
  body('description').optional().isString().trim(),
  body('due_date').optional().isString().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'none', '']).withMessage('Invalid priority level'),
  body('category').optional().isString().trim(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { title, description, due_date, priority, category } = req.body;
    
    const newTask = new Task({
      title,
      description: description || null,
      due_date: due_date || null,
      priority: priority || null,
      category: category || null,
      completed: false,
      userId: req.user.uid
    });
    
    const savedTask = await newTask.save();
    
    res.status(201).json({
      id: savedTask._id,
      ...savedTask.toObject(),
      _id: undefined
    });
  } catch (error) {
    next(error);
  }
});

// Update a task (edit or complete)
router.put('/:id', [
  param('id').isString().withMessage('Invalid task ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 255 }),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('description').optional().isString().trim(),
  body('due_date').optional().isString().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'none', '']).withMessage('Invalid priority level'),
  body('category').optional().isString().trim(),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const task = await Task.findOne({ _id: id, userId: req.user.uid });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }
    
    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.completed !== undefined) task.completed = req.body.completed;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.due_date !== undefined) task.due_date = req.body.due_date;
    if (req.body.priority !== undefined) task.priority = req.body.priority;
    if (req.body.category !== undefined) task.category = req.body.category;
    
    const updatedTask = await task.save();
    
    res.json({
      id: updatedTask._id,
      ...updatedTask.toObject(),
      _id: undefined
    });
  } catch (error) {
    next(error);
  }
});

// Delete a task
router.delete('/:id', [
  param('id').isString().withMessage('Invalid task ID'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findOneAndDelete({ _id: id, userId: req.user.uid });
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
