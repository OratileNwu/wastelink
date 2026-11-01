import { doc, serverTimestamp, updateDoc } from "firebase/firestore";
import { isValidEnabledActivities } from "../types";
import type { UserProfile } from "../types";
import { db } from "../config/firebase";

export type ProfileUpdate = Partial<Pick<UserProfile, "fullName" | "phoneNumber" | "location" | "enabledActivities">>;

export async function saveUserProfile(uid: string, changes: ProfileUpdate): Promise<void> {
  if (!uid) throw new Error("You must be signed in to update your profile.");
  if (changes.fullName !== undefined && !changes.fullName.trim()) {
    throw new Error("Your full name cannot be empty.");
  }
  if (changes.enabledActivities && !isValidEnabledActivities(changes.enabledActivities)) {
    throw new Error("Select Seller, Buyer, or both.");
  }
  await updateDoc(doc(db, "users", uid), {
    ...changes,
    updatedAt: serverTimestamp(),
  });
}
