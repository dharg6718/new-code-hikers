# Setup Guide - AI Smart Tourism Platform

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and add your API keys:

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and add your API keys:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/smart-tourism
# OR use MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-tourism

# JWT Secret (change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AI/LLM API Keys (choose one provider)
OPENROUTER_API_KEY=your-openrouter-api-key-here
# OR
# OPENAI_API_KEY=your-openai-api-key-here
# OR
# AZURE_OPENAI_API_KEY=your-azure-key-here
# OR
# ANTHROPIC_API_KEY=your-anthropic-key-here

# Google Maps API
GOOGLE_MAPS_API_KEY=your-google-maps-api-key-here

# OpenWeatherMap API
OPENWEATHER_API_KEY=your-openweather-api-key-here

# API Provider Selection
LLM_PROVIDER=openrouter
```

### 3. Start MongoDB

If using local MongoDB:

```bash
# Windows
mongod

# macOS/Linux
sudo systemctl start mongod
# OR
brew services start mongodb-community
```

Or use MongoDB Atlas (cloud) - no local installation needed.

### 4. Start Development Servers

From the root directory:

```bash
npm run dev
```

This will start:
- Backend server on http://localhost:5000
- Frontend React app on http://localhost:3000

Or start them separately:

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm start
```

## Getting API Keys

### 1. OpenRouter (Recommended for LLM)
- Visit: https://openrouter.ai/
- Sign up and get your API key
- Supports multiple models (GPT-4, Claude, etc.)

### 2. Google Maps API
- Visit: https://console.cloud.google.com/
- Create a project
- Enable: Maps JavaScript API, Places API, Directions API
- Create credentials (API Key)
- Add to `.env` as `GOOGLE_MAPS_API_KEY`

### 3. OpenWeatherMap API
- Visit: https://openweathermap.org/api
- Sign up for free account
- Get API key from dashboard
- Add to `.env` as `OPENWEATHER_API_KEY`

## Project Structure

```
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts (Auth)
│   │   ├── pages/          # Route pages
│   │   └── App.js          # Main app component
│   └── package.json
│
├── server/                 # Node.js backend
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── services/           # Business logic
│   │   ├── personalizationEngine.js  # AI engine
│   │   ├── llmService.js   # LLM API integration
│   │   ├── mapsService.js  # Google Maps integration
│   │   └── weatherService.js # Weather API integration
│   ├── index.js            # Server entry point
│   └── .env                # Environment variables
│
└── package.json            # Root package.json
```

## Features

✅ User Authentication (Register/Login)
✅ User Profile & Preferences
✅ AI-Powered Itinerary Generation
✅ Real-Time Context (Weather, Traffic, Safety)
✅ AI Virtual Guide (Chatbot)
✅ Local Community Experiences
✅ Accessibility & Inclusivity Features
✅ Feedback & Learning System

## Development Notes

- The app uses mock data when API keys are not configured
- All API calls go through the backend (no secrets in frontend)
- Personalization engine is the core IP - runs server-side
- MongoDB stores user preferences and itineraries

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`
- For Atlas, ensure IP whitelist includes your IP

### API Key Errors
- Check that API keys are correctly set in `.env`
- Verify API keys are active and have proper permissions
- Check API quotas/limits

### Port Already in Use
- Change `PORT` in `server/.env`
- Or kill process using port 5000/3000

## Production Build

```bash
# Build frontend
cd client
npm run build

# Start production server
cd ../server
NODE_ENV=production npm start
```

## License

MIT
