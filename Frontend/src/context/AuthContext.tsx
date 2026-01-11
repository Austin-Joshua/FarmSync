// Authentication Context for managing user state
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  googleLogin: (idToken: string) => Promise<boolean>;
  appleLogin: (idToken: string, userData?: { name?: string; email?: string }) => Promise<boolean>;
  microsoftLogin: (accessToken: string) => Promise<boolean>;
  register: (name: string, email: string, password: string, role: UserRole) => Promise<boolean>;
  updateUser: (updates: { name?: string; location?: string; land_size?: number; soil_type?: string; picture_url?: string }) => Promise<boolean>;
  uploadProfilePicture: (file: File) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage for persisted user
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [hasTriedAutoLogin, setHasTriedAutoLogin] = useState(false);

  // Auto-login with test credentials if no user is found (only once on mount)
  useEffect(() => {
    const autoLogin = async () => {
      // Only auto-login if no user is saved, no token exists, and we haven't tried yet
      const savedUser = localStorage.getItem('user');
      const savedToken = localStorage.getItem('token');
      
      if (!savedUser && !savedToken && !hasTriedAutoLogin) {
        setHasTriedAutoLogin(true);
        try {
          // Wait a bit for backend to be ready
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // Try to auto-login with test farmer credentials
          const response = await api.login('farmer@test.com', 'farmer123');
          if (response.user) {
            const userData: User = {
              id: response.user.id,
              name: response.user.name,
              email: response.user.email,
              role: response.user.role,
              location: response.user.location,
              land_size: response.user.land_size,
              soil_type: response.user.soil_type,
              picture_url: response.user.picture_url,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            if (response.token) {
              localStorage.setItem('token', response.token);
            }
            console.log('Auto-login successful');
          }
        } catch (error: any) {
          // If auto-login fails, user will need to login manually
          console.log('Auto-login failed:', error?.message || 'Unknown error');
          // Don't show error to user, just let them login manually
        }
      }
    };

    autoLogin();
  }, [hasTriedAutoLogin]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.login(email, password);
      if (response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          location: response.user.location,
          land_size: response.user.land_size,
          soil_type: response.user.soil_type,
          picture_url: response.user.picture_url,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const googleLogin = async (idToken: string): Promise<boolean> => {
    try {
      const response = await api.googleLogin(idToken);
      if (response.user && response.token) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          location: response.user.location,
          land_size: response.user.land_size,
          soil_type: response.user.soil_type,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.token);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  const appleLogin = async (idToken: string, userData?: { name?: string; email?: string }): Promise<boolean> => {
    try {
      const response = await api.appleLogin(idToken, userData);
      if (response.user && response.token) {
        const userDataObj: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          location: response.user.location,
          land_size: response.user.land_size,
          soil_type: response.user.soil_type,
          picture_url: response.user.picture_url,
        };
        setUser(userDataObj);
        localStorage.setItem('user', JSON.stringify(userDataObj));
        localStorage.setItem('token', response.token);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Apple login error:', error);
      throw error;
    }
  };

  const microsoftLogin = async (accessToken: string): Promise<boolean> => {
    try {
      const response = await api.microsoftLogin(accessToken);
      if (response.user && response.token) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          location: response.user.location,
          land_size: response.user.land_size,
          soil_type: response.user.soil_type,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', response.token);
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Microsoft login error:', error);
      throw error;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string,
    role: UserRole
  ): Promise<boolean> => {
    try {
      const response = await api.register(name, email, password, role);
      if (response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          location: response.user.location,
          land_size: response.user.land_size,
          soil_type: response.user.soil_type,
          picture_url: response.user.picture_url,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        if (response.token) {
          localStorage.setItem('token', response.token);
        }
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const updateUser = async (updates: { name?: string; location?: string; land_size?: number; soil_type?: string; picture_url?: string }): Promise<boolean> => {
    try {
      const response = await api.updateProfile(updates);
      if (response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          location: response.user.location || undefined,
          land_size: response.user.land_size || undefined,
          soil_type: response.user.soil_type || undefined,
          picture_url: response.user.picture_url || undefined,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const uploadProfilePicture = async (file: File): Promise<boolean> => {
    try {
      const response = await api.uploadProfilePicture(file);
      if (response.user) {
        const userData: User = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          location: response.user.location || undefined,
          land_size: response.user.land_size || undefined,
          soil_type: response.user.soil_type || undefined,
          picture_url: response.user.picture_url || undefined,
        };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        googleLogin,
        appleLogin,
        microsoftLogin,
        register,
        updateUser,
        uploadProfilePicture,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
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

