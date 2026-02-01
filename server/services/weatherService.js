const axios = require('axios');
require('dotenv').config();

/**
 * OpenWeatherMap Service
 * Handles weather data and forecasts
 */
class WeatherService {
  constructor() {
    this.apiKey = process.env.OPENWEATHER_API_KEY;
    this.baseUrl = 'https://api.openweathermap.org/data/2.5';
  }

  async getCurrentWeather(lat, lng) {
    if (!this.apiKey) {
      return this.getMockWeather();
    }

    try {
      const response = await axios.get(`${this.baseUrl}/weather`, {
        params: {
          lat: lat,
          lon: lng,
          appid: this.apiKey,
          units: 'metric'
        }
      });

      return {
        temperature: response.data.main.temp,
        condition: response.data.weather[0].main,
        description: response.data.weather[0].description,
        humidity: response.data.main.humidity,
        windSpeed: response.data.wind?.speed || 0,
        icon: response.data.weather[0].icon,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('Weather API Error:', error.message);
      return this.getMockWeather();
    }
  }

  async getForecast(lat, lng, days = 5) {
    if (!this.apiKey) {
      return this.getMockForecast(days);
    }

    try {
      const response = await axios.get(`${this.baseUrl}/forecast`, {
        params: {
          lat: lat,
          lon: lng,
          appid: this.apiKey,
          units: 'metric',
          cnt: days * 8 // 8 forecasts per day (3-hour intervals)
        }
      });

      const forecasts = [];
      const dailyData = {};

      response.data.list.forEach(item => {
        const date = new Date(item.dt * 1000);
        const dateKey = date.toDateString();

        if (!dailyData[dateKey]) {
          dailyData[dateKey] = {
            date: dateKey,
            temperatures: [],
            conditions: [],
            humidity: [],
            windSpeed: []
          };
        }

        dailyData[dateKey].temperatures.push(item.main.temp);
        dailyData[dateKey].conditions.push(item.weather[0].main);
        dailyData[dateKey].humidity.push(item.main.humidity);
        dailyData[dateKey].windSpeed.push(item.wind?.speed || 0);
      });

      Object.values(dailyData).forEach(day => {
        forecasts.push({
          date: day.date,
          temperature: {
            min: Math.min(...day.temperatures),
            max: Math.max(...day.temperatures),
            avg: day.temperatures.reduce((a, b) => a + b, 0) / day.temperatures.length
          },
          condition: this.getMostCommon(day.conditions),
          humidity: day.humidity.reduce((a, b) => a + b, 0) / day.humidity.length,
          windSpeed: day.windSpeed.reduce((a, b) => a + b, 0) / day.windSpeed.length
        });
      });

      return forecasts.slice(0, days);
    } catch (error) {
      console.error('Weather Forecast Error:', error.message);
      return this.getMockForecast(days);
    }
  }

  getMostCommon(arr) {
    return arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  }

  getWeatherRecommendation(weather) {
    const condition = weather.condition?.toLowerCase() || '';
    
    if (condition.includes('rain') || condition.includes('storm')) {
      return {
        alert: 'Rain expected',
        recommendation: 'Consider indoor activities or bring an umbrella',
        severity: 'moderate'
      };
    }
    
    if (condition.includes('clear') || condition.includes('sun')) {
      return {
        alert: 'Clear weather',
        recommendation: 'Perfect for outdoor activities',
        severity: 'low'
      };
    }
    
    if (weather.temperature > 35) {
      return {
        alert: 'High temperature',
        recommendation: 'Stay hydrated and avoid prolonged sun exposure',
        severity: 'moderate'
      };
    }
    
    if (weather.temperature < 10) {
      return {
        alert: 'Cold weather',
        recommendation: 'Dress warmly and consider indoor activities',
        severity: 'low'
      };
    }

    return {
      alert: 'Normal conditions',
      recommendation: 'Weather is suitable for most activities',
      severity: 'low'
    };
  }

  getMockWeather() {
    return {
      temperature: 25,
      condition: 'Clear',
      description: 'clear sky',
      humidity: 60,
      windSpeed: 5,
      icon: '01d',
      timestamp: new Date()
    };
  }

  getMockForecast(days) {
    const forecasts = [];
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      forecasts.push({
        date: date.toDateString(),
        temperature: { min: 20, max: 28, avg: 24 },
        condition: 'Clear',
        humidity: 60,
        windSpeed: 5
      });
    }
    return forecasts;
  }
}

module.exports = new WeatherService();
