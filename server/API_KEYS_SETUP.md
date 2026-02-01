# API Keys Setup Guide

## ✅ Configured API Keys

The following API keys have been configured in `server/.env`:

### Google Maps APIs
- ✅ **GOOGLE_MAPS_API_KEY** - For Maps and Directions
- ✅ **GOOGLE_PLACES_API_KEY** - For Places search and details
- ✅ **GOOGLE_GEOCODING_API_KEY** - For geocoding (address to coordinates)
- ✅ **GOOGLE_GEOLOCATION_API_KEY** - For geolocation services

### Weather API
- ✅ **OPENWEATHER_API_KEY** - For weather data and forecasts

### Database
- ✅ **MONGODB_URI** - MongoDB Atlas connection string

## ⚠️ Required: LLM API Key for Chatbot

**The chatbot feature requires an LLM API key to work.**

You need to add ONE of the following to `server/.env`:

### Option 1: OpenRouter (Recommended - supports multiple models)
```env
OPENROUTER_API_KEY=your-openrouter-api-key-here
LLM_PROVIDER=openrouter
```

Get your key at: https://openrouter.ai/

### Option 2: OpenAI
```env
OPENAI_API_KEY=your-openai-api-key-here
LLM_PROVIDER=openai
```

Get your key at: https://platform.openai.com/api-keys

### Option 3: Azure OpenAI
```env
AZURE_OPENAI_API_KEY=your-azure-key-here
AZURE_OPENAI_ENDPOINT=your-endpoint-here
AZURE_OPENAI_DEPLOYMENT=your-deployment-name
LLM_PROVIDER=azure
```

### Option 4: Anthropic Claude
```env
ANTHROPIC_API_KEY=your-anthropic-key-here
LLM_PROVIDER=anthropic
```

Get your key at: https://console.anthropic.com/

## Features Status

| Feature | Status | Notes |
|---------|--------|-------|
| 🗺️ Maps & Places | ✅ Ready | All Google Maps APIs configured |
| 🌤️ Weather | ✅ Ready | OpenWeatherMap API configured |
| 💬 Chatbot | ⚠️ Needs LLM Key | Add LLM API key to enable |
| 📍 Geocoding | ✅ Ready | Google Geocoding API configured |
| 🧭 Directions | ✅ Ready | Google Maps Directions API configured |

## Testing Your Setup

1. **Maps**: Try searching for places in the Itinerary or Community pages
2. **Weather**: Check the Context page with latitude/longitude
3. **Chatbot**: Will work once you add an LLM API key

## Security Notes

- Never commit `.env` file to Git (already in `.gitignore`)
- Rotate API keys periodically
- Use environment-specific keys for production
- Monitor API usage to avoid unexpected charges
