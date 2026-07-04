import { useState } from 'react';
import { Sprout, Zap, ChevronRight, Info, BarChart2, Leaf, Droplets, Thermometer, CloudRain } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

interface Recommendation {
  crop: string;
  confidence: number;
  confidence_percent: number;
  advice: string;
}

interface RecommendResult {
  recommended_crop: string;
  confidence: number;
  confidence_percent: number;
  recommendations: Recommendation[];
  advice: string;
  model_accuracy: number;
  cv_accuracy: number;
  quantum_active?: boolean;
  classical_confidence_percent?: number;
}

const CROP_EMOJIS: Record<string, string> = {
  rice: '🌾', wheat: '🌿', maize: '🌽', chickpea: '🫘', kidneybeans: '🫘',
  pigeonpeas: '🟤', mothbeans: '🫘', mungbean: '🫘', blackgram: '⚫',
  lentil: '🟤', pomegranate: '🍎', banana: '🍌', mango: '🥭', grapes: '🍇',
  watermelon: '🍉', muskmelon: '🍈', apple: '🍎', orange: '🍊', papaya: '🍈',
  coconut: '🥥', cotton: '🤍', sugarcane: '🎋', coffee: '☕', jute: '🌿',
};

const FIELD_CONFIGS = [
  { key: 'N', label: 'Nitrogen (N)', unit: 'kg/ha', min: 0, max: 200, step: 1, icon: '🧪', color: 'blue', hint: 'Soil nitrogen content' },
  { key: 'P', label: 'Phosphorus (P)', unit: 'kg/ha', min: 0, max: 150, step: 1, icon: '🔵', color: 'indigo', hint: 'Soil phosphorus level' },
  { key: 'K', label: 'Potassium (K)', unit: 'kg/ha', min: 0, max: 250, step: 1, icon: '🟣', color: 'purple', hint: 'Soil potassium content' },
  { key: 'temperature', label: 'Temperature', unit: '°C', min: 0, max: 50, step: 0.1, icon: '🌡️', color: 'orange', hint: 'Average temperature' },
  { key: 'humidity', label: 'Humidity', unit: '%', min: 0, max: 100, step: 1, icon: '💧', color: 'cyan', hint: 'Relative humidity' },
  { key: 'ph', label: 'Soil pH', unit: '', min: 0, max: 14, step: 0.1, icon: '⚗️', color: 'green', hint: 'Soil pH level (6-7 ideal)' },
  { key: 'rainfall', label: 'Rainfall', unit: 'mm', min: 0, max: 500, step: 1, icon: '🌧️', color: 'sky', hint: 'Annual rainfall' },
];

const DEFAULT_VALUES = {
  N: 90, P: 42, K: 43, temperature: 20.9, humidity: 82.0, ph: 6.5, rainfall: 202.9
};

