/**
 * AI Personalization Engine
 * Core intellectual property - scores and ranks places based on user preferences
 */

class PersonalizationEngine {
  /**
   * Calculate preference vector score for a place
   * @param {Object} userPreferences - User's preference vector
   * @param {Object} place - Place data with attributes
   * @returns {Object} Score breakdown and reasoning
   */
  scorePlace(userPreferences, place) {
    const scores = {
      interestMatch: 0,
      accessibilityMatch: 0,
      budgetMatch: 0,
      sustainabilityMatch: 0,
      noveltyScore: 0,
      timeOptimization: 0
    };

    const reasoning = [];

    // 1. Interest Matching (weighted average)
    if (place.categories && userPreferences.interests) {
      let interestScore = 0;
      let totalWeight = 0;
      
      place.categories.forEach(category => {
        const categoryKey = category.toLowerCase().replace(/\s+/g, '');
        if (userPreferences.interests[categoryKey] !== undefined) {
          interestScore += userPreferences.interests[categoryKey];
          totalWeight += 1;
        }
      });
      
      scores.interestMatch = totalWeight > 0 ? interestScore / totalWeight : 0.5;
      reasoning.push(`Interest match: ${(scores.interestMatch * 100).toFixed(0)}% based on ${place.categories?.join(', ') || 'general'}`);
    }

    // 2. Accessibility Matching
    if (userPreferences.accessibility) {
      let accessibilityScore = 1.0;
      
      if (userPreferences.accessibility.wheelchairFriendly && !place.wheelchairAccessible) {
        accessibilityScore *= 0.3;
        reasoning.push('⚠️ Not wheelchair accessible');
      }
      
      if (userPreferences.accessibility.dietaryRestrictions?.length > 0) {
        const hasDietaryOptions = place.dietaryOptions?.some(diet => 
          userPreferences.accessibility.dietaryRestrictions.includes(diet)
        );
        if (!hasDietaryOptions) {
          accessibilityScore *= 0.7;
          reasoning.push('⚠️ Limited dietary options');
        }
      }
      
      scores.accessibilityMatch = accessibilityScore;
    } else {
      scores.accessibilityMatch = 1.0;
    }

    // 3. Budget Matching
    if (place.estimatedCost && userPreferences.budgetLevel) {
      const budgetRanges = {
        budget: { min: 0, max: 500 },
        'mid-range': { min: 500, max: 2000 },
        luxury: { min: 2000, max: Infinity }
      };
      
      const range = budgetRanges[userPreferences.budgetLevel];
      if (place.estimatedCost <= range.max && place.estimatedCost >= range.min) {
        scores.budgetMatch = 1.0;
        reasoning.push(`✅ Within ${userPreferences.budgetLevel} budget`);
      } else if (place.estimatedCost < range.min) {
        scores.budgetMatch = 0.8;
        reasoning.push('💰 Below budget range');
      } else {
        scores.budgetMatch = 0.4;
        reasoning.push('⚠️ Above budget range');
      }
    } else {
      scores.budgetMatch = 0.7;
    }

    // 4. Sustainability Score
    if (place.sustainabilityScore !== undefined) {
      const userSustainabilityInterest = userPreferences.interests?.sustainability || 0.5;
      scores.sustainabilityMatch = (place.sustainabilityScore / 10) * (0.5 + userSustainabilityInterest);
      reasoning.push(`🌱 Sustainability: ${place.sustainabilityScore}/10`);
    } else {
      scores.sustainabilityMatch = 0.5;
    }

    // 5. Novelty Score (avoid previously visited places)
    if (userPreferences.visitedPlaces) {
      const hasVisited = userPreferences.visitedPlaces.some(
        visit => visit.placeId === place.id || visit.placeName === place.name
      );
      scores.noveltyScore = hasVisited ? 0.2 : 1.0;
      if (hasVisited) {
        reasoning.push('📍 Previously visited - lower priority');
      } else {
        reasoning.push('✨ New experience');
      }
    } else {
      scores.noveltyScore = 1.0;
    }

    // 6. Time Optimization (consider travel pace)
    if (place.estimatedDuration && userPreferences.travelPace) {
      const paceMultipliers = {
        slow: 1.5,
        moderate: 1.0,
        fast: 0.7
      };
      const adjustedDuration = place.estimatedDuration * (paceMultipliers[userPreferences.travelPace] || 1.0);
      scores.timeOptimization = adjustedDuration <= 180 ? 1.0 : Math.max(0.5, 1 - (adjustedDuration - 180) / 300);
      reasoning.push(`⏱️ Duration: ${place.estimatedDuration}min (${userPreferences.travelPace} pace)`);
    } else {
      scores.timeOptimization = 0.8;
    }

    // Calculate weighted final score
    const weights = {
      interestMatch: 0.3,
      accessibilityMatch: 0.2,
      budgetMatch: 0.15,
      sustainabilityMatch: 0.1,
      noveltyScore: 0.15,
      timeOptimization: 0.1
    };

    const finalScore = Object.keys(weights).reduce((sum, key) => {
      return sum + (scores[key] * weights[key]);
    }, 0);

    return {
      finalScore: Math.round(finalScore * 100) / 100,
      breakdown: scores,
      reasoning: reasoning.join(' | ')
    };
  }

  /**
   * Rank places by score
   * @param {Array} places - Array of places to rank
   * @param {Object} userPreferences - User's preference vector
   * @returns {Array} Sorted places with scores
   */
  rankPlaces(places, userPreferences) {
    // Handle undefined/null preferences
    const prefs = userPreferences || {};
    
    return places
      .map(place => ({
        ...place,
        score: this.scorePlace(prefs, place)
      }))
      .sort((a, b) => b.score.finalScore - a.score.finalScore)
      .slice(0, 50); // Top 50 results
  }

  /**
   * Generate AI explanation for itinerary
   * @param {Object} itinerary - Generated itinerary
   * @param {Object} userPreferences - User preferences
   * @returns {String} Natural language explanation
   */
  generateExplanation(itinerary, userPreferences) {
    const explanations = [];
    
    // Safely handle undefined preferences
    const prefs = userPreferences || {};
    
    if (prefs.interests) {
      const topInterests = Object.entries(prefs.interests)
        .filter(([_, value]) => value > 0.6)
        .map(([key, _]) => key)
        .slice(0, 3);
      
      if (topInterests.length > 0) {
        explanations.push(`Curated based on your interests in ${topInterests.join(', ')}`);
      }
    }
    
    if (prefs.visitedPlaces?.length > 0) {
      explanations.push(`Avoided ${prefs.visitedPlaces.length} previously visited locations`);
    }
    
    if (prefs.budgetLevel) {
      explanations.push(`Optimized for ${prefs.budgetLevel} budget`);
    }
    
    if (prefs.accessibility?.wheelchairFriendly) {
      explanations.push('All locations are wheelchair accessible');
    }
    
    return explanations.length > 0 
      ? explanations.join('. ') + '.'
      : 'Personalized itinerary based on your preferences and travel style.';
  }
}

module.exports = new PersonalizationEngine();
