import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import type { BuyerRequirement } from "../types";
import { subscribeToBuyerRequirements } from "../services/buyerService";
import { BuyingRequirements } from "./WasteLinkPages";

export default function BuyerRequirementsRoute() {
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const [requirements, setRequirements] = useState<BuyerRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }
    return subscribeToBuyerRequirements(
      firebaseUser.uid,
      (records) => {
        setRequirements(records);
        setLoading(false);
        setError(null);
      },
      (reason) => {
        setError(reason.message);
        setLoading(false);
      },
    );
  }, [firebaseUser]);

  if (authLoading) return <section className="profile-route-state" role="status">Loading your WasteLink account…</section>;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (!profile) return <section className="profile-route-state" role="alert"><h1>Buyer workspace unavailable</h1><p>Your WasteLink profile could not be loaded.</p></section>;
  if (!profile.enabledActivities.includes("buyer")) {
    return <section className="profile-route-state"><h1>Buyer activity is not enabled</h1><p>Enable Buyer in your profile to manage purchasing requirements.</p><Link to="/settings" className="btn btn-primary">Update profile</Link></section>;
  }

  return <BuyingRequirements requirements={requirements} loading={loading} error={error} />;
}
