// Authentication Context for managing user state
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
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

  // Check for existing saved user session on mount
  useEffect(() => {
    // User should register/login with their own credentials
    // No auto-login with test credentials - users must create accounts through registration
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      // User already has a session, restore it
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } catch (error) {
        // Invalid saved data, clear it
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

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
          is_onboarded: response.user.is_onboarded ?? false,
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
          is_onboarded: response.user.is_onboarded ?? false,
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
          is_onboarded: response.user.is_onboarded ?? false,
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
          is_onboarded: response.user.is_onboarded ?? false,
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

