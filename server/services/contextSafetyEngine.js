/**
 * Real-Time Context & Safety Engine
 * Smart Travel Platform - Production Grade
 * 
 * Responsibilities:
 * 1. Interpret live user context
 * 2. Enforce safety constraints
 * 3. Validate recommendations before delivery
 * 4. Provide safe fallback options
 * 
 * PRINCIPLE: Safety always overrides personalization
 */

const axios = require('axios');
require('dotenv').config();

class ContextSafetyEngine {
  constructor() {
    this.weatherApiKey = process.env.OPENWEATHER_API_KEY;
    this.safetyThresholds = {
      maxDailyTravelHours: 10,
      maxDailyDistance: 150, // km
      unsafeHoursStart: 23, // 11 PM
      unsafeHoursEnd: 5,    // 5 AM
      extremeWeatherCodes: [202, 212, 221, 232, 504, 511, 602, 622, 781], // Thunderstorm, heavy rain, snow
      minRestBetweenActivities: 30, // minutes
      maxActivitiesPerDay: 6
    };
  }

  /**
   * Main validation entry point
   * Validates context and returns approval/restrictions
   */
  async validateContext(userContext, recommendations) {
    const result = {
      approved: true,
      warnings: [],
      restrictions: [],
      safeAlternatives: [],
      contextAnalysis: {},
      safetyScore: 100
    };

    try {
      // 1. Analyze user context
      result.contextAnalysis = this.analyzeUserContext(userContext);

      // 2. Weather safety check
      const weatherCheck = await this.checkWeatherSafety(
        userContext.destination,
        userContext.startDate,
        userContext.endDate
      );
      if (!weatherCheck.safe) {
        result.warnings.push(...weatherCheck.warnings);
        result.safetyScore -= weatherCheck.severity * 10;
        if (weatherCheck.severe) {
          result.restrictions.push({
            type: 'WEATHER_EXTREME',
            message: weatherCheck.message,
            dates: weatherCheck.affectedDates
          });
        }
      }

      // 3. Time feasibility check
      const timeCheck = this.checkTimeFeasibility(userContext, recommendations);
      if (!timeCheck.feasible) {
        result.warnings.push(...timeCheck.warnings);
        result.safeAlternatives.push(...timeCheck.alternatives);
        result.safetyScore -= 15;
      }

      // 4. Travel group safety
      const groupCheck = this.checkGroupSafety(userContext.travelGroup, recommendations);
      if (!groupCheck.safe) {
        result.warnings.push(...groupCheck.warnings);
        result.restrictions.push(...groupCheck.restrictions);
        result.safetyScore -= 20;
      }

      // 5. Late night safety
      const nightCheck = this.checkNightSafety(recommendations);
      if (!nightCheck.safe) {
        result.warnings.push(...nightCheck.warnings);
        result.safeAlternatives.push(...nightCheck.alternatives);
        result.safetyScore -= 15;
      }

      // 6. Distance and exhaustion check
      const exhaustionCheck = this.checkExhaustionRisk(recommendations);
      if (!exhaustionCheck.safe) {
        result.warnings.push(...exhaustionCheck.warnings);
        result.safeAlternatives.push(...exhaustionCheck.suggestions);
        result.safetyScore -= 10;
      }

      // 7. Repetition check
      const repetitionCheck = this.checkRepetition(userContext.visitedPlaces, recommendations);
      if (repetitionCheck.hasRepetition) {
        result.warnings.push(...repetitionCheck.warnings);
      }

      // Determine final approval
      result.approved = result.safetyScore >= 50 && result.restrictions.length === 0;
      result.safetyScore = Math.max(0, result.safetyScore);

    } catch (error) {
      console.error('Context Safety Engine Error:', error);
      result.warnings.push({
        type: 'SYSTEM',
        message: 'Unable to complete all safety checks. Proceed with caution.',
        severity: 'medium'
      });
    }

    return result;
  }

