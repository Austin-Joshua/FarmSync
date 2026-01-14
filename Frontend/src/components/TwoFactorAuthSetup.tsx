import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, X, Copy, Download, Key, AlertCircle } from 'lucide-react';
import api from '../services/api';

interface TwoFactorAuthSetupProps {
  user2FAEnabled?: boolean;
  on2FAEnabled: () => void;
  on2FADisabled: () => void;
}

const TwoFactorAuthSetup: React.FC<TwoFactorAuthSetupProps> = ({
  user2FAEnabled = false,
  on2FAEnabled,
  on2FADisabled,
}) => {
  const [step, setStep] = useState<'setup' | 'verify' | 'success' | 'disabled'>(
    user2FAEnabled ? 'disabled' : 'setup'
  );
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState<string>('');
  const [qrCode, setQrCode] = useState<string>('');
  const [verificationToken, setVerificationToken] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');

  useEffect(() => {
    if (user2FAEnabled) {
      setStep('disabled');
    }
  }, [user2FAEnabled]);

  const handleSetup = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.setup2FA();
      if (response.data) {
        setSecret(response.data.secret);
        setQrCode(response.data.qrCode);
        setStep('verify');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationToken || verificationToken.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await api.verifyAndEnable2FA(secret, verificationToken);
      if (response.data) {
        setBackupCodes(response.data.backupCodes);
        setStep('success');
        setShowBackupCodes(true);
        on2FAEnabled();
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!disablePassword) {
      setError('Password is required to disable 2FA');
      return;
    }

    setLoading(true);
    setError('');
    try {
      await api.disable2FA(disablePassword);
      setStep('setup');
      setDisablePassword('');
      setError('');
      on2FADisabled();
    } catch (err: any) {
      setError(err?.message || 'Failed to disable 2FA. Please check your password.');
    } finally {
      setLoading(false);
    }
  };

  const copyBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    navigator.clipboard.writeText(codesText);
    alert('Backup codes copied to clipboard!');
  };

  const downloadBackupCodes = () => {
    const codesText = backupCodes.join('\n');
    const blob = new Blob([codesText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'farmSync-2fa-backup-codes.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (step === 'setup') {
    return (
      <div className="space-y-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="text-blue-600 dark:text-blue-400 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                Two-Factor Authentication
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                Add an extra layer of security to your account. You'll need to enter a code from your
                authenticator app when logging in.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          </div>
        )}

        <button
          onClick={handleSetup}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Shield size={18} />
          {loading ? 'Setting up...' : 'Enable Two-Factor Authentication'}
        </button>
      </div>
    );
  }

  if (step === 'verify') {
    return (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Scan QR Code with Authenticator App
          </h3>

          {qrCode && (
            <div className="flex flex-col items-center gap-4 mb-6">
              <img src={qrCode} alt="QR Code" className="w-48 h-48 border-2 border-gray-200 dark:border-gray-700 rounded-lg" />
              <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                Scan this QR code with Google Authenticator, Authy, or any TOTP app
              </p>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Manual Entry Key (if QR code doesn't work)
            </label>
            <div className="flex items-center gap-2">
              <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm font-mono text-gray-900 dark:text-gray-100">
                {secret}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(secret);
                  alert('Secret copied to clipboard!');
                }}
                className="p-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                title="Copy secret to clipboard"
              >
                <Copy size={16} />
              </button>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter 6-digit verification code
            </label>
            <input
              type="text"
              value={verificationToken}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                setVerificationToken(value);
                setError('');
              }}
              className="w-full input-field text-center text-2xl tracking-widest font-mono"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <div className="flex items-center gap-2 text-red-800 dark:text-red-200 text-sm">
                <AlertCircle size={16} />
                {error}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleVerify}
              disabled={loading || verificationToken.length !== 6}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle size={18} />
              {loading ? 'Verifying...' : 'Verify and Enable'}
            </button>
            <button
              onClick={() => {
                setStep('setup');
                setVerificationToken('');
                setError('');
              }}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'success' && showBackupCodes) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                Two-Factor Authentication Enabled!
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200 mb-4">
                Your account is now protected with two-factor authentication.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
                  ⚠️ Save Your Backup Codes
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-3">
                  These codes can be used to access your account if you lose your authenticator device.
                  Store them in a safe place. Each code can only be used once.
                </p>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 mb-3">
                  <div className="grid grid-cols-2 gap-2 font-mono text-sm">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="text-gray-900 dark:text-gray-100">
                        {code}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={copyBackupCodes}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-yellow-300 dark:border-yellow-700 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                  >
                    <Copy size={14} />
                    Copy Codes
                  </button>
                  <button
                    onClick={downloadBackupCodes}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm border border-yellow-300 dark:border-yellow-700 rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 transition-colors"
                  >
                    <Download size={14} />
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setShowBackupCodes(false)}
          className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          I've Saved My Backup Codes
        </button>
      </div>
    );
  }

  if (step === 'disabled' || user2FAEnabled) {
    return (
      <div className="space-y-4">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle className="text-green-600 dark:text-green-400 mt-0.5" size={20} />
            <div className="flex-1">
              <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                Two-Factor Authentication Enabled
              </h3>
              <p className="text-sm text-green-800 dark:text-green-200">
                Your account is protected with two-factor authentication.
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-800 dark:text-red-200 text-sm">
              <AlertCircle size={16} />
              {error}
            </div>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-3">
            Disable Two-Factor Authentication
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Enter your password to disable 2FA. This will make your account less secure.
          </p>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                value={disablePassword}
                onChange={(e) => {
                  setDisablePassword(e.target.value);
                  setError('');
                }}
                className="w-full input-field"
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={handleDisable}
              disabled={loading || !disablePassword}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <X size={18} />
              {loading ? 'Disabling...' : 'Disable Two-Factor Authentication'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default TwoFactorAuthSetup;
