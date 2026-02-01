import React, { useState } from 'react';
import axios from 'axios';
import './Context.css';

const Context = () => {
  const [location, setLocation] = useState({ lat: '', lng: '' });
  const [contextData, setContextData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleGetContext = async () => {
    if (!location.lat || !location.lng) {
      alert('Please enter latitude and longitude');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`/api/v1/context/${location.lat}/${location.lng}`);
      setContextData(response.data);
    } catch (error) {
      alert('Error fetching context data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'Clear': '☀️',
      'Clouds': '☁️',
      'Rain': '🌧️',
      'Drizzle': '🌦️',
      'Thunderstorm': '⛈️',
      'Snow': '❄️',
      'Mist': '🌫️'
    };
    return icons[condition] || '🌤️';
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: '#10b981',
      moderate: '#f59e0b',
      high: '#ef4444'
    };
    return colors[severity] || colors.low;
  };

  return (
    <div className="context">
      <div className="context-header">
        <h1>Real-Time Context & Safety</h1>
        <p>Get weather, traffic, and safety information for your location</p>
      </div>

      <div className="context-form-section">
        <div className="form-card">
          <h2>Enter Location</h2>
          <div className="location-inputs">
            <div className="input-group">
              <label htmlFor="lat">Latitude</label>
              <input
                type="number"
                id="lat"
                step="any"
                value={location.lat}
                onChange={(e) => setLocation({ ...location, lat: e.target.value })}
                placeholder="e.g., 12.9716"
              />
            </div>
            <div className="input-group">
              <label htmlFor="lng">Longitude</label>
              <input
                type="number"
                id="lng"
                step="any"
                value={location.lng}
                onChange={(e) => setLocation({ ...location, lng: e.target.value })}
                placeholder="e.g., 77.5946"
              />
            </div>
            <button onClick={handleGetContext} className="fetch-btn" disabled={loading}>
              {loading ? 'Fetching...' : 'Get Context'}
            </button>
          </div>
        </div>
      </div>

      {contextData && (
        <div className="context-data">
          <div className="weather-section">
            <h2>🌤️ Weather Information</h2>
            <div className="weather-card">
              <div className="weather-current">
                <div className="weather-main">
                  <span className="weather-icon-large">
                    {getWeatherIcon(contextData.weather.current.condition)}
                  </span>
                  <div>
                    <div className="temperature">
                      {contextData.weather.current.temperature}°C
                    </div>
                    <div className="condition">
                      {contextData.weather.current.description}
                    </div>
                  </div>
                </div>
                <div className="weather-details">
                  <div className="detail-item">
                    <span className="detail-label">Humidity</span>
                    <span className="detail-value">{contextData.weather.current.humidity}%</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Wind Speed</span>
                    <span className="detail-value">{contextData.weather.current.windSpeed} m/s</span>
                  </div>
                </div>
              </div>

              {contextData.weather.recommendation && (
                <div
                  className="weather-recommendation"
                  style={{ borderLeftColor: getSeverityColor(contextData.weather.recommendation.severity) }}
                >
                  <div className="recommendation-header">
                    <span className="recommendation-alert">
                      {contextData.weather.recommendation.alert}
                    </span>
                    <span
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(contextData.weather.recommendation.severity) }}
                    >
                      {contextData.weather.recommendation.severity}
                    </span>
                  </div>
                  <p className="recommendation-text">
                    {contextData.weather.recommendation.recommendation}
                  </p>
                </div>
              )}
            </div>

            {contextData.weather.forecast && contextData.weather.forecast.length > 0 && (
              <div className="forecast-section">
                <h3>5-Day Forecast</h3>
                <div className="forecast-grid">
                  {contextData.weather.forecast.map((day, index) => (
                    <div key={index} className="forecast-item">
                      <div className="forecast-date">{day.date}</div>
                      <div className="forecast-icon">
                        {getWeatherIcon(day.condition)}
                      </div>
                      <div className="forecast-temp">
                        <span className="temp-high">{day.temperature.max}°</span>
                        <span className="temp-low">{day.temperature.min}°</span>
                      </div>
                      <div className="forecast-condition">{day.condition}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="traffic-section">
            <h2>🚦 Traffic Information</h2>
            <div className="traffic-card">
              <div className="traffic-level">
                <span className="traffic-label">Traffic Level</span>
                <span className={`traffic-value ${contextData.traffic.level}`}>
                  {contextData.traffic.level}
                </span>
              </div>
              <div className="traffic-details">
                <div className="traffic-item">
                  <span>Congestion</span>
                  <span>{contextData.traffic.congestion}%</span>
                </div>
                <div className="traffic-message">
                  {contextData.traffic.message}
                </div>
              </div>
            </div>
          </div>

          <div className="safety-section">
            <h2>🛡️ Safety Information</h2>
            <div className="safety-card">
              <div className="safety-level">
                <span className="safety-label">Safety Level</span>
                <span className="safety-value safe">
                  {contextData.safety.level}
                </span>
              </div>
              {contextData.safety.alerts && contextData.safety.alerts.length > 0 ? (
                <div className="safety-alerts">
                  {contextData.safety.alerts.map((alert, index) => (
                    <div key={index} className="alert-item">
                      ⚠️ {alert}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-alerts">No safety alerts at this time.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Context;
