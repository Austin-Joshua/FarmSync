import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  ArrowRight, TrendingUp, Sun, Moon, 
  Calendar, PieChart, Zap, Database, Check, PlayCircle
} from 'lucide-react';
import { useThemeStore } from '../context/useThemeStore';
import LanguageSwitcher from '../components/LanguageSwitcher';

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useThemeStore();

  const features = [
    {
      icon: <Database className="text-emerald-500" />,
      title: "Smart Inventory",
      description: "Real-time tracking of seeds, fertilizers, and tools. Never run out of essentials during peak season."
    },
    {
      icon: <TrendingUp className="text-blue-500" />,
      title: "Yield Prediction",
      description: "AI-driven models that forecast your harvest based on soil history and local weather patterns."
    },
    {
      icon: <Calendar className="text-amber-500" />,
      title: "Crop Calendar",
      description: "Automated schedules for sowing, irrigation, and harvesting tailored to your specific region."
    },
    {
      icon: <PieChart className="text-purple-500" />,
      title: "Financial Insights",
      description: "Detailed expense management and profit analysis to maximize your farm's ROI."
    }
  ];

  const steps = [
    { title: "Connect", description: "Register your farm and add your field coordinates." },
    { title: "Analyze", description: "Our AI processes your soil and history data." },
    { title: "Succeed", description: "Receive daily insights to optimize your output." }
  ];

  const plans = [
    {
      name: "Starter",
      price: "Free",
      features: ["Up to 5 Hectares", "Basic Yield Tracker", "Community Support", "Weather Alerts"],
      button: "Start Now",
      highlight: false
    },
    {
      name: "Pro Farmer",
      price: "₹499",
      period: "/month",
      features: ["Unlimited Hectares", "AI Disease Detection", "Export PDF Reports", "Priority Expert Advice"],
      button: "Get Pro",
      highlight: true
    },
    {
      name: "Estate",
      price: "Custom",
      features: ["Enterprise Fleet Sync", "Sub-meter Precision", "Dedicated Account Manager", "API Access"],
      button: "Contact Sales",
      highlight: false
    }
  ];

  const academyLessons = [
    { title: "Precision Soil Health", duration: "12 min", type: "Video Guide" },
    { title: "Scaling Vertical Harvest", duration: "8 min", type: "Visual Map" },
    { title: "Pest Prevention AI", duration: "15 min", type: "Interactive" }
  ];

  return (
    <div id="top" className={`min-h-screen font-sans selection:bg-primary-200 ${theme === 'dark' ? 'bg-[#0d1510] text-gray-100' : 'bg-[#f8fafc] text-gray-900'}`}>
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b ${theme === 'dark' ? 'bg-[#0d1510]/80 border-white/5' : 'bg-white/80 border-gray-100'}`}>
        <div className="flex items-center">
          <Logo size="default" variant={theme === 'dark' ? 'dark' : 'light'} />
        </div>
        
        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-10 text-[13px] font-extrabold uppercase tracking-widest">
          <a href="#features" className="hover:text-primary-500 transition-colors">Features</a>
          <a href="#membership" className="hover:text-primary-500 transition-colors">Membership</a>
          <a href="#academy" className="hover:text-primary-500 transition-colors">Academy</a>
          <a href="#how-it-works" className="hover:text-primary-500 transition-colors">How it works</a>
        </div>

        {/* Right CTA */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <LanguageSwitcher />
            <div className="w-px h-4 bg-gray-300 dark:bg-white/20 mx-2" />
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>
          
          <Link to="/login" className="hidden sm:block text-sm font-bold hover:text-primary-500 transition-colors">
             Log in
          </Link>
          <button 
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-[#0d1510] px-6 py-2.5 rounded-full text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary-500/10"
          >
            Get started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-20">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="lg:w-1/2 flex flex-col items-start space-y-8 animate-fade-in-up">
          <div className="flex items-center gap-3 px-4 py-2 bg-primary-100 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 rounded-full text-xs font-black uppercase tracking-[0.2em]">
            <Zap size={14} className="animate-bounce" />
            <span>AI-Driven Agriculture</span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl font-black leading-[1] tracking-tighter italic uppercase">
            Smarter Fields,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-emerald-500">Greater Yield</span><br />
            Better Future.
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg font-bold leading-relaxed">
            Revolutionize your farm management with deeply accurate insights, automatic tracking, and precision agriculture tools designed for the modern farmer.
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-primary-600 hover:bg-primary-500 text-white px-10 py-5 rounded-full text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 shadow-2xl shadow-primary-500/40 hover:scale-105 transition-all group"
            >
              Start Free Trial
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <a href="#features" className="px-10 py-5 rounded-full text-lg font-black uppercase tracking-tighter border-2 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">
              See Features
            </a>
          </div>
        </div>

        <div className="lg:w-1/2 relative w-full group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="relative bg-white dark:bg-white/5 p-1 backdrop-blur-2xl rounded-[3rem] border border-white/20 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none overflow-hidden transform hover:rotate-1 transition-all duration-700">
             <div className="bg-gray-50 dark:bg-[#0d1510]/80 p-8 rounded-[2.8rem]">
                <div className="flex justify-between items-start mb-10">
                   <div className="bg-primary-100 dark:bg-primary-500/20 p-4 rounded-3xl">
                      <TrendingUp size={32} className="text-primary-600 dark:text-primary-400" />
                   </div>
                   <div className="flex -space-x-4">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-white dark:border-[#0d1510] bg-gray-200 dark:bg-white/10 overflow-hidden shadow-xl" />
                      ))}
                      <div className="w-12 h-12 rounded-full border-4 border-white dark:border-[#0d1510] bg-primary-500 flex items-center justify-center text-xs font-black text-white shadow-xl">+12</div>
                   </div>
                </div>
                <div className="space-y-2 mb-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">Real-time Analytics</p>
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter">Harvest Forecast</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-6 bg-white dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                      <p className="text-sm font-bold text-gray-500 dark:text-white/40 mb-1">Efficiency</p>
                      <p className="text-3xl font-black text-emerald-500 tracking-tighter">94.2%</p>
                   </div>
                   <div className="p-6 bg-white dark:bg-white/5 rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                      <p className="text-sm font-bold text-gray-500 dark:text-white/40 mb-1">Health Index</p>
                      <p className="text-3xl font-black text-primary-500 tracking-tighter">A-Grade</p>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-primary-500 mb-2">Core Ecosystem</h2>
          <h3 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter">Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-primary-500">scale.</span></h3>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="group p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-primary-500/50 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500">
               <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary-500/10 transition-all">
                  {f.icon}
               </div>
               <h4 className="text-2xl font-black uppercase tracking-tighter mb-3">{f.title}</h4>
               <p className="text-gray-500 dark:text-gray-400 font-bold text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Membership / Pricing Section */}
      <section id="membership" className="py-32 px-6 bg-gray-50 dark:bg-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-primary-500 mb-2">Membership Plans</h2>
            <h3 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter">Invest in your <span className="text-primary-500">legacy.</span></h3>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {plans.map((p, i) => (
              <div key={i} className={`p-10 rounded-[3rem] border transition-all duration-500 ${p.highlight ? 'bg-primary-600 border-primary-500 text-white scale-105 shadow-2xl shadow-primary-500/20' : 'bg-white dark:bg-[#0d1510] border-gray-100 dark:border-white/10 text-gray-900 dark:text-white hover:border-primary-500/50'}`}>
                <h4 className="text-2xl font-black uppercase tracking-tighter mb-4">{p.name}</h4>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-5xl font-black tracking-tighter">{p.price}</span>
                  <span className="text-sm font-bold opacity-60 uppercase">{p.period}</span>
                </div>
                <div className="space-y-4 mb-10">
                  {p.features.map((feat, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center ${p.highlight ? 'bg-white/20' : 'bg-primary-100 dark:bg-primary-900/20'}`}>
                        <Check size={12} className={p.highlight ? 'text-white' : 'text-primary-500'} />
                      </div>
                      <span className="text-sm font-bold">{feat}</span>
                    </div>
                  ))}
                </div>
                <button className={`w-full py-4 rounded-full font-black uppercase tracking-widest text-xs transition-all ${p.highlight ? 'bg-white text-primary-600 hover:scale-105 shadow-xl' : 'bg-gray-900 dark:bg-white text-white dark:text-[#0d1510] hover:scale-105'}`}>
                  {p.button}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Academy Section */}
      <section id="academy" className="py-32 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row items-end justify-between gap-10 mb-20">
          <div className="max-w-2xl">
            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-primary-500 mb-2">Sync Academy</h2>
            <h3 className="text-4xl sm:text-6xl font-black uppercase italic tracking-tighter">Learn the art of <span className="text-emerald-500">Precision.</span></h3>
          </div>
          <button className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-primary-500 transition-colors group">
            Browse All Courses <ArrowRight size={18} className="group-hover:translate-x-2 transition-all" />
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {academyLessons.map((l, i) => (
            <div key={i} className="group cursor-pointer">
              <div className="relative aspect-video rounded-[2rem] overflow-hidden bg-gray-100 dark:bg-white/5 mb-6">
                <div className="absolute inset-0 bg-primary-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 group-hover:opacity-100 transition-all scale-50 group-hover:scale-100">
                  <PlayCircle size={64} fill="currentColor" stroke="none" />
                </div>
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 mb-1">{l.type}</p>
              <h4 className="text-xl font-bold uppercase mb-2 group-hover:text-primary-500 transition-colors">{l.title}</h4>
              <p className="text-xs font-bold text-gray-500">{l.duration} • Beginner Friendly</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-32 bg-gray-900 dark:bg-white/5 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 space-y-8">
               <h3 className="text-5xl font-black uppercase italic tracking-tighter leading-none">The path to<br />optimization.</h3>
               <p className="text-xl text-gray-400 font-bold leading-relaxed">We simplified the complex agricultural data landscape so you can focus on what matters most: growing your legacy.</p>
               <button onClick={() => navigate('/register')} className="bg-white text-[#0d1510] px-10 py-5 rounded-full text-lg font-black uppercase tracking-tighter italic hover:scale-105 transition-all">Join Waitlist</button>
            </div>
            
            <div className="lg:w-1/2 grid grid-cols-1 gap-12 relative">
               <div className="absolute left-10 top-0 bottom-0 w-px bg-white/20 hidden sm:block" />
               {steps.map((s, i) => (
                 <div key={i} className="relative pl-0 sm:pl-24 group">
                    <div className="absolute left-0 top-0 w-20 h-20 rounded-full bg-white text-[#0d1510] flex items-center justify-center text-3xl font-black italic shadow-2xl z-10 group-hover:scale-110 transition-transform hidden sm:flex">
                       0{i + 1}
                    </div>
                    <div className="pt-2">
                       <h4 className="text-2xl font-black uppercase tracking-tighter mb-2">{s.title}</h4>
                       <p className="text-gray-400 font-bold text-sm">{s.description}</p>
                    </div>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center">
         <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-5xl sm:text-7xl font-black leading-none tracking-tighter uppercase italic">Ready to sync your farm with the future?</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-primary-600 hover:bg-primary-500 text-white px-12 py-6 rounded-full text-xl font-black uppercase tracking-tighter italic shadow-2xl shadow-primary-500/20 transition-all active:scale-95">Get Started Now</button>
               <button onClick={() => navigate('/about')} className="w-full sm:w-auto px-12 py-6 rounded-full text-xl font-black uppercase tracking-tighter border-2 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all">Book a Demo</button>
            </div>
         </div>
      </section>

      {/* Simple Footer */}
      <footer className="border-t border-gray-100 dark:border-white/5 py-12 px-6 bg-white dark:bg-[#0d1510]">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
               <Logo size="small" variant={theme === 'dark' ? 'dark' : 'light'} />
               <p className="text-sm font-bold text-gray-500">&copy; 2026 FarmSync AI. All Rights Reserved.</p>
            </div>
            <div className="flex gap-10 text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
               <a href="#" className="hover:text-primary-500 transition-colors">Privacy</a>
               <a href="#" className="hover:text-primary-500 transition-colors">Terms</a>
               <a href="#" className="hover:text-primary-500 transition-colors">Contact</a>
            </div>
         </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
    </div>
  );
};

export default Landing;