  /**
   * Analyze user context for situational awareness
   */
  analyzeUserContext(context) {
    const analysis = {
      tripDuration: 0,
      budgetCategory: 'mid-range',
      timeAvailable: 'full-day',
      seasonalContext: '',
      groupType: 'general',
      specialNeeds: []
    };

    // Calculate trip duration
    if (context.startDate && context.endDate) {
      const start = new Date(context.startDate);
      const end = new Date(context.endDate);
      analysis.tripDuration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }

    // Budget categorization
    if (context.totalBudget) {
      const dailyBudget = context.totalBudget / (analysis.tripDuration || 1);
      if (dailyBudget < 2000) analysis.budgetCategory = 'budget';
      else if (dailyBudget < 5000) analysis.budgetCategory = 'mid-range';
      else analysis.budgetCategory = 'luxury';
    }

    // Seasonal context
    const month = new Date(context.startDate || Date.now()).getMonth();
    if (month >= 2 && month <= 4) analysis.seasonalContext = 'spring';
    else if (month >= 5 && month <= 7) analysis.seasonalContext = 'summer';
    else if (month >= 8 && month <= 10) analysis.seasonalContext = 'autumn';
    else analysis.seasonalContext = 'winter';

    // Group type analysis
    if (context.travelGroup) {
      if (context.travelGroup.hasChildren) {
        analysis.groupType = 'family';
        analysis.specialNeeds.push('child-friendly');
      }
      if (context.travelGroup.hasElderly) {
        analysis.groupType = 'senior-inclusive';
        analysis.specialNeeds.push('accessibility', 'rest-stops');
      }
      if (context.travelGroup.size > 6) {
        analysis.specialNeeds.push('group-friendly');
      }
    }

    return analysis;
  }

  /**
   * Check weather safety using OpenWeatherMap API
   */
  async checkWeatherSafety(destination, startDate, endDate) {
    const result = {
      safe: true,
      warnings: [],
      severe: false,
      message: '',
      affectedDates: [],
      severity: 0
    };

    if (!this.weatherApiKey) {
      return result; // Skip if no API key
    }

    try {
      // Get coordinates for destination
      const geoResponse = await axios.get(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${this.weatherApiKey}`
      );

      if (geoResponse.data.length === 0) {
        return result;
      }

      const { lat, lon } = geoResponse.data[0];

      // Get weather forecast
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${this.weatherApiKey}&units=metric`
      );

      const forecasts = weatherResponse.data.list;
      const start = new Date(startDate);
      const end = new Date(endDate);

      for (const forecast of forecasts) {
        const forecastDate = new Date(forecast.dt * 1000);
        
        if (forecastDate >= start && forecastDate <= end) {
          const weatherCode = forecast.weather[0].id;
          const temp = forecast.main.temp;
          const windSpeed = forecast.wind.speed;

          // Check for extreme weather
          if (this.safetyThresholds.extremeWeatherCodes.includes(weatherCode)) {
            result.safe = false;
            result.severe = true;
            result.severity = 3;
            result.affectedDates.push(forecastDate.toDateString());
            result.warnings.push({
              type: 'WEATHER_EXTREME',
              message: `⚠️ Extreme weather expected: ${forecast.weather[0].description}`,
              date: forecastDate.toDateString(),
              severity: 'high'
            });
          }

          // Check for extreme temperatures
          if (temp > 42 || temp < -5) {
            result.warnings.push({
              type: 'WEATHER_TEMPERATURE',
              message: `🌡️ Extreme temperature: ${temp}°C expected on ${forecastDate.toDateString()}`,
              severity: 'medium'
            });
            result.severity = Math.max(result.severity, 2);
          }

          // Check for high winds
          if (windSpeed > 15) {
            result.warnings.push({
              type: 'WEATHER_WIND',
              message: `💨 High winds (${windSpeed} m/s) expected. Outdoor activities may be affected.`,
              severity: 'low'
            });
            result.severity = Math.max(result.severity, 1);
          }
        }
      }

      if (result.severe) {
        result.message = 'Extreme weather conditions detected. Consider rescheduling outdoor activities.';
      }

    } catch (error) {
      console.error('Weather API Error:', error.message);
      // Don't fail the whole check if weather API fails
    }

    return result;
  }

