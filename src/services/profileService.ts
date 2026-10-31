import { getIdToken, reload, verifyBeforeUpdateEmail, type User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { isValidEnabledActivities } from "../types";
import type { UserProfile } from "../types";
import { db, storage } from "../config/firebase";

export type ProfileUpdate = Partial<Pick<UserProfile,
  "fullName" | "phoneNumber" | "location" | "enabledActivities" |
  "notificationPreferences" | "languagePreference" | "profileImageUrl"
>>;

export async function saveUserProfile(uid: string, changes: ProfileUpdate): Promise<void> {
  if (!uid) throw new Error("You must be signed in to update your profile.");
  if (changes.fullName !== undefined && !changes.fullName.trim()) throw new Error("Your full name cannot be empty.");
  if (changes.enabledActivities && !isValidEnabledActivities(changes.enabledActivities)) throw new Error("Select Seller, Buyer, or both.");
  await updateDoc(doc(db, "users", uid), { ...changes, updatedAt: serverTimestamp() });
}

export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  if (!uid) throw new Error("You must be signed in to upload a profile photo.");
  const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  if (!allowedTypes.has(file.type)) throw new Error("Use a JPEG, PNG or WebP profile photo.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Your profile photo must be 5 MB or smaller.");
  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const photoRef = ref(storage, `users/${uid}/profile/profile-${Date.now()}.${extension}`);
  await uploadBytes(photoRef, file, { contentType: file.type });
  return getDownloadURL(photoRef);
}

/** Sends a verification link; Firebase Auth changes the sign-in email after confirmation. */
export async function requestEmailChange(user: User, newEmail: string): Promise<void> {
  const email = newEmail.trim();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");
  if (email.toLowerCase() === (user.email ?? "").toLowerCase()) return;
  await verifyBeforeUpdateEmail(user, email);
}

/** Copies a confirmed Firebase Auth email into the matching Firestore user document. */
export async function syncVerifiedEmail(user: User): Promise<boolean> {
  await reload(user);
  await getIdToken(user, true);
  if (!user.email || !user.emailVerified) return false;
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  if (!snapshot.exists()) return false;
  const saved = snapshot.data() as UserProfile;
  if (saved.email === user.email && saved.emailVerified === true) return false;
  await updateDoc(userRef, { email: user.email, emailVerified: true, updatedAt: serverTimestamp() });
  return true;
}
