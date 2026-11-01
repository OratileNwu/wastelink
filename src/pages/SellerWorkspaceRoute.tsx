import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import type { Offer, SellerListing, Transaction, UserNotification } from "../types";
import { createSellerListing, subscribeToSellerWorkspace } from "../services/sellerService";
import SellerWorkspace from "./seller/SellerWorkspace";

export default function SellerWorkspaceRoute() {
  const { firebaseUser, profile, loading: authLoading } = useAuth();
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [offers, setOffers] = useState<Offer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseUser) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    const ready = new Set<string>();
    const markReady = (key: string) => {
      ready.add(key);
      if (ready.size === 4) setLoading(false);
    };

    const unsubscribers = subscribeToSellerWorkspace(
      firebaseUser.uid,
      (data) => {
        if (data.listings) {
          setListings(data.listings);
          markReady("listings");
        }
        if (data.offers) {
          setOffers(data.offers);
          markReady("offers");
        }
        if (data.transactions) {
          setTransactions(data.transactions);
          markReady("transactions");
        }
        if (data.notifications) {
          setNotifications(data.notifications);
          markReady("notifications");
        }
      },
      (reason) => {
        setError(reason.message);
        setLoading(false);
      },
    );

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, [firebaseUser]);

  if (authLoading) {
    return <section className="profile-route-state" role="status">Loading your WasteLink account…</section>;
  }
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (!profile) {
    return <section className="profile-route-state" role="alert">
      <h1>Seller workspace unavailable</h1>
      <p>Your account profile could not be loaded. Please refresh or sign in again.</p>
    </section>;
  }
  if (!profile.enabledActivities.includes("seller")) {
    return <section className="profile-route-state">
      <h1>Seller activity is not enabled</h1>
      <p>Enable Seller in your WasteLink profile before creating or managing PET listings.</p>
      <Link to="/settings" className="btn btn-primary">Update profile</Link>
    </section>;
  }

  return (
    <SellerWorkspace
      sellerId={firebaseUser.uid}
      sellerName={profile.fullName}
      listings={listings}
      offers={offers}
      transactions={transactions}
      notifications={notifications}
      loading={loading}
      error={error}
      onRetry={() => window.location.reload()}
      onCreateListing={(input) => createSellerListing(firebaseUser.uid, input)}
    />
  );
}
