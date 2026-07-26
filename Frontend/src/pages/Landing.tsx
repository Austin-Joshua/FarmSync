import { Link, useNavigate } from 'react-router-dom';
import Logo from '../components/Logo';
import { Sun, Moon, Menu, X, ChevronDown, Database, TrendingUp, Calendar, PieChart, Shield } from 'lucide-react';
import { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';

const Landing = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePreviewTab, setActivePreviewTab] = useState<'weather' | 'disease' | 'inventory' | 'yield'>('weather');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const { t } = useTranslation();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const features = [
    { icon: Database, title: t('landing.feature1Title'), desc: t('landing.feature1Desc') },
    { icon: TrendingUp, title: t('landing.feature2Title'), desc: t('landing.feature2Desc') },
    { icon: Calendar, title: t('landing.feature3Title'), desc: t('landing.feature3Desc') },
    { icon: PieChart, title: t('landing.feature4Title'), desc: t('landing.feature4Desc') }
  ];

  const steps = [
    { title: t('landing.step1Title'), desc: t('landing.step1Desc') },
    { title: t('landing.step2Title'), desc: t('landing.step2Desc') },
    { title: t('landing.step3Title'), desc: t('landing.step3Desc') }
  ];

  const faqs = [
    { q: t('landing.faq1Q'), a: t('landing.faq1A') },
    { q: t('landing.faq2Q'), a: t('landing.faq2A') },
    { q: t('landing.faq3Q'), a: t('landing.faq3A') },
    { q: t('landing.faq4Q'), a: t('landing.faq4A') }
  ];

  return (
    <div className="min-h-screen bg-surface text-text">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-surface/95 border-b border-border px-6 py-4 flex items-center justify-between">
        <Logo size="default" variant={theme === 'dark' ? 'dark' : 'light'} />

        <div className="hidden lg:flex items-center gap-8">
          <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="text-sm font-medium text-text hover:text-accent transition-colors">{t('landing.features')}</a>
          <a href="#showcase" onClick={(e) => handleScroll(e, 'showcase')} className="text-sm font-medium text-text hover:text-accent transition-colors">{t('landing.appPreview')}</a>
          <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="text-sm font-medium text-text hover:text-accent transition-colors">{t('landing.faq')}</a>
          <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="text-sm font-medium text-text hover:text-accent transition-colors">{t('landing.howItWorks')}</a>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center bg-surface-raised rounded-md p-1 border border-border">
            <LanguageSwitcher />
            <div className="w-px h-4 bg-border mx-2" />
            <button onClick={toggleTheme} className="p-1.5 rounded hover:bg-surface-sunken transition-colors" aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={16} className="text-accent" /> : <Moon size={16} className="text-text-muted" />}
            </button>
          </div>
          <Link to="/login" className="hidden sm:block text-sm font-medium text-text hover:text-accent transition-colors">{t('landing.logIn')}</Link>
          <Button variant="primary" size="sm" onClick={() => navigate('/register')}>{t('landing.getStarted')}</Button>
          <button className="lg:hidden p-2 rounded-md border border-border text-text hover:bg-surface-raised transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="fixed top-[73px] left-0 right-0 z-40 bg-surface border-b border-border p-6 shadow-lg lg:hidden">
          <div className="flex flex-col gap-4 text-sm font-medium">
            <a href="#features" onClick={(e) => handleScroll(e, 'features')} className="text-text hover:text-accent transition-colors py-2">{t('landing.features')}</a>
            <a href="#showcase" onClick={(e) => handleScroll(e, 'showcase')} className="text-text hover:text-accent transition-colors py-2">{t('landing.appPreview')}</a>
            <a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="text-text hover:text-accent transition-colors py-2">{t('landing.faq')}</a>
            <a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="text-text hover:text-accent transition-colors py-2">{t('landing.howItWorks')}</a>
            <div className="border-t border-border my-2" />
            <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-center text-accent font-medium py-2 border border-accent/20 rounded-md hover:bg-accent/5">{t('landing.logInAccount')}</Link>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <div className="max-w-3xl">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-serif font-bold text-text mb-6 leading-tight">{t('landing.headline1')}</h1>
          <p className="text-xl text-text-muted font-medium mb-8 max-w-2xl">{t('landing.subtext')}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button variant="primary" size="lg" onClick={() => navigate('/register')}>{t('landing.getStartedNow')}</Button>
            <Button variant="secondary" size="lg" onClick={(e: any) => handleScroll(e, 'features')}>Learn more</Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto border-t border-border">
        <div className="mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text mb-4">{t('landing.everythingYouNeed')}</h2>
          <p className="text-text-muted font-medium max-w-2xl">{t('landing.featureSubtitle')}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-lg bg-surface-raised border border-border hover:border-accent/50 transition-colors">
              <f.icon className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-text mb-2">{f.title}</h3>
              <p className="text-sm text-text-muted">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* App Preview */}
      <section id="showcase" className="py-20 px-6 max-w-7xl mx-auto bg-surface-raised border-t border-b border-border">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text mb-4">{t('landing.seeFarmSync')}</h2>
          <p className="text-text-muted font-medium">{t('landing.showcaseSubtitle')}</p>
        </div>
        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {[
            { id: 'weather', icon: Sun, label: t('landing.weatherIntelligence') },
            { id: 'disease', icon: Shield, label: t('landing.aiDisease') },
            { id: 'inventory', icon: Database, label: t('landing.inventoryLog') },
            { id: 'yield', icon: TrendingUp, label: t('landing.yieldTracker') }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActivePreviewTab(tab.id as any)} className={`p-4 rounded-lg border transition-all text-left ${activePreviewTab === tab.id ? 'bg-accent text-accent-contrast border-accent' : 'bg-surface border-border hover:border-accent/50 text-text'}`}>
              <tab.icon size={20} className="mb-2" />
              <h4 className="font-semibold text-sm">{tab.label}</h4>
            </button>
          ))}
        </div>
        <div className="bg-surface border border-border rounded-lg p-8 min-h-[300px]">
          {activePreviewTab === 'weather' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-text">{t('landing.weatherDashboard')}</h3>
              <div className="grid grid-cols-3 gap-4">
                <div><p className="text-xs text-text-muted">Humidity</p><p className="text-2xl font-bold text-accent">62%</p></div>
                <div><p className="text-xs text-text-muted">Temperature</p><p className="text-2xl font-bold text-accent">34.2°C</p></div>
                <div><p className="text-xs text-text-muted">Wind</p><p className="text-2xl font-bold text-accent">12 km/h</p></div>
              </div>
            </div>
          )}
          {activePreviewTab === 'disease' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text">Leaf Scanner Analysis</h3>
              <p className="text-text-muted">Upload a photo to scan for diseases and get instant recommendations.</p>
              <Button variant="primary">Upload photo</Button>
            </div>
          )}
          {activePreviewTab === 'inventory' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text">Stock Management</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-text">Seeds</span><span className="font-semibold text-accent">120 kg</span></div>
                <div className="flex justify-between"><span className="text-text">Fertilizer</span><span className="font-semibold text-accent">45 kg</span></div>
                <div className="flex justify-between"><span className="text-text">Pesticide</span><span className="font-semibold text-accent">20 L</span></div>
              </div>
            </div>
          )}
          {activePreviewTab === 'yield' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-text">Yield Projection</h3>
              <div className="grid grid-cols-2 gap-4">
                <div><p className="text-xs text-text-muted">Investment</p><p className="text-2xl font-bold text-accent">₹32,450</p></div>
                <div><p className="text-xs text-text-muted">Projected Income</p><p className="text-2xl font-bold text-accent">₹145,000</p></div>
              </div>
              <p className="text-sm text-text-muted">+24% vs historical average</p>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-20 px-6 max-w-4xl mx-auto border-t border-border">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text mb-4">{t('landing.frequentlyAsked')}</h2>
          <p className="text-text-muted font-medium">{t('landing.gotQuestions')}</p>
        </div>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="border border-border rounded-lg overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full p-6 text-left flex items-center justify-between gap-4 font-semibold text-text hover:bg-surface-raised transition-colors">
                <span>{faq.q}</span>
                <ChevronDown size={18} className={`text-accent transition-transform flex-shrink-0 ${openFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === i && (
                <div className="px-6 pb-6 pt-1 text-sm text-text-muted border-t border-border leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 max-w-7xl mx-auto border-t border-border bg-surface-raised">
        <div className="mb-12">
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text mb-4">{t('landing.pathToOptimization')}</h2>
          <p className="text-text-muted font-medium">{t('landing.pathSubtext')}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <div key={i} className="p-6 bg-surface rounded-lg border border-border">
              <div className="w-10 h-10 rounded-md bg-accent/10 text-accent font-bold flex items-center justify-center mb-4">{i + 1}</div>
              <h3 className="font-semibold text-text mb-2">{step.title}</h3>
              <p className="text-sm text-text-muted">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-serif font-bold text-text mb-8">{t('landing.readyToSync')}</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="primary" size="lg" onClick={() => navigate('/register')}>{t('landing.getStartedNow')}</Button>
          <Button variant="secondary" size="lg" onClick={(e: any) => handleScroll(e, 'showcase')}>See app preview</Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-16 px-6 bg-surface-raised">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <Logo size="default" variant={theme === 'dark' ? 'dark' : 'light'} />
              <p className="text-sm text-text-muted mt-4">{t('landing.footerAbout')}</p>
              <p className="text-xs text-text-subtle mt-4">{t('landing.copyright')}</p>
            </div>
            <div>
              <h5 className="font-semibold text-text mb-4">Navigation</h5>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a href="#features" onClick={(e) => handleScroll(e, 'features')} className="hover:text-accent transition-colors">{t('landing.features')}</a></li>
                <li><a href="#showcase" onClick={(e) => handleScroll(e, 'showcase')} className="hover:text-accent transition-colors">{t('landing.appPreview')}</a></li>
                <li><a href="#faq" onClick={(e) => handleScroll(e, 'faq')} className="hover:text-accent transition-colors">{t('landing.faq')}</a></li>
                <li><a href="#how-it-works" onClick={(e) => handleScroll(e, 'how-it-works')} className="hover:text-accent transition-colors">{t('landing.howItWorks')}</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-text mb-4">About</h5>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
                <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-text mb-4">Legal</h5>
              <ul className="space-y-2 text-sm text-text-muted">
                <li><a href="#" className="hover:text-accent transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-accent transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-xs text-text-subtle text-center">
            <p>&copy; 2026 FarmSync. Farm management for Indian agriculture.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
