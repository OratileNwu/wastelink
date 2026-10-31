import { useEffect, useRef, useState } from "react";
import {
  Camera, ChevronDown, CircleHelp, Globe2, Mail, MapPin,
  Pencil, Phone, Save, ShieldCheck, UserRound, X,
} from "lucide-react";
import { isValidEnabledActivities } from "../types";
import type {
  Address, FirestoreTimestamp, NotificationPreferences, UserActivity, UserProfile,
} from "../types";
import "../styles/profile.css";

type ProfileForm = Omit<UserProfile, "location" | "phoneNumber" | "notificationPreferences" | "languagePreference"> & {
  phoneNumber: string;
  location: Address;
  notificationPreferences: NotificationPreferences;
  languagePreference: string;
};

type ProfileChanges = Partial<Pick<UserProfile,
  "fullName" | "phoneNumber" | "location" | "enabledActivities" |
  "notificationPreferences" | "languagePreference" | "profileImageUrl"
>>;

type Props = {
  profile: UserProfile;
  onSave: (changes: ProfileChanges) => Promise<void> | void;
  onPhotoSelected: (file: File) => Promise<string>;
  onEmailChange: (email: string) => Promise<void>;
};

const defaultAddress: Address = {
  streetAddress: "",
  suburb: "",
  postalCode: "",
  city: "",
  province: "",
  country: "South Africa",
};

const defaultNotificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  collectionUpdates: true,
  transactionUpdates: true,
  offerNotifications: true,
};

function toForm(profile: UserProfile): ProfileForm {
  return {
    ...profile,
    phoneNumber: profile.phoneNumber ?? "",
    location: { ...defaultAddress, ...profile.location },
    notificationPreferences: {
      ...defaultNotificationPreferences,
      ...profile.notificationPreferences,
    },
    languagePreference: profile.languagePreference ?? "English",
  };
}

const activityOptions: { value: UserActivity; label: string; description: string }[] = [
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

export default function ProfileSettings({ profile, onSave, onPhotoSelected, onEmailChange }: Props) {
  const [form, setForm] = useState<ProfileForm>(() => toForm(profile));
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info");
  const [photoPreview, setPhotoPreview] = useState(profile.profileImageUrl || "");
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  const temporaryPhotoUrl = useRef("");

  useEffect(() => {
    setForm(toForm(profile));
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

  const update = <K extends keyof ProfileForm,>(key: K, value: ProfileForm[K]) =>
    setForm(current => ({ ...current, [key]: value }));

  const updateLocation = (
    key: "streetAddress" | "suburb" | "postalCode" | "city" | "province" | "country",
    value: string,
  ) => setForm(current => ({
    ...current,
    location: { ...current.location, [key]: value },
  }));

  const updateNotification = (key: keyof NotificationPreferences, value: boolean) =>
    setForm(current => ({
      ...current,
      notificationPreferences: { ...current.notificationPreferences, [key]: value },
    }));

  const toggleActivity = (activity: UserActivity) =>
    setForm(current => ({
      ...current,
      enabledActivities: current.enabledActivities.includes(activity)
        ? current.enabledActivities.filter(item => item !== activity)
        : [...current.enabledActivities, activity],
    }));

  const cancelEditing = () => {
    if (temporaryPhotoUrl.current) URL.revokeObjectURL(temporaryPhotoUrl.current);
    temporaryPhotoUrl.current = "";
    setForm(toForm(profile));
    setPhotoPreview(profile.profileImageUrl || "");
    setSelectedPhoto(null);
    if (photoInput.current) photoInput.current.value = "";
    setEditing(false);
    setMessage("");
  };

  const handlePhoto = (file?: File) => {
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      showMessage("Choose a JPEG, PNG or WebP image.", "error");
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

    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      showMessage("Enter a valid email address.", "error");
      return;
    }

    if (form.phoneNumber.trim() && !/^\+?[0-9\s()-]{7,20}$/.test(form.phoneNumber.trim())) {
      showMessage("Enter a valid phone number using 7–20 digits, spaces or + ( ).", "error");
      return;
    }

    if (!isValidEnabledActivities(form.enabledActivities)) {
      showMessage("Select Seller, Buyer, or both before saving.", "error");
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

      const emailChanged = form.email.trim().toLowerCase() !== profile.email.trim().toLowerCase();
      if (emailChanged) await onEmailChange(form.email.trim());

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
      showMessage(
        emailChanged
          ? "Your profile was saved. Check your new email address for a Firebase verification link; your sign-in email changes only after confirmation."
          : "Your WasteLink profile has been saved to your account.",
        "success",
      );
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
              accept="image/png,image/jpeg,image/webp"
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
                <div className="input-with-icon"><Mail size={16} /><input type="email" value={form.email} disabled={!editing} maxLength={254} autoComplete="email" placeholder="name@example.com" onChange={event => update("email", event.target.value)} /></div>
                <small>A verification link will be sent to a new address. Your sign-in email changes only after you confirm it.</small>
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
              <label className="profile-field"><span>Postal code</span><input value={form.location.postalCode || ""} disabled={!editing} maxLength={12} autoComplete="postal-code" placeholder="e.g. 2745" onChange={event => updateLocation("postalCode", event.target.value)} /></label>
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
            <p className="language-note">Your preference is saved to your WasteLink profile. Full application translation requires language resources to be configured separately.</p>
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
