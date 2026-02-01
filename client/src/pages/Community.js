import React, { useState } from 'react';
import axios from 'axios';
import './Community.css';

const Community = () => {
  const [experiences, setExperiences] = useState([]);
  const [sustainableOptions, setSustainableOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('experiences');
  const [location, setLocation] = useState('');

  const fetchExperiences = async () => {
    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/v1/community/experiences', {
        params: { location, query: 'local artisan sustainable tourism' }
      });
      setExperiences(response.data.experiences || []);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSustainable = async () => {
    if (!location.trim()) {
      alert('Please enter a location');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/api/v1/community/sustainable', {
        params: { location }
      });
      setSustainableOptions(response.data.sustainableOptions || []);
    } catch (error) {
      console.error('Error fetching sustainable options:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (activeTab === 'experiences') {
      fetchExperiences();
    } else {
      fetchSustainable();
    }
  };

  return (
    <div className="community">
      <div className="community-header">
        <h1>Local Community & Experiences</h1>
        <p>Discover authentic local experiences, artisans, and sustainable tourism options</p>
      </div>

      <div className="community-tabs">
        <button
          className={`tab-btn ${activeTab === 'experiences' ? 'active' : ''}`}
          onClick={() => setActiveTab('experiences')}
        >
          🤝 Local Experiences
        </button>
        <button
          className={`tab-btn ${activeTab === 'sustainable' ? 'active' : ''}`}
          onClick={() => setActiveTab('sustainable')}
        >
          🌱 Sustainable Tourism
        </button>
      </div>

      <div className="search-section">
        <div className="search-card">
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Enter location (e.g., Chennai, India)"
            className="location-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button onClick={handleSearch} className="search-btn" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>

      {activeTab === 'experiences' && (
        <div className="experiences-section">
          <h2>Local Experiences</h2>
          {experiences.length > 0 ? (
            <div className="experiences-grid">
              {experiences.map((experience, index) => (
                <div key={index} className="experience-card">
                  <div className="experience-header">
                    <h3>{experience.name}</h3>
                    {experience.score && (
                      <span className="score-badge">
                        Score: {experience.score.finalScore?.toFixed(2) || 'N/A'}
                      </span>
                    )}
                  </div>
                  <p className="experience-address">{experience.address}</p>
                  {experience.rating > 0 && (
                    <div className="experience-rating">
                      ⭐ {experience.rating.toFixed(1)}
                    </div>
                  )}
                  {experience.categories && experience.categories.length > 0 && (
                    <div className="experience-categories">
                      {experience.categories.slice(0, 3).map((cat, i) => (
                        <span key={i} className="category-tag">
                          {cat.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                  {experience.score?.reasoning && (
                    <p className="experience-reasoning">
                      💡 {experience.score.reasoning}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Enter a location and search to discover local experiences</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'sustainable' && (
        <div className="sustainable-section">
          <h2>Sustainable Tourism Options</h2>
          {sustainableOptions.length > 0 ? (
            <div className="sustainable-grid">
              {sustainableOptions.map((option, index) => (
                <div key={index} className="sustainable-card">
                  <div className="sustainable-header">
                    <h3>{option.name}</h3>
                    <span className="sustainability-badge">🌱 Sustainable</span>
                  </div>
                  <p className="sustainable-address">{option.address}</p>
                  {option.rating > 0 && (
                    <div className="sustainable-rating">
                      ⭐ {option.rating.toFixed(1)}
                    </div>
                  )}
                  {option.score && (
                    <div className="sustainable-score">
                      <span>Personalization Score: {option.score.finalScore?.toFixed(2) || 'N/A'}</span>
                    </div>
                  )}
                  {option.categories && (
                    <div className="sustainable-categories">
                      {option.categories.slice(0, 3).map((cat, i) => (
                        <span key={i} className="category-tag">
                          {cat.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>Enter a location and search to find sustainable tourism options</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Community;
