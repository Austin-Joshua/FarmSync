// Rule-based crop recommendation service (fallback when ML model is unavailable)
import { CropRecommendationInput, CropRecommendationResult, CropRecommendation } from './mlService';

export class RuleBasedCropService {
  /**
   * Get crop recommendation based on simple rules
   * This is used as fallback when ML model is unavailable
   */
  static getCropRecommendation(input: CropRecommendationInput): CropRecommendationResult {
    const recommendations: CropRecommendation[] = [];
    let topCrop = '';
    let topConfidence = 0;

    // Rule 1: High rainfall + high humidity = Rice
    if (input.rainfall > 200 && input.humidity > 70 && input.ph >= 5.5 && input.ph <= 7.0) {
      const confidence = Math.min(85, 60 + (input.rainfall / 10) + (input.humidity / 2));
      recommendations.push({ crop: 'rice', confidence, confidence_percent: confidence });
      if (confidence > topConfidence) {
        topCrop = 'rice';
        topConfidence = confidence;
      }
    }

    // Rule 2: Low rainfall + high temperature = Wheat, Maize
    if (input.rainfall < 100 && input.temperature > 20 && input.temperature < 35) {
      if (input.ph >= 6.0 && input.ph <= 7.5) {
        const confidence = Math.min(80, 55 + (input.N / 5) + (input.P / 5) + (input.K / 5));
        recommendations.push({ crop: 'wheat', confidence, confidence_percent: confidence });
        if (confidence > topConfidence) {
          topCrop = 'wheat';
          topConfidence = confidence;
        }
      }
      if (input.temperature > 22 && input.temperature < 28) {
        const confidence = Math.min(78, 50 + (input.N / 4) + (input.P / 4));
        recommendations.push({ crop: 'maize', confidence, confidence_percent: confidence });
        if (confidence > topConfidence) {
          topCrop = 'maize';
          topConfidence = confidence;
        }
      }
    }

    // Rule 3: Moderate rainfall + moderate temperature = Tomato, Potato
    if (input.rainfall >= 100 && input.rainfall <= 200 && input.temperature >= 15 && input.temperature <= 30) {
      if (input.ph >= 5.5 && input.ph <= 6.8 && input.N > 40 && input.P > 30) {
        const confidence = Math.min(82, 60 + (input.P / 4) + (input.K / 4));
        recommendations.push({ crop: 'tomato', confidence, confidence_percent: confidence });
        if (confidence > topConfidence) {
          topCrop = 'tomato';
          topConfidence = confidence;
        }
      }
      if (input.temperature >= 15 && input.temperature <= 25 && input.K > 50) {
        const confidence = Math.min(80, 55 + (input.K / 5));
        recommendations.push({ crop: 'potato', confidence, confidence_percent: confidence });
        if (confidence > topConfidence) {
          topCrop = 'potato';
          topConfidence = confidence;
        }
      }
    }

    // Rule 4: High temperature + low humidity = Cotton, Sugarcane
    if (input.temperature > 25 && input.humidity < 50 && input.rainfall >= 50 && input.rainfall <= 150) {
      if (input.ph >= 5.5 && input.ph <= 8.0) {
        const confidence = Math.min(75, 50 + (input.rainfall / 5));
        recommendations.push({ crop: 'cotton', confidence, confidence_percent: confidence });
        if (confidence > topConfidence) {
          topCrop = 'cotton';
          topConfidence = confidence;
        }
      }
    }

    // Rule 5: Low rainfall + moderate nutrients = Pulses (Lentil, Chickpea)
    if (input.rainfall < 150 && input.N < 50 && input.P > 30) {
      const confidence = Math.min(77, 55 + (input.P / 4));
      recommendations.push({ crop: 'lentil', confidence, confidence_percent: confidence });
      if (confidence > topConfidence) {
        topCrop = 'lentil';
        topConfidence = confidence;
      }

      if (input.temperature >= 15 && input.temperature <= 25) {
        const confidence2 = Math.min(75, 52 + (input.P / 4));
        recommendations.push({ crop: 'chickpea', confidence: confidence2, confidence_percent: confidence2 });
        if (confidence2 > topConfidence) {
          topCrop = 'chickpea';
          topConfidence = confidence2;
        }
      }
    }

    // Rule 6: Moderate conditions = Soybean, Groundnut
    if (
      input.rainfall >= 50 &&
      input.rainfall <= 150 &&
      input.temperature >= 20 &&
      input.temperature <= 30 &&
      input.ph >= 5.5 &&
      input.ph <= 7.0
    ) {
      if (input.P > 25 && input.K > 30) {
        const confidence = Math.min(73, 50 + (input.P / 5) + (input.K / 5));
        recommendations.push({ crop: 'soybean', confidence, confidence_percent: confidence });
        if (confidence > topConfidence) {
          topCrop = 'soybean';
          topConfidence = confidence;
        }
      }

      if (input.temperature >= 25 && input.temperature <= 30 && input.K > 35) {
        const confidence = Math.min(70, 48 + (input.K / 5));
        recommendations.push({ crop: 'groundnut', confidence, confidence_percent: confidence });
        if (confidence > topConfidence) {
          topCrop = 'groundnut';
          topConfidence = confidence;
        }
      }
    }

    // Rule 7: High nutrients = Fruit crops (Mango, Apple if temperature allows)
    if (input.N > 60 && input.P > 50 && input.K > 60) {
      if (input.temperature >= 20 && input.temperature <= 35 && input.rainfall >= 100) {
        const confidence = Math.min(72, 50 + (input.N / 6) + (input.K / 6));
        recommendations.push({ crop: 'mango', confidence, confidence_percent: confidence });
        if (confidence > topConfidence) {
          topCrop = 'mango';
          topConfidence = confidence;
        }
      }

      if (input.temperature >= 15 && input.temperature <= 25 && input.rainfall >= 80 && input.rainfall <= 150) {
        const confidence = Math.min(70, 48 + (input.K / 6));
        recommendations.push({ crop: 'apple', confidence, confidence_percent: confidence });
        if (confidence > topConfidence) {
          topCrop = 'apple';
          topConfidence = confidence;
        }
      }
    }

    // Sort recommendations by confidence (descending)
    recommendations.sort((a, b) => b.confidence - a.confidence);

    // If no recommendations found, provide default suggestions
    if (recommendations.length === 0) {
      // Default fallback based on basic conditions
      const defaultCrop = this.getDefaultCrop(input);
      recommendations.push({
        crop: defaultCrop,
        confidence: 60,
        confidence_percent: 60,
      });
      topCrop = defaultCrop;
      topConfidence = 60;
    }

    return {
      success: true,
      recommended_crop: topCrop,
      recommendations: recommendations.slice(0, 5), // Top 5 recommendations
      model_accuracy: 0, // Rule-based has no model accuracy
      rule_based: true, // Flag to indicate this is rule-based
    };
  }

  private static getDefaultCrop(input: CropRecommendationInput): string {
    // Default fallback logic
    if (input.rainfall > 150) {
      return 'rice';
    } else if (input.temperature > 25) {
      return 'cotton';
    } else if (input.temperature < 20) {
      return 'wheat';
    } else {
      return 'tomato';
    }
  }
}
