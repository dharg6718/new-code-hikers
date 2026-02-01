import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './Guide.css';

const Guide = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I'm your AI travel guide. How can I help you plan your trip today? I can assist with destination recommendations, itinerary planning, local insights, safety information, and more. I also support multiple languages (English, Tamil, Hindi)."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await axios.post('/api/v1/guide/chat', {
        message: userMessage
      });

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: response.data.response
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I'm having trouble right now. Please try again in a moment."
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmergency = async () => {
    try {
      const response = await axios.get('/api/v1/guide/emergency');
      const emergencyInfo = response.data;
      
      const emergencyMessage = `🆘 EMERGENCY ASSISTANCE\n\n` +
        `Local Emergency: ${emergencyInfo.localEmergencyNumber}\n` +
        `Tourist Helpline: ${emergencyInfo.touristHelpline}\n` +
        `Medical: ${emergencyInfo.medicalEmergency}\n` +
        `Police: ${emergencyInfo.policeEmergency}\n` +
        `Fire: ${emergencyInfo.fireEmergency}\n\n` +
        `${emergencyInfo.message}`;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: emergencyMessage
      }]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Unable to fetch emergency information. Please contact local authorities immediately.'
      }]);
    }
  };

  const quickActions = [
    { label: 'Best places to visit', query: 'What are the best places to visit in this area?' },
    { label: 'Local food', query: 'Tell me about local food and restaurants' },
    { label: 'Safety tips', query: 'What safety tips should I know?' },
    { label: 'Accessibility', query: 'What accessibility options are available?' },
    { label: 'Sustainable tourism', query: 'Show me sustainable tourism options' }
  ];

  const handleQuickAction = (query) => {
    setInput(query);
  };

  return (
    <div className="guide">
      <div className="guide-header">
        <h1>AI Virtual Guide</h1>
        <p>Chat with your AI travel assistant for personalized recommendations and assistance</p>
      </div>

      <div className="guide-container">
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              >
                <div className="message-content">
                  {message.content.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < message.content.split('\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message assistant-message">
                <div className="message-content">
                  <span className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="quick-actions">
            <div className="quick-actions-label">Quick Actions:</div>
            <div className="quick-actions-buttons">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  className="quick-action-btn"
                  onClick={() => handleQuickAction(action.query)}
                >
                  {action.label}
                </button>
              ))}
              <button
                className="quick-action-btn emergency"
                onClick={handleEmergency}
              >
                🆘 Emergency
              </button>
            </div>
          </div>

          <form onSubmit={handleSend} className="chat-input-form">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your trip..."
              className="chat-input"
              disabled={loading}
            />
            <button
              type="submit"
              className="send-btn"
              disabled={loading || !input.trim()}
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Guide;
