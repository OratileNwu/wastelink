import { createContext } from "react";
import type { User } from "firebase/auth";
import type { UserActivity, UserProfile } from "../types";

export interface RegisterInput {
  fullName: string;
  email: string;
  password: string;
  enabledActivities: UserActivity[];
}

export interface AuthContextValue {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  register: (input: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<UserProfile | null>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
