import { useEffect, useRef, useState } from "react";
import {
  Camera, ChevronDown, CircleHelp, Globe2, Mail, MapPin,
  Pencil, Phone, Save, ShieldCheck, UserRound, X,
} from "lucide-react";
import type {
  Activity, NotificationPreferences, ProfileSettingsData,
} from "../types/profile";
import "../styles/profile.css";

type Props = {
  profile: ProfileSettingsData;
  onSave: (changes: Partial<ProfileSettingsData>) => Promise<void> | void;
  onPhotoSelected: (file: File) => Promise<string | void> | string | void;
};

const activityOptions: { value: Activity; label: string; description: string }[] = [
  { value: "seller", label: "Seller", description: "List PET bottles and manage collections." },
  { value: "buyer", label: "Buyer", description: "Find PET bottles and manage purchases." },
];

function formatDate(value: Date | null) {
  if (!value || Number.isNaN(new Date(value).getTime())) return "Not available";
  return new Intl.DateTimeFormat("en-ZA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function ProfileSettings({ profile, onSave, onPhotoSelected }: Props) {
  const [form, setForm] = useState<ProfileSettingsData>(profile);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [photoPreview, setPhotoPreview] = useState(profile.profileImageUrl || "");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const temporaryPhotoUrl = useRef("");

  useEffect(() => {
    setForm(profile);
    setPhotoPreview(profile.profileImageUrl || "");
    setSelectedPhoto(null);
  }, [profile]);

  useEffect(() => () => {
    if (temporaryPhotoUrl.current) URL.revokeObjectURL(temporaryPhotoUrl.current);
  }, []);

  const showMessage = (text: string, type: "success" | "error" | "info" = "info") => {
    setMessage(text);
    setMessageType(type);
  };

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

  const cancelEditing = () => {
    if (temporaryPhotoUrl.current) URL.revokeObjectURL(temporaryPhotoUrl.current);
    temporaryPhotoUrl.current = "";
    setForm(profile);
    setPhotoPreview(profile.profileImageUrl || "");
    setSelectedPhoto(null);
    if (photoInput.current) photoInput.current.value = "";
    setEditing(false);
    setMessage("");
  };

  const handlePhoto = (file?: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showMessage("Please choose a valid image file.", "error");
      if (photoInput.current) photoInput.current.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showMessage("Your profile photo must be 5 MB or smaller.", "error");
      if (photoInput.current) photoInput.current.value = "";
      return;
    }

    if (temporaryPhotoUrl.current) URL.revokeObjectURL(temporaryPhotoUrl.current);
    temporaryPhotoUrl.current = URL.createObjectURL(file);
    setPhotoPreview(temporaryPhotoUrl.current);
    setSelectedPhoto(file);
    showMessage("Photo preview ready. Save your profile to keep this photo.", "info");
  };

  const save = async () => {
    if (!form.fullName.trim()) {
      showMessage("Please enter your full name.", "error");
      return;
    }

    if (form.phoneNumber.trim() && !/^\+?[0-9\s()-]{7,20}$/.test(form.phoneNumber.trim())) {
      showMessage("Enter a valid phone number using 7–20 digits, spaces or + ( ).", "error");
      return;
    }

    if (form.enabledActivities.length === 0) {
      showMessage("Enable at least one WasteLink activity before saving.", "error");
      return;
    }

    setSaving(true);
    setMessage("");

    try {
      let profileImageUrl = profile.profileImageUrl || "";
      if (selectedPhoto) {
        const savedPhotoUrl = await onPhotoSelected(selectedPhoto);
        if (savedPhotoUrl) profileImageUrl = savedPhotoUrl;
      }

      await onSave({
        fullName: form.fullName.trim(),
        phoneNumber: form.phoneNumber.trim(),
        location: form.location,
        enabledActivities: form.enabledActivities,
        notificationPreferences: form.notificationPreferences,
        languagePreference: form.languagePreference,
        profileImageUrl,
      });

      if (temporaryPhotoUrl.current) URL.revokeObjectURL(temporaryPhotoUrl.current);
      temporaryPhotoUrl.current = "";
      setSelectedPhoto(null);
      setEditing(false);
      showMessage("Your WasteLink profile has been saved on this device.", "success");
    } catch (error) {
      showMessage(
        error instanceof Error ? error.message : "We couldn't save your changes. Please try again.",
        "error",
      );
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
          <div>
            <p className="eyebrow">YOUR ACCOUNT</p>
            <h1>Profile &amp; settings</h1>
            <p className="heading-copy">Manage your personal information and how you use WasteLink.</p>
          </div>
          {!editing ? (
            <button className="primary-button" onClick={() => { setEditing(true); setMessage(""); }}>
              <Pencil size={16} /> Edit profile
            </button>
          ) : (
            <div className="heading-actions">
              <button className="secondary-button" onClick={cancelEditing} disabled={saving}>
                <X size={16} /> Cancel
              </button>
              <button className="primary-button" onClick={save} disabled={saving}>
                <Save size={16} /> {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>

        {message && <div className={`profile-message message-${messageType}`} role="status">{message}</div>}

        <section className="profile-card profile-identity">
          <div className="avatar-wrap">
            {photoPreview
              ? <img className="profile-avatar" src={photoPreview} alt="Profile" />
              : <div className="profile-avatar avatar-placeholder">{initials}</div>}
            {editing && (
              <button className="avatar-edit" aria-label="Change profile photo" onClick={() => photoInput.current?.click()}>
                <Camera size={16} />
              </button>
            )}
            <input
              ref={photoInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              hidden
              onChange={event => handlePhoto(event.target.files?.[0])}
            />
          </div>
          <div className="identity-copy">
            <h2>{form.fullName || "Your name"}</h2>
            <p>{form.email || "Email address not connected"}</p>
            <div className="identity-tags">
              <span className={form.accountStatus === "active" ? "status-pill status-active" : "status-pill"}>
                {form.accountStatus.replaceAll("_", " ")}
              </span>
              <span className="member-since">Member since {formatDate(form.createdAt)}</span>
            </div>
          </div>
          <div className="verification-summary">
            <ShieldCheck size={19} />
            <span>{form.emailVerified ? "Email verified" : "Email not verified"}</span>
          </div>
        </section>

        <div className="profile-grid">
          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon"><UserRound size={18} /></div>
              <div><h3>Personal information</h3><p>Your basic account details</p></div>
            </div>
            <div className="field-grid">
              <label className="profile-field">
                <span>Full name</span>
                <input value={form.fullName} disabled={!editing} required maxLength={100} placeholder="Enter your full name" onChange={event => update("fullName", event.target.value)} />
              </label>
              <label className="profile-field">
                <span>Email address</span>
                <div className="input-with-icon"><Mail size={16} /><input value={form.email} disabled readOnly placeholder="Email will be provided by account sign-in" /></div>
                <small>Email is managed by your sign-in account.</small>
              </label>
              <label className="profile-field">
                <span>Phone number</span>
                <div className="input-with-icon"><Phone size={16} /><input value={form.phoneNumber} disabled={!editing} type="tel" maxLength={20} placeholder="+27 ..." onChange={event => update("phoneNumber", event.target.value)} /></div>
                <small>{form.phoneVerified ? "Phone number verified" : "Phone number not verified"}</small>
              </label>
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon"><MapPin size={18} /></div>
              <div><h3>Location</h3><p>Where you're based</p></div>
            </div>
            <div className="field-grid">
              <label className="profile-field"><span>Street / area</span><input value={form.location.streetAddress || ""} disabled={!editing} maxLength={150} placeholder="Street or area" onChange={event => updateLocation("streetAddress", event.target.value)} /></label>
              <label className="profile-field"><span>Suburb / village</span><input value={form.location.suburb || ""} disabled={!editing} maxLength={100} placeholder="Suburb or village" onChange={event => updateLocation("suburb", event.target.value)} /></label>
              <label className="profile-field"><span>City / town</span><input value={form.location.city} disabled={!editing} maxLength={100} placeholder="City or town" onChange={event => updateLocation("city", event.target.value)} /></label>
              <label className="profile-field"><span>Province</span><input value={form.location.province} disabled={!editing} maxLength={100} placeholder="Province" onChange={event => updateLocation("province", event.target.value)} /></label>
              <label className="profile-field field-full"><span>Country</span><input value={form.location.country} disabled={!editing} maxLength={100} onChange={event => updateLocation("country", event.target.value)} /></label>
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon"><UserRound size={18} /></div>
              <div><h3>WasteLink activities</h3><p>One account, multiple ways to participate</p></div>
            </div>
            <div className="activity-list">
              {activityOptions.map(activity => {
                const active = form.enabledActivities.includes(activity.value);
                return (
                  <div className="activity-row" key={activity.value}>
                    <div><strong>{activity.label}</strong><p>{activity.description}</p></div>
                    <button type="button" role="switch" aria-checked={active} aria-label={`Enable ${activity.label}`} disabled={!editing} className={`toggle-switch ${active ? "is-on" : ""}`} onClick={() => toggleActivity(activity.value)}><span /></button>
                  </div>
                );
              })}
            </div>
            {editing && form.enabledActivities.length === 0 && <p className="field-warning">Select at least one activity to use WasteLink.</p>}
          </section>

          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon"><Mail size={18} /></div>
              <div><h3>Notification preferences</h3><p>Choose the updates you want to receive</p></div>
            </div>
            <div className="preference-list">
              {([
                ["emailNotifications", "Email notifications", "Receive WasteLink updates by email."],
                ["collectionUpdates", "Collection updates", "Updates about your PET bottle collection activity."],
                ["transactionUpdates", "Transaction updates", "Changes to transactions and payments."],
                ["offerNotifications", "Offer notifications", "New offers and negotiation activity."],
              ] as [keyof NotificationPreferences, string, string][]).map(([key, title, description]) => (
                <div className="preference-row" key={key}>
                  <div><strong>{title}</strong><p>{description}</p></div>
                  <button type="button" role="switch" aria-checked={form.notificationPreferences[key]} aria-label={title} disabled={!editing} className={`toggle-switch ${form.notificationPreferences[key] ? "is-on" : ""}`} onClick={() => updateNotification(key, !form.notificationPreferences[key])}><span /></button>
                </div>
              ))}
            </div>
          </section>

          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon"><Globe2 size={18} /></div>
              <div><h3>Language preference</h3><p>Choose your preferred display language</p></div>
            </div>
            <label className="profile-field">
              <span>Language</span>
              <div className="select-wrap">
                <select value={form.languagePreference} disabled={!editing} onChange={event => update("languagePreference", event.target.value)}>
                  <option>English</option><option>isiZulu</option><option>isiXhosa</option><option>Setswana</option><option>Sesotho</option><option>Afrikaans</option>
                </select>
                <ChevronDown size={16} />
              </div>
            </label>
            <p className="language-note">Your preference is saved to this device. Translating the full application requires language support to be configured separately.</p>
          </section>

          <section className="profile-card">
            <div className="section-heading">
              <div className="section-icon"><ShieldCheck size={18} /></div>
              <div><h3>Account &amp; security</h3><p>Your account verification and activity</p></div>
            </div>
            <div className="security-list">
              <div><span>Email verification</span><strong className={form.emailVerified ? "verified" : ""}>{form.emailVerified ? "Verified" : "Not verified"}</strong></div>
              <div><span>Phone verification</span><strong className={form.phoneVerified ? "verified" : ""}>{form.phoneVerified ? "Verified" : "Not verified"}</strong></div>
              <div><span>Account status</span><strong>{form.accountStatus.replaceAll("_", " ")}</strong></div>
              <div><span>Last updated</span><strong>{formatDate(form.updatedAt)}</strong></div>
            </div>
          </section>
        </div>

        <footer className="profile-footer">
          <span><CircleHelp size={15} /> Need help with your account?</span>
          <span>WasteLink · PET bottle recycling network</span>
        </footer>
      </div>
    </main>
  );
}
