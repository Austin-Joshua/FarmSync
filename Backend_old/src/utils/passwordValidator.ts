// Password validation utility
export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

export const validatePassword = (password: string): PasswordValidationResult => {
  const errors: string[] = [];
  
  // Minimum length check
  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  
  // Uppercase letter check
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  
  // Lowercase letter check
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  
  // Number check
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  
  // Special character check
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*()_+-=[]{};\':"|,.<>/?~`)');
  }
  
  // Calculate password strength
  let strength: 'weak' | 'medium' | 'strong' | 'very-strong' = 'weak';
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  if (password.length >= 16) score += 1;
  
  if (score >= 6 && errors.length === 0) {
    strength = 'very-strong';
  } else if (score >= 5 && errors.length === 0) {
    strength = 'strong';
  } else if (score >= 3) {
    strength = 'medium';
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
};

export const getPasswordStrengthColor = (strength: string): string => {
  switch (strength) {
    case 'very-strong':
      return 'bg-green-500';
    case 'strong':
      return 'bg-green-400';
    case 'medium':
      return 'bg-yellow-500';
    case 'weak':
      return 'bg-red-500';
    default:
      return 'bg-gray-300';
  }
};

export const getPasswordStrengthText = (strength: string): string => {
  switch (strength) {
    case 'very-strong':
      return 'Very Strong';
    case 'strong':
      return 'Strong';
    case 'medium':
      return 'Medium';
    case 'weak':
      return 'Weak';
    default:
      return 'Enter Password';
  }
};
