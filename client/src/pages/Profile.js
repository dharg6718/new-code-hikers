import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [preferences, setPreferences] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/v1/users/profile');
      setUser(response.data);
      setPreferences(response.data.preferences || {
        travelPace: 'moderate',
        budgetLevel: 'mid-range',
        groupSize: 1,
        interests: {
          culture: 0.5,
          nature: 0.5,
          adventure: 0.5,
          food: 0.5,
          history: 0.5,
          shopping: 0.5,
          nightlife: 0.5,
          relaxation: 0.5,
          photography: 0.5,
          sustainability: 0.5
        },
        accessibility: {
          wheelchairFriendly: false,
          dietaryRestrictions: [],
          languagePreferences: ['en'],
          mobilityLevel: 'high'
        }
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePreferenceChange = (path, value) => {
    const keys = path.split('.');
    setPreferences(prev => {
      const newPrefs = { ...prev };
      let current = newPrefs;
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newPrefs;
    });
  };

  const handleInterestChange = (interest, value) => {
    setPreferences(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [interest]: parseFloat(value)
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      await axios.put('/api/v1/users/preferences', preferences);
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error saving preferences');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  const interests = [
    { key: 'culture', label: 'Culture', icon: '🏛️' },
    { key: 'nature', label: 'Nature', icon: '🌲' },
    { key: 'adventure', label: 'Adventure', icon: '⛰️' },
    { key: 'food', label: 'Food', icon: '🍜' },
    { key: 'history', label: 'History', icon: '📜' },
    { key: 'shopping', label: 'Shopping', icon: '🛍️' },
    { key: 'nightlife', label: 'Nightlife', icon: '🌃' },
    { key: 'relaxation', label: 'Relaxation', icon: '🧘' },
    { key: 'photography', label: 'Photography', icon: '📸' },
    { key: 'sustainability', label: 'Sustainability', icon: '🌱' }
  ];

  return (
    <div className="profile">
      <div className="profile-header">
        <h1>Profile & Preferences</h1>
        <p>Customize your travel preferences for personalized recommendations</p>
      </div>

      {message && (
        <div className={`profile-message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <div className="profile-content">
        <div className="profile-section">
          <h2>Basic Information</h2>
          <div className="info-card">
            <div className="info-item">
              <label>Name</label>
              <div className="info-value">{user?.name}</div>
            </div>
            <div className="info-item">
              <label>Email</label>
              <div className="info-value">{user?.email}</div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Travel Preferences</h2>
          <div className="preferences-card">
            <div className="preference-group">
              <label>Travel Pace</label>
              <select
                value={preferences?.travelPace || 'moderate'}
                onChange={(e) => handlePreferenceChange('travelPace', e.target.value)}
              >
                <option value="slow">Slow & Relaxed</option>
                <option value="moderate">Moderate</option>
                <option value="fast">Fast & Active</option>
              </select>
            </div>

            <div className="preference-group">
              <label>Budget Level</label>
              <select
                value={preferences?.budgetLevel || 'mid-range'}
                onChange={(e) => handlePreferenceChange('budgetLevel', e.target.value)}
              >
                <option value="budget">Budget</option>
                <option value="mid-range">Mid-Range</option>
                <option value="luxury">Luxury</option>
              </select>
            </div>

            <div className="preference-group">
              <label>Group Size</label>
              <input
                type="number"
                min="1"
                max="20"
                value={preferences?.groupSize || 1}
                onChange={(e) => handlePreferenceChange('groupSize', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Interests</h2>
          <p className="section-description">Adjust sliders to indicate your interest level (0 = not interested, 1 = very interested)</p>
          <div className="interests-grid">
            {interests.map(interest => (
              <div key={interest.key} className="interest-item">
                <div className="interest-header">
                  <span className="interest-icon">{interest.icon}</span>
                  <span className="interest-label">{interest.label}</span>
                  <span className="interest-value">
                    {((preferences?.interests?.[interest.key] || 0.5) * 100).toFixed(0)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={preferences?.interests?.[interest.key] || 0.5}
                  onChange={(e) => handleInterestChange(interest.key, e.target.value)}
                  className="interest-slider"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="profile-section">
          <h2>Accessibility & Inclusivity</h2>
          <div className="preferences-card">
            <div className="preference-group checkbox-group">
              <label>
                <input
                  type="checkbox"
                  checked={preferences?.accessibility?.wheelchairFriendly || false}
                  onChange={(e) => handlePreferenceChange('accessibility.wheelchairFriendly', e.target.checked)}
                />
                Wheelchair Friendly Routes
              </label>
            </div>

            <div className="preference-group">
              <label>Mobility Level</label>
              <select
                value={preferences?.accessibility?.mobilityLevel || 'high'}
                onChange={(e) => handlePreferenceChange('accessibility.mobilityLevel', e.target.value)}
              >
                <option value="high">High Mobility</option>
                <option value="medium">Medium Mobility</option>
                <option value="low">Low Mobility</option>
              </select>
            </div>

            <div className="preference-group">
              <label>Dietary Restrictions</label>
              <div className="checkbox-group">
                {['vegetarian', 'vegan', 'gluten-free', 'halal', 'kosher'].map(diet => (
                  <label key={diet} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(preferences?.accessibility?.dietaryRestrictions || []).includes(diet)}
                      onChange={(e) => {
                        const current = preferences?.accessibility?.dietaryRestrictions || [];
                        const updated = e.target.checked
                          ? [...current, diet]
                          : current.filter(d => d !== diet);
                        handlePreferenceChange('accessibility.dietaryRestrictions', updated);
                      }}
                    />
                    {diet.charAt(0).toUpperCase() + diet.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="preference-group">
              <label>Language Preferences</label>
              <div className="checkbox-group">
                {['en', 'ta', 'hi'].map(lang => (
                  <label key={lang} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={(preferences?.accessibility?.languagePreferences || ['en']).includes(lang)}
                      onChange={(e) => {
                        const current = preferences?.accessibility?.languagePreferences || ['en'];
                        const updated = e.target.checked
                          ? [...current, lang]
                          : current.filter(l => l !== lang);
                        handlePreferenceChange('accessibility.languagePreferences', updated);
                      }}
                    />
                    {lang === 'en' ? 'English' : lang === 'ta' ? 'Tamil' : 'Hindi'}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="profile-section">
          <h2>Travel History</h2>
          <div className="history-card">
            <div className="history-stat">
              <span className="history-label">Visited Places</span>
              <span className="history-value">
                {user?.preferences?.visitedPlaces?.length || 0}
              </span>
            </div>
            <div className="history-stat">
              <span className="history-label">Feedback Entries</span>
              <span className="history-value">
                {user?.preferences?.feedbackHistory?.length || 0}
              </span>
            </div>
            <p className="history-note">
              Your preferences are continuously updated based on your travel history and feedback.
            </p>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={handleSave} className="save-btn" disabled={saving}>
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
