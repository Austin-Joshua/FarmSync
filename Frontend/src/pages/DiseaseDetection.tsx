import React, { useState, useRef } from 'react';
import { 
  Upload, Image as ImageIcon, CheckCircle, AlertTriangle, 
  Loader2, RefreshCw, ChevronRight, ShieldCheck, Zap
} from 'lucide-react';
import ApiService from '../services/api';
import toast from 'react-hot-toast';

interface DetectionResult {
  disease: string;
  confidence: number;
  solution: string;
  filename: string;
}

const DiseaseDetection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DetectionResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB');
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    try {
      const response = await ApiService.detectDisease(selectedFile);
      setResult(response as unknown as DetectionResult);
      toast.success('Analysis complete!');
    } catch (error) {
      console.error('Detection failed:', error);
      toast.error('AI Analysis failed. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">
            AI Crop <span className="text-primary-600">Health Scanner</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Upload a photo of your crop to detect diseases with 99% precision.
          </p>
        </div>
        <div className="flex items-center gap-4 px-6 py-3 bg-primary-100 dark:bg-primary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800/30">
          <Zap className="text-primary-600 animate-pulse" size={20} />
          <span className="text-sm font-black uppercase tracking-widest text-primary-700 dark:text-primary-400">
            Powered by FarmSync ML v4.2
          </span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Upload Column */}
        <div className="space-y-6">
          <div 
            onClick={() => !isAnalyzing && fileInputRef.current?.click()}
            className={`
              relative aspect-square md:aspect-video rounded-[2.5rem] border-4 border-dashed transition-all duration-500 cursor-pointer overflow-hidden
              ${previewUrl ? 'border-primary-500 bg-gray-900' : 'border-gray-200 dark:border-gray-800 hover:border-primary-400 hover:bg-gray-50 dark:hover:bg-white/5'}
            `}
          >
            {previewUrl ? (
              <>
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-80" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                  <div className="flex items-center gap-3 text-white">
                    <ImageIcon size={24} />
                    <span className="font-bold text-lg">{selectedFile?.name}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center space-y-4">
                <div className="w-20 h-20 rounded-3xl bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center text-primary-600">
                  <Upload size={32} />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-black uppercase tracking-tighter">Click to upload photo</p>
                  <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Supports JPG, PNG (Max 5MB)</p>
                </div>
              </div>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="flex gap-4">
            {previewUrl && !result && (
              <button
                onClick={handleUpload}
                disabled={isAnalyzing}
                className="flex-1 bg-primary-600 hover:bg-primary-500 disabled:bg-gray-400 text-white py-5 rounded-2xl text-lg font-black uppercase italic tracking-tighter shadow-2xl shadow-primary-500/20 transition-all active:scale-95 flex items-center justify-center gap-3"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={24} />
                    Analyzing Field Data...
                  </>
                ) : (
                  <>
                    <Zap size={24} />
                    Run AI Analysis
                  </>
                )}
              </button>
            )}
            {previewUrl && (
              <button
                onClick={reset}
                className="p-5 rounded-2xl border-2 border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
              >
                <RefreshCw size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Results Column */}
        <div className="space-y-6">
          {!result && !isAnalyzing && (
            <div className="glass-card p-10 flex flex-col items-center justify-center text-center space-y-6 opacity-60 grayscale hover:grayscale-0 transition-all">
              <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-gray-400">
                <Zap size={48} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-black uppercase tracking-tighter">Ready for Scan</h3>
                <p className="text-sm font-bold text-gray-400 uppercase tracking-widest max-w-[200px]">Results will appear here after analysis</p>
              </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="glass-card p-10 border border-primary-500/30 space-y-10">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary-500">Neural Network Status</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Active</span>
                </div>
                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 animate-analysis-progress" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-20 rounded-2xl bg-gray-50 dark:bg-white/5 animate-pulse" />
                ))}
              </div>
            </div>
          )}

          {result && (
            <div className="glass-card overflow-hidden shadow-xl animate-in zoom-in-95 duration-500">
              <div className={`p-8 ${result.disease === 'Healthy' ? 'bg-emerald-500' : 'bg-amber-500'} text-white`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-white/20 rounded-2xl">
                    {result.disease === 'Healthy' ? <CheckCircle size={32} /> : <AlertTriangle size={32} />}
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Confidence</p>
                    <p className="text-4xl font-black tracking-tighter">{(result.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80 mb-1">Diagnosis</p>
                  <h2 className="text-4xl font-black uppercase italic tracking-tighter">{result.disease}</h2>
                </div>
              </div>

              <div className="p-8 space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary-500">
                    <ShieldCheck size={14} />
                    Recommended Treatment
                  </div>
                  <p className="text-lg font-bold text-gray-700 dark:text-gray-300 leading-relaxed">
                    {result.solution}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-100 dark:border-white/5">
                  <button className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                    Search Registry <ChevronRight size={14} />
                  </button>
                  <button className="flex items-center justify-center gap-2 p-4 rounded-xl bg-gray-50 dark:bg-white/5 font-black uppercase tracking-widest text-[10px] hover:bg-gray-100 dark:hover:bg-white/10 transition-all">
                    Consult Expert <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes analysis-progress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
        .animate-analysis-progress {
          animation: analysis-progress 1.5s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default DiseaseDetection;
