const express = require('express');
const router = express.Router();
const { authenticate } = require('./auth');
const llmService = require('../services/llmService');
const User = require('../models/User');

// Chat with AI guide
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message, context } = req.body;
    
    // Get user preferences for context
    const user = await User.findById(req.userId);
    const userContext = {
      preferences: user?.preferences || {},
      ...context
    };

    const response = await llmService.chatWithGuide(message, userContext);

    res.json({
      response,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Guide chat error:', error);
    res.status(500).json({ 
      message: error.message,
      response: "I'm having trouble right now. Please try again in a moment."
    });
  }
});

// Get emergency assistance
router.get('/emergency', authenticate, async (req, res) => {
  try {
    const emergencyInfo = {
      localEmergencyNumber: '112', // Universal emergency number
      touristHelpline: '+91-1800-11-1363',
      embassyInfo: 'Contact your embassy for assistance',
      medicalEmergency: '102',
      policeEmergency: '100',
      fireEmergency: '101',
      message: 'In case of emergency, contact local authorities immediately'
    };

    res.json(emergencyInfo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
