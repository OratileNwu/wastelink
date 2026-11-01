import {
  collection,
  doc,
  limit,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  where,
  setDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import type { BuyerRequirement, SellerListing } from "../types";
import type { RequirementEditableFields } from "../features/buyer/requirements";

export function subscribeToBuyerRequirements(
  buyerId: string,
  onData: (requirements: BuyerRequirement[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(collection(db, "buyer_requirements"), where("buyerId", "==", buyerId)),
    (snapshot) => onData(snapshot.docs.map((item) => ({
      ...item.data(),
      requirementId: item.id,
    }) as BuyerRequirement)),
    (reason) => onError(reason instanceof Error ? reason : new Error("Unable to load buying requirements.")),
  );
}

export function subscribeToMarketplaceListings(
  onData: (listings: SellerListing[]) => void,
  onError: (error: Error) => void,
) {
  return onSnapshot(
    query(
      collection(db, "listings"),
      where("listingStatus", "==", "active"),
      limit(50),
    ),
    (snapshot) => onData(snapshot.docs.map((item) => ({
      ...item.data(),
      listingId: item.id,
    }) as SellerListing)),
    (reason) => onError(reason instanceof Error ? reason : new Error("Unable to load PET listings.")),
  );
}

export async function createBuyerRequirement(
  buyerId: string,
  fields: RequirementEditableFields,
  validUntilInput: string,
): Promise<void> {
  if (!buyerId) throw new Error("Sign in before publishing a buying requirement.");

  const { maximumWeightKg, ...requiredFields } = fields;
  const validUntil = validUntilInput
    ? Timestamp.fromDate(new Date(`${validUntilInput}T23:59:59`))
    : undefined;

  const requirementRef = doc(collection(db, "buyer_requirements"));
  await setDoc(requirementRef, {
    ...requiredFields,
    ...(maximumWeightKg === undefined ? {} : { maximumWeightKg }),
    ...(validUntil ? { validUntil } : {}),
    buyerId,
    requirementId: requirementRef.id,
    availabilityStatus: "active",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}
