import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import ApiService from '../services/api';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../config/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithToken: (token: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: UserRole, metadata?: any) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (partialUser: Partial<User>) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
          // Verify session integrity with backend
          const profile = await ApiService.getProfile();
          if (profile) {
            const userProfile = profile as any as User;
            setUser(userProfile);
            localStorage.setItem('user', JSON.stringify(userProfile));
          }
        } catch (error) {
          console.error('Session verification failed, logging out:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response: any = await ApiService.login(email, password);
      if (response && response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error('Invalid server response structure');
      }
    } catch (err: any) {
      console.error('Backend Login failed:', err);
      throw err;
    }
  };

  const loginWithToken = async (token: string) => {
    localStorage.setItem('token', token);
    try {
      const profile = await ApiService.getProfile();
      if (profile) {
        const userProfile = profile as any as User;
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
      }
    } catch (err) {
      localStorage.removeItem('token');
      throw err;
    }
  };

  const mockGoogleLogin = async () => {
    const email = 'google-user@farmsync.com';
    const name = 'Farmer Bob';
    try {
      await ApiService.register(name, email, 'oauth2_user', 'farmer');
    } catch (err) {
      console.log('Mock registration skipped (user may already exist on backend).');
    }
    const response: any = await ApiService.login(email, 'oauth2_user');
    if (response && response.token && response.user) {
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      setUser(response.user);
    } else {
      throw new Error('Could not sync mock credentials with the backend server database');
    }
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      if (import.meta.env.MODE === 'development') {
        console.warn("Firebase not initialized, falling back to mock Google login in dev mode");
        await mockGoogleLogin();
        return;
      }
      throw new Error("AUTHENTICATION_UNINITIALIZED: Firebase Google authentication is not initialized. Please check your config parameters.");
    }
    
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: 'select_account'
      });
      
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      const email = firebaseUser.email || '';
      const name = firebaseUser.displayName || 'Google User';
      
      // Attempt registration on our Spring Boot local DB (ignore if they already exist)
      try {
        await ApiService.register(name, email, 'oauth2_user', 'farmer');
      } catch (err) {
        console.log('Registration skipped (user may already exist on backend).');
      }
      
      // Log in on backend to get local JWT
      const response: any = await ApiService.login(email, 'oauth2_user');
      if (response && response.token && response.user) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        setUser(response.user);
      } else {
        throw new Error('Could not sync user credentials with the backend server database');
      }
    } catch (err: any) {
      console.error('Google login failed:', err);
      if (import.meta.env.MODE === 'development') {
        console.warn("Firebase Google login failed, falling back to mock Google login in dev mode");
        await mockGoogleLogin();
        return;
      }
      throw err;
    }
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
      await ApiService.logout();
    } catch (e) {
      // Ignore if logout API call fails
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
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
        loginWithGoogle,
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
