import { useEffect, useState } from "react";
import ProfileSettings from "./ProfileSettings";
import { useAuth } from "../contexts/AuthContext";
import {
  requestEmailChange,
  saveUserProfile,
  syncVerifiedEmail,
  uploadProfilePhoto,
} from "../services/profileService";

export default function ProfileSettingsRoute() {
  const { firebaseUser, profile, loading, error, refreshProfile } = useAuth();
  const [syncError, setSyncError] = useState("");

  useEffect(() => {
    if (!firebaseUser || !profile) return;
    let active = true;
    void syncVerifiedEmail(firebaseUser)
      .then((changed) => {
        if (active && changed) return refreshProfile();
        return undefined;
      })
      .catch((syncFailure: unknown) => {
        if (active) setSyncError(syncFailure instanceof Error ? syncFailure.message : "Unable to refresh your verified email address.");
      });
    return () => { active = false; };
  }, [firebaseUser, profile?.email, refreshProfile]);

  if (loading) return <section className="profile-route-state" role="status">Loading your WasteLink account…</section>;
  if (!firebaseUser) return <section className="profile-route-state"><h1>Profile &amp; settings</h1><p>Sign in to manage your WasteLink profile and account settings.</p></section>;
  if (!profile) return <section className="profile-route-state" role="alert"><h1>Profile unavailable</h1><p>{error || "Your authenticated account does not have a WasteLink profile document yet."}</p></section>;

  return (
    <>
      {syncError && <p className="profile-route-error" role="status">{syncError}</p>}
      <ProfileSettings
        profile={profile}
        onSave={async (changes) => {
          await saveUserProfile(firebaseUser.uid, changes);
          await refreshProfile();
        }}
        onPhotoSelected={(file) => uploadProfilePhoto(firebaseUser.uid, file)}
        onEmailChange={(email) => requestEmailChange(firebaseUser, email)}
      />
    </>
  );
}
