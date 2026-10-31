export type Activity = "seller" | "buyer" | "transporter";

export type AccountStatus =
  | "active"
  | "suspended"
  | "pending_verification";

export interface Address {
  streetAddress?: string;
  suburb?: string;
  city: string;
  province: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  collectionUpdates: boolean;
  transactionUpdates: boolean;
  offerNotifications: boolean;
}

export interface ProfileSettingsData {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  profileImageUrl?: string;
  location: Address;
  enabledActivities: Activity[];
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  notificationPreferences: NotificationPreferences;
  languagePreference: string;
  createdAt: Date | null;
  updatedAt: Date | null;
}
