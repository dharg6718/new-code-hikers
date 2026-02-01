const axios = require('axios');
require('dotenv').config();

/**
 * LLM Service - Handles all AI/LLM API calls
 * Supports: OpenRouter, OpenAI, Azure OpenAI, Anthropic
 */
class LLMService {
  constructor() {
    this.provider = process.env.LLM_PROVIDER || 'openrouter';
    this.apiKey = this.getApiKey();
  }

  getApiKey() {
    switch (this.provider) {
      case 'openrouter':
        return process.env.OPENROUTER_API_KEY;
      case 'openai':
        return process.env.OPENAI_API_KEY;
      case 'azure':
        return process.env.AZURE_OPENAI_API_KEY;
      case 'anthropic':
        return process.env.ANTHROPIC_API_KEY;
      default:
        return process.env.OPENROUTER_API_KEY;
    }
  }

  async chat(messages, options = {}) {
    if (!this.apiKey) {
      throw new Error('LLM API key not configured. Please set API key in environment variables.');
    }

    try {
      switch (this.provider) {
        case 'openrouter':
          return await this.openRouterChat(messages, options);
        case 'openai':
          return await this.openAIChat(messages, options);
        case 'azure':
          return await this.azureChat(messages, options);
        case 'anthropic':
          return await this.anthropicChat(messages, options);
        default:
          return await this.openRouterChat(messages, options);
      }
    } catch (error) {
      console.error('LLM API Error:', error.message);
      // Fallback response
      return {
        content: "I'm having trouble connecting to the AI service. Please check your API key configuration.",
        error: true
      };
    }
  }

