const express = require('express');
const router = express.Router();
const User = require('../models/User');
const authRouter = require('./auth');

const authenticate = authRouter.authenticate;
const mockUsers = authRouter.mockUsers;
const isMongoConnected = authRouter.isMongoConnected;

// Helper to find mock user by ID
const findMockUserById = (userId) => {
  for (const [email, mockUser] of mockUsers.entries()) {
    if (mockUser._id === userId) {
      return { user: mockUser, email };
    }
  }
  return { user: null, email: null };
};

// Get user profile
router.get('/profile', authenticate, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.userId).select('-password');
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } else {
      const { user } = findMockUserById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user preferences
router.put('/preferences', authenticate, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const user = await User.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.preferences = {
        ...user.preferences,
        ...req.body,
        lastUpdated: new Date()
      };

      await user.save();

      res.json({
        message: 'Preferences updated successfully',
        preferences: user.preferences
      });
    } else {
      const { user, email } = findMockUserById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.preferences = {
        ...user.preferences,
        ...req.body,
        lastUpdated: new Date()
      };
      mockUsers.set(email, user);

      res.json({
        message: 'Preferences updated successfully',
        preferences: user.preferences
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add visited place
router.post('/visited-places', authenticate, async (req, res) => {
  try {
    const { placeId, placeName, rating } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.preferences.visitedPlaces.push({
      placeId,
      placeName,
      visitDate: new Date(),
      rating: rating || 5
    });

    await user.save();

    res.json({
      message: 'Visited place added',
      visitedPlaces: user.preferences.visitedPlaces
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
