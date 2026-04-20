const express = require('express');
const { body, param, validationResult } = require('express-validator');
const db = require('../database');

const router = express.Router();

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Get all tasks
router.get('/', async (req, res, next) => {
  try {
    const tasksSnapshot = await db.collection('tasks').orderBy('created_at', 'desc').get();
    const tasks = [];
    tasksSnapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });
    res.json({ tasks });
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
    
    const newTask = {
      title,
      description: description || null,
      due_date: due_date || null,
      priority: priority || null,
      category: category || null,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    const docRef = await db.collection('tasks').add(newTask);
    
    res.status(201).json({
      id: docRef.id,
      ...newTask
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
    const updateData = {};
    
    // Only update fields that are provided
    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.completed !== undefined) updateData.completed = req.body.completed;
    if (req.body.description !== undefined) updateData.description = req.body.description;
    if (req.body.due_date !== undefined) updateData.due_date = req.body.due_date;
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.category !== undefined) updateData.category = req.body.category;
    
    const docRef = db.collection('tasks').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    await docRef.update(updateData);
    
    // Return the updated document
    const updatedDoc = await docRef.get();
    res.json({
      id: updatedDoc.id,
      ...updatedDoc.data()
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
    await db.collection('tasks').doc(id).delete();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
