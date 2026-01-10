import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
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
  private static googleClient: OAuth2Client | null = null;

  static getGoogleClient(): OAuth2Client {
    if (!this.googleClient) {
      this.googleClient = new OAuth2Client(
        config.google.clientId,
        config.google.clientSecret
      );
    }
    return this.googleClient;
  }

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
    const user = await UserModel.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (!user.password_hash) {
      throw new Error('Please use Google login for this account');
    }

    const isValid = await UserModel.verifyPassword(user, password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

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

  static async googleLogin(idToken: string): Promise<AuthTokens> {
    try {
      const client = this.getGoogleClient();
      const ticket = await client.verifyIdToken({
        idToken,
        audience: config.google.clientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error('Invalid Google token');
      }

      const { sub: googleId, email, name, picture } = payload;

      if (!email) {
        throw new Error('Email not provided by Google');
      }

      // Check if user exists with Google ID
      let user = await UserModel.findByGoogleId(googleId);

      if (!user) {
        // Check if user exists with email
        user = await UserModel.findByEmail(email);
        if (user) {
          // Update existing user with Google ID
          await UserModel.update(user.id, {
            google_id: googleId,
            picture_url: picture,
          });
          user = await UserModel.findById(user.id);
        } else {
          // Create new user
          user = await UserModel.create({
            name: name || 'User',
            email,
            role: 'farmer',
            google_id: googleId,
            picture_url: picture,
          });
        }
      }

      if (!user) {
        throw new Error('Failed to create or retrieve user');
      }

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
    } catch (error: any) {
      throw new Error(`Google authentication failed: ${error.message}`);
    }
  }
}
