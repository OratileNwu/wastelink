import { useEffect, useState } from "react";
import ProfileSettings from "./pages/ProfileSettings";
import type { ProfileSettingsData } from "./types/profile";
import {
  defaultProfile,
  loadProfile,
  loadProfilePhoto,
  saveProfile,
  saveProfilePhoto,
} from "./services/profileStorage";

function App() {
  const [profile, setProfile] = useState<ProfileSettingsData>(defaultProfile);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    let photoUrl = "";

    const initialise = async () => {
      const storedProfile = loadProfile();

      try {
        photoUrl = await loadProfilePhoto();
      } catch {
        // Profile details remain available if browser photo storage is unavailable.
      }

      if (!cancelled) {
        setProfile({ ...storedProfile, profileImageUrl: photoUrl });
        setLoading(false);
      } else if (photoUrl) {
        URL.revokeObjectURL(photoUrl);
      }
    };

    initialise();

    return () => {
      cancelled = true;
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, []);

  const handleSave = async (changes: Partial<ProfileSettingsData>) => {
    const updatedProfile: ProfileSettingsData = {
      ...profile,
      ...changes,
      location: { ...profile.location, ...changes.location },
      notificationPreferences: {
        ...profile.notificationPreferences,
        ...changes.notificationPreferences,
      },
      updatedAt: new Date(),
    };

    saveProfile(updatedProfile);
    setProfile(updatedProfile);
  };

  const handlePhotoSelected = async (file: File) => {
    const photoUrl = await saveProfilePhoto(file);
    return photoUrl;
  };

  if (loading) {
    return (
      <main className="profile-page">
        <div className="profile-content" role="status">Loading your WasteLink profile...</div>
      </main>
    );
  }

  return (
    <ProfileSettings
      profile={profile}
      onSave={handleSave}
      onPhotoSelected={handlePhotoSelected}
    />
  );
}

export default App;
