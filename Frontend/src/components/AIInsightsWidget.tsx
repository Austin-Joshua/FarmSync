import { useState, useEffect } from 'react';
import { Sprout, TrendingUp, Bug, AlertTriangle } from 'lucide-react';
import api from '../services/api';
import { getCropIcon } from '../utils/cropIcons';

export default function AIInsightsWidget() {
  const [loading, setLoading] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [yieldPrediction, setYieldPrediction] = useState<any>(null);
  const [pestRisk, setPestRisk] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMLData = async () => {
      setLoading(true);
      try {
        // Mock environmental data representative of average farm conditions
        const soilData = { N: 90, P: 42, K: 43, temperature: 25.5, humidity: 70.0, ph: 6.5, rainfall: 150.0 };
        const yieldData = { state: 'Maharashtra', district: 'Pune', season: 'Kharif', crop: 'rice', area: 5 };
        const pestData = { temperature: 25.5, humidity: 70.0, rainfall: 150.0, crop: 'rice' };

        const [cropRes, yieldRes, pestRes] = await Promise.allSettled([
          api.recommendCrop(soilData),
          api.predictYield(yieldData),
          api.predictPest(pestData)
        ]);

        if (cropRes.status === 'fulfilled') setRecommendation(cropRes.value.data);
        if (yieldRes.status === 'fulfilled') setYieldPrediction(yieldRes.value.data);
        if (pestRes.status === 'fulfilled') setPestRisk(pestRes.value.data);

      } catch (err: any) {
        console.error('Failed to fetch AI insights:', err);
        setError('Failed to connect to ML models.');
      } finally {
        setLoading(false);
      }
    };

    fetchMLData();
  }, []);

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Sprout size={24} className="text-primary-600" /> AI Insights Loading...
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6 mb-6 border-l-4 border-primary-500">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <div className="p-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
            <Sprout size={20} className="text-primary-600 dark:text-primary-400" />
          </div>
          AI Farm Insights
        </h2>
        {error && <span className="text-xs text-red-500 flex items-center gap-1"><AlertTriangle size={12}/> ML Service Offline</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Crop Recommendation */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sprout size={18} className="text-green-600 dark:text-green-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Crop Advisory</h3>
            </div>
            {recommendation?.recommended_crop ? (
              <>
                <p className="text-2xl font-black text-green-700 dark:text-green-400 capitalize flex items-center gap-2">
                  <span className="text-3xl">{getCropIcon(recommendation.recommended_crop)}</span>
                  {recommendation.recommended_crop}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-2">
                  {recommendation.advice || `Recommended for current soil conditions with ${recommendation.confidence_percent?.toFixed(1)}% confidence.`}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">No advisory available.</p>
            )}
          </div>
        </div>

        {/* Yield Prediction */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex flex-col justify-between hover:shadow-md transition-all">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Yield Projection (Rice)</h3>
            </div>
            {yieldPrediction?.success ? (
              <>
                <p className="text-2xl font-black text-blue-700 dark:text-blue-400">
                  {yieldPrediction.predicted_yield.toLocaleString()} <span className="text-sm font-medium">kg total</span>
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  Expected yield for 5 acres in Kharif season based on historical ML data.
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">Prediction unavailable.</p>
            )}
          </div>
        </div>

        {/* Pest Risk */}
        <div className={`bg-gradient-to-br ${pestRisk?.risk_level === 'High' ? 'from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 border-red-200 dark:border-red-800' : 'from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800'} rounded-xl p-4 flex flex-col justify-between border hover:shadow-md transition-all`}>
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bug size={18} className={pestRisk?.risk_level === 'High' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-400'} />
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Pest Risk (Rice)</h3>
            </div>
            {pestRisk?.success ? (
              <>
                <p className={`text-xl font-bold capitalize ${pestRisk?.risk_level === 'High' ? 'text-red-700 dark:text-red-400' : 'text-yellow-700 dark:text-yellow-400'}`}>
                  {pestRisk.predicted_pest}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${pestRisk?.risk_level === 'High' ? 'bg-red-200 text-red-800 dark:bg-red-900/50 dark:text-red-300' : 'bg-yellow-200 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                    {pestRisk.risk_level} Risk
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                    {(pestRisk.confidence * 100).toFixed(1)}% prob.
                  </span>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 line-clamp-1">
                  {pestRisk.recommendation}
                </p>
              </>
            ) : (
              <p className="text-sm text-gray-500 italic">No recent alerts.</p>
            )}
        </div>
      </div>

      {/* Quantum Resource Optimization Panel */}
      {yieldPrediction?.quantum_resource_optimization && (
        <div className="mt-6 p-5 bg-gradient-to-br from-gray-950 to-indigo-950 text-white rounded-xl border border-indigo-500/20 relative overflow-hidden shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -translate-y-6 translate-x-6" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-[9px] font-black text-indigo-300 bg-indigo-500/20 px-2.5 py-1 rounded-full uppercase tracking-widest flex items-center gap-1.5 w-fit">
                <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-ping" />
                Quantum Decision Layer Active
              </span>
              <h3 className="text-base font-black mt-2 flex items-center gap-2 text-indigo-100">
                ⚛️ Hybrid QAOA Resource Optimizer
              </h3>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-xs text-indigo-400 font-bold block">Engine Parameters</span>
              <span className="text-[11px] text-indigo-200">3 Qubits • 2,048 Shots • QUBO Minimized</span>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-black/40 p-4 rounded-xl border border-indigo-500/10">
            <div>
              <span className="text-[10px] text-indigo-400 uppercase font-black tracking-wider">Optimal Fertilizer</span>
              <p className="text-sm font-bold text-gray-200 mt-1">{yieldPrediction.quantum_resource_optimization.optimal_fertilizer_strategy}</p>
            </div>
            <div>
              <span className="text-[10px] text-indigo-400 uppercase font-black tracking-wider">Optimal Water</span>
              <p className="text-sm font-bold text-gray-200 mt-1">{yieldPrediction.quantum_resource_optimization.optimal_water_strategy}</p>
            </div>
            <div>
              <span className="text-[10px] text-indigo-400 uppercase font-black tracking-wider">Optimal Pesticide</span>
              <p className="text-sm font-bold text-gray-200 mt-1">{yieldPrediction.quantum_resource_optimization.optimal_pesticide_strategy}</p>
            </div>
            <div>
              <span className="text-[10px] text-green-400 uppercase font-black tracking-wider">Projected Savings</span>
              <p className="text-base font-black text-green-400 mt-0.5">
                ₹{yieldPrediction.quantum_resource_optimization.estimated_resource_savings_rupees.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="text-[10px] text-indigo-300/80 mt-3.5 leading-relaxed">
            Agricultural decision variables are mapped as spin states of an Ising Hamiltonian. Minimum energy states are solved using a simulated <strong>Quantum Approximate Optimization Algorithm (QAOA)</strong> to maximize total yield while minimizing waste.
          </p>
        </div>
      )}
    </div>
  );
}
