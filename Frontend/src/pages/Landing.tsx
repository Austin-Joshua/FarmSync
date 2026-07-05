import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { 
  ArrowRight, TrendingUp, Sun, Moon, 
  Calendar, PieChart, Zap, Database,
  Menu, X, ChevronDown, ChevronLeft, ChevronRight, Mail, Shield, Smartphone
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activePreviewTab, setActivePreviewTab] = useState<'weather' | 'disease' | 'inventory' | 'yield'>('weather');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [, setIsSubscribed] = useState(false);
  const { t } = useTranslation();

  // Smooth scroll helper
  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const features = [
    {
      icon: <Database className="text-emerald-500" />,
      title: t('landing.feature1Title'),
      description: t('landing.feature1Desc')
    },
    {
      icon: <TrendingUp className="text-blue-500" />,
      title: t('landing.feature2Title'),
      description: t('landing.feature2Desc')
    },
    {
      icon: <Calendar className="text-amber-500" />,
      title: t('landing.feature3Title'),
      description: t('landing.feature3Desc')
    },
    {
      icon: <PieChart className="text-purple-500" />,
      title: t('landing.feature4Title'),
      description: t('landing.feature4Desc')
    }
  ];

  const steps = [
    { title: t('landing.step1Title'), description: t('landing.step1Desc') },
    { title: t('landing.step2Title'), description: t('landing.step2Desc') },
    { title: t('landing.step3Title'), description: t('landing.step3Desc') }
  ];

  const testimonials = [
    {
      quote: t('landing.testimonial1Quote'),
      author: t('landing.testimonial1Author'),
      location: t('landing.testimonial1Location'),
      crop: t('landing.testimonial1Crop'),
      initials: "RK",
      gradient: "from-amber-500 to-orange-600"
    },
    {
      quote: t('landing.testimonial2Quote'),
      author: t('landing.testimonial2Author'),
      location: t('landing.testimonial2Location'),
      crop: t('landing.testimonial2Crop'),
      initials: "AP",
      gradient: "from-emerald-400 to-teal-600"
    },
    {
      quote: t('landing.testimonial3Quote'),
      author: t('landing.testimonial3Author'),
      location: t('landing.testimonial3Location'),
      crop: t('landing.testimonial3Crop'),
      initials: "SR",
      gradient: "from-blue-500 to-indigo-600"
    }
  ];

  const faqs = [
    {
      q: t('landing.faq1Q'),
      a: t('landing.faq1A')
    },
    {
      q: t('landing.faq2Q'),
      a: t('landing.faq2A')
    },
    {
      q: t('landing.faq3Q'),
      a: t('landing.faq3A')
    },
    {
      q: t('landing.faq4Q'),
      a: t('landing.faq4A')
    }
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail || !newsletterEmail.includes('@')) {
      toast.error(t('landing.newsletterError'));
      return;
    }
    setIsSubscribed(true);
    setNewsletterEmail('');
    toast.success(t('landing.newsletterSuccess'));
  };

  const nextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  // Auto scroll testimonials
  useEffect(() => {
    const timer = setInterval(nextTestimonial, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="top" className={`min-h-screen font-sans scroll-smooth selection:bg-emerald-200 dark:selection:bg-emerald-800 ${theme === 'dark' ? 'bg-[#0b130e] text-gray-100' : 'bg-[#f8fafc] text-gray-900'}`}>
      
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl px-6 py-4 flex items-center justify-between border-b transition-colors duration-300 ${theme === 'dark' ? 'bg-[#0b130e]/85 border-white/5' : 'bg-white/80 border-gray-100'}`}>
        <div className="flex items-center">
          <Logo size="default" variant={theme === 'dark' ? 'dark' : 'light'} />
        </div>
        
        {/* Scroll Links */}
        <div className="hidden lg:flex items-center gap-8 xl:gap-10 text-[13px] font-extrabold uppercase tracking-widest">
          <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-emerald-500 transition-colors">{t('landing.features')}</a>
          <a href="#showcase" onClick={(e) => handleScroll(e, 'showcase')} className="hover:text-emerald-500 transition-colors">{t('landing.appPreview')}</a>
          <a href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')} className="hover:text-emerald-500 transition-colors">{t('landing.stories')}</a>
          <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="hover:text-emerald-500 transition-colors">{t('landing.faq')}</a>
          <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="hover:text-emerald-500 transition-colors">{t('landing.howItWorks')}</a>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center p-1 bg-gray-100 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <LanguageSwitcher />
            <div className="w-px h-4 bg-gray-300 dark:bg-white/20 mx-2" />
            <button 
              onClick={toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white dark:hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} className="text-amber-400" /> : <Moon size={16} className="text-slate-600" />}
            </button>
          </div>
          
          <Link to="/login" className="hidden sm:block text-sm font-black hover:text-emerald-500 transition-colors uppercase tracking-wider">
             {t('landing.logIn')}
          </Link>
          <button 
            onClick={() => navigate('/register')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white dark:bg-white dark:text-[#0b130e] px-4 sm:px-6 py-2 sm:py-2.5 rounded-full text-sm font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-emerald-500/10 whitespace-nowrap"
          >
            {t('landing.getStarted')}
          </button>

          {/* Mobile Menu Button */}
          <button 
            className="lg:hidden p-2 rounded-xl bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white border border-gray-200 dark:border-white/10"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Nav Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-[73px] left-0 right-0 z-40 bg-white/95 dark:bg-[#0b130e]/95 backdrop-blur-xl border-b border-gray-100 dark:border-white/5 p-6 shadow-2xl lg:hidden animate-fade-in-up">
          <div className="flex flex-col gap-6 text-sm font-extrabold uppercase tracking-widest">
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-emerald-500 transition-colors flex items-center justify-between">
              {t('landing.features')} <ArrowRight size={16} />
            </a>
            <a href="#showcase" onClick={(e) => handleScroll(e, 'showcase')} className="hover:text-emerald-500 transition-colors flex items-center justify-between">
              {t('landing.appPreview')} <ArrowRight size={16} />
            </a>
            <a href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')} className="hover:text-emerald-500 transition-colors flex items-center justify-between">
              {t('landing.stories')} <ArrowRight size={16} />
            </a>
            <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="hover:text-emerald-500 transition-colors flex items-center justify-between">
              {t('landing.faq')} <ArrowRight size={16} />
            </a>
            <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="hover:text-emerald-500 transition-colors flex items-center justify-between">
              {t('landing.howItWorks')} <ArrowRight size={16} />
            </a>
            <div className="h-px bg-gray-200 dark:bg-white/10 my-2" />
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-emerald-600 dark:text-emerald-400 font-bold py-2 border border-emerald-500/20 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/20">
              {t('landing.logInAccount')}
            </Link>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-16">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-amber-500/5 rounded-full blur-[100px] -z-10" />
        
        <div className="lg:w-1/2 flex flex-col items-start space-y-8 animate-fade-in-up">
          <div className="flex items-center gap-3 px-4 py-2 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-[0.2em] border border-emerald-200/50 dark:border-emerald-500/10">
            <Zap size={14} className="animate-bounce text-emerald-500" />
            <span>{t('landing.badge')}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1] tracking-tighter italic uppercase text-gray-900 dark:text-white">
            {t('landing.headline1')}<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-400 to-green-500">{t('landing.headline2')}</span><br />
            {t('landing.headline3')}
          </h1>
          
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg font-bold leading-relaxed">
            {t('landing.subtext')}
          </p>
          
          <div className="flex flex-wrap gap-4 pt-4">
            <button 
              onClick={() => navigate('/register')}
              className="bg-emerald-600 hover:bg-emerald-500 text-white px-10 py-5 rounded-full text-lg font-black italic uppercase tracking-tighter flex items-center gap-3 shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all group"
            >
              {t('landing.startFreeTrial')}
              <ArrowRight size={22} className="group-hover:translate-x-2 transition-transform" />
            </button>
            <a 
              href="#showcase" 
              onClick={(e) => handleScroll(e, 'showcase')}
              className="px-10 py-5 rounded-full text-lg font-black uppercase tracking-tighter border-2 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all"
            >
              {t('landing.seeAppPreview')}
            </a>
          </div>
        </div>

        {/* Decorative App Dashboard Simulation */}
        <div className="lg:w-1/2 relative w-full group">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" />
          <div className="relative bg-white dark:bg-white/5 p-1.5 backdrop-blur-2xl rounded-[2rem] sm:rounded-[3rem] border border-gray-200 dark:border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] overflow-hidden transform hover:rotate-1 transition-all duration-700">
             <div className="bg-gray-50 dark:bg-[#0b130e]/90 p-4 sm:p-8 rounded-[1.8rem] sm:rounded-[2.7rem]">
                <div className="flex justify-between items-start mb-10">
                   <div className="bg-emerald-100 dark:bg-emerald-500/20 p-4 rounded-3xl">
                      <TrendingUp size={32} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
                   </div>
                   <div className="flex flex-col items-end">
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Live Telemetry</span>
                      <span className="text-xs text-gray-500 font-bold mt-1">FarmSync Active Hub</span>
                   </div>
                </div>
                
                <div className="space-y-2 mb-10">
                   <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500 dark:text-white/40">Soil Health & Moisture</p>
                   <h3 className="text-4xl font-black uppercase italic tracking-tighter text-gray-900 dark:text-white">Field Analysis</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                   <div className="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 dark:text-white/40 mb-1">Moisture Level</p>
                      <p className="text-2xl sm:text-3xl font-black text-emerald-500 tracking-tighter">78.4%</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block mt-1">Optimal Range</span>
                   </div>
                   <div className="p-4 sm:p-6 bg-white dark:bg-white/5 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 dark:border-white/5 shadow-sm">
                      <p className="text-xs font-bold text-gray-500 dark:text-white/40 mb-1">Nitrogen (N)</p>
                      <p className="text-2xl sm:text-3xl font-black text-amber-500 tracking-tighter">Medium</p>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold block mt-1">Slight deficit</span>
                   </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Weather advisory updated just now</span>
                  </div>
                  <ChevronRight size={16} className="text-emerald-500" />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="py-28 px-6 max-w-7xl mx-auto border-t border-gray-100 dark:border-white/5">
        <div className="text-center mb-20 space-y-4">
          <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-2">{t('landing.coreEcosystem')}</h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black uppercase italic tracking-tighter">{t('landing.everythingYouNeed')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-400">{t('landing.scale')}</span></h3>
          <p className="text-gray-500 max-w-lg mx-auto font-bold">{t('landing.featureSubtitle')}</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="group p-8 rounded-[2.5rem] bg-white dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:border-emerald-500/40 hover:bg-gray-50 dark:hover:bg-white/10 transition-all duration-500">
               <div className="w-16 h-16 rounded-[1.5rem] bg-gray-100 dark:bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-emerald-500/10 transition-all">
                  {f.icon}
               </div>
               <h4 className="text-2xl font-black uppercase tracking-tighter mb-3 text-gray-900 dark:text-white">{f.title}</h4>
               <p className="text-gray-500 dark:text-gray-400 font-bold text-sm leading-relaxed">{f.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App Preview Showcase Section */}
      <section id="showcase" className="py-28 px-6 bg-gray-50 dark:bg-white/5 border-t border-b border-gray-100 dark:border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-2">{t('landing.interactiveShowcase')}</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter">{t('landing.seeFarmSync')} <span className="text-emerald-500">{t('landing.inAction')}</span></h3>
            <p className="text-gray-500 max-w-lg mx-auto mt-4 font-bold">{t('landing.showcaseSubtitle')}</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Left selector */}
            <div className="w-full lg:w-1/3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              <button 
                onClick={() => setActivePreviewTab('weather')}
                className={`text-left p-6 rounded-[2rem] border transition-all duration-300 ${activePreviewTab === 'weather' ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-500/15' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-emerald-500/30'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Sun size={20} className={activePreviewTab === 'weather' ? 'text-white' : 'text-emerald-500'} />
                  <h4 className="font-black uppercase tracking-wider text-sm">{t('landing.weatherIntelligence')}</h4>
                </div>
                <p className={`text-xs font-bold leading-relaxed ${activePreviewTab === 'weather' ? 'text-white/80' : 'text-gray-500'}`}>
                  {t('landing.weatherDesc')}
                </p>
              </button>

              <button 
                onClick={() => setActivePreviewTab('disease')}
                className={`text-left p-6 rounded-[2rem] border transition-all duration-300 ${activePreviewTab === 'disease' ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-500/15' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-emerald-500/30'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Shield size={20} className={activePreviewTab === 'disease' ? 'text-white' : 'text-emerald-500'} />
                  <h4 className="font-black uppercase tracking-wider text-sm">{t('landing.aiDisease')}</h4>
                </div>
                <p className={`text-xs font-bold leading-relaxed ${activePreviewTab === 'disease' ? 'text-white/80' : 'text-gray-500'}`}>
                  {t('landing.aiDiseaseDesc')}
                </p>
              </button>

              <button 
                onClick={() => setActivePreviewTab('inventory')}
                className={`text-left p-6 rounded-[2rem] border transition-all duration-300 ${activePreviewTab === 'inventory' ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-500/15' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-emerald-500/30'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Database size={20} className={activePreviewTab === 'inventory' ? 'text-white' : 'text-emerald-500'} />
                  <h4 className="font-black uppercase tracking-wider text-sm">{t('landing.inventoryLog')}</h4>
                </div>
                <p className={`text-xs font-bold leading-relaxed ${activePreviewTab === 'inventory' ? 'text-white/80' : 'text-gray-500'}`}>
                  {t('landing.inventoryDesc')}
                </p>
              </button>

              <button 
                onClick={() => setActivePreviewTab('yield')}
                className={`text-left p-6 rounded-[2rem] border transition-all duration-300 ${activePreviewTab === 'yield' ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-500/15' : 'bg-white dark:bg-white/5 border-gray-200 dark:border-white/5 hover:border-emerald-500/30'}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp size={20} className={activePreviewTab === 'yield' ? 'text-white' : 'text-emerald-500'} />
                  <h4 className="font-black uppercase tracking-wider text-sm">{t('landing.yieldTracker')}</h4>
                </div>
                <p className={`text-xs font-bold leading-relaxed ${activePreviewTab === 'yield' ? 'text-white/80' : 'text-gray-500'}`}>
                  {t('landing.yieldDesc')}
                </p>
              </button>
            </div>

            {/* Right graphic presentation */}
            <div className="w-full lg:w-2/3 bg-white dark:bg-[#070e0a] rounded-[2.5rem] border border-gray-200 dark:border-white/5 p-8 sm:p-12 shadow-xl min-h-[400px] flex flex-col justify-between">
              {activePreviewTab === 'weather' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                    <span className="text-sm font-black uppercase text-emerald-500 tracking-widest">{t('landing.weatherDashboard')}</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black">{t('landing.activeField')}</span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                      <span className="text-xs text-gray-500 block">Relative Humidity</span>
                      <strong className="text-2xl font-black block mt-1 text-gray-900 dark:text-white">62%</strong>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                      <span className="text-xs text-gray-500 block">Temperature Forecast</span>
                      <strong className="text-2xl font-black block mt-1 text-gray-900 dark:text-white">34.2 °C</strong>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                      <span className="text-xs text-gray-500 block">Wind Velocity</span>
                      <strong className="text-2xl font-black block mt-1 text-gray-900 dark:text-white">12 km/h</strong>
                    </div>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-500/20 rounded-2xl p-6">
                    <h5 className="font-black text-amber-800 dark:text-amber-400 text-sm mb-1 uppercase tracking-wider">💡 {t('landing.sowingAdvisory')}</h5>
                    <p className="text-sm text-amber-700 dark:text-amber-300/90 font-semibold leading-relaxed">
                      {t('landing.sowingAdvisoryText')}
                    </p>
                  </div>
                </div>
              )}

              {activePreviewTab === 'disease' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                    <span className="text-sm font-black uppercase text-emerald-500 tracking-widest">{t('landing.aiLeafScanner')}</span>
                    <span className="bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-black">{t('landing.warningTriggered')}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-6 items-center">
                    <div className="w-32 h-32 rounded-2xl bg-emerald-900/10 border-2 border-dashed border-emerald-500/20 flex flex-col items-center justify-center text-center p-3">
                      <Smartphone size={24} className="text-emerald-500 mb-2 animate-bounce" />
                      <span className="text-[10px] text-gray-500 font-black">Camera Ready</span>
                    </div>
                    <div className="flex-1 space-y-2">
                      <h5 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight">Identified Disease: Brown Spot (Helminthosporium oryzae)</h5>
                      <div className="flex gap-2">
                        <span className="bg-red-500/10 text-red-500 text-[10px] px-2.5 py-1 rounded font-black uppercase">Confidence: 94%</span>
                        <span className="bg-gray-100 dark:bg-white/5 text-gray-500 text-[10px] px-2.5 py-1 rounded font-black uppercase">Crop: Rice</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-6 border border-gray-200 dark:border-white/10">
                    <h5 className="font-bold text-gray-900 dark:text-white text-sm mb-2">Recommended Remedy Protocol:</h5>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed font-semibold">
                      1. Keep the fields clean and remove wild grasses that serve as hosts.<br />
                      2. Apply potash fertilizers at standard sowing intervals to balance nutrition.<br />
                      3. If severe, apply biological Mancozeb spray dilution under dry wind conditions.
                    </p>
                  </div>
                </div>
              )}

              {activePreviewTab === 'inventory' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                    <span className="text-sm font-black uppercase text-emerald-500 tracking-widest">{t('landing.inventoryMgmt')}</span>
                    <span className="bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 px-3 py-1 rounded-full text-[10px] font-black">{t('landing.lowStockAlert')}</span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 text-xs font-black">SEEDS</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">Basmati Paddy Seeds</span>
                      </div>
                      <span className="font-black text-gray-900 dark:text-white">120 kg</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-amber-500/10 rounded-lg text-amber-500 text-xs font-black">CHEM</span>
                        <span className="font-bold text-amber-900 dark:text-amber-200 text-sm">Urea Granular Fertilizer</span>
                      </div>
                      <span className="font-black text-amber-600 dark:text-amber-400">15 kg (Critically Low)</span>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/5">
                      <div className="flex items-center gap-3">
                        <span className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500 text-xs font-black">PEST</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">Neem Biological Insecticide</span>
                      </div>
                      <span className="font-black text-gray-900 dark:text-white">45 Liters</span>
                    </div>
                  </div>
                </div>
              )}

              {activePreviewTab === 'yield' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-gray-100 dark:border-white/5 pb-4">
                    <span className="text-sm font-black uppercase text-emerald-500 tracking-widest">{t('landing.financialAnalytics')}</span>
                    <span className="bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black">Q2 Overview</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 sm:p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-[1.5rem] sm:rounded-[2rem]">
                      <span className="text-xs text-gray-500 block font-bold">Total Investments</span>
                      <strong className="text-xl sm:text-2xl md:text-3xl font-black block mt-2 text-emerald-500">₹32,450</strong>
                      <span className="text-[10px] text-gray-400 block mt-1">Seeds & chemical inputs</span>
                    </div>
                    <div className="p-4 sm:p-6 bg-teal-500/5 border border-teal-500/10 rounded-[1.5rem] sm:rounded-[2rem]">
                      <span className="text-xs text-gray-500 block font-bold">Projected Income</span>
                      <strong className="text-xl sm:text-2xl md:text-3xl font-black block mt-2 text-teal-500">₹145,000</strong>
                      <span className="text-[10px] text-teal-600 block mt-1">+24% vs historical average</span>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-white/5 rounded-2xl p-4 flex items-center justify-between">
                    <span className="text-xs text-gray-500 font-bold">Net Profit projection margin:</span>
                    <span className="text-emerald-500 text-sm font-black uppercase">77.6% (Very High)</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Carousel Section */}
      <section id="testimonials" className="py-28 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-2">{t('landing.successStories')}</h2>
          <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter">{t('landing.farmersTrusting')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-green-400">FarmSync.</span></h3>
        </div>

        <div className="relative max-w-4xl mx-auto">
          {/* Card wrapper */}
          <div className="bg-white dark:bg-[#0c1611] rounded-[3rem] border border-gray-100 dark:border-white/5 p-8 sm:p-14 shadow-2xl relative overflow-hidden transition-all">
            <div className="absolute top-8 right-12 text-[120px] leading-none font-serif opacity-[0.03] select-none text-emerald-500">“</div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
              {/* Avatar circle */}
              <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${testimonials[activeTestimonial].gradient} flex items-center justify-center text-white text-3xl font-black shadow-xl shrink-0`}>
                {testimonials[activeTestimonial].initials}
              </div>

              {/* Quote details */}
              <div className="space-y-6 flex-1 text-center md:text-left">
                <p className="text-lg sm:text-xl font-bold italic leading-relaxed text-gray-800 dark:text-gray-200">
                  "{testimonials[activeTestimonial].quote}"
                </p>
                <div>
                  <h4 className="text-lg font-black uppercase tracking-tight text-gray-900 dark:text-white">{testimonials[activeTestimonial].author}</h4>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                    {testimonials[activeTestimonial].location} • {testimonials[activeTestimonial].crop}
                  </p>
                </div>
              </div>
            </div>

            {/* Indicator dots */}
            <div className="flex justify-center gap-2 mt-8 md:absolute md:bottom-10 md:right-14 md:mt-0">
              {testimonials.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeTestimonial === idx ? 'w-8 bg-emerald-500' : 'bg-gray-300 dark:bg-white/20'}`}
                />
              ))}
            </div>
          </div>

          {/* Nav arrows */}
          <button 
            onClick={prevTestimonial}
            className="absolute left-[-20px] sm:left-[-30px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-[#0c1611] border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-lg hover:text-emerald-500 transition-colors z-10 hidden md:flex"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={nextTestimonial}
            className="absolute right-[-20px] sm:right-[-30px] top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white dark:bg-[#0c1611] border border-gray-200 dark:border-white/10 flex items-center justify-center shadow-lg hover:text-emerald-500 transition-colors z-10 hidden md:flex"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* FAQ Accordion Section */}
      <section id="faq" className="py-28 px-6 bg-gray-50 dark:bg-white/5 border-t border-b border-gray-100 dark:border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-[12px] font-black uppercase tracking-[0.5em] text-emerald-500 mb-2">{t('landing.gotQuestions')}</h2>
            <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter">{t('landing.frequentlyAsked')} <span className="text-emerald-500">{t('landing.details')}</span></h3>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div 
                  key={idx}
                  className="bg-white dark:bg-[#0c1611] rounded-2xl border border-gray-200 dark:border-white/5 overflow-hidden transition-all duration-300"
                >
                  <button 
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-extrabold text-sm sm:text-base uppercase tracking-tight text-gray-900 dark:text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={18} className={`text-emerald-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-6 pt-1 text-sm font-semibold text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-white/5 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-28 bg-[#070e0a] text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative">
          <div className="flex flex-col lg:flex-row items-center gap-20">
            <div className="lg:w-1/2 space-y-8">
               <h3 className="text-3xl sm:text-4xl md:text-5xl font-black uppercase italic tracking-tighter leading-none">{t('landing.pathToOptimization')}</h3>
               <p className="text-xl text-gray-400 font-bold leading-relaxed">{t('landing.pathSubtext')}</p>
               <button onClick={() => navigate('/register')} className="bg-white text-[#0b130e] px-10 py-5 rounded-full text-lg font-black uppercase tracking-tighter italic hover:scale-105 transition-all">{t('landing.startFreeNow')}</button>
            </div>
            
            <div className="lg:w-1/2 grid grid-cols-1 gap-12 relative">
               <div className="absolute left-10 top-0 bottom-0 w-px bg-white/20 hidden sm:block" />
               {steps.map((s, i) => (
                  <div key={i} className="relative pl-0 sm:pl-24 group">
                     <div className="absolute left-0 top-0 w-20 h-20 rounded-full bg-white text-[#0b130e] flex items-center justify-center text-3xl font-black italic shadow-2xl z-10 group-hover:scale-110 transition-transform hidden sm:flex">
                        0{i + 1}
                     </div>
                     <div className="pt-2">
                        <h4 className="text-2xl font-black uppercase tracking-tighter mb-2 text-white">{s.title}</h4>
                        <p className="text-gray-400 font-bold text-sm leading-relaxed">{s.description}</p>
                     </div>
                  </div>
               ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 text-center">
         <div className="max-w-4xl mx-auto space-y-10">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-none tracking-tighter uppercase italic">{t('landing.readyToSync')}</h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
               <button onClick={() => navigate('/register')} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white px-12 py-6 rounded-full text-xl font-black uppercase tracking-tighter italic shadow-2xl shadow-emerald-500/20 transition-all active:scale-95">{t('landing.getStartedNow')}</button>
               <a href="#showcase" onClick={(e) => handleScroll(e, 'showcase')} className="w-full sm:w-auto px-12 py-6 rounded-full text-xl font-black uppercase tracking-tighter border-2 border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/5 transition-all text-center inline-block">{t('landing.seeAppPreview')}</a>
            </div>
         </div>
      </section>

      {/* Footer with Newsletter signup */}
      <footer className="border-t border-gray-100 dark:border-white/5 py-16 px-6 bg-white dark:bg-[#070e0a] transition-colors duration-300">
         <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Logo and brief */}
            <div className="md:col-span-2 space-y-6">
               <Logo size="default" variant={theme === 'dark' ? 'dark' : 'light'} />
               <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold max-w-sm">
                  {t('landing.footerAbout')}
               </p>
               <p className="text-xs text-gray-400">{t('landing.copyright')}</p>
            </div>

            {/* Useful Links */}
            <div>
               <h5 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-gray-900 dark:text-white">{t('landing.navNavigation')}</h5>
               <ul className="space-y-3 text-xs font-bold text-gray-500">
                  <li><a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-emerald-500 transition-colors">{t('landing.features')}</a></li>
                  <li><a href="#showcase" onClick={(e) => handleScroll(e, 'showcase')} className="hover:text-emerald-500 transition-colors">{t('landing.appPreview')}</a></li>
                  <li><a href="#testimonials" onClick={(e) => handleScroll(e, 'testimonials')} className="hover:text-emerald-500 transition-colors">{t('landing.stories')}</a></li>
                  <li><a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="hover:text-emerald-500 transition-colors">{t('landing.faq')}</a></li>
               </ul>
            </div>

            {/* Newsletter Signup */}
            <div>
               <h5 className="font-black text-xs uppercase tracking-[0.2em] mb-4 text-gray-900 dark:text-white">{t('landing.farmSyncWeekly')}</h5>
               <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 font-semibold">{t('landing.newsletterDesc')}</p>
               
               <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                     <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                     <input 
                        type="email" 
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder={t('landing.emailPlaceholder')}
                        className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-full pl-10 pr-4 py-2.5 text-xs font-semibold focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
                        required
                     />
                  </div>
                  <button 
                     type="submit" 
                     className="bg-emerald-600 hover:bg-emerald-500 text-white p-2.5 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
                     aria-label="Subscribe"
                  >
                     <ArrowRight size={16} />
                  </button>
               </form>
            </div>
         </div>

         <div className="max-w-7xl mx-auto border-t border-gray-100 dark:border-white/5 pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            <div className="flex gap-8">
               <a href="#" className="hover:text-emerald-500 transition-colors">{t('landing.privacyPolicy')}</a>
               <a href="#" className="hover:text-emerald-500 transition-colors">{t('landing.termsOfService')}</a>
               <a href="#" className="hover:text-emerald-500 transition-colors">{t('landing.slaAgreement')}</a>
            </div>
            <div>
               <span>{t('landing.telemetryActive')}</span>
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
        html {
          scroll-behavior: smooth;
        }
      `}} />
    </div>
  );
};

export default Landing;
