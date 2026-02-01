import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Itinerary from './pages/Itinerary';
import Context from './pages/Context';
import Guide from './pages/Guide';
import Community from './pages/Community';
import Accessibility from './pages/Accessibility';
import Feedback from './pages/Feedback';
import PrivateRoute from './components/PrivateRoute';

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <Profile />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/itinerary"
            element={
              <PrivateRoute>
                <Layout>
                  <Itinerary />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/context"
            element={
              <PrivateRoute>
                <Layout>
                  <Context />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/guide"
            element={
              <PrivateRoute>
                <Layout>
                  <Guide />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/community"
            element={
              <PrivateRoute>
                <Layout>
                  <Community />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/accessibility"
            element={
              <PrivateRoute>
                <Layout>
                  <Accessibility />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/feedback"
            element={
              <PrivateRoute>
                <Layout>
                  <Feedback />
                </Layout>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
