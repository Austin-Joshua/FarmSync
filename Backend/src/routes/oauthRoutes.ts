import { Router, Request, Response } from 'express';
import passport from 'passport';
import { generateToken, handleAppleSignIn } from '../services/oauthService';

const router = Router();

// Google OAuth Routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req: Request, res: Response): void => {
    const user = req.user as { id: number; email: string };
    const token = generateToken(user.id, user.email);
    
    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?token=${token}`);
  }
);

// Microsoft OAuth Routes
router.get(
  '/microsoft',
  passport.authenticate('azure-ad', {
    scope: ['profile', 'email', 'openid'],
  })
);

router.get(
  '/microsoft/callback',
  passport.authenticate('azure-ad', { failureRedirect: '/login' }),
  (req: Request, res: Response): void => {
    const user = req.user as { id: number; email: string };
    const token = generateToken(user.id, user.email);
    
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/dashboard?token=${token}`);
  }
);

// Apple Sign-In Route
router.post('/apple', async (req: Request, res: Response): Promise<void> => {
  try {
    const { user: appleUser, identityToken } = req.body as { 
      user: any; 
      identityToken: string;
    };

    const user = await handleAppleSignIn({
      user: appleUser,
      identityToken,
    });

    if (!user) {
      res.status(400).json({ message: 'Apple sign-in failed' });
      return;
    }

    const token = generateToken(user.id, user.email);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