  /**
   * Check time feasibility of itinerary
   */
  checkTimeFeasibility(context, recommendations) {
    const result = {
      feasible: true,
      warnings: [],
      alternatives: []
    };

    if (!recommendations || !recommendations.days) {
      return result;
    }

    for (const day of recommendations.days) {
      if (!day.activities) continue;

      let totalDuration = 0;
      let totalTravel = 0;

      for (const activity of day.activities) {
        totalDuration += activity.duration || 120;
        totalTravel += 30; // Estimated travel time between activities
      }

      const totalHours = (totalDuration + totalTravel) / 60;

      if (totalHours > this.safetyThresholds.maxDailyTravelHours) {
        result.feasible = false;
        result.warnings.push({
          type: 'TIME_OVERLOAD',
          message: `⏰ Day ${day.dayNumber || ''}: ${totalHours.toFixed(1)} hours planned exceeds safe limit of ${this.safetyThresholds.maxDailyTravelHours} hours`,
          severity: 'medium'
        });
        result.alternatives.push({
          suggestion: `Consider reducing activities on Day ${day.dayNumber} or splitting across multiple days`,
          action: 'REDUCE_ACTIVITIES'
        });
      }

      if (day.activities.length > this.safetyThresholds.maxActivitiesPerDay) {
        result.warnings.push({
          type: 'ACTIVITY_OVERLOAD',
          message: `📋 Day ${day.dayNumber || ''}: ${day.activities.length} activities may be too many`,
          severity: 'low'
        });
      }
    }

    return result;
  }

  /**
   * Check safety for different travel group compositions
   */
  checkGroupSafety(travelGroup, recommendations) {
    const result = {
      safe: true,
      warnings: [],
      restrictions: []
    };

    if (!travelGroup) return result;

    const { hasChildren, hasElderly, hasMobilityIssues } = travelGroup;

    if (!recommendations || !recommendations.days) return result;

    for (const day of recommendations.days) {
      if (!day.activities) continue;

      for (const activity of day.activities) {
        // Check for child safety
        if (hasChildren) {
          const unsafeForChildren = ['bar', 'nightclub', 'casino', 'adult'];
          if (unsafeForChildren.some(term => 
            activity.category?.toLowerCase().includes(term) ||
            activity.placeName?.toLowerCase().includes(term)
          )) {
            result.safe = false;
            result.restrictions.push({
              type: 'CHILD_UNSAFE',
              place: activity.placeName,
              message: `🚫 "${activity.placeName}" may not be suitable for children`
            });
          }
        }

        // Check for elderly/mobility
        if (hasElderly || hasMobilityIssues) {
          const strenuous = ['trek', 'hike', 'climb', 'adventure'];
          if (strenuous.some(term => 
            activity.category?.toLowerCase().includes(term) ||
            activity.placeName?.toLowerCase().includes(term)
          )) {
            result.warnings.push({
              type: 'MOBILITY_CONCERN',
              place: activity.placeName,
              message: `♿ "${activity.placeName}" may require significant walking/climbing`,
              severity: 'medium'
            });
          }

          // Check activity duration
          if (activity.duration > 180) {
            result.warnings.push({
              type: 'DURATION_CONCERN',
              message: `⏱️ "${activity.placeName}" (${activity.duration} min) - Consider shorter visit for comfort`,
              severity: 'low'
            });
          }
        }
      }
    }

    return result;
  }

  /**
   * Check for late night safety concerns
   */
  checkNightSafety(recommendations) {
    const result = {
      safe: true,
      warnings: [],
      alternatives: []
    };

    if (!recommendations || !recommendations.days) return result;

    for (const day of recommendations.days) {
      if (!day.activities) continue;

      for (const activity of day.activities) {
        if (!activity.endTime) continue;

        const [hours] = activity.endTime.split(':').map(Number);

        if (hours >= this.safetyThresholds.unsafeHoursStart || hours < this.safetyThresholds.unsafeHoursEnd) {
          result.safe = false;
          result.warnings.push({
            type: 'LATE_NIGHT',
            message: `🌙 "${activity.placeName}" ends at ${activity.endTime} - Late night travel may be unsafe`,
            severity: 'medium'
          });
          result.alternatives.push({
            suggestion: `Consider visiting "${activity.placeName}" earlier in the day`,
            action: 'RESCHEDULE'
          });
        }
      }
    }

    return result;
  }

