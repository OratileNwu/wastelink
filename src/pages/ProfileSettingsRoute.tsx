import { useAuth } from "../contexts/useAuth";
import ProfileSettings from "./ProfileSettings";
import { saveUserProfile } from "../services/profileService";

export default function ProfileSettingsRoute() {
  const { firebaseUser, profile, loading, error, refreshProfile } = useAuth();

  if (loading) return <section className="profile-route-state" role="status">Loading your WasteLink account…</section>;
  if (!firebaseUser) return <section className="profile-route-state"><h1>Profile &amp; settings</h1><p>Sign in to manage your WasteLink profile.</p></section>;
  if (!profile) return <section className="profile-route-state" role="alert"><h1>Profile unavailable</h1><p>{error || "Your account does not have a WasteLink profile yet."}</p></section>;

  return (
    <ProfileSettings
      profile={profile}
      onSave={async (changes) => {
        await saveUserProfile(firebaseUser.uid, changes);
        await refreshProfile();
      }}
    />
  );
}
