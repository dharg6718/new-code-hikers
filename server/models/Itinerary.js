const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  placeId: String,
  placeName: String,
  category: String,
  startTime: String,
  endTime: String,
  duration: Number, // in minutes
  cost: Number,
  coordinates: {
    lat: Number,
    lng: Number
  },
  sustainabilityScore: { type: Number, min: 0, max: 10, default: 5 },
  accessibilityScore: { type: Number, min: 0, max: 10, default: 5 },
  aiReasoning: String,
  order: Number
}, { _id: false });

const daySchema = new mongoose.Schema({
  date: Date,
  activities: [activitySchema],
  totalCost: { type: Number, default: 0 },
  totalDistance: { type: Number, default: 0 }, // in km
  weatherAware: { type: Boolean, default: false }
}, { _id: false });

const itinerarySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  days: [daySchema],
  totalBudget: Number,
  preferences: mongoose.Schema.Types.Mixed,
  aiExplanation: String,
  status: { type: String, enum: ['draft', 'active', 'completed'], default: 'draft' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

itinerarySchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
