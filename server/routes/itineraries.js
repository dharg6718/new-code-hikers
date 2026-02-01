const express = require('express');
const router = express.Router();
const Itinerary = require('../models/Itinerary');
const User = require('../models/User');
const authRouter = require('./auth');
const personalizationEngine = require('../services/personalizationEngine');
const mapsService = require('../services/mapsService');
const llmService = require('../services/llmService');
const contextSafetyEngine = require('../services/contextSafetyEngine');

const authenticate = authRouter.authenticate;
const mockUsers = authRouter.mockUsers;
const isMongoConnected = authRouter.isMongoConnected;

// In-memory storage for itineraries when MongoDB is not available
const mockItineraries = new Map();

// Get all itineraries for user
router.get('/', authenticate, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const itineraries = await Itinerary.find({ userId: req.userId })
        .sort({ createdAt: -1 });
      res.json(itineraries);
    } else {
      // Return mock itineraries
      const userItineraries = [];
      mockItineraries.forEach((itinerary) => {
        if (itinerary.userId === req.userId) {
          userItineraries.push(itinerary);
        }
      });
      res.json(userItineraries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single itinerary
router.get('/:id', authenticate, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const itinerary = await Itinerary.findOne({
        _id: req.params.id,
        userId: req.userId
      });
      
      if (!itinerary) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }
      
      res.json(itinerary);
    } else {
      const itinerary = mockItineraries.get(req.params.id);
      if (!itinerary || itinerary.userId !== req.userId) {
        return res.status(404).json({ message: 'Itinerary not found' });
      }
      res.json(itinerary);
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Generate new itinerary
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { destination, startDate, endDate, totalBudget, travelGroup, accessibilityNeeds, interests } = req.body;
    
    // Get user preferences (from MongoDB or mock)
    let user;
    if (isMongoConnected()) {
      user = await User.findById(req.userId);
    } else {
      // Find mock user by ID
      for (const [email, mockUser] of mockUsers.entries()) {
        if (mockUser._id === req.userId) {
          user = mockUser;
          break;
        }
      }
    }
    
    if (!user) {
      // Create a default user object for itinerary generation
      user = {
        preferences: { interests: [], dietaryRestrictions: [], accessibilityNeeds: [] }
      };
    }

    // Calculate number of days
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Get AI-generated place recommendations
    const aiRecommendations = await llmService.generatePlaceRecommendations(
      destination,
      days,
      user.preferences
    );

    const itineraryDays = [];

    if (aiRecommendations && aiRecommendations.days) {
      // Use AI recommendations
      // OPTIMIZATION: Collect all places first and fetch Google Maps data in parallel
      const allPlacesToFetch = [];
      for (let i = 0; i < days; i++) {
        const aiDay = aiRecommendations.days[i] || aiRecommendations.days[0];
        for (const place of (aiDay.places || [])) {
          const searchQuery = place.place_name 
            ? `${place.place_name} ${place.city || destination}`
            : `${place.name} ${destination}`;
          allPlacesToFetch.push({ searchQuery, place, dayIndex: i });
        }
      }

      // Fetch all Google Maps data in parallel (batched for rate limiting)
      const batchSize = 5;
      const googlePlacesMap = new Map();
      for (let b = 0; b < allPlacesToFetch.length; b += batchSize) {
        const batch = allPlacesToFetch.slice(b, b + batchSize);
        const results = await Promise.all(
          batch.map(item => mapsService.searchPlaces(item.searchQuery).catch(() => []))
        );
        batch.forEach((item, idx) => {
          googlePlacesMap.set(item.searchQuery, results[idx][0] || {});
        });
      }

      // Now build itinerary days using cached Google data
      for (let i = 0; i < days; i++) {
        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + i);
        
        const aiDay = aiRecommendations.days[i] || aiRecommendations.days[0];
        const activities = [];
        let dayCost = 0;
        let currentTime = 9 * 60; // Start at 9 AM

        // Default placeholder images by category
        const defaultImages = {
          landmark: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
          museum: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400',
          nature: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
          religious: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
          historical: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
          shopping: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400',
          attraction: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'
        };

        for (const place of (aiDay.places || [])) {
          const searchQuery = place.place_name 
            ? `${place.place_name} ${place.city || destination}`
            : `${place.name} ${destination}`;
          
          const googlePlace = googlePlacesMap.get(searchQuery) || {};
          const duration = place.duration || 120;
          const placeName = place.place_name || place.name;
          const category = place.category || 'attraction';
          
          // Use Google photos or fallback to category-based default image
          const photos = (googlePlace.photos && googlePlace.photos.length > 0) 
            ? googlePlace.photos 
            : [defaultImages[category] || defaultImages.attraction];

          activities.push({
            placeId: googlePlace.id || `ai-${Date.now()}-${Math.random()}`,
            placeName: placeName,
            city: place.city || destination,
            category: category,
            description: place.importance || place.description || '',
            startTime: `${Math.floor(currentTime / 60)}:${String(currentTime % 60).padStart(2, '0')}`,
            endTime: `${Math.floor((currentTime + duration) / 60)}:${String((currentTime + duration) % 60).padStart(2, '0')}`,
            duration: duration,
            cost: place.estimatedCost || 500,
            coordinates: googlePlace.coordinates || place.coordinates,
            photos: photos,
            rating: googlePlace.rating || 4.5,
            tips: place.tips || '',
            bestTime: place.bestTime || 'Anytime',
            sustainabilityScore: 7,
            accessibilityScore: 8,
            aiReasoning: place.importance || place.description || 'Recommended based on your preferences',
            order: activities.length + 1
          });

          dayCost += place.estimatedCost || 500;
          currentTime += duration + 30;
        }

        itineraryDays.push({
          date: dayDate,
          theme: aiDay.theme || `Day ${i + 1} Exploration`,
          activities,
          totalCost: dayCost,
          totalDistance: 15,
          weatherAware: false
        });
      }
    } else {
      // Fallback: Search for tourist attractions in destination using Google Maps
      console.log('Using Google Places API fallback for:', destination);
      
      // Search for different categories - attractions, temples, and restaurants
      const searchQueries = [
        { query: `${destination} famous tourist attractions landmarks`, category: 'attraction' },
        { query: `${destination} best restaurants famous food`, category: 'restaurant' },
        { query: `${destination} temples religious sites churches mosques`, category: 'temple' },
        { query: `${destination} historical monuments heritage sites`, category: 'monument' },
        { query: `${destination} museums art galleries`, category: 'museum' },
        { query: `${destination} parks gardens nature`, category: 'park' },
        { query: `${destination} local street food markets`, category: 'market' }
      ];
      
      // Fetch all queries in parallel for faster response
      const searchResults = await Promise.all(
        searchQueries.map(async (item) => {
          const places = await mapsService.searchPlaces(item.query).catch(() => []);
          return places.map(p => ({ ...p, category: item.category }));
        })
      );
      
      // Separate places by category
      const placesByCategory = {
        attraction: [],
        restaurant: [],
        temple: [],
        monument: [],
        museum: [],
        park: [],
        market: []
      };
      
      searchResults.flat().forEach(place => {
        if (placesByCategory[place.category]) {
          // Avoid duplicates
          if (!placesByCategory[place.category].find(p => p.id === place.id)) {
            placesByCategory[place.category].push(place);
          }
        }
      });
      
      // Category-specific placeholder images
      const categoryImages = {
        attraction: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
        restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
        temple: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
        monument: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
        museum: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400',
        park: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400',
        market: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400'
      };

      // Track used places to avoid repetition
      const usedPlaceIds = new Set();
      
      // Helper to get next available place from a category
      const getNextPlace = (category) => {
        const places = placesByCategory[category] || [];
        for (const place of places) {
          if (!usedPlaceIds.has(place.id)) {
            usedPlaceIds.add(place.id);
            return place;
          }
        }
        return null;
      };

      // Day themes for variety
      const dayThemes = [
        { name: 'Heritage & Culture', categories: ['monument', 'temple', 'restaurant', 'attraction'] },
        { name: 'Local Flavors & Temples', categories: ['restaurant', 'temple', 'market', 'park'] },
        { name: 'Art & Cuisine', categories: ['museum', 'restaurant', 'attraction', 'temple'] },
        { name: 'Nature & Spirituality', categories: ['park', 'temple', 'restaurant', 'monument'] },
        { name: 'Hidden Gems', categories: ['market', 'temple', 'restaurant', 'museum'] }
      ];

      for (let i = 0; i < days; i++) {
        const dayDate = new Date(start);
        dayDate.setDate(start.getDate() + i);
        
        const activities = [];
        let dayCost = 0;
        let currentTime = 9 * 60; // Start at 9 AM
        
        // Get theme for this day
        const theme = dayThemes[i % dayThemes.length];

        // Add 4 activities per day from different categories
        for (let j = 0; j < 4; j++) {
          const category = theme.categories[j];
          let place = getNextPlace(category);
          
          // Fallback to any available attraction if category is empty
          if (!place) {
            for (const cat of ['attraction', 'monument', 'temple', 'restaurant', 'museum', 'park', 'market']) {
              place = getNextPlace(cat);
              if (place) break;
            }
          }
          
          if (!place) continue;
          
          const duration = category === 'restaurant' ? 90 : 120;
          const cost = category === 'restaurant' ? 800 : 500;
          
          // Use place photos or fallback to category-specific images
          const photos = (place.photos && place.photos.length > 0) 
            ? place.photos 
            : [categoryImages[category] || categoryImages.attraction];
          
          // Determine time slot based on activity type
          let timeLabel = 'Morning Visit';
          if (currentTime >= 12 * 60 && currentTime < 14 * 60) {
            timeLabel = category === 'restaurant' ? '🍽️ Lunch Time' : 'Afternoon Visit';
          } else if (currentTime >= 17 * 60) {
            timeLabel = category === 'restaurant' ? '🍽️ Dinner Time' : 'Evening Visit';
          }
          
          activities.push({
            placeId: place.id,
            placeName: place.name,
            category: category,
            description: place.address || '',
            startTime: `${Math.floor(currentTime / 60)}:${String(currentTime % 60).padStart(2, '0')}`,
            endTime: `${Math.floor((currentTime + duration) / 60)}:${String((currentTime + duration) % 60).padStart(2, '0')}`,
            duration: duration,
            cost: cost,
            coordinates: place.coordinates,
            photos: photos,
            rating: place.rating || 4.0,
            tips: timeLabel,
            bestTime: timeLabel,
            sustainabilityScore: 7,
            accessibilityScore: 8,
            aiReasoning: `${category === 'restaurant' ? '🍴 Famous for local cuisine' : category === 'temple' ? '🛕 Cultural & spiritual significance' : '⭐ Must-visit attraction'}`,
            order: j + 1
          });

          dayCost += cost;
          currentTime += duration + 30; // 30 min travel between places
        }

        itineraryDays.push({
          date: dayDate,
          theme: `${theme.name} - Day ${i + 1}`,
          activities,
          totalCost: dayCost,
          totalDistance: 15,
          weatherAware: false
        });
      }
    }

    // ========== REAL-TIME CONTEXT & SAFETY VALIDATION ==========
    // Parse travel group from form selection
    const parseTravelGroup = (groupType, accessibility) => {
      const groups = {
        'solo': { hasChildren: false, hasElderly: false, hasMobilityIssues: false, size: 1 },
        'couple': { hasChildren: false, hasElderly: false, hasMobilityIssues: false, size: 2 },
        'family-young': { hasChildren: true, hasElderly: false, hasMobilityIssues: false, size: 4 },
        'family': { hasChildren: false, hasElderly: false, hasMobilityIssues: false, size: 4 },
        'seniors': { hasChildren: false, hasElderly: true, hasMobilityIssues: false, size: 2 },
        'friends': { hasChildren: false, hasElderly: false, hasMobilityIssues: false, size: 5 },
        'business': { hasChildren: false, hasElderly: false, hasMobilityIssues: false, size: 1 }
      };
      const base = groups[groupType] || { hasChildren: false, hasElderly: false, hasMobilityIssues: false, size: 1 };
      
      // Add accessibility needs
      if (accessibility === 'wheelchair' || accessibility === 'mobility') {
        base.hasMobilityIssues = true;
      }
      base.accessibilityType = accessibility || 'none';
      
      return base;
    };

    // Build user context for safety engine
    const userContext = {
      destination,
      startDate,
      endDate,
      totalBudget: totalBudget || 10000,
      travelGroup: parseTravelGroup(travelGroup, accessibilityNeeds),
      visitedPlaces: user.preferences?.visitedPlaces || [],
      preferences: {
        ...user.preferences,
        interests: interests ? interests.split(',').map(i => i.trim()) : user.preferences?.interests || []
      }
    };

    // Validate itinerary through Context & Safety Engine
    const safetyValidation = await contextSafetyEngine.validateContext(
      userContext,
      { days: itineraryDays }
    );

    // Get safety status summary
    const safetyStatus = contextSafetyEngine.getSafetyStatusSummary(safetyValidation);

    // Generate safe fallbacks if needed
    let safeFallbacks = [];
    if (safetyValidation.restrictions.length > 0) {
      safeFallbacks = contextSafetyEngine.generateSafeFallback(
        userContext,
        safetyValidation.restrictions
      );
    }

    // Generate explanation quickly without extra API call (skip slow LLM call)
    const aiExplanation = personalizationEngine.generateExplanation(
      { destination, days: itineraryDays },
      user.preferences
    );

    // Create and save itinerary with safety data
    let savedItinerary;
    
    if (isMongoConnected()) {
      const itinerary = new Itinerary({
        userId: req.userId,
        destination,
        startDate: start,
        endDate: end,
        days: itineraryDays,
        totalBudget: totalBudget || 10000,
        preferences: user.preferences,
        aiExplanation,
        overallTips: aiRecommendations?.overallTips || '',
        status: 'draft',
        // Safety data
        safetyScore: safetyValidation.safetyScore,
        safetyWarnings: safetyValidation.warnings,
        safetyStatus: safetyStatus.status,
        safeFallbacks: safeFallbacks
      });

      await itinerary.save();
      savedItinerary = itinerary;
    } else {
      // Save to mock storage
      const mockId = 'itinerary_' + Date.now();
      savedItinerary = {
        _id: mockId,
        userId: req.userId,
        destination,
        startDate: start,
        endDate: end,
        days: itineraryDays,
        totalBudget: totalBudget || 10000,
        preferences: user.preferences || {},
        aiExplanation,
        overallTips: aiRecommendations?.overallTips || '',
        status: 'draft',
        createdAt: new Date(),
        // Safety data
        safetyScore: safetyValidation.safetyScore,
        safetyWarnings: safetyValidation.warnings,
        safetyStatus: safetyStatus.status,
        safeFallbacks: safeFallbacks
      };
      mockItineraries.set(mockId, savedItinerary);
      console.log('⚠️ Using mock storage (MongoDB not connected). Itinerary saved with ID:', mockId);
      console.log(`🛡️ Safety Score: ${safetyStatus.summary}`);
    }

    res.status(201).json(savedItinerary);
  } catch (error) {
    console.error('Itinerary generation error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get place details with AI enhancement
router.get('/place/:placeId', authenticate, async (req, res) => {
  try {
    const { placeId } = req.params;
    const { destination } = req.query;

    // Get place details from Google Maps
    const googleDetails = await mapsService.getPlaceDetails(placeId);
    
    // Enhance with AI details
    let aiDetails = null;
    if (googleDetails && googleDetails.name) {
      aiDetails = await llmService.getPlaceDetails(googleDetails.name, destination || '');
    }

    res.json({
      ...googleDetails,
      aiDetails
    });
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update itinerary
router.put('/:id', authenticate, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    Object.assign(itinerary, req.body);
    await itinerary.save();

    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete itinerary
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId
    });
    
    if (!itinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json({ message: 'Itinerary deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
