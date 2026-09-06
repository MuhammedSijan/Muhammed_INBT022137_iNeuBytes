const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const { connectDatabase } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const departmentRoutes = require('./routes/departmentRoutes');
const appointmentRoutes = require('./routes/appointmentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Global Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets from client directory
app.use(express.static(path.join(__dirname, '../client')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    system: 'MediLink Healthcare & Clinic Management System',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/analytics', analyticsRoutes);

// Fallback route for Single Page / Multi Page Navigation
app.get('*', (req, res, next) => {
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ success: false, message: `Endpoint ${req.url} not found` });
  }
  // If requesting a file that exists in client, let static middleware handle, else index.html
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Centralized Error Handling Middleware
app.use(errorHandler);

// Start Server and Database Connection
async function startServer() {
  await connectDatabase();
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(` MediLink Server running at http://localhost:${PORT}`);
    console.log(` Web Portal: http://localhost:${PORT}/index.html`);
    console.log(` REST API:   http://localhost:${PORT}/api/health`);
    console.log('====================================================');
  });
}

startServer();

module.exports = app;
