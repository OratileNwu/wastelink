import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import type { ReactNode } from "react";
import type { User } from "firebase/auth";

import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";

import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";

import { auth, db } from "../config/firebase";

import {
  isValidEnabledActivities,
} from "../types";

import type {
  UserActivity,
  UserProfile,
} from "../types";

// Registration input
interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  enabledActivities: UserActivity[];
}

// Authentication context values
interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;

  register: (input: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
);

interface AuthProviderProps {
  children: ReactNode;
}

async function getUserProfile(
  uid: string,
): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent older profile requests from overwriting newer results.
  const profileRequestRef = useRef(0);

  // Listen for Firebase authentication changes.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        const requestId = ++profileRequestRef.current;

        setFirebaseUser(user);
        setError(null);

        if (!user) {
          setProfile(null);
          setLoading(false);
          return;
        }

        setLoading(true);

        try {
          const userProfile = await getUserProfile(user.uid);

          if (requestId === profileRequestRef.current) {
            setProfile(userProfile);
          }
        } catch (err) {
          if (requestId === profileRequestRef.current) {
            setProfile(null);
            setError(
              err instanceof Error
                ? err.message
                : "Unable to load your profile.",
            );
          }
        } finally {
          if (requestId === profileRequestRef.current) {
            setLoading(false);
          }
        }
      },
    );

    return unsubscribe;
  }, []);

  // Register a new WasteLink user.
  const register = useCallback(
    async (input: RegisterInput): Promise<void> => {
      setError(null);

      if (!input.fullName.trim()) {
        throw new Error("Please enter your full name.");
      }

      if (!isValidEnabledActivities(input.enabledActivities)) {
        throw new Error("Please select Seller, Buyer, or both.");
      }

      const credential = await createUserWithEmailAndPassword(
        auth,
        input.email.trim(),
        input.password,
      );

      const newProfile = {
        uid: credential.user.uid,
        fullName: input.fullName.trim(),
        email: input.email.trim(),
        enabledActivities: input.enabledActivities,
        accountStatus: "active",
        hasCompletedOnboarding: false,
        emailVerified: credential.user.emailVerified,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      try {
        await setDoc(
          doc(db, "users", credential.user.uid),
          newProfile,
        );

        const savedProfile = await getUserProfile(
          credential.user.uid,
        );

        if (!savedProfile) {
          throw new Error("The user profile could not be retrieved.");
        }

        const requestId = ++profileRequestRef.current;

        setFirebaseUser(credential.user);
        setProfile(savedProfile);
        setLoading(false);

        if (requestId === profileRequestRef.current) {
          setError(null);
        }
      } catch (err) {
        await signOut(auth);

        throw new Error(
          "Your authentication account was created, but your WasteLink profile could not be saved. Check Firestore security rules before trying again.",
        );
      }
    },
    [],
  );

  // Sign in an existing user.
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      setError(null);

      await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password,
      );
    },
    [],
  );

  // Sign out the current user.
  const logout = useCallback(async (): Promise<void> => {
    setError(null);
    await signOut(auth);
  }, []);

  // Reload the current user's Firestore profile.
  const refreshProfile = useCallback(
    async (): Promise<UserProfile | null> => {
      if (!firebaseUser) {
        return null;
      }

      const requestId = ++profileRequestRef.current;

      setLoading(true);
      setError(null);

      try {
        const userProfile = await getUserProfile(firebaseUser.uid);

        if (requestId === profileRequestRef.current) {
          setProfile(userProfile);
        }

        return userProfile;
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Unable to refresh your profile.";

        if (requestId === profileRequestRef.current) {
          setError(message);
        }

        throw err;
      } finally {
        if (requestId === profileRequestRef.current) {
          setLoading(false);
        }
      }
    },
    [firebaseUser],
  );

  const value: AuthContextValue = {
    firebaseUser,
    profile,
    loading,
    error,
    register,
    login,
    logout,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Access authentication anywhere inside AuthProvider.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider.",
    );
  }

  return context;
}