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
    console.log('AuthService.register called:', { name, email, role });
    
    try {
      // Check if user already exists
      console.log('Checking if user exists...');
      const existingUser = await UserModel.findByEmail(email);
      if (existingUser) {
        console.log('User already exists:', email);
        throw new Error('User with this email already exists');
      }
      console.log('User does not exist, proceeding with creation...');

      // Create new user
      console.log('Creating user...');
      const user = await UserModel.create({
        name,
        email,
        password,
        role,
        location,
      });
      console.log('User created successfully:', user.id);

      const token = this.generateToken(user);
      console.log('Token generated successfully');

      // Build user object with only available fields
      const userResponse: any = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      };

      // Add optional fields only if they exist
      if (user.location !== undefined) userResponse.location = user.location || null;
      if (user.land_size !== undefined) userResponse.land_size = user.land_size || null;
      if (user.soil_type !== undefined) userResponse.soil_type = user.soil_type || null;
      if (user.is_onboarded !== undefined) userResponse.is_onboarded = user.is_onboarded || false;

      console.log('Registration completed successfully');
      return {
        token,
        user: userResponse,
      };
    } catch (error: any) {
      console.error('Error in AuthService.register:', error);
      throw error;
    }
  }

  static async login(email: string, password: string): Promise<AuthTokens> {
    console.log('🟢 AuthService.login called for email:', email);
    // Find user by email (includes password_hash for verification)
    console.log('🟢 Calling UserModel.findByEmail...');
    const user = await UserModel.findByEmail(email);
    console.log('🟢 UserModel.findByEmail completed, user found:', !!user);
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

    // Build user object with only available fields
    const userResponse: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    // Add optional fields only if they exist
    if ('location' in user) userResponse.location = user.location || null;
    if ('land_size' in user) userResponse.land_size = user.land_size || null;
    if ('soil_type' in user) userResponse.soil_type = user.soil_type || null;
    if ('picture_url' in user) userResponse.picture_url = user.picture_url || null;
    if ('is_onboarded' in user) userResponse.is_onboarded = user.is_onboarded ?? false;

    return {
      token,
      user: userResponse,
    };
  }
}
