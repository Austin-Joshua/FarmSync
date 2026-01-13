import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { UserModel } from '../models/User';
import { AppError } from '../middleware/errorHandler';

export class TwoFactorService {
  /**
   * Generate a secret for 2FA setup
   */
  static generateSecret(userEmail: string, appName: string = 'FarmSync'): string {
    return speakeasy.generateSecret({
      name: `${appName} (${userEmail})`,
      length: 32,
    }).base32;
  }

  /**
   * Generate QR code data URL for 2FA setup
   */
  static async generateQRCode(secret: string, userEmail: string, appName: string = 'FarmSync'): Promise<string> {
    const otpAuthUrl = speakeasy.otpauthURL({
      secret,
      label: userEmail,
      issuer: appName,
      encoding: 'base32',
    });

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
      return qrCodeDataUrl;
    } catch (error) {
      throw new AppError('Failed to generate QR code', 500);
    }
  }

  /**
   * Verify TOTP token
   */
  static verifyToken(secret: string, token: string, window: number = 1): boolean {
    return speakeasy.totp.verify({
      secret,
      encoding: 'base32',
      token,
      window, // Allow tokens within ±1 time step
    });
  }

  /**
   * Generate backup codes (10 codes)
   */
  static generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < 10; i++) {
      // Generate 8-digit backup codes
      const code = Math.floor(10000000 + Math.random() * 90000000).toString();
      codes.push(code);
    }
    return codes;
  }

  /**
   * Verify backup code
   */
  static verifyBackupCode(backupCodes: string[], code: string): boolean {
    return backupCodes.includes(code);
  }

  /**
   * Remove used backup code
   */
  static removeBackupCode(backupCodes: string[], code: string): string[] {
    return backupCodes.filter(c => c !== code);
  }

  /**
   * Enable 2FA for user
   */
  static async enable2FA(userId: string, secret: string, backupCodes: string[]): Promise<void> {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await UserModel.update(userId, {
      two_factor_enabled: true,
      two_factor_secret: secret,
      two_factor_backup_codes: JSON.stringify(backupCodes),
    });
  }

  /**
   * Disable 2FA for user
   */
  static async disable2FA(userId: string): Promise<void> {
    await UserModel.update(userId, {
      two_factor_enabled: false,
      two_factor_secret: null,
      two_factor_backup_codes: null,
    });
  }

  /**
   * Verify 2FA token during login
   */
  static async verify2FAToken(userId: string, token: string): Promise<boolean> {
    const user = await UserModel.findById(userId);
    if (!user || !user.two_factor_enabled || !user.two_factor_secret) {
      return false;
    }

    // Try TOTP token first
    if (this.verifyToken(user.two_factor_secret, token)) {
      return true;
    }

    // Try backup codes
    if (user.two_factor_backup_codes) {
      const backupCodes = JSON.parse(user.two_factor_backup_codes);
      if (this.verifyBackupCode(backupCodes, token)) {
        // Remove used backup code
        const updatedCodes = this.removeBackupCode(backupCodes, token);
        await UserModel.update(userId, {
          two_factor_backup_codes: JSON.stringify(updatedCodes),
        });
        return true;
      }
    }

    return false;
  }
}
