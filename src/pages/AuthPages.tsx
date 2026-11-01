import { useState } from "react";
import type { FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Leaf, LockKeyhole, Mail, UserRound } from "lucide-react";
import { useAuth } from "../contexts/useAuth";
import type { UserActivity } from "../types";
import "../styles/auth-pages.css";

function AuthBrand() {
  return <Link to="/" className="auth-brand"><span><Leaf size={23} /></span>WasteLink</Link>;
}

export function LoginPage() {
  const { firebaseUser, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (firebaseUser) return <Navigate to="/app" replace />;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      navigate("/app", { replace: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to sign in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <AuthBrand />
        <p className="auth-eyebrow">WELCOME BACK</p>
        <h1>Sign in to WasteLink</h1>
        <p className="auth-intro">Continue connecting PET bottle sellers, buyers and recyclers.</p>
        <form className="auth-form" onSubmit={submit}>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <label><span>Email address</span><div className="auth-input"><Mail size={17} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
          <label><span>Password</span><div className="auth-input"><LockKeyhole size={17} /><input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" /></div></label>
          <button className="auth-submit" type="submit" disabled={submitting}>{submitting ? "Signing in…" : "Sign in"}</button>
        </form>
        <p className="auth-switch">New to WasteLink? <Link to="/register">Create an account</Link></p>
        <Link to="/" className="auth-back">Back to WasteLink overview</Link>
      </section>
      <aside className="auth-aside"><div className="auth-aside-mark"><Leaf size={30} /></div><p className="auth-aside-kicker">WASTE TO OPPORTUNITY</p><h2>Make recycling work for everyone.</h2><p>Find PET bottle buyers, connect with local sellers and make collection easier.</p></aside>
    </main>
  );
}

export function RegisterPage() {
  const { firebaseUser, register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [enabledActivities, setEnabledActivities] = useState<UserActivity[]>(["seller"]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (firebaseUser) return <Navigate to="/app" replace />;

  function toggleActivity(activity: UserActivity) {
    setEnabledActivities((current) => current.includes(activity)
      ? current.filter((item) => item !== activity)
      : [...current, activity]);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await register({ fullName, email, password, enabledActivities });
      navigate("/app", { replace: true });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : "Unable to create your account. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-panel auth-register-panel">
        <AuthBrand />
        <p className="auth-eyebrow">JOIN THE NETWORK</p>
        <h1>Create your WasteLink account</h1>
        <p className="auth-intro">One account lets you participate as a PET bottle seller, buyer, or both.</p>
        <form className="auth-form" onSubmit={submit}>
          {error && <p className="auth-error" role="alert">{error}</p>}
          <label><span>Full name</span><div className="auth-input"><UserRound size={17} /><input autoComplete="name" required maxLength={100} value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" /></div></label>
          <label><span>Email address</span><div className="auth-input"><Mail size={17} /><input type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></div></label>
          <label><span>Password</span><div className="auth-input"><LockKeyhole size={17} /><input type="password" autoComplete="new-password" required minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 6 characters" /></div></label>
          <fieldset className="auth-activities"><legend>How will you use WasteLink?</legend>
            <label><input type="checkbox" checked={enabledActivities.includes("seller")} onChange={() => toggleActivity("seller")} /><span><strong>Seller</strong><small>List PET bottles and manage collections.</small></span></label>
            <label><input type="checkbox" checked={enabledActivities.includes("buyer")} onChange={() => toggleActivity("buyer")} /><span><strong>Buyer</strong><small>Find PET bottles and manage purchases.</small></span></label>
          </fieldset>
          <button className="auth-submit" type="submit" disabled={submitting || enabledActivities.length === 0}>{submitting ? "Creating account…" : "Create account"}</button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
        <Link to="/" className="auth-back">Back to WasteLink overview</Link>
      </section>
      <aside className="auth-aside"><div className="auth-aside-mark"><Leaf size={30} /></div><p className="auth-aside-kicker">WASTE TO OPPORTUNITY</p><h2>Build a cleaner circular economy together.</h2><p>Join a growing network connecting PET bottle supply with real buyer demand.</p></aside>
    </main>
  );
}
