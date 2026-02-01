import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/profile', label: 'Profile', icon: '👤' },
    { path: '/itinerary', label: 'Itinerary', icon: '🗺️' },
    { path: '/context', label: 'Context', icon: '🌍' },
    { path: '/guide', label: 'AI Guide', icon: '💬' },
    { path: '/community', label: 'Community', icon: '🤝' },
    { path: '/accessibility', label: 'Accessibility', icon: '♿' },
    { path: '/feedback', label: 'Feedback', icon: '📝' }
  ];

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/dashboard" className="nav-logo">
            <span className="logo-icon">🌍</span>
            <span className="logo-text">Smart Tourism</span>
          </Link>

          <button
            className="mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>

          <div className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                <span className="nav-label">{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="nav-user">
            <span className="user-name">{user?.name || 'User'}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
