const mongoose = require('mongoose');

const preferenceVectorSchema = new mongoose.Schema({
  // Travel preferences
  travelPace: { type: String, enum: ['slow', 'moderate', 'fast'], default: 'moderate' },
  budgetLevel: { type: String, enum: ['budget', 'mid-range', 'luxury'], default: 'mid-range' },
  groupSize: { type: Number, default: 1 },
  
  // Interests (0-1 scale)
  interests: {
    culture: { type: Number, default: 0.5, min: 0, max: 1 },
    nature: { type: Number, default: 0.5, min: 0, max: 1 },
    adventure: { type: Number, default: 0.5, min: 0, max: 1 },
    food: { type: Number, default: 0.5, min: 0, max: 1 },
    history: { type: Number, default: 0.5, min: 0, max: 1 },
    shopping: { type: Number, default: 0.5, min: 0, max: 1 },
    nightlife: { type: Number, default: 0.5, min: 0, max: 1 },
    relaxation: { type: Number, default: 0.5, min: 0, max: 1 },
    photography: { type: Number, default: 0.5, min: 0, max: 1 },
    sustainability: { type: Number, default: 0.5, min: 0, max: 1 }
  },
  
  // Accessibility
  accessibility: {
    wheelchairFriendly: { type: Boolean, default: false },
    dietaryRestrictions: [{ type: String }],
    languagePreferences: [{ type: String, default: ['en'] }],
    mobilityLevel: { type: String, enum: ['high', 'medium', 'low'], default: 'high' }
  },
  
  // Learning data
  visitedPlaces: [{ 
    placeId: String,
    placeName: String,
    visitDate: Date,
    rating: { type: Number, min: 1, max: 5 }
  }],
  
  feedbackHistory: [{
    itineraryId: String,
    feedback: String,
    rating: Number,
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Last updated timestamp
  lastUpdated: { type: Date, default: Date.now }
}, { _id: false });

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  preferences: { type: preferenceVectorSchema, default: () => ({}) },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', userSchema);
