import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { MapIcon, CheckIcon, LocationIcon, StarIcon, PlusIcon, ChatIcon, CommunityIcon } from '../components/Icons';
import './Dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalItineraries: 0,
    completedTrips: 0,
    visitedPlaces: 0,
    averageRating: 0
  });
  const [recentItineraries, setRecentItineraries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [itinerariesRes, feedbackRes] = await Promise.all([
        axios.get('/api/v1/itineraries'),
        axios.get('/api/v1/feedback')
      ]);

      const itineraries = itinerariesRes.data;
      const feedback = feedbackRes.data;

      setStats({
        totalItineraries: itineraries.length,
        completedTrips: itineraries.filter(i => i.status === 'completed').length,
        visitedPlaces: feedback.visitedPlaces?.length || 0,
        averageRating: feedback.feedbackHistory?.length > 0
          ? (feedback.feedbackHistory.reduce((sum, f) => sum + f.rating, 0) / feedback.feedbackHistory.length).toFixed(1)
          : 0
      });

      setRecentItineraries(itineraries.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="dashboard-subtitle">Welcome back! Here's your travel overview.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <MapIcon className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.totalItineraries}</div>
            <div className="stat-label">Total Itineraries</div>
          </div>
        </div>

        <div className="stat-card">
          <CheckIcon className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.completedTrips}</div>
            <div className="stat-label">Completed Trips</div>
          </div>
        </div>

        <div className="stat-card">
          <LocationIcon className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.visitedPlaces}</div>
            <div className="stat-label">Visited Places</div>
          </div>
        </div>

        <div className="stat-card">
          <StarIcon className="stat-icon" />
          <div className="stat-content">
            <div className="stat-value">{stats.averageRating}</div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        <Link to="/itinerary" className="action-card primary">
          <PlusIcon className="action-icon" />
          <div className="action-content">
            <h3>Create New Itinerary</h3>
            <p>Let AI plan your perfect trip</p>
          </div>
        </Link>

        <Link to="/guide" className="action-card">
          <ChatIcon className="action-icon" />
          <div className="action-content">
            <h3>Chat with AI Guide</h3>
            <p>Get instant travel assistance</p>
          </div>
        </Link>

        <Link to="/community" className="action-card">
          <CommunityIcon className="action-icon" />
          <div className="action-content">
            <h3>Explore Community</h3>
            <p>Discover local experiences</p>
          </div>
        </Link>
      </div>

      <div className="recent-section">
        <h2>Recent Itineraries</h2>
        {recentItineraries.length > 0 ? (
          <div className="itineraries-list">
            {recentItineraries.map(itinerary => (
              <Link
                key={itinerary._id}
                to={`/itinerary?id=${itinerary._id}`}
                className="itinerary-card"
              >
                <div className="itinerary-header">
                  <h3>{itinerary.destination}</h3>
                  <span className={`status-badge ${itinerary.status}`}>
                    {itinerary.status}
                  </span>
                </div>
                <div className="itinerary-details">
                  <span>📅 {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}</span>
                  <span>📆 {itinerary.days?.length || 0} days</span>
                </div>
                {itinerary.aiExplanation && (
                  <p className="itinerary-explanation">{itinerary.aiExplanation}</p>
                )}
              </Link>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No itineraries yet. Create your first one!</p>
            <Link to="/itinerary" className="empty-state-btn">
              Create Itinerary
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
