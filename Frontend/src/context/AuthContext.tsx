import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import ApiService, { AUTH_TOKEN_STORAGE_KEY } from '../services/api';
import { BACKEND_ORIGIN } from '../config/api';

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
    const initializeSession = async () => {
      const token = localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const profile = await ApiService.getProfile();
        setUser(profile as User);
      } catch (error) {
        console.warn('Session restore failed, clearing token.', error);
        localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await ApiService.login(email, password);
    const token = response?.token;
    const backendUser = response?.user;

    if (!token || !backendUser) {
      throw new Error('Invalid login response from server.');
    }

    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    setUser({
      id: String(backendUser.id),
      name: backendUser.name,
      email: backendUser.email,
      role: backendUser.role,
      location: backendUser.location,
      land_size: backendUser.landSize,
      soil_type: backendUser.soilType,
      picture_url: backendUser.pictureUrl,
    });
  };

  const loginWithToken = async (token: string) => {
    localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, token);
    const profile = await ApiService.getProfile();
    setUser({
      ...(profile as User),
      id: String((profile as User).id),
    });
  };

  const loginWithGoogle = async () => {
    window.location.href = `${BACKEND_ORIGIN}/oauth2/authorization/google`;
  };

  const register = async (name: string, email: string, password: string, role: UserRole, metadata: any = {}) => {
    const userData: Record<string, any> = {
      name,
      email,
      role,
      password,
      ...metadata
    };
    
    Object.keys(userData).forEach((key) => {
      if (userData[key] === undefined || userData[key] === null || userData[key] === '') {
        delete userData[key];
      }
    });

    // backend expects camelCase for these fields
    if (userData.land_size !== undefined) {
      userData.landSize = userData.land_size;
      delete userData.land_size;
    }
    if (userData.soil_type !== undefined) {
      userData.soilType = userData.soil_type;
      delete userData.soil_type;
    }

    await ApiService.register(name, email, password, role, userData);
    await login(email, password);
  };

  const logout = async () => {
    localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
    setUser(null);
  };

  const updateUser = async (partialUser: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...partialUser };
    await ApiService.updateProfile(partialUser);
    setUser(updatedUser);
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
