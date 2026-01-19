// Login Page with Remember Me functionality
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        setSuccess(t('auth.loginSuccess') || 'Login successful! Redirecting...');
        
        // Handle remember me
        if (rememberMe) {
          // Store credentials securely (only email, not password)
          localStorage.setItem('rememberedEmail', email);
          // Extend token expiration to 30 days instead of default 7 days
          const token = localStorage.getItem('token');
          if (token) {
            // Token expiration is handled by backend, but we can store a flag
            localStorage.setItem('rememberMe', 'true');
          }
        } else {
          localStorage.removeItem('rememberedEmail');
          localStorage.removeItem('rememberMe');
        }
        
        // Check if user needs onboarding
        const userData = JSON.parse(localStorage.getItem('user') || '{}');
        const needsOnboarding = userData.role === 'farmer' && !userData.is_onboarded;
        
        setTimeout(() => {
          if (userData.role === 'admin') {
            navigate('/admin', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }, 1000);
      } else {
        setError(t('auth.loginError') || 'Login failed. Please check your credentials.');
      }
    } catch (err: any) {
      let errorMessage = t('auth.loginError') || 'Login failed';
      
      if (err?.message) {
        if (err.message.includes('Failed to connect') || 
            err.message.includes('fetch') || 
            err.message.includes('NetworkError') ||
            err.message.includes('Network request failed') ||
            err.message.includes('timed out') ||
            err.message.includes('Request timed out')) {
          errorMessage = 'Cannot connect to server. Please make sure the backend server is running on http://localhost:5174';
        } else if (err.message.includes('Invalid email or password') || 
                   err.message.includes('Invalid credentials') ||
                   err.status === 401) {
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (err.status === 400) {
          errorMessage = err.message || 'Please check your email and password format.';
        } else {
          errorMessage = err.message || 'An error occurred during login. Please try again.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Load remembered email on mount
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Green Header Bar - Surrounding Top */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 w-full h-3 shadow-md animate-fade-in"></div>

      {/* White Content Section */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 animate-fade-in-up">
        <div className="max-w-md w-full">
          {/* Title and Icon */}
          <div className="text-center mb-6 animate-slide-down">
            <div className="flex items-center gap-3 justify-center mb-4">
              <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg shadow-md relative transform transition-all duration-300 hover:scale-110 hover:rotate-3 hover:shadow-xl">
                <svg 
                  className="text-white w-8 h-8"
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 2L4 6L12 10L20 6L12 2Z" fill="currentColor" opacity="0.9"/>
                  <path d="M4 6L12 10L20 6L12 2L4 6Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M12 10V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M9 14L12 10L15 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                  <path d="M10 16L12 18L14 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
                <div className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="text-white w-2.5 h-2.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M9 3L11 1L9 -1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M11 1C10 4 8 6 5 6C2 6 1 4 1 1" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M3 9L1 11L3 13" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M1 11C2 8 4 6 7 6C10 6 11 8 11 11" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white transition-all duration-300 hover:scale-105">
                FarmSync
              </h1>
            </div>
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-8 animate-slide-up">
            <h2 className="text-2xl font-semibold text-gray-950 dark:text-gray-100 mb-2 transition-colors duration-300">
              Welcome Back
            </h2>
            <p className="text-gray-600 dark:text-gray-400 transition-colors duration-300">
              Sign in to your account to continue managing your farm
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700 transition-all duration-300 hover:shadow-2xl hover:scale-[1.01]">
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <p className="text-sm text-green-700 dark:text-green-400">{success}</p>
              </div>
            )}

            {/* Email Field */}
            <div className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-gray-600">
                  <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-200">
                Password
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors duration-200 group-focus-within:text-gray-600">
                  <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-gray-600 transition-colors duration-200" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 hover:border-gray-400 dark:hover:border-gray-500 hover:shadow-sm"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 transform hover:scale-110 active:scale-95"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <div className="flex items-center group cursor-pointer">
                <input
                  id="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded cursor-pointer transition-all duration-200 hover:scale-110"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300 cursor-pointer transition-colors duration-200 group-hover:text-gray-900 dark:group-hover:text-gray-100">
                  Remember me
                </label>
              </div>
              <Link
                to="/forgot-password"
                className="text-sm text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 font-medium transition-all duration-200 hover:underline underline-offset-2 transform hover:scale-105"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-md text-base font-semibold text-white bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] animate-fade-in"
              style={{ animationDelay: '0.4s' }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5 mr-2" />
                  Sign In
                </>
              )}
            </button>
            </form>

            {/* Sign Up Link */}
            <div className="mt-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
              <p className="text-sm text-gray-600 dark:text-gray-400 transition-colors duration-200">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100 transition-all duration-200 hover:underline underline-offset-2 transform inline-block hover:scale-105"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
