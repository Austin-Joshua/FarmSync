import { describe, it, expect } from 'vitest';
import { validatePassword } from './passwordValidator';

describe('validatePassword', () => {
  it('rejects passwords that are too short', () => {
    const result = validatePassword('Ab1!');
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters long');
  });

  it('rejects passwords missing required character classes', () => {
    const result = validatePassword('password123');
    expect(result.isValid).toBe(false);
    expect(result.errors.some((error) => error.includes('uppercase'))).toBe(true);
    expect(result.errors.some((error) => error.includes('special character'))).toBe(true);
  });

  it('accepts strong valid passwords', () => {
    const result = validatePassword('FarmSync!2026');
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.strength).toBe('strong');
  });
});
