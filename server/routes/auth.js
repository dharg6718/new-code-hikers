const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// In-memory mock users for when MongoDB is not available
const mockUsers = new Map();

// Helper to check if MongoDB is connected
const isMongoConnected = () => mongoose.connection.readyState === 1;

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    if (isMongoConnected()) {
      // Use MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = new User({
        email,
        name,
        password: hashedPassword
      });

      await user.save();

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.preferences
        }
      });
    } else {
      // Use mock storage when MongoDB is not available
      if (mockUsers.has(email)) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const mockUserId = 'mock_' + Date.now();
      const mockUser = {
        _id: mockUserId,
        email,
        name,
        password: hashedPassword,
        preferences: { interests: [], dietaryRestrictions: [], accessibilityNeeds: [] }
      };
      mockUsers.set(email, mockUser);

      const token = jwt.sign(
        { userId: mockUserId },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      console.log('⚠️ Using mock auth (MongoDB not connected). User registered:', email);
      
      res.status(201).json({
        token,
        user: {
          id: mockUserId,
          email: mockUser.email,
          name: mockUser.name,
          preferences: mockUser.preferences
        }
      });
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    if (isMongoConnected()) {
      // Use MongoDB
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: user._id },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          preferences: user.preferences
        }
      });
    } else {
      // Use mock storage
      const mockUser = mockUsers.get(email);
      if (!mockUser) {
        return res.status(401).json({ message: 'Invalid credentials. Try registering first.' });
      }

      const isValid = await bcrypt.compare(password, mockUser.password);
      if (!isValid) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = jwt.sign(
        { userId: mockUser._id },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: '7d' }
      );

      console.log('⚠️ Using mock auth (MongoDB not connected). User logged in:', email);
      
      res.json({
        token,
        user: {
          id: mockUser._id,
          email: mockUser.email,
          name: mockUser.name,
          preferences: mockUser.preferences
        }
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Middleware to verify token
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Export everything properly
router.mockUsers = mockUsers;
router.isMongoConnected = isMongoConnected;
router.authenticate = authenticate;

module.exports = router;
