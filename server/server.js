require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: '*', // For development flexibility; restrict in production
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve profile pictures if needed later
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes mapping
app.use('/api/auth', require('./routes/auth'));
app.use('/api/volunteers', require('./routes/volunteers'));
app.use('/api/events', require('./routes/events'));
app.use('/api/reports', require('./routes/reports'));

// API Home / Status Check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    system: 'Volunteer Registration API',
    databaseMode: db.isFallback() ? 'local-fallback (JSON)' : 'mongodb-connected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    message: 'An unexpected server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Start Server after connecting to Database
const startServer = async () => {
  await db.connect();
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    if (db.isFallback()) {
      console.log(`📂 fall-back JSON database stored in: ${path.join(__dirname, 'local_db.json')}`);
    }
  });
};

startServer();
