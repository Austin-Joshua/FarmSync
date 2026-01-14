import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { BearerStrategy } from 'passport-azure-ad';
import jwt from 'jsonwebtoken';
import db from '../config/database';

// OAuth Configuration
export const initializeOAuth = () => {
  // Google OAuth Configuration - Only initialize if credentials are provided
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  if (googleClientId) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: googleClientId,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
          callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:5174/api/auth/google/callback',
        },
      async (_accessToken: string, _refreshToken: string, profile: any, done: (err: any, user?: any) => void): Promise<void> => {
        try {
          const { id, emails, displayName, photos } = profile;
          const email = emails?.[0]?.value;
          const photoUrl = photos?.[0]?.value;

          // Check if user exists
          const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
          );

          if (Array.isArray(existingUser) && existingUser.length > 0) {
            // Update OAuth ID if not set
            const user = existingUser[0] as any;
            if (!user.google_id) {
              await db.query(
                'UPDATE users SET google_id = ? WHERE email = ?',
                [id, email]
              );
            }
            return done(null, user);
          }

          // Create new user
          const result = await db.query(
            'INSERT INTO users (name, email, google_id, photo_url, is_verified) VALUES (?, ?, ?, ?, ?)',
            [displayName, email, id, photoUrl, true]
          );

          const newUser = {
            id: (result as any).insertId,
            name: displayName,
            email,
            google_id: id,
            photo_url: photoUrl,
            is_verified: true,
          };

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
    )
    );
  }

  // Azure AD / Microsoft OAuth Configuration - Only initialize if credentials are provided
  const azureClientId = process.env.AZURE_CLIENT_ID;
  if (azureClientId) {
    passport.use(
      'azure-ad',
      new BearerStrategy(
        {
          identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
          clientID: azureClientId,
          clientSecret: process.env.AZURE_CLIENT_SECRET || '',
          callbackURL: process.env.AZURE_CALLBACK_URL || 'http://localhost:5174/api/auth/microsoft/callback',
      } as any,
      async (profile: any, done: (err: any, user?: any) => void): Promise<void> => {
        try {
          const { oid, upn, givenName, familyName, picture } = profile;
          const email = upn || profile.email;

          // Check if user exists
          const [existingUser] = await db.query(
            'SELECT * FROM users WHERE email = ?',
            [email]
          );

          if (Array.isArray(existingUser) && existingUser.length > 0) {
            const user = existingUser[0] as any;
            if (!user.microsoft_id) {
              await db.query(
                'UPDATE users SET microsoft_id = ? WHERE email = ?',
                [oid, email]
              );
            }
            return done(null, user);
          }

          // Create new user
          const displayName = `${givenName || ''} ${familyName || ''}`.trim();
          const result = await db.query(
            'INSERT INTO users (name, email, microsoft_id, photo_url, is_verified) VALUES (?, ?, ?, ?, ?)',
            [displayName, email, oid, picture, true]
          );

          const newUser = {
            id: (result as any).insertId,
            name: displayName,
            email,
            microsoft_id: oid,
            photo_url: picture,
            is_verified: true,
          };

          return done(null, newUser);
        } catch (error) {
          return done(error);
        }
      }
      )
    );
  }

  // Serialize user
  passport.serializeUser((user: any, done: (err: any, id?: number) => void): void => {
    done(null, user.id);
  });

  // Deserialize user
  passport.deserializeUser(async (id: number, done: (err: any, user?: any) => void): Promise<void> => {
    try {
      const [user] = await db.query(
        'SELECT * FROM users WHERE id = ?',
        [id]
      );
      if (Array.isArray(user) && user.length > 0) {
        done(null, user[0]);
      } else {
        done(null, null);
      }
    } catch (error) {
      done(error);
    }
  });
};

// Generate JWT Token
export const generateToken = (userId: number, email: string): string => {
  return jwt.sign(
    { userId, email },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '7d' }
  );
};

// Verify Apple Sign-In Token
export const verifyAppleToken = async (token: string): Promise<any> => {
  try {
    // Apple token verification would be done here
    // For now, we'll decode without verification (unsafe for production)
    const decoded = jwt.decode(token);
    return decoded;
  } catch (error) {
    throw new Error('Invalid Apple token');
  }
};

// Handle Apple Sign-In
export const handleAppleSignIn = async (appleData: { 
  user: any; 
  identityToken: string;
}): Promise<any> => {
  try {
    const { user, identityToken } = appleData;
    if (!user) return null;

    const { email, name } = user;
    const decoded = jwt.decode(identityToken) as { sub?: string } | null;
    const appleId = decoded?.sub || '';

    // Check if user exists
    const [existingUser] = await db.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUser) && existingUser.length > 0) {
      const dbUser = existingUser[0] as { apple_id?: string; id: number; email: string; name: string };
      if (!dbUser.apple_id) {
        await db.query(
          'UPDATE users SET apple_id = ? WHERE email = ?',
          [appleId, email]
        );
      }
      return dbUser;
    }

    // Create new user
    const displayName = `${name?.firstName || ''} ${name?.lastName || ''}`.trim();
    const [queryResult] = await db.query(
      'INSERT INTO users (name, email, apple_id, is_verified) VALUES (?, ?, ?, ?)',
      [displayName || email, email, appleId, true]
    );
    const result = queryResult as any;

    const newUser = {
      id: result.insertId,
      name: displayName || email,
      email,
      apple_id: appleId,
      is_verified: true,
    };

    return newUser;
  } catch (error) {
    throw new Error('Apple sign-in failed');
  }
};

};
