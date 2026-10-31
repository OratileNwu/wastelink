import { useEffect, useRef, useState } from "react";
import {
  Camera, ChevronDown, CircleHelp, Globe2, Mail, MapPin,
  Pencil, Phone, Save, ShieldCheck, UserRound, X,
} from "lucide-react";
import type {
  Activity, NotificationPreferences, ProfileSettingsData,
} from "../types/profile";
import "../styles/profile.css";

const emptyProfile: ProfileSettingsData = {
  uid: "",
  fullName: "",
  email: "",
  phoneNumber: "",
  profileImageUrl: "",
  location: { streetAddress: "", suburb: "", city: "", province: "", country: "South Africa" },
  enabledActivities: [],
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
  createdAt: null,
  updatedAt: null,
};

type Props = {
  profile?: ProfileSettingsData;
  onSave?: (changes: Partial<ProfileSettingsData>) => Promise<void> | void;
  onPhotoSelected?: (file: File) => Promise<string | void> | string | void;
};

const activityOptions: { value: Activity; label: string; description: string }[] = [
  { value: "seller", label: "Seller", description: "List PET bottles and manage collections." },
  { value: "buyer", label: "Buyer", description: "Find PET bottles and manage purchases." },
];

function formatDate(value: Date | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en-ZA", { day: "numeric", month: "long", year: "numeric" }).format(value);
}

