const request = require('supertest');
const express = require('express');
const taskRoutes = require('../routes/tasks');
const db = require('../database');

const app = express();
app.use(express.json());
app.use('/api/tasks', taskRoutes);

// Mock error handler
app.use((err, req, res, next) => {
  res.status(500).json({ error: err.message });
});

beforeAll((done) => {
  // Let the DB initialize (in memory)
  setTimeout(done, 100);
});

afterAll((done) => {
  db.close(done);
});

describe('Tasks API', () => {
  let createdTaskId;

  it('should create a new task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Test Task',
        priority: 'high'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Test Task');
    expect(res.body.priority).toBe('high');
    expect(res.body.completed).toBe(false);
    
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
    expect(res.body.errors).toBeDefined();
  });

  it('should get all tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(res.body.tasks).toBeInstanceOf(Array);
    expect(res.body.tasks.length).toBeGreaterThan(0);
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
