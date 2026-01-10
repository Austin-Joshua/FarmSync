// Password strength indicator component
import { useTranslation } from 'react-i18next';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '../utils/passwordValidator';
import { Check, X } from 'lucide-react';
import ProgressBar from './ProgressBar';

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

const PasswordStrengthIndicator = ({ password, showRequirements = true }: PasswordStrengthIndicatorProps) => {
  const { t } = useTranslation();
  const validation = validatePassword(password);
  const progressValueCalc = (validation.score / 7) * 100;
  const progressValueNum = Number.isFinite(progressValueCalc) ? Math.max(0, Math.min(100, Math.round(progressValueCalc))) : 0;
  const progressValue = progressValueNum; // Explicit number for ARIA

  if (!password) {
    return null;
  }

  const requirements = [
    { test: password.length >= 8, text: t('auth.passwordRequirementMinLength') || 'At least 8 characters' },
    { test: /[A-Z]/.test(password), text: t('auth.passwordRequirementUppercase') || 'At least one uppercase letter (A-Z)' },
    { test: /[a-z]/.test(password), text: t('auth.passwordRequirementLowercase') || 'At least one lowercase letter (a-z)' },
    { test: /[0-9]/.test(password), text: t('auth.passwordRequirementNumber') || 'At least one number (0-9)' },
    { test: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password), text: t('auth.passwordRequirementSpecial') || 'At least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?~)' },
  ];

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('auth.passwordStrength') || 'Password Strength'}:
          </span>
          <span className={`text-sm font-semibold ${
            validation.strength === 'very-strong' ? 'text-green-600' :
            validation.strength === 'strong' ? 'text-green-500' :
            validation.strength === 'medium' ? 'text-yellow-600' :
            'text-red-600'
          }`}>
            {getPasswordStrengthText(validation.strength)}
          </span>
        </div>
        <ProgressBar
          value={progressValue}
          className="bg-gray-200 dark:bg-gray-700"
          barClassName={getPasswordStrengthColor(validation.strength)}
          aria-valuenow={progressValue}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Password strength: ${getPasswordStrengthText(validation.strength)}`}
        />
      </div>

      {/* Requirements List */}
      {showRequirements && (
        <div className="space-y-1.5">
          {requirements.map((req, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              {req.test ? (
                <Check size={16} className="text-green-600 flex-shrink-0" />
              ) : (
                <X size={16} className="text-red-500 flex-shrink-0" />
              )}
              <span className={req.test ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}>
                {req.text}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;
