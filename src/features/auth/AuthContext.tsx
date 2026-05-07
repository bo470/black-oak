import * as React from "react";
import { onAuthStateChanged, User, signOut as firebaseSignOut, signInAnonymously as firebaseSignInAnonymously } from "firebase/auth";
import { doc, onSnapshot, updateDoc, setDoc } from "firebase/firestore";
import { auth, db, handleFirestoreError, OperationType } from "@/src/firebase";
import { UserProfile } from "@/src/types";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
  updateProfile: async () => {},
  signInAnonymously: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<UserProfile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isAuthReady, setIsAuthReady] = React.useState(false);

  React.useEffect(() => {
    // Initial theme check from localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthReady(true);
      
      if (!currentUser) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  React.useEffect(() => {
    if (profile?.theme) {
      localStorage.setItem('theme', profile.theme);
      if (profile.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [profile?.theme]);

  React.useEffect(() => {
    if (!user) return;

    const path = `users/${user.uid}`;
    const unsubscribeProfile = onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as UserProfile);
        setLoading(false);
      } else if (user.isAnonymous) {
        // Create a temporary profile for anonymous users if it doesn't exist
        const guestProfile: UserProfile = {
          uid: user.uid,
          email: "guest@blackoak.demo",
          firstName: "Guest",
          lastName: "Trader",
          fullName: "Guest Trader",
          city: "Demo City",
          photoURL: null,
          traderTypes: ["Intraday"],
          marketPreferences: ["Stocks"],
          experienceLevel: "Beginner",
          goals: ["Explore Features"],
          currency: "USD",
          language: "en-US",
          theme: "dark",
          onboardingCompleted: true,
          plan: "FREE",
          subscriptionStatus: "active",
          createdAt: Date.now(),
        };
        
        // We don't necessarily have to save it to Firestore immediately, 
        // but it helps with consistency across the app.
        setDoc(doc(db, "users", user.uid), guestProfile).catch(err => {
           handleFirestoreError(err, OperationType.CREATE, path);
        });
        
        setProfile(guestProfile);
        setLoading(false);
      } else {
        setProfile(null);
        setLoading(false);
      }
    }, (error) => {
      setLoading(false);
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribeProfile();
  }, [user]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user) return;
    const path = `users/${user.uid}`;
    try {
      // Filter out undefined values as Firestore doesn't support them
      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== undefined)
      );
      await updateDoc(doc(db, "users", user.uid), cleanData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const signInAnonymously = async () => {
    try {
      await firebaseSignInAnonymously(auth);
    } catch (error) {
      console.error("Failed to sign in anonymously:", error);
      throw error;
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady, updateProfile, signInAnonymously, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => React.useContext(AuthContext);
