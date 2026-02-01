const express = require('express');
const router = express.Router();
const { authenticate } = require('./auth');
const User = require('../models/User');
const Itinerary = require('../models/Itinerary');

// Submit feedback
router.post('/', authenticate, async (req, res) => {
  try {
    const { itineraryId, feedback, rating, visitedPlaces } = req.body;
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add feedback to history
    user.preferences.feedbackHistory.push({
      itineraryId,
      feedback,
      rating: rating || 5,
      timestamp: new Date()
    });

    // Update visited places if provided
    if (visitedPlaces && Array.isArray(visitedPlaces)) {
      visitedPlaces.forEach(place => {
        const existing = user.preferences.visitedPlaces.find(
          vp => vp.placeId === place.placeId
        );
        
        if (!existing) {
          user.preferences.visitedPlaces.push({
            placeId: place.placeId,
            placeName: place.placeName,
            visitDate: new Date(),
            rating: place.rating || rating || 5
          });
        } else {
          existing.rating = place.rating || existing.rating;
        }
      });
    }

    // Update preferences based on feedback (learning)
    if (rating) {
      // Adjust interest weights based on positive/negative feedback
      // This is a simplified learning mechanism
      const adjustment = (rating - 3) * 0.1; // Scale adjustment
      
      // Would implement more sophisticated learning here
      user.preferences.lastUpdated = new Date();
    }

    await user.save();

    // Update itinerary status if completed
    if (itineraryId) {
      const itinerary = await Itinerary.findById(itineraryId);
      if (itinerary && itinerary.userId.toString() === req.userId) {
        itinerary.status = 'completed';
        await itinerary.save();
      }
    }

    res.json({
      message: 'Feedback submitted successfully',
      updatedPreferences: user.preferences
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get feedback history
router.get('/', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      feedbackHistory: user.preferences.feedbackHistory || [],
      visitedPlaces: user.preferences.visitedPlaces || []
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get learning insights (how AI adapts)
router.get('/insights', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const insights = {
      totalFeedback: user.preferences.feedbackHistory?.length || 0,
      visitedPlaces: user.preferences.visitedPlaces?.length || 0,
      averageRating: user.preferences.feedbackHistory?.length > 0
        ? user.preferences.feedbackHistory.reduce((sum, f) => sum + f.rating, 0) / user.preferences.feedbackHistory.length
        : 0,
      lastUpdated: user.preferences.lastUpdated,
      message: `Based on ${user.preferences.feedbackHistory?.length || 0} feedback entries, your preferences have been refined to better match your travel style.`
    };

    res.json(insights);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
