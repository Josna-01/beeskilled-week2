const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const noteRoutes = require('./routes/noteRoutes');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Root / Health check route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Notes App Backend API is running',
    version: '1.0.0',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        profile: 'GET /api/auth/profile (Protected)'
      },
      notes: {
        createNote: 'POST /api/notes (Protected)',
        getNotes: 'GET /api/notes (Protected)',
        getNoteById: 'GET /api/notes/:id (Protected)',
        updateNote: 'PUT /api/notes/:id (Protected)',
        deleteNote: 'DELETE /api/notes/:id (Protected)'
      }
    }
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/notes', noteRoutes);

// Handle 404 for undefined routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found at ${req.method} ${req.originalUrl}`
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

module.exports = app;

