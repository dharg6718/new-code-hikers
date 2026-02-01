const express = require('express');
const router = express.Router();
const authRouter = require('./auth');
const contextSafetyEngine = require('../services/contextSafetyEngine');

const authenticate = authRouter.authenticate;

/**
 * Real-Time Context & Safety API
 * Provides safety validation for travel recommendations
 */

// Validate travel context and get safety assessment
router.post('/validate', authenticate, async (req, res) => {
  try {
    const {
      destination,
      startDate,
      endDate,
      totalBudget,
      travelGroup,
      recommendations
    } = req.body;

    // Build user context
    const userContext = {
      destination,
      startDate,
      endDate,
      totalBudget,
      travelGroup: travelGroup || {
        hasChildren: false,
        hasElderly: false,
        hasMobilityIssues: false,
        size: 1
      },
      visitedPlaces: [],
      preferences: {}
    };

    // Run full safety validation
    const validation = await contextSafetyEngine.validateContext(
      userContext,
      recommendations || { days: [] }
    );

    // Get status summary
    const status = contextSafetyEngine.getSafetyStatusSummary(validation);

    // Generate fallbacks if needed
    let fallbacks = [];
    if (validation.restrictions.length > 0) {
      fallbacks = contextSafetyEngine.generateSafeFallback(
        userContext,
        validation.restrictions
      );
    }

    res.json({
      success: true,
      validation: {
        approved: validation.approved,
        safetyScore: validation.safetyScore,
        status: status.status,
        statusIcon: status.icon,
        statusColor: status.color,
        summary: status.summary
      },
      contextAnalysis: validation.contextAnalysis,
      warnings: validation.warnings,
      restrictions: validation.restrictions,
      safeAlternatives: [...validation.safeAlternatives, ...fallbacks]
    });

  } catch (error) {
    console.error('Context Safety Validation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Safety validation failed',
      error: error.message
    });
  }
});

// Get weather safety for destination
router.get('/weather/:destination', authenticate, async (req, res) => {
  try {
    const { destination } = req.params;
    const { startDate, endDate } = req.query;

    const weatherCheck = await contextSafetyEngine.checkWeatherSafety(
      destination,
      startDate || new Date().toISOString(),
      endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    );

    res.json({
      success: true,
      destination,
      weather: {
        safe: weatherCheck.safe,
        severe: weatherCheck.severe,
        message: weatherCheck.message,
        warnings: weatherCheck.warnings,
        affectedDates: weatherCheck.affectedDates
      }
    });

  } catch (error) {
    console.error('Weather Safety Check Error:', error);
    res.status(500).json({
      success: false,
      message: 'Weather check failed',
      error: error.message
    });
  }
});

// Get safety guidelines for travel group
router.post('/group-guidelines', authenticate, async (req, res) => {
  try {
    const { travelGroup } = req.body;

    const guidelines = [];
    
    if (travelGroup?.hasChildren) {
      guidelines.push({
        category: 'Children Safety',
        icon: '👶',
        tips: [
          'Avoid late-night activities (after 9 PM)',
          'Ensure child-friendly dining options',
          'Keep travel durations under 2 hours between stops',
          'Pack emergency contacts and first-aid kit',
          'Choose accommodations with child safety features'
        ]
      });
    }

    if (travelGroup?.hasElderly) {
      guidelines.push({
        category: 'Elderly Comfort',
        icon: '👴',
        tips: [
          'Schedule rest breaks every 2-3 hours',
          'Avoid strenuous activities like trekking',
          'Ensure wheelchair/mobility access at venues',
          'Keep medication and medical records handy',
          'Choose ground-floor accommodations when possible'
        ]
      });
    }

    if (travelGroup?.hasMobilityIssues) {
      guidelines.push({
        category: 'Accessibility',
        icon: '♿',
        tips: [
          'Verify wheelchair accessibility at all venues',
          'Book accessible transportation in advance',
          'Check for ramps and elevators at attractions',
          'Avoid cobblestone streets and uneven terrain',
          'Request priority seating/entry when available'
        ]
      });
    }

    if (travelGroup?.size > 6) {
      guidelines.push({
        category: 'Large Group',
        icon: '👥',
        tips: [
          'Make advance reservations for restaurants',
          'Book group tours for better rates',
          'Designate a meeting point for each location',
          'Use group messaging apps for coordination',
          'Consider splitting into smaller groups for some activities'
        ]
      });
    }

    // General guidelines
    guidelines.push({
      category: 'General Safety',
      icon: '🛡️',
      tips: [
        'Keep copies of important documents',
        'Share itinerary with emergency contacts',
        'Know local emergency numbers',
        'Stay hydrated and take breaks',
        'Respect local customs and dress codes'
      ]
    });

    res.json({
      success: true,
      guidelines,
      totalTips: guidelines.reduce((sum, g) => sum + g.tips.length, 0)
    });

  } catch (error) {
    console.error('Group Guidelines Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate guidelines',
      error: error.message
    });
  }
});

// Real-time safety status check
router.get('/status', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      engine: 'Real-Time Context & Safety Engine',
      version: '1.0.0',
      status: 'OPERATIONAL',
      capabilities: [
        'Weather Safety Analysis',
        'Time Feasibility Check',
        'Travel Group Safety',
        'Late Night Safety',
        'Exhaustion Risk Detection',
        'Repetition Avoidance',
        'Safe Fallback Generation',
        'Privacy Protection'
      ],
      principle: 'Safety always overrides personalization'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'ERROR',
      error: error.message
    });
  }
});

module.exports = router;
