import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export interface CropRecommendationInput {
  N: number; // Nitrogen
  P: number; // Phosphorus
  K: number; // Potassium
  temperature: number; // Celsius
  humidity: number; // Percentage
  ph: number; // Soil pH
  rainfall: number; // mm
}

export interface CropRecommendation {
  crop: string;
  confidence: number;
  confidence_percent: number;
}

export interface CropRecommendationResult {
  success: boolean;
  recommended_crop?: string;
  recommendations?: CropRecommendation[];
  model_accuracy?: number;
  error?: string;
}

export class MLService {
  private static modelPath = path.join(__dirname, '../../ml/crop_recommendation_model.pkl');
  private static predictScriptPath = path.join(__dirname, '../../ml/predict.py');

  static async isModelAvailable(): Promise<boolean> {
    return fs.existsSync(this.modelPath);
  }

  static async getCropRecommendation(input: CropRecommendationInput): Promise<CropRecommendationResult> {
    try {
      // Check if model exists
      if (!(await this.isModelAvailable())) {
        return {
          success: false,
          error: 'ML model not found. Please train the model first by running: python ml/train_model.py',
        };
      }

      // Validate input
      const validation = this.validateInput(input);
      if (!validation.valid) {
        return {
          success: false,
          error: validation.error || 'Invalid input parameters',
        };
      }

      // Call Python prediction script
      const result = await this.callPythonPredictor(input);
      return result;
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get crop recommendation',
      };
    }
  }

  private static validateInput(input: CropRecommendationInput): { valid: boolean; error?: string } {
    if (input.N < 0 || input.N > 150) {
      return { valid: false, error: 'Nitrogen (N) must be between 0 and 150' };
    }
    if (input.P < 0 || input.P > 150) {
      return { valid: false, error: 'Phosphorus (P) must be between 0 and 150' };
    }
    if (input.K < 0 || input.K > 150) {
      return { valid: false, error: 'Potassium (K) must be between 0 and 150' };
    }
    if (input.temperature < 0 || input.temperature > 50) {
      return { valid: false, error: 'Temperature must be between 0 and 50°C' };
    }
    if (input.humidity < 0 || input.humidity > 100) {
      return { valid: false, error: 'Humidity must be between 0 and 100%' };
    }
    if (input.ph < 0 || input.ph > 14) {
      return { valid: false, error: 'pH must be between 0 and 14' };
    }
    if (input.rainfall < 0 || input.rainfall > 500) {
      return { valid: false, error: 'Rainfall must be between 0 and 500 mm' };
    }
    return { valid: true };
  }

  private static async callPythonPredictor(input: CropRecommendationInput): Promise<CropRecommendationResult> {
    return new Promise((resolve, reject) => {
      const pythonScript = spawn('python', [this.predictScriptPath]);

      let stdout = '';
      let stderr = '';

      pythonScript.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      pythonScript.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      pythonScript.on('close', (code) => {
        if (code !== 0) {
          resolve({
            success: false,
            error: stderr || `Python script exited with code ${code}`,
          });
          return;
        }

        try {
          const result = JSON.parse(stdout);
          resolve(result);
        } catch (error) {
          resolve({
            success: false,
            error: `Failed to parse prediction result: ${stdout}`,
          });
        }
      });

      pythonScript.on('error', (error) => {
        resolve({
          success: false,
          error: `Failed to start Python process: ${error.message}. Make sure Python is installed and accessible.`,
        });
      });

      // Send input to Python script
      const inputJson = JSON.stringify(input);
      pythonScript.stdin.write(inputJson);
      pythonScript.stdin.end();
    });
  }

  static async getModelInfo(): Promise<any> {
    try {
      const modelInfoPath = path.join(__dirname, '../../ml/model_info.json');
      if (!fs.existsSync(modelInfoPath)) {
        return null;
      }
      const modelInfo = JSON.parse(fs.readFileSync(modelInfoPath, 'utf-8'));
      return modelInfo;
    } catch (error) {
      return null;
    }
  }
}