export default function CropRecommendation() {
  const [values, setValues] = useState<Record<string, number>>(DEFAULT_VALUES);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecommendResult | null>(null);

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: parseFloat(val) || 0 }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const response = await (api as any).recommendCrop(values);
      const data = response.data;
      if (data.success) {
        setResult(data);
        toast.success(`Best crop: ${data.recommended_crop.toUpperCase()} (${data.confidence_percent.toFixed(1)}% confidence)`);
      } else {
        toast.error(data.error || 'Recommendation failed');
      }
    } catch (err: any) {
      toast.error('ML service unavailable. Please ensure the ML server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setValues(DEFAULT_VALUES);
    setResult(null);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sprout size={22} className="text-white" />
            </div>
            AI Crop Advisor
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Enter your soil & climate parameters — our <span className="font-bold text-primary-600">96.5% accurate</span> Random Forest model recommends the optimal crop
          </p>
        </div>
        {result && (
          <div className="text-right hidden md:block">
            <div className="text-xs text-gray-400 mb-1">Model Accuracy</div>
            <div className="text-2xl font-black text-green-600">{result.model_accuracy?.toFixed(1)}%</div>
            <div className="text-xs text-gray-400">CV: {result.cv_accuracy?.toFixed(1)}%</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Input Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-card p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <BarChart2 size={20} className="text-primary-500" />
              Soil & Climate Parameters
            </h2>

            {FIELD_CONFIGS.map(field => (
              <div key={field.key}>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  <span className="mr-1">{field.icon}</span> {field.label}
                  {field.unit && <span className="text-gray-400 font-normal ml-1">({field.unit})</span>}
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="range"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={values[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="flex-1 accent-green-600"
                  />
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    step={field.step}
                    value={values[field.key]}
                    onChange={(e) => handleChange(field.key, e.target.value)}
                    className="w-20 px-2 py-1 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-center font-mono"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{field.hint}</p>
              </div>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-500 text-white font-bold py-3 px-4 rounded-xl hover:from-green-500 hover:to-emerald-400 transition-all shadow-lg shadow-green-500/25 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Zap size={18} />
                )}
                {loading ? 'Analyzing...' : 'Recommend Crop'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all font-medium"
              >
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-3 space-y-4">
          {!result && !loading && (
            <div className="glass-card p-10 text-center h-full flex flex-col items-center justify-center gap-4">
              <div className="w-20 h-20 bg-green-50 dark:bg-green-900/20 rounded-3xl flex items-center justify-center">
                <Leaf size={40} className="text-green-500" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Ready to Analyze</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm max-w-sm">
                  Adjust the soil and climate sliders on the left, then click "Recommend Crop" to get AI-powered recommendations.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 w-full mt-2">
                {[
                  { icon: <Droplets size={16} />, label: '7 Parameters', sub: 'N, P, K, pH, Humidity, Temp, Rain' },
                  { icon: <Zap size={16} />, label: '26 Crops', sub: 'Rice, Wheat, Cotton, Fruits...' },
                  { icon: <BarChart2 size={16} />, label: '96.5% Accuracy', sub: '6,000+ training samples' },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center">
                    <div className="text-primary-500 flex justify-center mb-1">{item.icon}</div>
                    <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{item.label}</p>
                    <p className="text-[10px] text-gray-400">{item.sub}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {loading && (
            <div className="glass-card p-10 text-center flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-600 dark:text-gray-400 font-medium">Analyzing soil parameters with Random Forest model...</p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Primary Recommendation */}
              <div className="glass-card p-6 border-2 border-green-500/30 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full -translate-y-8 translate-x-8" />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-xs font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-2 py-1 rounded-full uppercase tracking-wider">Top Recommendation</span>
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white mt-2 capitalize">
                      {CROP_EMOJIS[result.recommended_crop] || '🌱'} {result.recommended_crop}
                    </h2>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-black text-green-600">{result.confidence_percent.toFixed(1)}%</div>
                    <div className="text-xs text-gray-400">confidence</div>
                  </div>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-green-500 to-emerald-400 h-3 rounded-full transition-all duration-1000"
                    style={{ width: `${result.confidence_percent}%` }}
                  />
                </div>
                <div className="flex items-start gap-2 bg-green-50 dark:bg-green-900/20 rounded-xl p-3">
                  <Info size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-green-800 dark:text-green-300">{result.advice}</p>
                </div>
              </div>

              {/* Quantum Decision Intelligence Layer Card */}
              {result.quantum_active && (
                <div className="glass-card p-6 bg-gradient-to-br from-gray-900 to-indigo-950 text-white relative overflow-hidden border border-indigo-500/20 shadow-xl">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-xl -translate-y-4 translate-x-4" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-black text-indigo-300 bg-indigo-500/25 px-2 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                      QML VQC Optimizer Active
                    </span>
                    <span className="text-xs text-indigo-400 font-bold">4 Qubits (Angle Encoded)</span>
                  </div>
                  <h3 className="text-lg font-black flex items-center gap-2 mb-3">
                    ⚛️ Quantum Refined Decisions
                  </h3>
                  <div className="grid grid-cols-2 gap-3 bg-black/40 p-3.5 rounded-xl border border-indigo-500/10 mb-3">
                    <div>
                      <p className="text-[10px] text-indigo-300 uppercase font-black">Classical RF Probability</p>
                      <p className="text-lg font-black text-gray-300 mt-0.5">{result.classical_confidence_percent?.toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-green-300 uppercase font-black">Hybrid QML Probability</p>
                      <p className="text-lg font-black text-green-400 mt-0.5">{result.confidence_percent.toFixed(1)}%</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-indigo-200/80 leading-relaxed">
                    Continuous values mapped via a <strong>Z-Feature Map</strong> and run using a parameterized <strong>RealAmplitudes variational ansatz</strong> on simulated local quantum backends.
                  </p>
                </div>
              )}

              {/* Top 3 Recommendations */}
              <div className="glass-card p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <ChevronRight size={20} className="text-primary-500" />
                  All Recommendations
                </h3>
                <div className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <div key={rec.crop} className={`p-4 rounded-xl border transition-all ${i === 0 ? 'border-green-500/30 bg-green-50/50 dark:bg-green-900/10' : 'border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{CROP_EMOJIS[rec.crop] || '🌱'}</span>
                          <div>
                            <span className="font-bold text-gray-900 dark:text-white capitalize">{rec.crop}</span>
                            {i === 0 && <span className="ml-2 text-xs bg-green-500 text-white px-1.5 py-0.5 rounded-full">Best</span>}
                            {i === 1 && <span className="ml-2 text-xs bg-blue-500 text-white px-1.5 py-0.5 rounded-full">2nd</span>}
                            {i === 2 && <span className="ml-2 text-xs bg-gray-400 text-white px-1.5 py-0.5 rounded-full">3rd</span>}
                          </div>
                        </div>
                        <span className={`font-black text-lg ${i === 0 ? 'text-green-600' : 'text-gray-600 dark:text-gray-300'}`}>
                          {rec.confidence_percent.toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-1000 ${i === 0 ? 'bg-green-500' : i === 1 ? 'bg-blue-500' : 'bg-gray-400'}`}
                          style={{ width: `${rec.confidence_percent}%` }}
                        />
                      </div>
                      {i === 0 && rec.advice && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{rec.advice}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Input Summary */}
              <div className="glass-card p-4">
                <h4 className="text-sm font-bold text-gray-600 dark:text-gray-400 mb-3 uppercase tracking-wider">Input Parameters Used</h4>
                <div className="grid grid-cols-4 gap-2">
                  {FIELD_CONFIGS.map(f => (
                    <div key={f.key} className="text-center bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2">
                      <div className="text-lg">{f.icon}</div>
                      <div className="text-xs text-gray-400">{f.key}</div>
                      <div className="text-sm font-bold text-gray-700 dark:text-gray-300">{values[f.key]}{f.unit === '°C' ? '°' : f.unit === '%' ? '%' : ''}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Kaggle Dataset Info */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Thermometer size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-800 dark:text-blue-300">To Improve Accuracy Above 98%</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      Download the <strong>Crop Recommendation Dataset</strong> from Kaggle (2200 rows, 22 crops) and place it in{' '}
                      <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">Backend/MLService/Dataset/Crop_recommendation_full.csv</code>.
                      Then run <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">python train_model.py</code>.
                    </p>
                    <a
                      href="https://www.kaggle.com/datasets/atharvaingle/crop-recommendation-dataset"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs text-blue-700 dark:text-blue-300 font-bold hover:underline"
                    >
                      <CloudRain size={12} />
                      Open Kaggle Dataset →
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
