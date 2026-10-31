import type { ProfileSettingsData } from "../types/profile";

const PROFILE_STORAGE_KEY = "wastelink.profile-settings.v1";
const PHOTO_DATABASE = "wastelink-profile-media";
const PHOTO_STORE = "media";
const PHOTO_KEY = "profile-photo";

export const defaultProfile: ProfileSettingsData = {
  uid: "local-demo-user",
  fullName: "",
  email: "",
  phoneNumber: "",
  profileImageUrl: "",
  location: {
    streetAddress: "",
    suburb: "",
    postalCode: "",
    city: "",
    province: "",
    country: "South Africa",
  },
  enabledActivities: ["seller"],
  accountStatus: "pending_verification",
  emailVerified: false,
  phoneVerified: false,
  notificationPreferences: {
    emailNotifications: true,
    collectionUpdates: true,
    transactionUpdates: true,
    offerNotifications: true,
  },
  languagePreference: "English",
  createdAt: new Date(),
  updatedAt: null,
};

function openPhotoDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("This browser does not support local photo storage."));
      return;
    }

    const request = indexedDB.open(PHOTO_DATABASE, 1);
    request.onupgradeneeded = () => {
      const database = request.result;
      if (!database.objectStoreNames.contains(PHOTO_STORE)) {
        database.createObjectStore(PHOTO_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open photo storage."));
  });
}

export function loadProfile(): ProfileSettingsData {
  if (typeof window === "undefined") return defaultProfile;

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!raw) return defaultProfile;

    const saved = JSON.parse(raw) as Partial<ProfileSettingsData>;
    return {
      ...defaultProfile,
      ...saved,
      profileImageUrl: "",
      location: { ...defaultProfile.location, ...saved.location },
      notificationPreferences: {
        ...defaultProfile.notificationPreferences,
        ...saved.notificationPreferences,
      },
      enabledActivities: Array.isArray(saved.enabledActivities)
        ? saved.enabledActivities.filter(activity => activity === "seller" || activity === "buyer")
        : defaultProfile.enabledActivities,
      createdAt: saved.createdAt ? new Date(saved.createdAt) : defaultProfile.createdAt,
      updatedAt: saved.updatedAt ? new Date(saved.updatedAt) : null,
    };
  } catch {
    return defaultProfile;
  }
}

export function saveProfile(profile: ProfileSettingsData): void {
  const profileToStore = {
    ...profile,
    profileImageUrl: "",
    updatedAt: new Date(),
  };
  window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileToStore));
}

export async function saveProfilePhoto(file: File): Promise<string> {
  const database = await openPhotoDatabase();

  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(PHOTO_STORE, "readwrite");
      transaction.objectStore(PHOTO_STORE).put(file, PHOTO_KEY);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error ?? new Error("Could not save the photo."));
      transaction.onabort = () => reject(transaction.error ?? new Error("Photo storage was interrupted."));
    });
  } finally {
    database.close();
  }

  return URL.createObjectURL(file);
}

export async function loadProfilePhoto(): Promise<string> {
  const database = await openPhotoDatabase();

  try {
    const photo = await new Promise<Blob | undefined>((resolve, reject) => {
      const transaction = database.transaction(PHOTO_STORE, "readonly");
      const request = transaction.objectStore(PHOTO_STORE).get(PHOTO_KEY);
      request.onsuccess = () => resolve(request.result as Blob | undefined);
      request.onerror = () => reject(request.error ?? new Error("Could not load the saved photo."));
    });

    return photo ? URL.createObjectURL(photo) : "";
  } finally {
    database.close();
  }
}