  /**
   * Check for exhaustion risk
   */
  checkExhaustionRisk(recommendations) {
    const result = {
      safe: true,
      warnings: [],
      suggestions: []
    };

    if (!recommendations || !recommendations.days) return result;

    let consecutiveFullDays = 0;

    for (const day of recommendations.days) {
      if (!day.activities) continue;

      const totalDuration = day.activities.reduce((sum, a) => sum + (a.duration || 0), 0);
      
      if (totalDuration > 480) { // More than 8 hours
        consecutiveFullDays++;
        
        if (consecutiveFullDays >= 3) {
          result.safe = false;
          result.warnings.push({
            type: 'EXHAUSTION_RISK',
            message: `😴 ${consecutiveFullDays} consecutive intensive days detected. Risk of travel fatigue.`,
            severity: 'medium'
          });
          result.suggestions.push({
            suggestion: 'Consider adding a rest day or reducing activities',
            action: 'ADD_REST_DAY'
          });
        }
      } else {
        consecutiveFullDays = 0;
      }
    }

    return result;
  }

  /**
   * Check for repetition of previously visited places
   */
  checkRepetition(visitedPlaces, recommendations) {
    const result = {
      hasRepetition: false,
      warnings: []
    };

    if (!visitedPlaces || visitedPlaces.length === 0) return result;
    if (!recommendations || !recommendations.days) return result;

    const visitedNames = new Set(visitedPlaces.map(p => 
      (p.placeName || p.name || '').toLowerCase()
    ));

    for (const day of recommendations.days) {
      if (!day.activities) continue;

      for (const activity of day.activities) {
        const placeName = (activity.placeName || '').toLowerCase();
        
        if (visitedNames.has(placeName)) {
          result.hasRepetition = true;
          result.warnings.push({
            type: 'REPETITION',
            message: `🔄 "${activity.placeName}" was previously visited`,
            severity: 'low'
          });
        }
      }
    }

    return result;
  }

  /**
   * Generate safe fallback recommendations
   */
  generateSafeFallback(context, restrictions) {
    const fallbacks = [];

    for (const restriction of restrictions) {
      switch (restriction.type) {
        case 'WEATHER_EXTREME':
          fallbacks.push({
            type: 'INDOOR_ALTERNATIVE',
            message: 'Consider indoor attractions like museums, malls, or cultural centers',
            suggestions: ['Local Museum', 'Shopping Mall', 'Indoor Cultural Center', 'Cooking Class']
          });
          break;

        case 'CHILD_UNSAFE':
          fallbacks.push({
            type: 'FAMILY_FRIENDLY',
            message: 'Family-friendly alternatives available',
            suggestions: ['Parks', 'Zoo', 'Children\'s Museum', 'Aquarium', 'Family Restaurant']
          });
          break;

        case 'MOBILITY_CONCERN':
          fallbacks.push({
            type: 'ACCESSIBLE',
            message: 'Accessibility-friendly alternatives',
            suggestions: ['Scenic Drives', 'Boat Tours', 'Accessible Museums', 'Gardens with Paths']
          });
          break;

        default:
          fallbacks.push({
            type: 'GENERAL_SAFE',
            message: 'Safe alternative activities',
            suggestions: ['City Tour', 'Local Restaurant', 'Cultural Show', 'Market Visit']
          });
      }
    }

    return fallbacks;
  }

  /**
   * Privacy protection - sanitize sensitive data
   */
  sanitizeUserData(userData) {
    const sanitized = { ...userData };
    
    // Remove or mask sensitive fields
    const sensitiveFields = ['password', 'creditCard', 'ssn', 'phoneNumber', 'email'];
    
    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        if (field === 'email' && typeof sanitized[field] === 'string') {
          const [name, domain] = sanitized[field].split('@');
          sanitized[field] = `${name.charAt(0)}***@${domain}`;
        } else {
          delete sanitized[field];
        }
      }
    }

    return sanitized;
  }

  /**
   * Get current safety status summary
   */
  getSafetyStatusSummary(validationResult) {
    const { safetyScore, warnings, restrictions } = validationResult;
    
    let status = 'SAFE';
    let color = 'green';
    let icon = '✅';
    
    if (safetyScore < 50) {
      status = 'UNSAFE';
      color = 'red';
      icon = '🚫';
    } else if (safetyScore < 70) {
      status = 'CAUTION';
      color = 'orange';
      icon = '⚠️';
    } else if (safetyScore < 90) {
      status = 'MODERATE';
      color = 'yellow';
      icon = '⚡';
    }

    return {
      status,
      score: safetyScore,
      color,
      icon,
      warningCount: warnings.length,
      restrictionCount: restrictions.length,
      summary: `${icon} Safety Score: ${safetyScore}/100 - ${status}`
    };
  }
}

module.exports = new ContextSafetyEngine();
