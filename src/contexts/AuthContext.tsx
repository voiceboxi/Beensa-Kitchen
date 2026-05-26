import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  isFavorite: (recipeId: string) => boolean;
  toggleFavorite: (recipeId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currUser) => {
      setUser(currUser);
      if (currUser) {
        const userRef = doc(db, 'users', currUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          setProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
        } else {
          const newProfile: UserProfile = {
            id: currUser.uid,
            email: currUser.email || '',
            displayName: currUser.displayName || '',
            photoURL: currUser.photoURL || undefined,
            favoriteRecipes: [],
          };
          await setDoc(userRef, {
            email: newProfile.email,
            displayName: newProfile.displayName,
            photoURL: newProfile.photoURL,
            favoriteRecipes: newProfile.favoriteRecipes,
            createdAt: Date.now()
          });
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error("Login failed:", error);
      if (error.code === 'auth/popup-blocked') {
        alert("La fenêtre de connexion a été bloquée par votre navigateur. Veuillez ouvrir l'application dans un nouvel onglet.");
      }
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  const isFavorite = (recipeId: string) => {
    return profile?.favoriteRecipes.includes(recipeId) || false;
  };

  const toggleFavorite = async (recipeId: string) => {
    if (!profile || !user) return;
    const isFav = isFavorite(recipeId);
    let newFavs = [...profile.favoriteRecipes];
    if (isFav) {
      newFavs = newFavs.filter(id => id !== recipeId);
    } else {
      newFavs.push(recipeId);
    }
    setProfile(prev => prev ? { ...prev, favoriteRecipes: newFavs } : null);
    await setDoc(doc(db, 'users', user.uid), { favoriteRecipes: newFavs }, { merge: true });
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, isFavorite, toggleFavorite }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