export default function ProfileSettings({ profile = emptyProfile, onSave, onPhotoSelected }: Props) {
  const [form, setForm] = useState<ProfileSettingsData>(profile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [photoPreview, setPhotoPreview] = useState(profile.profileImageUrl || "");
  const photoInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setForm(profile);
    setPhotoPreview(profile.profileImageUrl || "");
  }, [profile]);

  const update = <K extends keyof ProfileSettingsData,>(key: K, value: ProfileSettingsData[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  const updateLocation = (key: keyof ProfileSettingsData["location"], value: string) =>
    setForm(current => ({ ...current, location: { ...current.location, [key]: value } }));

  const updateNotification = (key: keyof NotificationPreferences, value: boolean) =>
    setForm(current => ({
      ...current,
      notificationPreferences: { ...current.notificationPreferences, [key]: value },
    }));

  const toggleActivity = (activity: Activity) =>
    setForm(current => ({
      ...current,
      enabledActivities: current.enabledActivities.includes(activity)
        ? current.enabledActivities.filter(item => item !== activity)
        : [...current.enabledActivities, activity],
    }));

  const handlePhoto = async (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setMessage("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage("Image must be 5 MB or smaller.");
      return;
    }
    const localUrl = URL.createObjectURL(file);
    setPhotoPreview(localUrl);
    try {
      const uploadedUrl = await onPhotoSelected?.(file);
      if (uploadedUrl) {
        setPhotoPreview(uploadedUrl);
        update("profileImageUrl", uploadedUrl);
      }
      setMessage(onPhotoSelected ? "Profile photo selected." : "Photo preview updated. Connect Firebase Storage to upload it permanently.");
    } catch {
      setMessage("The photo could not be uploaded. Please try again.");
    }
  };

  const save = async () => {
    if (form.enabledActivities.length === 0) {
      setMessage("Enable at least one WasteLink activity before saving.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      await onSave?.({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        location: form.location,
        enabledActivities: form.enabledActivities,
        notificationPreferences: form.notificationPreferences,
        languagePreference: form.languagePreference,
        profileImageUrl: form.profileImageUrl,
      });
      setEditing(false);
      setMessage(onSave ? "Your profile changes have been saved." : "Changes are currently in this page only. Connect the profile service to save them to your account.");
    } catch {
      setMessage("We couldn't save your changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const initials = form.fullName.trim()
    ? form.fullName.trim().split(/\s+/).slice(0, 2).map(part => part[0]).join("").toUpperCase()
    : "WL";

  return (
    <main className="profile-page">
      <header className="profile-topbar">
        <div className="profile-brand"><span className="brand-mark">W</span><span>WasteLink</span></div>
        <span className="profile-topbar-label">Account settings</span>
      </header>

      <div className="profile-content">
        <div className="profile-heading">
          <div><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile & settings</h1><p className="heading-copy">Manage your personal information and how you use WasteLink.</p></div>
          {!editing ? (
            <button className="primary-button" onClick={() => { setEditing(true); setMessage(""); }}><Pencil size={16} /> Edit profile</button>
          ) : (
            <div className="heading-actions">
              <button className="secondary-button" onClick={() => { setForm(profile); setPhotoPreview(profile.profileImageUrl || ""); setEditing(false); setMessage(""); }}><X size={16} /> Cancel</button>
              <button className="primary-button" onClick={save} disabled={saving}><Save size={16} /> {saving ? "Saving..." : "Save changes"}</button>
            </div>
          )}
        </div>

        {message && <div className="profile-message" role="status">{message}</div>}

        <section className="profile-card profile-identity">
          <div className="avatar-wrap">
            {photoPreview ? <img className="profile-avatar" src={photoPreview} alt="Profile" /> : <div className="profile-avatar avatar-placeholder">{initials}</div>}
            {editing && <button className="avatar-edit" aria-label="Change profile photo" onClick={() => photoInput.current?.click()}><Camera size={16} /></button>}
            <input ref={photoInput} type="file" accept="image/*" hidden onChange={event => handlePhoto(event.target.files?.[0])} />
          </div>
          <div className="identity-copy"><h2>{form.fullName || "Your name"}</h2><p>{form.email || "Email address not available"}</p><div className="identity-tags"><span className={form.accountStatus === "active" ? "status-pill status-active" : "status-pill"}>{form.accountStatus.replace("_", " ")}</span><span className="member-since">Member since {formatDate(form.createdAt)}</span></div></div>
          <div className="verification-summary"><ShieldCheck size={19} /><span>{form.emailVerified ? "Email verified" : "Email not verified"}</span></div>
        </section>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><UserRound size={18} /></div><div><h3>Personal information</h3><p>Your basic account details</p></div></div>
            <div className="field-grid">
              <label className="profile-field"><span>Full name</span><input value={form.fullName} disabled={!editing} placeholder="Enter your full name" onChange={e => update("fullName", e.target.value)} /></label>
              <label className="profile-field"><span>Email address</span><div className="input-with-icon"><Mail size={16} /><input value={form.email} disabled readOnly /></div><small>Email is managed by your sign-in account.</small></label>
              <label className="profile-field"><span>Phone number</span><div className="input-with-icon"><Phone size={16} /><input value={form.phoneNumber} disabled={!editing} placeholder="+27 ..." onChange={e => update("phoneNumber", e.target.value)} /></div><small>{form.phoneVerified ? "Phone number verified" : "Phone number not verified"}</small></label>
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><MapPin size={18} /></div><div><h3>Location</h3><p>Where you're based</p></div></div>
            <div className="field-grid">
              <label className="profile-field"><span>Street / area</span><input value={form.location.streetAddress || ""} disabled={!editing} placeholder="Street or area" onChange={e => updateLocation("streetAddress", e.target.value)} /></label>
              <label className="profile-field"><span>Suburb / village</span><input value={form.location.suburb || ""} disabled={!editing} placeholder="Suburb or village" onChange={e => updateLocation("suburb", e.target.value)} /></label>
              <label className="profile-field"><span>City / town</span><input value={form.location.city} disabled={!editing} placeholder="City or town" onChange={e => updateLocation("city", e.target.value)} /></label>
              <label className="profile-field"><span>Province</span><input value={form.location.province} disabled={!editing} placeholder="Province" onChange={e => updateLocation("province", e.target.value)} /></label>
              <label className="profile-field field-full"><span>Country</span><input value={form.location.country} disabled={!editing} onChange={e => updateLocation("country", e.target.value)} /></label>
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><UserRound size={18} /></div><div><h3>WasteLink activities</h3><p>One account, multiple ways to participate</p></div></div>
            <div className="activity-list">{activityOptions.map(activity => {
              const active = form.enabledActivities.includes(activity.value);
              return <div className="activity-row" key={activity.value}><div><strong>{activity.label}</strong><p>{activity.description}</p></div><button type="button" role="switch" aria-checked={active} aria-label={`Enable ${activity.label}`} disabled={!editing} className={`toggle-switch ${active ? "is-on" : ""}`} onClick={() => toggleActivity(activity.value)}><span /></button></div>;
            })}</div>
            {editing && form.enabledActivities.length === 0 && <p className="field-warning">Select at least one activity to use WasteLink.</p>}
          </section>

          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><Mail size={18} /></div><div><h3>Notification preferences</h3><p>Choose the updates you want to receive</p></div></div>
            <div className="preference-list">
              {([
                ["emailNotifications", "Email notifications", "Receive WasteLink updates by email."],
                ["collectionUpdates", "Collection updates", "Updates about your PET bottle collection activity."],
                ["transactionUpdates", "Transaction updates", "Changes to transactions and payments."],
                ["offerNotifications", "Offer notifications", "New offers and negotiation activity."],
              ] as [keyof NotificationPreferences, string, string][]).map(([key, title, description]) => <div className="preference-row" key={key}><div><strong>{title}</strong><p>{description}</p></div><button type="button" role="switch" aria-checked={form.notificationPreferences[key]} aria-label={title} disabled={!editing} className={`toggle-switch ${form.notificationPreferences[key] ? "is-on" : ""}`} onClick={() => updateNotification(key, !form.notificationPreferences[key])}><span /></button></div>)}
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><Globe2 size={18} /></div><div><h3>Language preference</h3><p>Choose your preferred display language</p></div></div>
            <label className="profile-field"><span>Language</span><div className="select-wrap"><select value={form.languagePreference} disabled={!editing} onChange={e => update("languagePreference", e.target.value)}><option>English</option><option>isiZulu</option><option>isiXhosa</option><option>Setswana</option><option>Sesotho</option><option>Afrikaans</option></select><ChevronDown size={16} /></div></label>
            <p className="language-note">Changing this preference is saved to your profile. Translating the full application requires language support to be configured separately.</p>
          </section>

          <section className="profile-card">
            <div className="section-heading"><div className="section-icon"><ShieldCheck size={18} /></div><div><h3>Account & security</h3><p>Your account verification and activity</p></div></div>
            <div className="security-list"><div><span>Email verification</span><strong className={form.emailVerified ? "verified" : ""}>{form.emailVerified ? "Verified" : "Not verified"}</strong></div><div><span>Phone verification</span><strong className={form.phoneVerified ? "verified" : ""}>{form.phoneVerified ? "Verified" : "Not verified"}</strong></div><div><span>Account status</span><strong>{form.accountStatus.replace("_", " ")}</strong></div><div><span>Last updated</span><strong>{formatDate(form.updatedAt)}</strong></div></div>
          </section>
        </div>
        <footer className="profile-footer"><span><CircleHelp size={15} /> Need help with your account?</span><span>WasteLink · PET bottle recycling network</span></footer>
      </div>
    </main>
  );
}
