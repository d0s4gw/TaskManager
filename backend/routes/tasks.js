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
router.get('/', (req, res, next) => {
  db.all('SELECT * FROM tasks ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return next(err);
    const tasks = rows.map(row => ({ ...row, completed: !!row.completed }));
    res.json({ tasks });
  });
});

// Create a task
router.post('/', [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title must be under 255 characters'),
  body('description').optional().isString().trim(),
  body('due_date').optional().isString().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'none', '']).withMessage('Invalid priority level'),
  body('category').optional().isString().trim(),
  handleValidationErrors
], (req, res, next) => {
  const { title, description, due_date, priority, category } = req.body;
  
  const sql = `INSERT INTO tasks (title, description, due_date, priority, category) VALUES (?, ?, ?, ?, ?)`;
  const params = [title, description, due_date, priority, category];
  
  db.run(sql, params, function(err) {
    if (err) return next(err);
    res.status(201).json({
      id: this.lastID,
      title,
      completed: false,
      description,
      due_date,
      priority,
      category
    });
  });
});

// Update a task (edit or complete)
router.put('/:id', [
  param('id').isInt().withMessage('Invalid task ID'),
  body('title').optional().trim().notEmpty().withMessage('Title cannot be empty').isLength({ max: 255 }),
  body('completed').optional().isBoolean().withMessage('Completed must be a boolean'),
  body('description').optional().isString().trim(),
  body('due_date').optional().isString().trim(),
  body('priority').optional().isIn(['low', 'medium', 'high', 'none', '']).withMessage('Invalid priority level'),
  body('category').optional().isString().trim(),
  handleValidationErrors
], (req, res, next) => {
  const { id } = req.params;
  const { title, completed, description, due_date, priority, category } = req.body;
  
  db.get('SELECT * FROM tasks WHERE id = ?', [id], (err, row) => {
    if (err) return next(err);
    if (!row) return res.status(404).json({ error: 'Task not found' });
    
    const updateTitle = title !== undefined ? title : row.title;
    const updateCompleted = completed !== undefined ? (completed ? 1 : 0) : row.completed;
    const updateDescription = description !== undefined ? description : row.description;
    const updateDueDate = due_date !== undefined ? due_date : row.due_date;
    const updatePriority = priority !== undefined ? priority : row.priority;
    const updateCategory = category !== undefined ? category : row.category;
    
    const sql = `UPDATE tasks SET title = ?, completed = ?, description = ?, due_date = ?, priority = ?, category = ? WHERE id = ?`;
    const params = [updateTitle, updateCompleted, updateDescription, updateDueDate, updatePriority, updateCategory, id];
    
    db.run(sql, params, function(err) {
      if (err) return next(err);
      res.json({
        id: parseInt(id),
        title: updateTitle,
        completed: !!updateCompleted,
        description: updateDescription,
        due_date: updateDueDate,
        priority: updatePriority,
        category: updateCategory
      });
    });
  });
});

// Delete a task
router.delete('/:id', [
  param('id').isInt().withMessage('Invalid task ID'),
  handleValidationErrors
], (req, res, next) => {
  const { id } = req.params;
  db.run('DELETE FROM tasks WHERE id = ?', id, function(err) {
    if (err) return next(err);
    res.json({ message: 'Task deleted successfully', changes: this.changes });
  });
});

module.exports = router;
