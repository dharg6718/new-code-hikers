# AI-Powered Smart Tourism Platform

A production-ready AI SaaS platform for intelligent, personalized travel planning.

## Features

- 🎯 **AI-Powered Personalization** - Deep learning from user preferences
- 🗺️ **Smart Itinerary Planning** - Optimized day-wise travel plans
- 🌍 **Real-Time Context** - Weather, crowds, and safety awareness
- 💬 **AI Virtual Guide** - Multilingual chatbot assistant
- ♿ **Accessibility First** - Inclusive travel for everyone
- 🌱 **Sustainable Tourism** - Community-driven local experiences
- 📊 **Learning System** - Continuous improvement from feedback

## Tech Stack

- **Frontend**: React, React Router, CSS Modules
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: OpenRouter/OpenAI API integration
- **Maps**: Google Maps API
- **Weather**: OpenWeatherMap API

## Setup

1. Install dependencies:
```bash
npm run install-all
```

2. Configure environment variables:
- Copy `server/.env.example` to `server/.env`
- Add your API keys (OpenRouter, Google Maps, OpenWeatherMap)

3. Start development servers:
```bash
npm run dev
```

4. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Project Structure

```
├── client/          # React frontend
├── server/          # Node.js backend
└── README.md
```

## API Keys Required

- OpenRouter API Key (or OpenAI/Azure/Anthropic)
- Google Maps API Key
- OpenWeatherMap API Key

## License

MIT
