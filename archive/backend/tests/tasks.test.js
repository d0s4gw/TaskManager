const request = require('supertest');
const express = require('express');

// Mock the auth middleware BEFORE importing the routes
jest.mock('../middleware/auth', () => {
  return (req, res, next) => {
    // Simulate an authenticated user
    req.user = { uid: 'test_user_123' };
    next();
  };
});

// Mock the Task model
jest.mock('../models/Task', () => {
  let mockData = {};
  
  function MockTask(data) {
    this._id = 'test_id_' + Date.now();
    this.toObject = () => ({ _id: this._id, ...data });
    this.save = jest.fn().mockResolvedValue(this);
    // Assign properties to the instance
    Object.assign(this, data);
  }

  MockTask.find = jest.fn().mockImplementation((query) => {
    return Promise.resolve(Object.values(mockData).filter(t => t.userId === query.userId));
  });

  MockTask.findOne = jest.fn().mockImplementation((query) => {
    const task = mockData[query._id];
    if (task && task.userId === query.userId) {
      return Promise.resolve({
        ...task,
        save: jest.fn().mockImplementation(function() {
          mockData[this._id] = { ...this };
          return Promise.resolve(this);
        }),
        toObject: function() { return { ...this }; }
      });
    }
    return Promise.resolve(null);
  });

  MockTask.findOneAndDelete = jest.fn().mockImplementation((query) => {
    const task = mockData[query._id];
    if (task && task.userId === query.userId) {
      delete mockData[query._id];
      return Promise.resolve(task);
    }
    return Promise.resolve(null);
  });

  // For the 'new Task()' usage
  const TaskConstructor = function(data) {
    const id = 'test_id_' + Date.now();
    const task = { 
      _id: id, 
      ...data, 
      toObject: function() { return { ...this }; },
      save: jest.fn().mockImplementation(function() {
        mockData[this._id] = { ...this };
        return Promise.resolve(this);
      })
    };
    return task;
  };

  // Merge everything into a single mock object
  const mock = TaskConstructor;
  mock.find = MockTask.find;
  mock.findOne = MockTask.findOne;
  mock.findOneAndDelete = MockTask.findOneAndDelete;
  
  return mock;
});

const taskRoutes = require('../routes/tasks');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

// Mock error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

describe('Tasks API with Auth (Mongoose Mock)', () => {
  let createdTaskId;

  it('should create a new task attached to the user', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Auth Test Task',
        priority: 'high'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Auth Test Task');
    expect(res.body.userId).toBe('test_user_123');
    
    createdTaskId = res.body.id;
  });

  it('should validate invalid priority', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Invalid Priority Task',
        priority: 'superhigh'
      });
    
    expect(res.statusCode).toBe(400);
  });

  it('should get all tasks for the logged in user', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toBeInstanceOf(Array);
    expect(res.body.tasks.length).toBeGreaterThan(0);
    expect(res.body.tasks[0].userId).toBe('test_user_123');
  });

  it('should update a task', async () => {
    const res = await request(app)
      .put(`/api/tasks/${createdTaskId}`)
      .send({
        completed: true
      });
      
    expect(res.statusCode).toBe(200);
    expect(res.body.completed).toBe(true);
  });

  it('should delete a task', async () => {
    const res = await request(app).delete(`/api/tasks/${createdTaskId}`);
    expect(res.statusCode).toBe(200);
    
    const getRes = await request(app).get('/api/tasks');
    expect(getRes.body.tasks.find(t => t.id === createdTaskId)).toBeUndefined();
  });
});
