const express = require('express');
const router = express.Router();
const { authenticate } = require('./auth');
const mapsService = require('../services/mapsService');
const personalizationEngine = require('../services/personalizationEngine');
const User = require('../models/User');

// Get local experiences (artisans, events, sustainable tourism)
router.get('/experiences', authenticate, async (req, res) => {
  try {
    const { location, query } = req.query;
    
    // Get user preferences
    const user = await User.findById(req.userId);
    
    // Search for local experiences
    const searchQuery = query || 'local artisan sustainable tourism';
    const places = await mapsService.searchPlaces(
      `${searchQuery} ${location || ''}`,
      location ? { lat: parseFloat(location.split(',')[0]), lng: parseFloat(location.split(',')[1]) } : null
    );

    // Score and rank based on sustainability and user preferences
    const rankedExperiences = personalizationEngine.rankPlaces(
      places.map(p => ({
        ...p,
        estimatedCost: 300,
        estimatedDuration: 90,
        sustainabilityScore: 8, // Higher for community experiences
        wheelchairAccessible: true,
        dietaryOptions: ['vegetarian', 'vegan', 'local']
      })),
      user?.preferences || {}
    );

    res.json({
      experiences: rankedExperiences.slice(0, 20),
      total: rankedExperiences.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get sustainable tourism options
router.get('/sustainable', authenticate, async (req, res) => {
  try {
    const { location } = req.query;
    
    const places = await mapsService.searchPlaces(
      'eco-friendly sustainable tourism green',
      location ? { lat: parseFloat(location.split(',')[0]), lng: parseFloat(location.split(',')[1]) } : null
    );

    const user = await User.findById(req.userId);
    const ranked = personalizationEngine.rankPlaces(
      places.map(p => ({
        ...p,
        sustainabilityScore: 9,
        estimatedCost: 400,
        estimatedDuration: 120
      })),
      user?.preferences || {}
    );

    res.json({
      sustainableOptions: ranked.slice(0, 15)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
