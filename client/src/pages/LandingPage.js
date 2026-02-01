import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { PersonalizedIcon, AIGuideIcon, AccessibilityIcon, SustainableIcon, RealTimeIcon, LearningIcon, ChatIcon } from '../components/Icons';
import './LandingPage.css';

// Background image - using high-quality Unsplash travel image
const heroBackground = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1920&q=80';

const LandingPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div 
      className="landing-page"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(102, 126, 234, 0.75) 0%, rgba(118, 75, 162, 0.75) 50%, rgba(240, 147, 251, 0.75) 100%), url(${heroBackground})`
      }}
    >
      <div className="landing-hero">
        <div className="hero-content">
          <h1 className="hero-title">
            <span className="title-icon">🌍</span>
            <span>AI-Powered Smart Tourism</span>
          </h1>
          <p className="hero-subtitle">
            Experience deeply personalized, adaptive, and inclusive travel planning
            powered by artificial intelligence
          </p>
          <div className="hero-features">
            <div className="feature-item">
              <PersonalizedIcon className="feature-icon" />
              <span>Personalized Itineraries</span>
            </div>
            <div className="feature-item">
              <AIGuideIcon className="feature-icon" />
              <span>AI Virtual Guide</span>
            </div>
            <div className="feature-item">
              <AccessibilityIcon className="feature-icon" />
              <span>Accessibility First</span>
            </div>
            <div className="feature-item">
              <SustainableIcon className="feature-icon" />
              <span>Sustainable Tourism</span>
            </div>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-tabs">
            <button
              className={`auth-tab ${isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              className={`auth-tab ${!isLogin ? 'active' : ''}`}
              onClick={() => setIsLogin(false)}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Enter your name"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Enter your password"
                minLength="6"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? 'Processing...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </form>
        </div>
      </div>

      <div className="landing-features">
          <div className="features-container">
          <h2 className="section-title">Why Choose Smart Tourism?</h2>
          <p>Experience the future of travel planning with AI-powered personalization</p>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-card-icon">
                <PersonalizedIcon className="icon-svg" />
              </div>
              <h3>AI Personalization</h3>
              <p>Every itinerary is uniquely crafted based on your preferences, past experiences, and travel style.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <RealTimeIcon className="icon-svg" />
              </div>
              <h3>Real-Time Context</h3>
              <p>Weather-aware planning, crowd insights, and safety alerts keep you informed and safe.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <ChatIcon className="icon-svg" />
              </div>
              <h3>AI Virtual Guide</h3>
              <p>Multilingual chatbot assistant available 24/7 to answer questions and provide recommendations.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <AccessibilityIcon className="icon-svg" />
              </div>
              <h3>Inclusive Design</h3>
              <p>Accessibility-first approach ensuring everyone can enjoy their travel experience.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <SustainableIcon className="icon-svg" />
              </div>
              <h3>Sustainable Tourism</h3>
              <p>Discover local artisans, eco-friendly options, and community-driven experiences.</p>
            </div>
            <div className="feature-card">
              <div className="feature-card-icon">
                <LearningIcon className="icon-svg" />
              </div>
              <h3>Continuous Learning</h3>
              <p>AI learns from your feedback to improve recommendations over time.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
