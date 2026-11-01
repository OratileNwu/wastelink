import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  where,
  setDoc,
} from "firebase/firestore";
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from "firebase/storage";
import { db, storage } from "../config/firebase";
import type { Offer, SellerListing, Transaction, UserNotification } from "../types";
import type { CreateListingInput } from "../pages/seller/CreateListing";

export type SellerWorkspaceData = {
  listings: SellerListing[];
  offers: Offer[];
  transactions: Transaction[];
  notifications: UserNotification[];
};

export function subscribeToSellerWorkspace(
  sellerId: string,
  onData: (data: Partial<SellerWorkspaceData>) => void,
  onError: (error: Error) => void,
) {
  const subscriptions = [
    {
      key: "listings" as const,
      collectionName: "listings",
      ownerField: "sellerId",
    },
    {
      key: "offers" as const,
      collectionName: "offers",
      ownerField: "sellerId",
    },
    {
      key: "transactions" as const,
      collectionName: "transactions",
      ownerField: "sellerId",
    },
    {
      key: "notifications" as const,
      collectionName: "notifications",
      ownerField: "recipientId",
    },
  ];

  return subscriptions.map(({ key, collectionName, ownerField }) =>
    onSnapshot(
      query(
        collection(db, collectionName),
        where(ownerField, "==", sellerId),
      ),
      (snapshot) => {
        const records = snapshot.docs.map((item) => ({
          ...item.data(),
          [key === "listings" ? "listingId" : key === "offers" ? "offerId" : key === "transactions" ? "transactionId" : "notificationId"]: item.id,
        }));
        onData({ [key]: records } as Partial<SellerWorkspaceData>);
      },
      (reason) => onError(
        reason instanceof Error ? reason : new Error("Unable to load seller workspace data."),
      ),
    ),
  );
}

export async function createSellerListing(
  sellerId: string,
  input: CreateListingInput,
): Promise<void> {
  if (!sellerId) throw new Error("Sign in before creating a listing.");
  if (!input.photos.length) throw new Error("Add at least one listing photo.");

  const listingRef = doc(collection(db, "listings"));
  const uploadedRefs = input.photos.map((file, index) =>
    ref(storage, `listings/${sellerId}/${listingRef.id}/${index}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`),
  );

  try {
    const imageUrls: string[] = [];
    for (let index = 0; index < input.photos.length; index += 1) {
      const file = input.photos[index];
      const objectRef = uploadedRefs[index];
      await uploadBytes(objectRef, file, { contentType: file.type });
      imageUrls.push(await getDownloadURL(objectRef));
    }

    const listingFields = { ...input };
    Reflect.deleteProperty(listingFields, "photos");
    await setDoc(listingRef, {
      ...listingFields,
      listingId: listingRef.id,
      sellerId,
      imageUrls,
      listingStatus: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (reason) {
    await Promise.allSettled(uploadedRefs.map((objectRef) => deleteObject(objectRef)));
    throw reason instanceof Error
      ? reason
      : new Error("Your PET listing could not be saved. Check your Firebase permissions and try again.");
  }
}
