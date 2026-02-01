import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Feedback.css';

const Feedback = () => {
  const [itineraries, setItineraries] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    itineraryId: '',
    feedback: '',
    rating: 5,
    visitedPlaces: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itinerariesRes, feedbackRes, insightsRes] = await Promise.all([
        axios.get('/api/v1/itineraries'),
        axios.get('/api/v1/feedback'),
        axios.get('/api/v1/feedback/insights')
      ]);

      setItineraries(itinerariesRes.data);
      setFeedbackHistory(feedbackRes.data.feedbackHistory || []);
      setInsights(insightsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await axios.post('/api/v1/feedback', formData);
      alert('Feedback submitted successfully!');
      setFormData({
        itineraryId: '',
        feedback: '',
        rating: 5,
        visitedPlaces: []
      });
      fetchData();
    } catch (error) {
      alert('Error submitting feedback');
      console.error(error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (loading) {
    return <div className="feedback-loading">Loading...</div>;
  }

  return (
    <div className="feedback">
      <div className="feedback-header">
        <h1>Feedback & Learning</h1>
        <p>Share your experience to help AI improve future recommendations</p>
      </div>

      <div className="feedback-content">
        <div className="insights-section">
          <h2>Your Learning Insights</h2>
          {insights && (
            <div className="insights-card">
              <div className="insights-grid">
                <div className="insight-item">
                  <div className="insight-icon">📝</div>
                  <div className="insight-content">
                    <div className="insight-value">{insights.totalFeedback}</div>
                    <div className="insight-label">Feedback Entries</div>
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-icon">📍</div>
                  <div className="insight-content">
                    <div className="insight-value">{insights.visitedPlaces}</div>
                    <div className="insight-label">Visited Places</div>
                  </div>
                </div>

                <div className="insight-item">
                  <div className="insight-icon">⭐</div>
                  <div className="insight-content">
                    <div className="insight-value">{insights.averageRating?.toFixed(1) || '0'}</div>
                    <div className="insight-label">Average Rating</div>
                  </div>
                </div>
              </div>

              <div className="insights-message">
                <p>{insights.message}</p>
                {insights.lastUpdated && (
                  <p className="last-updated">
                    Last updated: {new Date(insights.lastUpdated).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="submit-section">
          <h2>Submit Feedback</h2>
          <div className="feedback-form-card">
            <form onSubmit={handleSubmit} className="feedback-form">
              <div className="form-group">
                <label htmlFor="itineraryId">Itinerary (Optional)</label>
                <select
                  id="itineraryId"
                  name="itineraryId"
                  value={formData.itineraryId}
                  onChange={handleInputChange}
                >
                  <option value="">Select an itinerary</option>
                  {itineraries.map(itinerary => (
                    <option key={itinerary._id} value={itinerary._id}>
                      {itinerary.destination} - {new Date(itinerary.startDate).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="rating">Rating</label>
                <div className="rating-input">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      className={`star-btn ${star <= formData.rating ? 'active' : ''}`}
                      onClick={() => setFormData({ ...formData, rating: star })}
                    >
                      ⭐
                    </button>
                  ))}
                  <span className="rating-value">{formData.rating} / 5</span>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="feedback">Your Feedback</label>
                <textarea
                  id="feedback"
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  rows="6"
                  placeholder="Share your experience, what you liked, what could be improved..."
                  required
                />
              </div>

              <button type="submit" className="submit-btn">
                Submit Feedback
              </button>
            </form>
          </div>
        </div>

        <div className="history-section">
          <h2>Feedback History</h2>
          {feedbackHistory.length > 0 ? (
            <div className="history-list">
              {feedbackHistory.map((item, index) => (
                <div key={index} className="history-item">
                  <div className="history-header">
                    <div className="history-rating">
                      {'⭐'.repeat(item.rating)}
                      <span className="rating-text">{item.rating}/5</span>
                    </div>
                    <span className="history-date">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  {item.feedback && (
                    <p className="history-feedback">{item.feedback}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No feedback submitted yet. Share your experience to help improve recommendations!</p>
            </div>
          )}
        </div>

        <div className="learning-section">
          <h2>How AI Learning Works</h2>
          <div className="learning-card">
            <div className="learning-step">
              <div className="step-icon">1️⃣</div>
              <div className="step-text">
                <h3>You Share Feedback</h3>
                <p>After your trip, provide ratings and feedback about your experience, places visited, and itinerary quality.</p>
              </div>
            </div>

            <div className="learning-step">
              <div className="step-icon">2️⃣</div>
              <div className="step-text">
                <h3>AI Analyzes Patterns</h3>
                <p>The system analyzes your feedback to identify preferences, patterns, and areas for improvement.</p>
              </div>
            </div>

            <div className="learning-step">
              <div className="step-icon">3️⃣</div>
              <div className="step-text">
                <h3>Preference Vector Updates</h3>
                <p>Your preference vector is updated based on feedback, adjusting interest weights and accessibility preferences.</p>
              </div>
            </div>

            <div className="learning-step">
              <div className="step-icon">4️⃣</div>
              <div className="step-text">
                <h3>Better Recommendations</h3>
                <p>Future itineraries and recommendations are improved to better match your evolving travel style and preferences.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feedback;
