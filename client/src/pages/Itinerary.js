import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import './Itinerary.css';

const Itinerary = () => {
  const [searchParams] = useSearchParams();
  const itineraryId = searchParams.get('id');
  
  const [itineraries, setItineraries] = useState([]);
  const [selectedItinerary, setSelectedItinerary] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showForm, setShowForm] = useState(!itineraryId);
  const [activeDay, setActiveDay] = useState(0);
  
  const [formData, setFormData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    totalBudget: '',
    interests: '',
    travelGroup: '',
    accessibilityNeeds: ''
  });

  const fetchItineraries = async () => {
    try {
      const response = await axios.get('/api/v1/itineraries');
      setItineraries(response.data);
      if (itineraryId) {
        const found = response.data.find(i => i._id === itineraryId);
        if (found) setSelectedItinerary(found);
      }
    } catch (error) {
      console.error('Error fetching itineraries:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItineraries();
    if (itineraryId) {
      fetchItinerary(itineraryId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [itineraryId]);

  const fetchItinerary = async (id) => {
    try {
      const response = await axios.get(`/api/v1/itineraries/${id}`);
      setSelectedItinerary(response.data);
      setShowForm(false);
    } catch (error) {
      console.error('Error fetching itinerary:', error);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setGenerating(true);
    
    try {
      // Optimized: added timeout for faster failure detection
      const response = await axios.post('/api/v1/itineraries/generate', formData, {
        timeout: 60000 // 60 second timeout
      });
      setSelectedItinerary(response.data);
      setShowForm(false);
      setActiveDay(0);
      fetchItineraries();
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        alert('Request timed out. Please try again with a shorter trip duration.');
      } else {
        alert(error.response?.data?.message || 'Error generating itinerary');
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openPlaceDetails = (activity) => {
    setSelectedPlace(activity);
  };

  const closePlaceDetails = () => {
    setSelectedPlace(null);
  };

  // Category icons and colors
  const getCategoryInfo = (category) => {
    const categories = {
      temple: { icon: '🛕', label: 'Temple', color: '#f97316' },
      restaurant: { icon: '🍽️', label: 'Restaurant', color: '#ef4444' },
      museum: { icon: '🏛️', label: 'Museum', color: '#8b5cf6' },
      park: { icon: '🌳', label: 'Park', color: '#22c55e' },
      beach: { icon: '🏖️', label: 'Beach', color: '#06b6d4' },
      monument: { icon: '🏰', label: 'Monument', color: '#a855f7' },
      market: { icon: '🛒', label: 'Market', color: '#ec4899' },
      attraction: { icon: '⭐', label: 'Attraction', color: '#eab308' },
      nature: { icon: '🌿', label: 'Nature', color: '#10b981' }
    };
    return categories[category] || { icon: '📍', label: category || 'Place', color: '#6b7280' };
  };

  const getPlaceImage = (activity, index = 0) => {
    if (activity.photos && activity.photos.length > index) {
      return activity.photos[index];
    }
    const categoryImages = {
      temple: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=400',
      museum: 'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?w=400',
      park: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?w=400',
      beach: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400',
      restaurant: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400',
      monument: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400',
      market: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=400',
      nature: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400',
      attraction: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400'
    };
    return categoryImages[activity.category] || categoryImages.attraction;
  };

  const openInGoogleMaps = (activity) => {
    if (activity.coordinates) {
      const url = `https://www.google.com/maps/search/?api=1&query=${activity.coordinates.lat},${activity.coordinates.lng}`;
      window.open(url, '_blank');
    } else {
      const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activity.placeName)}`;
      window.open(url, '_blank');
    }
  };

  if (loading) {
    return <div className="itinerary-loading">Loading...</div>;
  }

  return (
    <div className="itinerary">
      <div className="itinerary-header">
        <h1>🗺️ AI Itinerary Planner</h1>
        <p>Get personalized day-wise travel plans with best places to visit</p>
      </div>

      {showForm && (
        <div className="itinerary-form-section">
          <div className="form-card">
            <h2>✨ Create Your Perfect Trip</h2>
            <form onSubmit={handleGenerate} className="itinerary-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="destination">📍 Where do you want to go?</label>
                  <input
                    type="text"
                    id="destination"
                    name="destination"
                    value={formData.destination}
                    onChange={handleInputChange}
                    required
                    placeholder="e.g., Jaipur, Paris, Tokyo"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">📅 Start Date</label>
                  <input
                    type="date"
                    id="startDate"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">📅 End Date</label>
                  <input
                    type="date"
                    id="endDate"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="totalBudget">💰 Budget (₹)</label>
                  <input
                    type="number"
                    id="totalBudget"
                    name="totalBudget"
                    value={formData.totalBudget}
                    onChange={handleInputChange}
                    placeholder="Optional - e.g., 50000"
                    min="0"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="interests">❤️ Your Interests</label>
                  <input
                    type="text"
                    id="interests"
                    name="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    placeholder="e.g., temples, food, nature"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="travelGroup">👨‍👩‍👧‍👦 Travel Group</label>
                  <select
                    id="travelGroup"
                    name="travelGroup"
                    value={formData.travelGroup}
                    onChange={handleInputChange}
                  >
                    <option value="">Select group type...</option>
                    <option value="solo">Solo Traveler</option>
                    <option value="couple">Couple</option>
                    <option value="family-young">Family with Young Children</option>
                    <option value="family">Family</option>
                    <option value="seniors">Senior Citizens</option>
                    <option value="friends">Group of Friends</option>
                    <option value="business">Business Travel</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="accessibilityNeeds">♿ Accessibility Needs</label>
                  <select
                    id="accessibilityNeeds"
                    name="accessibilityNeeds"
                    value={formData.accessibilityNeeds}
                    onChange={handleInputChange}
                  >
                    <option value="">None</option>
                    <option value="wheelchair">Wheelchair Access Required</option>
                    <option value="mobility">Limited Mobility</option>
                    <option value="visual">Visual Impairment</option>
                    <option value="hearing">Hearing Impairment</option>
                  </select>
                </div>
              </div>

              <div className="safety-notice">
                <span className="notice-icon">🛡️</span>
                <span>Your itinerary will be validated by our Real-Time Safety Engine for weather, time, and group safety.</span>
              </div>

              <button type="submit" className="generate-btn" disabled={generating}>
                {generating ? (
                  <>
                    <span className="spinner"></span>
                    AI is crafting your perfect itinerary...
                  </>
                ) : (
                  '🚀 Generate My Itinerary'
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {!showForm && selectedItinerary && (
        <div className="itinerary-details">
          <div className="itinerary-info-card">
            <div className="itinerary-info-header">
              <div>
                <h2>🌍 {selectedItinerary.destination}</h2>
                <p className="itinerary-dates">
                  📅 {new Date(selectedItinerary.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} - {new Date(selectedItinerary.endDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              <button onClick={() => { setShowForm(true); setSelectedItinerary(null); }} className="new-itinerary-btn">
                + New Itinerary
              </button>
            </div>

            {selectedItinerary.aiExplanation && (
              <div className="ai-explanation">
                <h3>🤖 AI Travel Guide Says:</h3>
                <p>{selectedItinerary.aiExplanation}</p>
              </div>
            )}

            {selectedItinerary.overallTips && (
              <div className="travel-tips">
                <h3>💡 Travel Tips</h3>
                <p>{selectedItinerary.overallTips}</p>
              </div>
            )}

            {/* Real-Time Safety Information */}
            {selectedItinerary.safetyScore !== undefined && (
              <div className={`safety-panel ${selectedItinerary.safetyStatus === 'safe' ? 'safe' : selectedItinerary.safetyStatus === 'warnings' ? 'warning' : 'unsafe'}`}>
                <div className="safety-header">
                  <div className="safety-title">
                    <span className="safety-icon">🛡️</span>
                    <h3>Real-Time Safety Analysis</h3>
                  </div>
                  <div className="safety-score-badge">
                    <span className="score-value">{selectedItinerary.safetyScore}</span>
                    <span className="score-label">/ 100</span>
                  </div>
                </div>
                
                <div className="safety-status">
                  <span className={`status-indicator ${selectedItinerary.safetyStatus}`}>
                    {selectedItinerary.safetyStatus === 'safe' && '✅ Safe to Travel'}
                    {selectedItinerary.safetyStatus === 'warnings' && '⚠️ Travel with Caution'}
                    {selectedItinerary.safetyStatus === 'unsafe' && '🚫 Safety Concerns Detected'}
                  </span>
                </div>

                {selectedItinerary.safetyWarnings && selectedItinerary.safetyWarnings.length > 0 && (
                  <div className="safety-warnings">
                    <h4>⚠️ Safety Warnings</h4>
                    <ul>
                      {selectedItinerary.safetyWarnings.map((warning, idx) => (
                        <li key={idx} className={`warning-item ${warning.severity}`}>
                          <span className="warning-type">{warning.type}</span>
                          <span className="warning-message">{warning.message}</span>
                          {warning.suggestion && (
                            <span className="warning-suggestion">💡 {warning.suggestion}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedItinerary.safeFallbacks && selectedItinerary.safeFallbacks.length > 0 && (
                  <div className="safe-fallbacks">
                    <h4>🔄 Safe Alternatives</h4>
                    <div className="fallbacks-grid">
                      {selectedItinerary.safeFallbacks.map((fallback, idx) => (
                        <div key={idx} className="fallback-card">
                          <span className="fallback-icon">✨</span>
                          <span className="fallback-text">{fallback}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedItinerary.weatherInfo && (
                  <div className="weather-info">
                    <h4>🌤️ Weather Conditions</h4>
                    <div className="weather-details">
                      <span>🌡️ {selectedItinerary.weatherInfo.temperature}°C</span>
                      <span>💨 {selectedItinerary.weatherInfo.conditions}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="itinerary-stats">
              <div className="stat">
                <span className="stat-icon">📆</span>
                <span className="stat-value">{selectedItinerary.days?.length || 0}</span>
                <span className="stat-label">Days</span>
              </div>
              <div className="stat">
                <span className="stat-icon">📍</span>
                <span className="stat-value">
                  {selectedItinerary.days?.reduce((acc, day) => acc + (day.activities?.length || 0), 0) || 0}
                </span>
                <span className="stat-label">Places</span>
              </div>
              <div className="stat">
                <span className="stat-icon">💰</span>
                <span className="stat-value">₹{selectedItinerary.totalBudget?.toLocaleString() || 'N/A'}</span>
                <span className="stat-label">Budget</span>
              </div>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="day-tabs">
            {selectedItinerary.days?.map((day, index) => (
              <button
                key={index}
                className={`day-tab ${activeDay === index ? 'active' : ''}`}
                onClick={() => setActiveDay(index)}
              >
                Day {index + 1}
              </button>
            ))}
          </div>

          {/* Active Day Content */}
          {selectedItinerary.days && selectedItinerary.days[activeDay] && (
            <div className="active-day-content">
              <div className="day-header-info">
                <h3>
                  {selectedItinerary.days[activeDay].theme || `Day ${activeDay + 1} Adventure`}
                </h3>
                <span className="day-date">
                  {new Date(selectedItinerary.days[activeDay].date).toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
              </div>

              <div className="places-grid">
                {selectedItinerary.days[activeDay].activities?.map((activity, actIndex) => (
                  <div 
                    key={actIndex} 
                    className="place-card"
                    onClick={() => openPlaceDetails(activity)}
                  >
                    <div className="place-image-container">
                      <img 
                        src={getPlaceImage(activity)} 
                        alt={activity.placeName}
                        className="place-image"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400';
                        }}
                      />
                      <div className="place-time-badge">
                        {activity.startTime}
                      </div>
                      <div 
                        className="place-category-badge"
                        style={{ backgroundColor: getCategoryInfo(activity.category).color }}
                      >
                        {getCategoryInfo(activity.category).icon} {getCategoryInfo(activity.category).label}
                      </div>
                    </div>
                    <div className="place-info">
                      <h4>{activity.placeName}</h4>
                      {activity.rating && (
                        <div className="place-rating">
                          ⭐ {activity.rating.toFixed(1)}
                        </div>
                      )}
                      <p className="place-description">
                        {activity.aiReasoning || activity.description || 'A wonderful place to explore!'}
                      </p>
                      <div className="place-meta">
                        <span>⏱️ {activity.duration} min</span>
                        <span>💰 ₹{activity.cost}</span>
                      </div>
                      <div className="place-actions">
                        <button 
                          className="map-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            openInGoogleMaps(activity);
                          }}
                        >
                          📍 View on Map
                        </button>
                        <button className="details-btn">
                          ℹ️ Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="day-summary-bar">
                <span>💰 Day Cost: ₹{selectedItinerary.days[activeDay].totalCost?.toLocaleString()}</span>
                <span>📍 {selectedItinerary.days[activeDay].activities?.length} Places</span>
                <span>🚗 ~{selectedItinerary.days[activeDay].totalDistance} km travel</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Place Details Modal */}
      {selectedPlace && (
        <div className="place-modal-overlay" onClick={closePlaceDetails}>
          <div className="place-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePlaceDetails}>×</button>
            <div className="modal-images">
              <img 
                src={getPlaceImage(selectedPlace, 0)} 
                alt={selectedPlace.placeName}
                className="modal-main-image"
              />
            </div>
            <div className="modal-content">
              <h2>{selectedPlace.placeName}</h2>
              <div className="modal-badges">
                <span 
                  className="badge category"
                  style={{ backgroundColor: getCategoryInfo(selectedPlace.category).color }}
                >
                  {getCategoryInfo(selectedPlace.category).icon} {getCategoryInfo(selectedPlace.category).label}
                </span>
                {selectedPlace.rating && (
                  <span className="badge rating">⭐ {selectedPlace.rating.toFixed(1)}</span>
                )}
                <span className="badge time">🕐 {selectedPlace.bestTime || 'Anytime'}</span>
              </div>
              
              <div className="modal-section">
                <h3>📖 About This Place</h3>
                <p>{selectedPlace.aiReasoning || selectedPlace.description || 'A must-visit destination on your trip!'}</p>
              </div>

              <div className="modal-section">
                <h3>ℹ️ Visit Details</h3>
                <div className="visit-details">
                  <div className="detail-item">
                    <span className="detail-label">⏱️ Duration</span>
                    <span className="detail-value">{selectedPlace.duration} minutes</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">💰 Estimated Cost</span>
                    <span className="detail-value">₹{selectedPlace.cost}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">🕐 Suggested Time</span>
                    <span className="detail-value">{selectedPlace.startTime} - {selectedPlace.endTime}</span>
                  </div>
                </div>
              </div>

              {selectedPlace.tips && (
                <div className="modal-section">
                  <h3>💡 Insider Tips</h3>
                  <p>{selectedPlace.tips}</p>
                </div>
              )}

              <div className="modal-section scores">
                <div className="score-item">
                  <span>🌱 Sustainability</span>
                  <div className="score-bar">
                    <div className="score-fill" style={{width: `${selectedPlace.sustainabilityScore * 10}%`}}></div>
                  </div>
                  <span>{selectedPlace.sustainabilityScore}/10</span>
                </div>
                <div className="score-item">
                  <span>♿ Accessibility</span>
                  <div className="score-bar">
                    <div className="score-fill" style={{width: `${selectedPlace.accessibilityScore * 10}%`}}></div>
                  </div>
                  <span>{selectedPlace.accessibilityScore}/10</span>
                </div>
              </div>

              <div className="modal-actions">
                <button 
                  className="action-btn primary"
                  onClick={() => openInGoogleMaps(selectedPlace)}
                >
                  🗺️ Open in Google Maps
                </button>
                <button className="action-btn secondary" onClick={closePlaceDetails}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!showForm && !selectedItinerary && (
        <div className="itineraries-list-section">
          <div className="section-header">
            <h2>📚 Your Travel Plans</h2>
            <button onClick={() => setShowForm(true)} className="new-itinerary-btn">
              + Create New Trip
            </button>
          </div>

          {itineraries.length > 0 ? (
            <div className="itineraries-grid">
              {itineraries.map(itinerary => (
                <div
                  key={itinerary._id}
                  className="itinerary-card"
                  onClick={() => {
                    setSelectedItinerary(itinerary);
                    setShowForm(false);
                    setActiveDay(0);
                  }}
                >
                  <div className="card-header">
                    <h3>🌍 {itinerary.destination}</h3>
                    <span className={`status-badge ${itinerary.status}`}>
                      {itinerary.status}
                    </span>
                  </div>
                  <p className="card-dates">
                    📅 {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                  </p>
                  <div className="card-stats">
                    <span>📆 {itinerary.days?.length || 0} days</span>
                    <span>📍 {itinerary.days?.reduce((acc, day) => acc + (day.activities?.length || 0), 0) || 0} places</span>
                  </div>
                  <button className="view-btn">View Itinerary →</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">🗺️</div>
              <h3>No trips planned yet!</h3>
              <p>Start your adventure by creating your first AI-powered itinerary</p>
              <button onClick={() => setShowForm(true)} className="create-first-btn">
                ✨ Plan Your First Trip
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Itinerary;
