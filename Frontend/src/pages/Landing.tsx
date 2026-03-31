import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { Leaf, ArrowRight, Sprout, TrendingUp, ShieldCheck, Sun, Moon } from 'lucide-react';
import { useThemeStore } from '../context/useThemeStore';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <div className={`min-h-screen font-sans selection:bg-primary-200 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a]' : 'bg-[#f8fafc]'}`}>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-md px-6 py-4 flex items-center justify-between border-b transition-colors duration-500 ${theme === 'dark' ? 'bg-[#0f172a]/90 border-gray-800' : 'bg-[#f8fafc]/90 border-gray-100'}`}>
        <div className="flex items-center">
          <Logo size="default" variant={theme === 'dark' ? 'dark' : 'light'} />
        </div>
        
        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-gray-800 dark:text-gray-200">
          <a href="#features" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Features</a>
          <a href="#solutions" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Solutions</a>
          <a href="#pricing" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Pricing</a>
          <a href="#about" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">Learn</a>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="hidden sm:block">
            <LanguageSwitcher />
          </div>
          <button 
            onClick={toggleTheme}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100/50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-300 hover:scale-110 transition-transform"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          
          <Link to="/login" className="hidden sm:block text-sm font-bold text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
             Log in
          </Link>
          <button 
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-5 py-2.5 rounded-full text-sm font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-105 active:scale-95 shadow-sm"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16 min-h-[90vh]">
        {/* Left Side: Typography */}
        <div className="lg:w-1/2 flex flex-col items-start text-left space-y-6 animate-fade-in-up">
          <div className="flex items-center gap-2 text-sm font-extrabold tracking-widest text-gray-500 dark:text-gray-400 uppercase">
            <Leaf size={16} />
            <span>FarmSync Management</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-[1.1] tracking-tight">
            Easy, intelligent,<br />
            <span className="text-gray-900 dark:text-gray-300">and deeply accurate</span><br />
            farm management
          </h1>
          
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-lg font-medium leading-relaxed">
            The hassle-free, worry-free, and actually intelligent agriculture platform designed for modern farmers.
          </p>
          
          <button 
            onClick={() => navigate('/register')}
            className="mt-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl shadow-gray-900/10 dark:shadow-none flex items-center gap-2 group"
          >
            Get started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Right Side: Mockup / Visual */}
        <div className="lg:w-1/2 relative flex justify-center w-full animate-fade-in delay-200">
          {/* Decorative background circle */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary-100 rounded-full blur-[80px] opacity-60"></div>
          
          {/* Floating UI Card Mockup */}
          <div className="relative bg-white dark:bg-slate-800 p-8 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-md transform rotate-2 hover:rotate-0 transition-transform duration-500 hover:shadow-primary-900/5 dark:hover:shadow-primary-400/5">
            <div className="absolute -top-8 -right-8 bg-blue-500 text-white p-4 rounded-2xl shadow-lg transform rotate-12 bounce-slow">
              <ShieldCheck size={32} />
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-primary-100 dark:bg-primary-900/30 p-4 rounded-2xl text-primary-600 dark:text-primary-400">
                  <TrendingUp size={32} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Crop Yield Predictor</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Wheat (Premium)</h3>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100 dark:border-gray-700">
                <p className="text-5xl font-extrabold text-[#111827] dark:text-white tracking-tight">
                  2,893 <span className="text-lg text-gray-500 dark:text-gray-400 tracking-normal font-semibold">kg</span>
                </p>
                <div className="flex items-center gap-2 mt-2 font-bold text-sm">
                  <span className="text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-md tracking-wider">+1,200 vs last season</span>
                </div>
              </div>

              {/* Skeleton lines for UI aesthetic */}
              <div className="space-y-3 pt-4">
                <div className="h-2 w-3/4 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                <div className="h-2 w-1/2 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
                <div className="h-2 w-5/6 bg-gray-100 dark:bg-gray-700 rounded-full"></div>
              </div>
            </div>
            
            <div className="absolute -bottom-6 -left-6 bg-amber-400 text-yellow-900 p-4 rounded-2xl shadow-lg transform -rotate-6 animate-pulse">
              <Sprout size={32} />
            </div>
          </div>
        </div>
      </main>

      {/* Global simple animations to add to index.css if not there, or inline here */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0) rotate(12deg); }
          50% { transform: translateY(-10px) rotate(12deg); }
        }
        .bounce-slow {
          animation: bounce-slow 4s ease-in-out infinite;
        }
      `}} />
    </div>
  );
};

export default Landing;
