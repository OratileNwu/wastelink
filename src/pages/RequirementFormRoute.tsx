import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";
import { createBuyerRequirement } from "../services/buyerService";
import type { RequirementEditableFields } from "../features/buyer/requirements";
import { RequirementForm } from "./WasteLinkPages";

export default function RequirementFormRoute() {
  const { firebaseUser, profile, loading } = useAuth();
  const navigate = useNavigate();

  if (loading) return <section className="profile-route-state" role="status">Loading your WasteLink account…</section>;
  if (!firebaseUser) return <Navigate to="/login" replace />;
  if (!profile) return <section className="profile-route-state" role="alert"><h1>Buyer workspace unavailable</h1><p>Your WasteLink profile could not be loaded.</p></section>;
  if (!profile.enabledActivities.includes("buyer")) {
    return <section className="profile-route-state"><h1>Buyer activity is not enabled</h1><p>Enable Buyer in your profile before publishing a requirement.</p><button className="btn btn-primary" type="button" onClick={() => navigate("/settings")}>Update profile</button></section>;
  }

  const publish = async (fields: RequirementEditableFields, validUntilInput: string) => {
    await createBuyerRequirement(firebaseUser.uid, fields, validUntilInput);
    navigate("/buyer/requirements");
  };

  return <RequirementForm onPublish={publish} />;
}
