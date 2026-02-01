const axios = require('axios');
require('dotenv').config();

/**
 * Google Maps Service
 * Handles Maps, Places, and Directions API calls
 */
class MapsService {
  constructor() {
    // Use GOOGLE_MAPS_API_KEY as primary, fallback to GOOGLE_PLACES_API_KEY
    this.apiKey = process.env.GOOGLE_MAPS_API_KEY || process.env.GOOGLE_PLACES_API_KEY;
    this.placesApiKey = process.env.GOOGLE_PLACES_API_KEY || this.apiKey;
    this.geocodingApiKey = process.env.GOOGLE_GEOCODING_API_KEY || this.apiKey;
    this.baseUrl = 'https://maps.googleapis.com/maps/api';
  }

  async searchPlaces(query, location = null, type = null) {
    if (!this.apiKey) {
      console.warn('Google Maps API key not configured');
      return this.getMockPlaces(query);
    }

    try {
      const params = {
        query: query,
        key: this.placesApiKey
      };

      if (location) {
        params.location = `${location.lat},${location.lng}`;
        params.radius = 5000;
      }

      if (type) {
        params.type = type;
      }

      const response = await axios.get(`${this.baseUrl}/place/textsearch/json`, { params });
      
      return response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating || 0,
        categories: place.types || [],
        photos: place.photos?.map(p => `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${p.photo_reference}&key=${this.placesApiKey}`) || []
      }));
    } catch (error) {
      console.error('Google Maps API Error:', error.message);
      return this.getMockPlaces(query);
    }
  }

  async getPlaceDetails(placeId) {
    if (!this.apiKey) {
      return this.getMockPlaceDetails(placeId);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/place/details/json`, {
        params: {
          place_id: placeId,
          fields: 'name,formatted_address,geometry,rating,types,photos,opening_hours,price_level,accessibility_options',
          key: this.placesApiKey
        }
      });

      const place = response.data.result;
      return {
        id: place.place_id,
        name: place.name,
        address: place.formatted_address,
        coordinates: {
          lat: place.geometry.location.lat,
          lng: place.geometry.location.lng
        },
        rating: place.rating || 0,
        categories: place.types || [],
        openingHours: place.opening_hours?.weekday_text || [],
        priceLevel: place.price_level || 0,
        wheelchairAccessible: place.accessibility_options?.wheelchair_accessible || false
      };
    } catch (error) {
      console.error('Google Maps Details Error:', error.message);
      return this.getMockPlaceDetails(placeId);
    }
  }

  async getDirections(origin, destination, waypoints = []) {
    if (!this.apiKey) {
      return this.getMockDirections(origin, destination);
    }

    try {
      const params = {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: this.apiKey, // Directions API uses main Maps API key
        mode: 'driving'
      };

      if (waypoints.length > 0) {
        params.waypoints = waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|');
      }

      const response = await axios.get(`${this.baseUrl}/directions/json`, { params });
      
      if (response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const leg = route.legs[0];
        
        return {
          distance: leg.distance.value / 1000, // km
          duration: leg.duration.value / 60, // minutes
          polyline: route.overview_polyline.points,
          steps: leg.steps.map(step => ({
            instruction: step.html_instructions,
            distance: step.distance.text,
            duration: step.duration.text
          }))
        };
      }

      return null;
    } catch (error) {
      console.error('Google Directions Error:', error.message);
      return this.getMockDirections(origin, destination);
    }
  }

  // Mock data for development when API key is not available
  getMockPlaces(query) {
    // Default placeholder images for different categories
    const defaultImages = [
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400'
    ];
    
    // Extract place name from query
    const placeName = query.split(' ').slice(0, 3).join(' ');
    
    return [
      {
        id: `mock-${Date.now()}-1`,
        name: placeName,
        address: `${placeName}, Tourist Area`,
        coordinates: { lat: 12.9716 + Math.random() * 0.1, lng: 77.5946 + Math.random() * 0.1 },
        rating: 4.2 + Math.random() * 0.6,
        categories: ['tourist_attraction', 'point_of_interest'],
        photos: [defaultImages[Math.floor(Math.random() * defaultImages.length)]]
      }
    ];
  }

  getMockPlaceDetails(placeId) {
    return {
      id: placeId,
      name: 'Example Tourist Attraction',
      address: '123 Main Street',
      coordinates: { lat: 12.9716, lng: 77.5946 },
      rating: 4.5,
      categories: ['tourist_attraction'],
      openingHours: ['Monday: 9:00 AM - 6:00 PM'],
      priceLevel: 2,
      wheelchairAccessible: true
    };
  }

  getMockDirections(origin, destination) {
    return {
      distance: 5.2,
      duration: 15,
      polyline: '',
      steps: [
        { instruction: 'Head north', distance: '1.2 km', duration: '3 min' },
        { instruction: 'Turn right', distance: '2.0 km', duration: '5 min' }
      ]
    };
  }
}

module.exports = new MapsService();
