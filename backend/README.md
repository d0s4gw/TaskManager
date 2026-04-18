# TaskManager Backend

This is the Express API that powers the TaskManager application. It uses a local SQLite database (`tasks.db`) for persistence.

## Features
- **Security**: Uses `helmet` for secure HTTP headers.
- **Validation**: Uses `express-validator` to strictly type-check incoming data payloads.
- **Persistence**: SQLite database with parameterized queries to prevent SQL injection.

## Scripts
- `node server.js`: Starts the server on port 3001.
- `npm test`: Runs the Jest integration test suite using an isolated, in-memory `:memory:` SQLite database.

## API Endpoints
All endpoints are prefixed with `/api/tasks`.
- `GET /` - Retrieve all tasks
- `POST /` - Create a new task
- `PUT /:id` - Update a task (edit details or toggle completion)
- `DELETE /:id` - Delete a task
