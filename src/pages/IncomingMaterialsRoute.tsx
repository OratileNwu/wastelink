import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import type { SellerListing } from "../types";
import { subscribeToMarketplaceListings } from "../services/buyerService";
import { IncomingMaterials } from "./WasteLinkPages";

export default function IncomingMaterialsRoute() {
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }
    return subscribeToMarketplaceListings(
      (records) => {
        setListings(records);
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
  if (!profile) return <section className="profile-route-state" role="alert"><h1>Marketplace unavailable</h1><p>Your WasteLink profile could not be loaded.</p></section>;
  if (!profile.enabledActivities.includes("buyer")) {
    return <section className="profile-route-state"><h1>Buyer activity is not enabled</h1><p>Enable Buyer in your profile to browse PET listings.</p><Link to="/settings" className="btn btn-primary">Update profile</Link></section>;
  }

  return <IncomingMaterials listings={listings} loading={loading} error={error} />;
}
