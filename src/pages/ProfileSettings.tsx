import { useEffect, useRef, useState } from "react";
import { Camera, Mail, MapPin, Pencil, Phone, Save, ShieldCheck, UserRound, X } from "lucide-react";
import { isValidEnabledActivities } from "../types";
import type { Address, FirestoreTimestamp, UserActivity, UserProfile } from "../types";
import "../styles/profile.css";

type ProfileChanges = Partial<Pick<UserProfile, "fullName" | "phoneNumber" | "location" | "enabledActivities">>;

type Props = {
  profile: UserProfile;
  onSave: (changes: ProfileChanges) => Promise<void>;
};

const emptyAddress: Address = {
  streetAddress: "",
  suburb: "",
  postalCode: "",
  city: "",
  province: "",
  country: "South Africa",
};

const activities: { value: UserActivity; label: string; description: string }[] = [
  { value: "seller", label: "Seller", description: "List PET bottles and manage collections." },
  { value: "buyer", label: "Buyer", description: "Find PET bottles and manage purchases." },
];

function formatDate(value?: FirestoreTimestamp) {
  if (!value || !Number.isFinite(value.seconds)) return "Not available";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value.seconds * 1000));
}

export default function ProfileSettings({ profile, onSave }: Props) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [phoneNumber, setPhoneNumber] = useState(profile.phoneNumber ?? "");
  const [location, setLocation] = useState<Address>({ ...emptyAddress, ...profile.location });
  const [enabledActivities, setEnabledActivities] = useState<UserActivity[]>(profile.enabledActivities ?? []);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [photoPreview, setPhotoPreview] = useState(profile.profileImageUrl ?? "");
  const [temporaryPhotoUrl, setTemporaryPhotoUrl] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setFullName(profile.fullName);
    setPhoneNumber(profile.phoneNumber ?? "");
    setLocation({ ...emptyAddress, ...profile.location });
    setEnabledActivities(profile.enabledActivities ?? []);
    setPhotoPreview(profile.profileImageUrl ?? "");
  }, [profile]);

  useEffect(() => () => {
    if (temporaryPhotoUrl) URL.revokeObjectURL(temporaryPhotoUrl);
  }, [temporaryPhotoUrl]);

  const updateLocation = (key: keyof Address, value: string) => {
    setLocation((current) => ({ ...current, [key]: value }));
  };

  const toggleActivity = (activity: UserActivity) => {
    setEnabledActivities((current) =>
      current.includes(activity)
        ? current.filter((item) => item !== activity)
        : [...current, activity],
    );
  };

  const cancel = () => {
    setFullName(profile.fullName);
    setPhoneNumber(profile.phoneNumber ?? "");
    setLocation({ ...emptyAddress, ...profile.location });
    setEnabledActivities(profile.enabledActivities ?? []);
    if (temporaryPhotoUrl) URL.revokeObjectURL(temporaryPhotoUrl);
    setTemporaryPhotoUrl("");
    setPhotoPreview(profile.profileImageUrl ?? "");
    if (fileInput.current) fileInput.current.value = "";
    setEditing(false);
    setMessage("");
  };

  const selectPhoto = (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      setMessage("Choose a JPEG, PNG or WebP image up to 5 MB.");
      setMessageType("error");
      if (fileInput.current) fileInput.current.value = "";
      return;
    }
    if (temporaryPhotoUrl) URL.revokeObjectURL(temporaryPhotoUrl);
    const previewUrl = URL.createObjectURL(file);
    setTemporaryPhotoUrl(previewUrl);
    setPhotoPreview(previewUrl);
    setMessage("Photo preview only. Profile-photo uploads are not enabled in this version.");
    setMessageType("info");
  };

  const save = async () => {
    if (!fullName.trim()) {
      setMessage("Please enter your full name.");
      setMessageType("error");
      return;
    }
    if (phoneNumber.trim() && !/^\+?[0-9\s()-]{7,20}$/.test(phoneNumber.trim())) {
      setMessage("Enter a valid phone number.");
      setMessageType("error");
      return;
    }
    if (!isValidEnabledActivities(enabledActivities)) {
      setMessage("Select Seller, Buyer, or both.");
      setMessageType("error");
      return;
    }

    setSaving(true);
    setMessage("");
    try {
      await onSave({
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        location,
        enabledActivities,
      });
      if (temporaryPhotoUrl) URL.revokeObjectURL(temporaryPhotoUrl);
      setTemporaryPhotoUrl("");
      setPhotoPreview(profile.profileImageUrl ?? "");
      setEditing(false);
      setMessage("Your WasteLink profile has been saved.");
      setMessageType("success");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "We couldn't save your changes. Please try again.");
      setMessageType("error");
    } finally {
      setSaving(false);
    }
  };

  const initials = fullName.trim()
    ? fullName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()
    : "WL";

  return (
    <main className="profile-page">
      <div className="profile-content">
        <div className="profile-heading">
          <div>
            <p className="eyebrow">YOUR ACCOUNT</p>
            <h1>Profile &amp; settings</h1>
            <p className="heading-copy">Manage the details used for your PET bottle recycling activity.</p>
          </div>
          {!editing ? (
            <button className="primary-button" onClick={() => { setEditing(true); setMessage(""); }}>
              <Pencil size={16} /> Edit profile
            </button>
          ) : (
            <div className="heading-actions">
              <button className="secondary-button" onClick={cancel} disabled={saving}><X size={16} /> Cancel</button>
              <button className="primary-button" onClick={save} disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save changes"}</button>
            </div>
          )}
        </div>

        {message && <div className={`profile-message message-${messageType}`} role="status">{message}</div>}

        <section className="profile-card profile-identity">
          <div className="avatar-wrap">
            {photoPreview
              ? <img className="profile-avatar" src={photoPreview} alt="Profile preview" />
              : <div className="profile-avatar avatar-placeholder">{initials}</div>}
            {editing && <button className="avatar-edit" aria-label="Preview profile photo" onClick={() => fileInput.current?.click()}><Camera size={16} /></button>}
            <input ref={fileInput} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(event) => selectPhoto(event.target.files?.[0])} />
          </div>
          <div className="identity-copy">
            <h2>{fullName || "Your name"}</h2>
            <p>{profile.email}</p>
            <div className="identity-tags">
              <span className={profile.accountStatus === "active" ? "status-pill status-active" : "status-pill"}>{profile.accountStatus.replaceAll("_", " ")}</span>
              <span className="member-since">Member since {formatDate(profile.createdAt)}</span>
            </div>
          </div>
          <div className="verification-summary"><ShieldCheck size={19} /><span>{profile.emailVerified ? "Email verified" : "Email not verified"}</span></div>
        </section>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><UserRound size={18} /></div><div><h3>Personal information</h3><p>Your account details</p></div></div>
            <div className="field-grid">
              <label className="profile-field"><span>Full name</span><input value={fullName} disabled={!editing} maxLength={100} onChange={(event) => setFullName(event.target.value)} /></label>
              <label className="profile-field"><span>Email address</span><div className="input-with-icon"><Mail size={16} /><input type="email" value={profile.email} disabled readOnly /></div><small>Email changes are managed separately through account security.</small></label>
              <label className="profile-field"><span>Phone number</span><div className="input-with-icon"><Phone size={16} /><input type="tel" value={phoneNumber} disabled={!editing} maxLength={20} placeholder="+27 ..." onChange={(event) => setPhoneNumber(event.target.value)} /></div></label>
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><MapPin size={18} /></div><div><h3>Location</h3><p>Where you are based for collections and delivery</p></div></div>
            <div className="field-grid">
              <label className="profile-field"><span>Street / area</span><input value={location.streetAddress ?? ""} disabled={!editing} maxLength={150} onChange={(event) => updateLocation("streetAddress", event.target.value)} /></label>
              <label className="profile-field"><span>Suburb / village</span><input value={location.suburb ?? ""} disabled={!editing} maxLength={100} onChange={(event) => updateLocation("suburb", event.target.value)} /></label>
              <label className="profile-field"><span>Postal code</span><input value={location.postalCode ?? ""} disabled={!editing} maxLength={12} onChange={(event) => updateLocation("postalCode", event.target.value)} /></label>
              <label className="profile-field"><span>City / town</span><input value={location.city} disabled={!editing} maxLength={100} onChange={(event) => updateLocation("city", event.target.value)} /></label>
              <label className="profile-field"><span>Province</span><input value={location.province} disabled={!editing} maxLength={100} onChange={(event) => updateLocation("province", event.target.value)} /></label>
              <label className="profile-field"><span>Country</span><input value={location.country} disabled={!editing} maxLength={100} onChange={(event) => updateLocation("country", event.target.value)} /></label>
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><UserRound size={18} /></div><div><h3>WasteLink activities</h3><p>Choose how you participate in the PET bottle marketplace</p></div></div>
            <div className="activity-list">
              {activities.map((activity) => {
                const active = enabledActivities.includes(activity.value);
                return <div className="activity-row" key={activity.value}><div><strong>{activity.label}</strong><p>{activity.description}</p></div><button type="button" role="switch" aria-checked={active} aria-label={`Enable ${activity.label}`} disabled={!editing} className={`toggle-switch ${active ? "is-on" : ""}`} onClick={() => toggleActivity(activity.value)}><span /></button></div>;
              })}
            </div>
            {editing && enabledActivities.length === 0 && <p className="field-warning">Select at least one activity.</p>}
          </section>

          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><ShieldCheck size={18} /></div><div><h3>Account status</h3><p>Verification information</p></div></div>
            <div className="security-list">
              <div><span>Email verification</span><strong className={profile.emailVerified ? "verified" : ""}>{profile.emailVerified ? "Verified" : "Not verified"}</strong></div>
              <div><span>Phone verification</span><strong className={profile.phoneVerified ? "verified" : ""}>{profile.phoneVerified ? "Verified" : "Not verified"}</strong></div>
              <div><span>Account status</span><strong>{profile.accountStatus.replaceAll("_", " ")}</strong></div>
              <div><span>Last updated</span><strong>{formatDate(profile.updatedAt)}</strong></div>
            </div>
          </section>
        </div>
        <footer className="profile-footer"><span>WasteLink · PET bottle recycling network</span><span>Connecting recyclers, sellers and buyers</span></footer>
      </div>
    </main>
  );
}
