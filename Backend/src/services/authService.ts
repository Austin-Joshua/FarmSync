import jwt from 'jsonwebtoken';
import { UserModel, User } from '../models/User';
import { config } from '../config/env';

export interface AuthTokens {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    location?: string;
    land_size?: number;
    soil_type?: string;
    picture_url?: string;
  };
}

export class AuthService {
  static generateToken(user: User): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }

  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async register(
    name: string,
    email: string,
    password: string,
    role: 'farmer' | 'admin',
    location?: string
  ): Promise<AuthTokens> {
    // Check if user already exists
    const existingUser = await UserModel.findByEmail(email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = await UserModel.create({
      name,
      email,
      password,
      role,
      location,
    });

    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        land_size: user.land_size,
        soil_type: user.soil_type,
      },
    };
  }

  static async login(email: string, password: string): Promise<AuthTokens> {
    // Find user by email (includes password_hash for verification)
    const user = await UserModel.findByEmail(email);
    if (!user) {
      // Don't reveal if email exists - security best practice
      throw new Error('Invalid email or password');
    }

    // Check if user has a password
    if (!user.password_hash) {
      throw new Error('Invalid email or password');
    }

    // Verify password matches the hash stored in database
    const isValid = await UserModel.verifyPassword(user, password);
    if (!isValid) {
      // Don't reveal if password is wrong or email doesn't exist - same error message
      throw new Error('Invalid email or password');
    }

    // Generate JWT token for authenticated user
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        location: user.location,
        land_size: user.land_size,
        soil_type: user.soil_type,
        picture_url: user.picture_url,
      },
    };
  }
}
