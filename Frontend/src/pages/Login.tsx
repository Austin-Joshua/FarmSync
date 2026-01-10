// Login page component with Google OAuth
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LogIn, Mail, Lock, Chrome } from 'lucide-react';
import Logo from '../components/Logo';

const Login = () => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        setSuccess(t('auth.loginSuccess') + '! Redirecting...');
        setTimeout(() => navigate('/dashboard'), 1000);
      } else {
        setError(t('auth.loginError'));
      }
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || err?.message || t('auth.loginError');
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setSuccess('');
    setGoogleLoading(true);

    try {
      // Note: For production, integrate with Google OAuth 2.0
      // This is a placeholder - you'll need to implement Google Sign-In
      // For now, show a message that Google OAuth needs to be configured
      setError('Google OAuth integration requires configuration. ' + t('auth.orContinueEmail'));
      setGoogleLoading(false);
      
      // Uncomment below when Google OAuth is configured:
      // const { idToken } = await signInWithGoogle();
      // const response = await api.googleLogin(idToken);
      // if (response.user) {
      //   setSuccess('Google login successful! Redirecting...');
      //   setTimeout(() => navigate('/dashboard'), 1000);
      // }
    } catch (err: any) {
      setError(err.message || 'Google authentication failed. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-green-50 to-earth-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="default" variant="light" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {t('auth.welcomeBack')}
          </h1>
          <p className="text-gray-600">{t('auth.signInAccount')}</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={googleLoading || loading}
            className="w-full mb-6 flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome size={20} className="text-red-500" />
            <span className="text-gray-700 font-medium">
              {googleLoading ? t('auth.connecting') : t('auth.continueGoogle')}
            </span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">{t('auth.orContinueEmail')}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.emailAddress')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field pl-10"
                  placeholder="Enter any email or username"
                  required
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder={t('auth.enterPassword')}
                  required
                  disabled={loading || googleLoading}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} />
              {loading ? t('auth.signingIn') : t('auth.signIn')}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              {t('auth.dontHaveAccount')}{' '}
              <Link to="/register" className="text-primary-600 font-medium hover:text-primary-700">
                {t('auth.createAccount')}
              </Link>
            </p>
          </div>

          {/* Demo credentials hint */}
          <div className="mt-4 p-3 bg-primary-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              💡 {t('auth.demoHint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

