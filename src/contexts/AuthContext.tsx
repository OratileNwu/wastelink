import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
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
import { isValidEnabledActivities } from "../types";
import type { UserProfile } from "../types";
import { AuthContext } from "./auth-context";
import type { AuthContextValue, RegisterInput } from "./auth-context";

interface AuthProviderProps {
  children: ReactNode;
}

async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return snapshot.data() as UserProfile;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [firebaseUser, setFirebaseUser] = useState<import("firebase/auth").User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Prevent older profile requests from overwriting newer results.
  const profileRequestRef = useRef(0);

  // Keep the React state synchronized with Firebase authentication.
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
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
      } catch (profileError) {
        if (requestId === profileRequestRef.current) {
          setProfile(null);
          setError(
            profileError instanceof Error
              ? profileError.message
              : "Unable to load your profile.",
          );
        }
      } finally {
        if (requestId === profileRequestRef.current) {
          setLoading(false);
        }
      }
    });

    return unsubscribe;
  }, []);

  const register = useCallback(async (input: RegisterInput): Promise<void> => {
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
      await setDoc(doc(db, "users", credential.user.uid), newProfile);

      const savedProfile = await getUserProfile(credential.user.uid);

      if (!savedProfile) {
        throw new Error("The user profile could not be retrieved.");
      }

      profileRequestRef.current += 1;
      setFirebaseUser(credential.user);
      setProfile(savedProfile);
      setLoading(false);
      setError(null);
    } catch (profileSaveError) {
      try {
        await signOut(auth);
      } catch (signOutError) {
        throw new AggregateError(
          [profileSaveError, signOutError],
          "The WasteLink profile could not be saved, and signing out also failed. Check Firestore security rules and sign out before trying again.",
        );
      }

      throw new Error(
        "Your authentication account was created, but your WasteLink profile could not be saved. Check Firestore security rules before trying again.",
        { cause: profileSaveError },
      );
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<void> => {
    setError(null);
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    setError(null);
    await signOut(auth);
  }, []);

  const refreshProfile = useCallback(async (): Promise<UserProfile | null> => {
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
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Unable to refresh your profile.";

      if (requestId === profileRequestRef.current) {
        setError(message);
      }

      throw refreshError;
    } finally {
      if (requestId === profileRequestRef.current) {
        setLoading(false);
      }
    }
  }, [firebaseUser]);

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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