  async openRouterChat(messages, options) {
    // Use free models on OpenRouter - try multiple in order of preference
    const freeModels = [
      'meta-llama/llama-3.2-3b-instruct:free',
      'google/gemma-2-9b-it:free',
      'mistralai/mistral-7b-instruct:free',
      'huggingfaceh4/zephyr-7b-beta:free'
    ];
    
    const modelToUse = options.model || freeModels[0];
    
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: modelToUse,
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.APP_URL || 'http://localhost:3000',
          'X-Title': 'AI Smart Tourism Platform'
        },
        timeout: 30000 // 30 second timeout for faster failure
      }
    );

    return {
      content: response.data.choices[0].message.content,
      model: response.data.model,
      usage: response.data.usage
    };
  }

  async openAIChat(messages, options) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: options.model || 'gpt-4-turbo-preview',
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: response.data.choices[0].message.content,
      model: response.data.model,
      usage: response.data.usage
    };
  }

  async azureChat(messages, options) {
    const endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    const deployment = process.env.AZURE_OPENAI_DEPLOYMENT || 'gpt-4';
    
    const response = await axios.post(
      `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=2024-02-15-preview`,
      {
        messages: messages,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000
      },
      {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: response.data.choices[0].message.content,
      model: deployment,
      usage: response.data.usage
    };
  }

  async anthropicChat(messages, options) {
    // Convert messages format for Anthropic
    const systemMessage = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: options.model || 'claude-3-opus-20240229',
        max_tokens: options.max_tokens || 1000,
        system: systemMessage,
        messages: conversationMessages
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        }
      }
    );

    return {
      content: response.data.content[0].text,
      model: response.data.model,
      usage: response.data.usage
    };
  }

  async generateItineraryExplanation(itinerary, userPreferences) {
    const prompt = `You are a friendly travel guide. Explain this itinerary in a natural, engaging way:

Destination: ${itinerary.destination}
Duration: ${itinerary.days?.length || 0} days
User Preferences: ${JSON.stringify(userPreferences, null, 2)}

Provide a warm, personalized explanation (2-3 sentences) highlighting why this itinerary suits the traveler.`;

    const response = await this.chat([
      { role: 'system', content: 'You are an expert travel guide who creates personalized, engaging explanations.' },
      { role: 'user', content: prompt }
    ]);

    return response.content || 'This itinerary has been personalized based on your preferences and travel style.';
  }

  async chatWithGuide(userMessage, context = {}) {
    const systemPrompt = `You are a friendly, knowledgeable AI travel guide for the Smart Tourism Platform. 
You help travelers with:
- Destination recommendations
- Itinerary planning
- Local insights and tips
- Safety information
- Accessibility information
- Sustainable travel options

Be conversational, helpful, and concise. Support multiple languages (English, Tamil, Hindi).
Current context: ${JSON.stringify(context, null, 2)}`;

    const response = await this.chat([
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ], {
      temperature: 0.8,
      max_tokens: 500
    });

    return response.content;
  }

  async generatePlaceRecommendations(destination, days, preferences = {}) {
    // Simplified preferences to reduce token usage - handle both array and string
    let simplifiedPrefs = '';
    if (preferences.interests) {
      simplifiedPrefs = Array.isArray(preferences.interests) 
        ? preferences.interests.slice(0, 3).join(', ')
        : String(preferences.interests);
    }
    
    // Reduce days to max 5 to avoid truncated responses
    const limitedDays = Math.min(days, 5);
    
    const prompt = `Create a ${limitedDays}-day travel itinerary for ${destination}.

IMPORTANT: Each day MUST include a MIX of:
- 1-2 Famous tourist attractions/landmarks
- 1 Temple/religious site or cultural monument
- 1 Famous local restaurant/food spot

Return ONLY valid JSON. Use REAL place names that exist on Google Maps.

Format:
{"days":[
  {"dayNumber":1,"theme":"Day Theme","places":[
    {"place_name":"Exact Place Name","city":"${destination}","category":"attraction","importance":"Why visit","duration":120,"estimatedCost":500},
    {"place_name":"Temple/Religious Name","city":"${destination}","category":"temple","importance":"Why visit","duration":60,"estimatedCost":100},
    {"place_name":"Restaurant Name","city":"${destination}","category":"restaurant","importance":"Famous for what food","duration":90,"estimatedCost":800}
  ]}
]}

Categories: attraction, temple, museum, park, restaurant, market, beach, monument
${simplifiedPrefs ? `User interests: ${simplifiedPrefs}` : ''}`;

    try {
      const response = await this.chat([
        { role: 'system', content: 'Expert travel planner. Return ONLY valid compact JSON with real places. No markdown or explanations.' },
        { role: 'user', content: prompt }
      ], {
        temperature: 0.4,
        max_tokens: 2500
      });

      // Parse the JSON response
      let content = response.content;
      // Remove markdown code blocks if present
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      // Try to fix truncated JSON
      const parsed = this.tryParseJSON(content);
      
      if (parsed && parsed.days) {
        // If we limited days but user wanted more, duplicate with variations
        while (parsed.days.length < days) {
          const dayIndex = parsed.days.length % limitedDays;
          const templateDay = parsed.days[dayIndex];
          parsed.days.push({
            ...templateDay,
            dayNumber: parsed.days.length + 1,
            theme: `Day ${parsed.days.length + 1} - More Exploration`
          });
        }
        return parsed;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating place recommendations:', error);
      return null;
    }
  }

  // Helper to try parsing potentially truncated JSON
  tryParseJSON(content) {
    try {
      return JSON.parse(content);
    } catch (e) {
      // Try to fix common truncation issues
      let fixed = content;
      
      // Count braces and brackets
      const openBraces = (fixed.match(/{/g) || []).length;
      const closeBraces = (fixed.match(/}/g) || []).length;
      const openBrackets = (fixed.match(/\[/g) || []).length;
      const closeBrackets = (fixed.match(/]/g) || []).length;
      
      // Add missing closing characters
      for (let i = 0; i < openBrackets - closeBrackets; i++) {
        fixed += ']';
      }
      for (let i = 0; i < openBraces - closeBraces; i++) {
        fixed += '}';
      }
      
      // Try parsing fixed version
      try {
        return JSON.parse(fixed);
      } catch (e2) {
        // Last resort: try to extract valid days array
        const daysMatch = content.match(/"days"\s*:\s*\[([\s\S]*)/);
        if (daysMatch) {
          try {
            // Find complete day objects
            const dayPattern = /\{"dayNumber":\s*\d+[^}]*"places"\s*:\s*\[[^\]]*\][^}]*\}/g;
            const days = content.match(dayPattern);
            if (days && days.length > 0) {
              return { days: days.map(d => JSON.parse(d)) };
            }
          } catch (e3) {
            // Give up
          }
        }
        console.error('Could not fix truncated JSON');
        return null;
      }
    }
  }

  async getPlaceDetails(placeName, destination) {
    const prompt = `Provide detailed information about "${placeName}" in ${destination}. 
Return JSON with this structure:
{
  "name": "${placeName}",
  "description": "Detailed 3-4 sentence description",
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "bestTimeToVisit": "Best time of day/season",
  "averageDuration": "2-3 hours",
  "entryFee": "₹500 or Free",
  "tips": ["tip1", "tip2"],
  "nearbyAttractions": ["nearby1", "nearby2"]
}

Return ONLY valid JSON.`;

    try {
      const response = await this.chat([
        { role: 'system', content: 'You are a travel expert. Always respond with valid JSON only.' },
        { role: 'user', content: prompt }
      ], {
        temperature: 0.5,
        max_tokens: 500
      });

      let content = response.content;
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      
      return JSON.parse(content);
    } catch (error) {
      console.error('Error getting place details:', error);
      return null;
    }
  }
}

module.exports = new LLMService();
