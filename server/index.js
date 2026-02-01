const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/users', require('./routes/users'));
app.use('/api/v1/itineraries', require('./routes/itineraries'));
app.use('/api/v1/context', require('./routes/context'));
app.use('/api/v1/guide', require('./routes/guide'));
app.use('/api/v1/community', require('./routes/community'));
app.use('/api/v1/feedback', require('./routes/feedback'));
app.use('/api/v1/safety', require('./routes/safety'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Safety Engine Status
app.get('/api/safety-status', (req, res) => {
  res.json({
    engine: 'Real-Time Context & Safety Engine',
    status: 'ACTIVE',
    principle: 'Safety always overrides personalization',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-tourism')
.then(() => console.log('✅ MongoDB connected'))
.catch(err => {
  console.error('❌ MongoDB connection error:', err.message);
  console.log('⚠️  App will continue with mock data. Check your MongoDB connection string.');
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
