import React, { useState } from 'react';
import { Bug, Droplets, ThermometerSun, CloudRain, AlertTriangle, CheckCircle2 } from 'lucide-react';
import ApiService from '../services/api';

const PestPrediction: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ risk: string; message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    temperature: '',
    humidity: '',
    rainfall: '',
    crop: 'Wheat'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = {
        temperature: parseFloat(formData.temperature),
        humidity: parseFloat(formData.humidity),
        rainfall: parseFloat(formData.rainfall),
        crop: formData.crop
      };

      const response = await ApiService.predictPest(data);
      const riskLevel = response.data?.pest_risk || 'Unknown';
      
      let message = '';
      if (riskLevel === 'High') {
        message = 'High risk of pest outbreak! Immediate preventive measures recommended.';
      } else if (riskLevel === 'Medium') {
        message = 'Moderate risk detected. Monitor crops closely over the next few days.';
      } else {
        message = 'Low risk. Continue with standard farming practices.';
      }

      setResult({ risk: riskLevel, message });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to predict pest risk. Ensure ML service is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
            <Bug className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Pest Outbreak Predictor</h1>
            <p className="text-red-100 mt-1">AI-powered risk analysis based on weather and crop data</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <ThermometerSun className="w-5 h-5 text-orange-500" />
            Environmental Data
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Crop Type
              </label>
              <select
                name="crop"
                value={formData.crop}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900 dark:text-white"
              >
                <option value="Wheat">Wheat</option>
                <option value="Rice">Rice</option>
                <option value="Corn">Corn</option>
                <option value="Cotton">Cotton</option>
                <option value="Sugarcane">Sugarcane</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <ThermometerSun className="w-4 h-4 text-orange-500" />
                Temperature (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="temperature"
                value={formData.temperature}
                onChange={handleChange}
                required
                placeholder="e.g., 28.5"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-blue-500" />
                Humidity (%)
              </label>
              <input
                type="number"
                step="0.1"
                name="humidity"
                value={formData.humidity}
                onChange={handleChange}
                required
                placeholder="e.g., 65.0"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-2">
                <CloudRain className="w-4 h-4 text-blue-400" />
                Rainfall (mm)
              </label>
              <input
                type="number"
                step="0.1"
                name="rainfall"
                value={formData.rainfall}
                onChange={handleChange}
                required
                placeholder="e.g., 20.0"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors text-gray-900 dark:text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-colors shadow-sm disabled:opacity-50 mt-6"
            >
              {loading ? 'Analyzing Risk...' : 'Analyze Pest Risk'}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col justify-center">
          {error ? (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800">
              <AlertTriangle className="w-6 h-6 mb-2" />
              <p className="font-medium">Analysis Failed</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          ) : result ? (
            <div className="text-center space-y-4">
              <div className={`mx-auto w-24 h-24 rounded-full flex items-center justify-center ${
                result.risk === 'High' ? 'bg-red-100 text-red-600' :
                result.risk === 'Medium' ? 'bg-orange-100 text-orange-600' :
                'bg-green-100 text-green-600'
              }`}>
                {result.risk === 'Low' ? <CheckCircle2 className="w-12 h-12" /> : <AlertTriangle className="w-12 h-12" />}
              </div>
              
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.risk} Risk Level
                </h3>
                <p className={`mt-2 font-medium ${
                  result.risk === 'High' ? 'text-red-600 dark:text-red-400' :
                  result.risk === 'Medium' ? 'text-orange-600 dark:text-orange-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {result.message}
                </p>
              </div>
              
              {result.risk !== 'Low' && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl text-left">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Recommended Actions:</h4>
                  <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <li>Inspect crops visually for early signs of damage.</li>
                    <li>Prepare organic or chemical countermeasures.</li>
                    <li>Adjust irrigation schedules to reduce surface humidity if possible.</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Bug className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Enter field data and run the analysis to see AI pest predictions here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PestPrediction;
