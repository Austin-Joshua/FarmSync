import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithCustomToken,
  signOut, 
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';
import { User, UserRole } from '../types';
import ApiService from '../services/api';

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
    // Safety timeout to prevent indefinite blank screen if Firebase fails to initialize
    const timeoutId = setTimeout(() => {
      console.warn('Firebase initialization timed out. Proceeding in offline/unauthenticated mode.');
      setLoading(false);
    }, 3000);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeoutId);
      try {
        if (firebaseUser) {
          // Fetch additional user data from Firestore
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              ...userDoc.data()
            } as User);
          } else {
            // Fallback if doc doesn't exist for some reason
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              name: firebaseUser.displayName || 'User',
              role: 'farmer'
            });
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Error in auth state change:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      if (err.code === 'auth/configuration-not-found') {
        throw new Error("FIREBASE_SETUP_REQUIRED: Authentication methods are not enabled. Please enable 'Email/Password' in your Firebase Console for project 'lunar-db-10d04'.");
      }
      throw err;
    }
  };

  const loginWithToken = async (token: string) => {
    await signInWithCustomToken(auth, token);
  };

  const loginWithGoogle = async () => {
    if (!auth) {
      throw new Error("AUTHENTICATION_UNINITIALIZED: Firebase not initialized.");
    }

    try {
      const provider = new GoogleAuthProvider();
      
      // Ensures the flow is fast and clean, always letting the user explicitly select their preferred account
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const userCredential = await signInWithPopup(auth, provider);
      
      const firebaseUser = userCredential.user;
      
      const userData = {
        name: firebaseUser.displayName || 'User',
        email: firebaseUser.email || '',
        role: 'farmer' as UserRole, // Default role
        is_onboarded: false,
        createdAt: new Date().toISOString(),
      };

      // Try to read existing data, but don't fail the whole login if Firestore isn't setup
      let userDocExists = false;
      let existingData = {};
      try {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        userDocExists = userDoc.exists();
        if (userDocExists) existingData = userDoc.data() || {};
      } catch (firestoreError) {
        console.warn("Firestore check skipped. Continuing login...", firestoreError);
      }

      if (!userDocExists) {
         try {
           await setDoc(doc(db, 'users', firebaseUser.uid), userData);
         } catch (e) {
           console.warn("Could not save to Firestore. Operating in local Auth mode.", e);
         }
         
         // Try to sync with backend optionally
         try {
           await ApiService.register(userData.name, userData.email, 'oauth2_user', 'farmer');
         } catch(e) {}
         
         setUser({
           id: firebaseUser.uid,
           ...userData
         } as User);
      } else {
         // If it exists, update the local session state immediately so navigation doesn't bounce back
         setUser({
           id: firebaseUser.uid,
           email: firebaseUser.email!,
           ...existingData
         } as User);
      }
    } catch (err: any) {
      console.error("Google Auth Error:", err);
      if (err.code === 'auth/configuration-not-found' || err.code === 'auth/provider-already-linked' || err.message?.includes('network')) {
        throw new Error("FIREBASE_SETUP_REQUIRED: Google Provider is not fully enabled in the console or your domain is not whitelisted.");
      }
      throw err;
    }
  };

  const register = async (name: string, email: string, password: string, role: UserRole, metadata: any = {}) => {
    if (!auth) {
      throw new Error("AUTHENTICATION_UNINITIALIZED: The initialization service is offline. Please check your network or Firebase configuration.");
    }

    let firebaseUser = null;

    try {
      // 1. Create in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      firebaseUser = userCredential.user;

      // 2. Update Firebase Profile
      await updateProfile(firebaseUser, { displayName: name });
    } catch (err: any) {
      console.error('Firebase Auth failed:', err);
      
      // Specifically handle configuration errors
      if (err.code === 'auth/configuration-not-found') {
        throw new Error("FIREBASE_SETUP_REQUIRED: Authentication methods are not enabled. Please enable 'Email/Password' in your Firebase Console for project 'lunar-db-10d04'.");
      }
      throw err;
    }

    const userData = {
      name,
      email,
      role,
      is_onboarded: false,
      createdAt: new Date().toISOString(),
      ...metadata
    };

    // 3. Save to Firestore (Simultaneous Cloud Save)
    if (firebaseUser) {
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    }
    
    // 4. Save to Backend Database (Simultaneous Backend Sync)
    // We execute this even if Firestore is slow, to ensure multi-db persistence
    try {
      await ApiService.register(name, email, password, role, metadata);
      console.log('Backend sync successful');
    } catch (apiError) {
      console.error('Backend sync failed:', apiError);
    }

    // 5. Update local state
    if (firebaseUser) {
      setUser({
        id: firebaseUser.uid,
        ...userData
      } as User);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateUser = async (partialUser: Partial<User>) => {
    if (!user) return;
    
    const updatedUser = { ...user, ...partialUser };
    const { id, ...updateData } = updatedUser;
    
    await setDoc(doc(db, 'users', id), updateData, { merge: true });
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
