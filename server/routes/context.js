const express = require('express');
const router = express.Router();
const { authenticate } = require('./auth');
const weatherService = require('../services/weatherService');
const mapsService = require('../services/mapsService');

// Get real-time context (weather, traffic, safety)
router.get('/:lat/:lng', authenticate, async (req, res) => {
  try {
    const { lat, lng } = req.params;
    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    // Get weather data
    const currentWeather = await weatherService.getCurrentWeather(latNum, lngNum);
    const forecast = await weatherService.getForecast(latNum, lngNum, 5);
    const weatherRecommendation = weatherService.getWeatherRecommendation(currentWeather);

    // Mock traffic data (would integrate with real traffic API)
    const trafficData = {
      level: 'moderate',
      congestion: 45,
      message: 'Normal traffic conditions'
    };

    // Mock safety alerts (would integrate with real safety API)
    const safetyAlerts = [];

    res.json({
      weather: {
        current: currentWeather,
        forecast,
        recommendation: weatherRecommendation
      },
      traffic: trafficData,
      safety: {
        alerts: safetyAlerts,
        level: 'safe'
      },
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get weather for itinerary dates
router.post('/weather-forecast', authenticate, async (req, res) => {
  try {
    const { lat, lng, dates } = req.body;
    
    const forecast = await weatherService.getForecast(lat, lng, dates?.length || 5);
    
    res.json({
      forecast,
      recommendations: forecast.map(day => 
        weatherService.getWeatherRecommendation({ condition: day.condition, temperature: day.temperature.avg })
      )
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
