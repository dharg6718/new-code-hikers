import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Accessibility.css';

const Accessibility = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get('/api/v1/users/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="accessibility-loading">Loading...</div>;
  }

  const accessibility = user?.preferences?.accessibility || {};

  return (
    <div className="accessibility">
      <div className="accessibility-header">
        <h1>Accessibility & Inclusivity</h1>
        <p>Your accessibility preferences and inclusive travel options</p>
      </div>

      <div className="accessibility-content">
        <div className="preferences-section">
          <h2>Your Accessibility Preferences</h2>
          <div className="preferences-card">
            <div className="preference-item">
              <div className="preference-icon">♿</div>
              <div className="preference-content">
                <h3>Wheelchair Accessibility</h3>
                <p className={accessibility.wheelchairFriendly ? 'enabled' : 'disabled'}>
                  {accessibility.wheelchairFriendly
                    ? '✅ Enabled - Only wheelchair-accessible routes will be recommended'
                    : '❌ Disabled - All routes will be shown'}
                </p>
              </div>
            </div>

            <div className="preference-item">
              <div className="preference-icon">🚶</div>
              <div className="preference-content">
                <h3>Mobility Level</h3>
                <p className="enabled">
                  Current: <strong>{accessibility.mobilityLevel || 'high'}</strong>
                </p>
                <p className="preference-description">
                  {accessibility.mobilityLevel === 'high'
                    ? 'You can handle long walks and stairs easily'
                    : accessibility.mobilityLevel === 'medium'
                    ? 'You prefer moderate walking distances'
                    : 'You prefer minimal walking and easy access'}
                </p>
              </div>
            </div>

            <div className="preference-item">
              <div className="preference-icon">🍽️</div>
              <div className="preference-content">
                <h3>Dietary Restrictions</h3>
                {accessibility.dietaryRestrictions && accessibility.dietaryRestrictions.length > 0 ? (
                  <div className="dietary-tags">
                    {accessibility.dietaryRestrictions.map((diet, index) => (
                      <span key={index} className="dietary-tag">
                        {diet.charAt(0).toUpperCase() + diet.slice(1)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="disabled">No dietary restrictions set</p>
                )}
              </div>
            </div>

            <div className="preference-item">
              <div className="preference-icon">🌐</div>
              <div className="preference-content">
                <h3>Language Preferences</h3>
                {accessibility.languagePreferences && accessibility.languagePreferences.length > 0 ? (
                  <div className="language-tags">
                    {accessibility.languagePreferences.map((lang, index) => (
                      <span key={index} className="language-tag">
                        {lang === 'en' ? 'English' : lang === 'ta' ? 'Tamil' : 'Hindi'}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="disabled">English (default)</p>
                )}
              </div>
            </div>
          </div>

          <div className="update-link">
            <a href="/profile">Update Preferences →</a>
          </div>
        </div>

        <div className="features-section">
          <h2>Accessibility Features</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">♿</div>
              <h3>Wheelchair-Friendly Routes</h3>
              <p>All recommended routes and locations are verified for wheelchair accessibility, including ramps, elevators, and accessible restrooms.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🍽️</div>
              <h3>Dietary-Safe Recommendations</h3>
              <p>Restaurants and food options are filtered based on your dietary restrictions (vegetarian, vegan, gluten-free, halal, kosher).</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🌐</div>
              <h3>Multilingual Support</h3>
              <p>AI guide and interface support multiple languages (English, Tamil, Hindi) for better communication and understanding.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🚶</div>
              <h3>Mobility-Aware Planning</h3>
              <p>Itineraries are optimized based on your mobility level, ensuring comfortable distances and accessible transportation options.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">👥</div>
              <h3>Inclusive Design</h3>
              <p>Our platform is designed with accessibility in mind, following WCAG guidelines for screen readers and keyboard navigation.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🛡️</div>
              <h3>Safety & Comfort</h3>
              <p>All recommendations prioritize your safety and comfort, with clear information about accessibility features at each location.</p>
            </div>
          </div>
        </div>

        <div className="info-section">
          <h2>How It Works</h2>
          <div className="info-card">
            <div className="info-step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Set Your Preferences</h3>
                <p>Configure your accessibility needs in your profile, including mobility level, dietary restrictions, and language preferences.</p>
              </div>
            </div>

            <div className="info-step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>AI Personalization</h3>
                <p>Our personalization engine uses your preferences to filter and rank all recommendations, ensuring they match your needs.</p>
              </div>
            </div>

            <div className="info-step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Accessible Itineraries</h3>
                <p>All generated itineraries automatically include only accessible routes and locations that meet your requirements.</p>
              </div>
            </div>

            <div className="info-step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Continuous Learning</h3>
                <p>Based on your feedback, the system learns and improves recommendations to better serve your accessibility needs.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accessibility;
