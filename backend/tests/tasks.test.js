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

const taskRoutes = require('../routes/tasks');

// Mock the database
jest.mock('../database', () => {
  let mockData = {};
  
  return {
    collection: jest.fn(() => ({
      where: jest.fn(() => ({
        orderBy: jest.fn().mockReturnThis(),
        get: jest.fn(() => {
          const docs = Object.entries(mockData)
            .filter(([id, data]) => data.userId === 'test_user_123')
            .map(([id, data]) => ({
              id,
              data: () => data
            }));
          docs.forEach = function(cb) {
            for (let i = 0; i < this.length; i++) cb(this[i]);
          };
          return Promise.resolve(docs);
        })
      })),
      add: jest.fn((data) => {
        const id = 'test_id_' + Date.now();
        mockData[id] = data;
        return Promise.resolve({ id });
      }),
      doc: jest.fn((id) => ({
        get: jest.fn(() => {
          if (!mockData[id]) return Promise.resolve({ exists: false });
          return Promise.resolve({ 
            exists: true, 
            id, 
            data: () => mockData[id] 
          });
        }),
        update: jest.fn((data) => {
          mockData[id] = { ...mockData[id], ...data };
          return Promise.resolve();
        }),
        delete: jest.fn(() => {
          delete mockData[id];
          return Promise.resolve();
        })
      }))
    }))
  };
});

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

// Mock error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

describe('Tasks API with Auth', () => {
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
    expect(res.body.userId).toBe('test_user_123'); // Should be attached by routes/tasks.js
    
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
