import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import ApiService from '../services/api';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string, refreshToken?: string) => Promise<void>;
  loginWithOtp: (phone: string, otp: string, name?: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, metadata?: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partialUser: Partial<User>) => Promise<void>;
  loginWithGoogle: (email?: string, name?: string, role?: UserRole) => Promise<void>;
  loginWithMicrosoft: (email?: string, name?: string, role?: UserRole) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Race a promise against a timeout — prevents backend cold-start from blocking login.
// Must be outside the component to avoid TSX generic <T> ambiguity.
function withTimeout<T,>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out')), ms)
    ),
  ]);
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (savedToken && savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (error) {
          console.error('Failed to parse cached user:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }

      // Stop blocking initial mount immediately
      setLoading(false);

      // Verify session integrity with backend in the background
      if (savedToken && savedUser) {
        try {
          const profile = await ApiService.getProfile();
          if (profile) {
            const userProfile = profile as any as User;
            setUser(userProfile);
            localStorage.setItem('user', JSON.stringify(userProfile));
          } else {
            // Profile is invalid/empty, clear session
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        } catch (error) {
          console.error('Session verification failed, logging out:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: any = await ApiService.login(email, password);
      if (response && response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
        setUser(response.user);
      } else {
        throw new Error('Invalid server response structure');
      }
    } catch (err: any) {
      console.error('Backend Login failed:', err);
      throw err;
    }
  };

  const loginWithToken = async (token: string, refreshToken?: string) => {
    localStorage.setItem('token', token);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    try {
      const profile = await ApiService.getProfile();
      if (profile) {
        const userProfile = profile as any as User;
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
      }
    } catch (err) {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      throw err;
    }
  };

  const loginWithOtp = async (phone: string, otp: string, name?: string) => {
    const response: any = await ApiService.verifyOtp(phone, otp, name);
    if (response && response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
      setUser(response.user);
    } else {
      throw new Error('OTP verification failed');
    }
  };

  const mockGoogleLogin = async (mockEmail?: string, mockName?: string, mockRole?: UserRole) => {
    const email = mockEmail || 'farmer@farmsync.com';
    const name = mockName || 'Ravi Kumar';
    const role = mockRole || 'farmer';

    // Build an optimistic user immediately so the UI can navigate instantly
    const optimisticUser: User = {
      id: crypto.randomUUID() as any,
      name,
      email,
      role,
      createdAt: new Date().toISOString(),
    } as any;
    localStorage.setItem('user', JSON.stringify(optimisticUser));
    setUser(optimisticUser); // ← dashboard redirect fires immediately

    // Backend sync in background — don't await this before navigating
    (async () => {
      try {
        await withTimeout(ApiService.register(name, email, 'oauth2_user', role), 8000);
      } catch { /* already exists or timed out — fine */ }
      try {
        const response: any = await withTimeout(ApiService.login(email, 'oauth2_user'), 8000);
        if (response?.token && response?.user) {
          localStorage.setItem('token', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
          setUser(response.user);
        }
      } catch { /* backend unreachable — stay on optimistic user */ }
    })();
  };

  const loginWithGoogle = async (email?: string, name?: string, role?: UserRole) => {
    if (email) {
      await mockGoogleLogin(email, name, role);
      return;
    }

    if (!auth) {
      console.warn('Firebase not initialized, throwing configuration error');
      throw new Error('FIREBASE_NOT_INITIALIZED');
    }

    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const fEmail = firebaseUser.email || '';
      const fName = firebaseUser.displayName || 'Google User';

      // Set optimistic user immediately from Firebase data — navigates to dashboard instantly
      const optimisticUser: User = {
        id: crypto.randomUUID() as any,
        name: fName,
        email: fEmail,
        role: 'farmer',
        createdAt: new Date().toISOString(),
      } as any;
      localStorage.setItem('user', JSON.stringify(optimisticUser));
      setUser(optimisticUser); // ← triggers immediate dashboard redirect

      // Backend sync happens in background — doesn't block navigation
      (async () => {
        try {
          await withTimeout(ApiService.register(fName, fEmail, 'oauth2_user', 'farmer'), 8000);
        } catch { /* already exists or timed out */ }
        try {
          const response: any = await withTimeout(ApiService.login(fEmail, 'oauth2_user'), 8000);
          if (response?.token && response?.user) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));
            if (response.refreshToken) localStorage.setItem('refreshToken', response.refreshToken);
            setUser(response.user);
          }
        } catch { /* backend unreachable — stay on optimistic user */ }
      })();
    } catch (err: any) {
      console.error('Google login failed:', err);
      throw err; // Propagate error so OAuthSignIn can open mock account chooser modal
    }
  };

  const loginWithMicrosoft = async (email?: string, name?: string, role?: UserRole) => {
    // For local Microsoft login, we simulate using mock credentials
    await mockGoogleLogin(email || 'farmer@farmsync.com', name || 'Ravi Kumar', role || 'farmer');
  };

  const register = async (name: string, email: string, password: string, role: UserRole, metadata: any = {}) => {
    try {
      // Create user directly on local relational database
      await ApiService.register(name, email, password, role, metadata);
      // Auto login after successful registration
      await login(email, password);
    } catch (err: any) {
      console.error('Backend Registration failed:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken') || undefined;
      await ApiService.logout(refreshToken);
    } catch (e) {
      // Ignore if logout API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  const updateUser = async (partialUser: Partial<User>) => {
    if (!user) return;
    try {
      const updatedUser = { ...user, ...partialUser };
      await ApiService.updateProfile(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
    } catch (err) {
      console.error('Profile update failed:', err);
      throw err;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        loginWithToken,
        loginWithOtp,
        loginWithGoogle,
        loginWithMicrosoft,
        register,
        logout,
        updateUser,
        isAuthenticated: !!user,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
