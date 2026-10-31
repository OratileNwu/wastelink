/**
 * WasteLink shared domain contracts.
 *
 * Keep these names and enum values aligned across all feature branches.
 * Firestore Timestamp values are structurally compatible with FirestoreTimestamp.
 * This file intentionally has no Firebase SDK import so UI/types can be developed
 * before the Firebase dependency is installed.
 */

export type UserActivity = "seller" | "buyer";

export type AccountStatus =
  | "active"
  | "suspended"
  | "pending_verification";

export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

export interface DocumentTimestamps {
  createdAt: FirestoreTimestamp;
  updatedAt: FirestoreTimestamp;
}

export interface Address {
  streetAddress?: string;
  suburb?: string;
  city: string;
  province: string;
  country: string;
  latitude?: number;
  longitude?: number;
}

export interface UserProfile extends DocumentTimestamps {
  uid: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  enabledActivities: UserActivity[];
  location?: Address;
  accountStatus: AccountStatus;
  hasCompletedOnboarding: boolean;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export type MaterialType = "PET_BOTTLES";

export type ListingFulfilmentOption =
  | "BUYER_COLLECTION"
  | "SELLER_DELIVERY"
  | "BOTH";

export type FulfilmentChoice =
  | "BUYER_COLLECTION"
  | "SELLER_DELIVERY";

export type BottleCondition = "clean" | "unclean" | "mixed";
export type BottleColour = "clear" | "green" | "mixed";

export type ListingStatus =
  | "draft"
  | "active"
  | "reserved"
  | "collected"
  | "delivered"
  | "completed"
  | "cancelled";

export interface SellerListing extends DocumentTimestamps {
  listingId: string;
  sellerId: string;
  materialType: MaterialType;
  listingTitle: string;
  description: string;
  estimatedWeightKg?: number;
  quantityDescription: string;
  bottleCondition: BottleCondition;
  bottleColour: BottleColour;
  isSorted: boolean;
  isClean: boolean;
  imageUrls: string[];
  collectionMethod: ListingFulfilmentOption;
  /** Seller-defined ZAR fee; required when seller delivery is offered. */
  deliveryFee?: number;
  collectionAddress: Address;
  availabilityDate?: FirestoreTimestamp;
  listingStatus: ListingStatus;
}

export type CollectionFeePolicy =
  | "buyer_pays"
  | "seller_pays"
  | "shared"
  | "included_in_rate";

export type BuyerRequirementStatus =
  | "active"
  | "paused"
  | "fulfilled"
  | "expired";

export interface BuyerRequirement extends DocumentTimestamps {
  requirementId: string;
  buyerId: string;
  materialType: MaterialType;
  requirementTitle: string;
  description: string;
  minimumWeightKg: number;
  maximumWeightKg?: number;
  pricePerKg: number;
  acceptedBottleColours: BottleColour[];
  acceptedConditions: BottleCondition[];
  requiresSortedBottles: boolean;
  requiresCleanBottles: boolean;
  acceptedCollectionMethods: FulfilmentChoice[];
  collectionAreas: string[];
  collectionFeePolicy: CollectionFeePolicy;
  availabilityStatus: BuyerRequirementStatus;
  validUntil?: FirestoreTimestamp;
}

export type MatchStatus =
  | "compatible"
  | "partially_compatible"
  | "not_compatible"
  | "pending_review";

export interface ListingMatch {
  listingId: string;
  requirementId: string;
  matchStatus: MatchStatus;
  matchScore?: number;
  /** Estimated only; never present this as verified weight. */
  estimatedWeightKg?: number;
  evaluatedAt: FirestoreTimestamp;
}

export type OfferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "counteroffer"
  | "withdrawn"
  | "expired";

export interface Offer extends DocumentTimestamps {
  offerId: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  offeredPricePerKg: number;
  proposedWeightKg?: number;
  selectedCollectionMethod: FulfilmentChoice;
  proposedDeliveryFee: number;
  offerMessage?: string;
  counterOfferPrice?: number;
  offerStatus: OfferStatus;
  expiresAt?: FirestoreTimestamp;
}

export type TransactionStatus =
  | "pending"
  | "agreed"
  | "collection_scheduled"
  | "in_progress"
  | "awaiting_weighing"
  | "awaiting_confirmation"
  | "completed"
  | "cancelled"
  | "disputed";

export type PaymentStatus =
  | "not_paid"
  | "pending"
  | "processing"
  | "paid"
  | "failed"
  | "refunded";

export type PaymentMethod =
  | "cash"
  | "eft"
  | "online"
  | "other";

export interface Transaction extends DocumentTimestamps {
  transactionId: string;
  buyerId: string;
  sellerId: string;
  listingId: string;
  offerId: string;
  materialType: MaterialType;
  estimatedWeightKg?: number;
  verifiedWeightKg?: number;
  agreedPricePerKg: number;
  agreedMaterialValue?: number;
  selectedCollectionMethod: FulfilmentChoice;
  /** Immutable agreed ZAR fee snapshot; zero for buyer collection. */
  agreedDeliveryFee: number;
  /** Final buyer total based on accepted/verified quantities and agreed charges. */
  totalBuyerAmount?: number;
  collectionAddressSnapshot: Address;
  deliveryAddressSnapshot?: Address;
  sellerConfirmed: boolean;
  buyerConfirmed: boolean;
  pickupConfirmed: boolean;
  deliveryConfirmed: boolean;
  weighingRecordId?: string;
  paymentMethod?: PaymentMethod;
  paymentReference?: string;
  paymentStatus: PaymentStatus;
  transactionStatus: TransactionStatus;
  completedAt?: FirestoreTimestamp;
}

export type VerificationStatus =
  | "pending"
  | "verified"
  | "rejected"
  | "disputed";

export interface WeighingRecord extends DocumentTimestamps {
  weighingRecordId: string;
  transactionId: string;
  sellerId: string;
  buyerId: string;
  estimatedWeightKg?: number;
  grossWeightKg: number;
  containerWeightKg: number;
  netWeightKg: number;
  scaleIdentifier?: string;
  weighingPhotoUrls: string[];
  recordedBy: string;
  verificationStatus: VerificationStatus;
  verifiedBy?: string;
  verifiedAt?: FirestoreTimestamp;
  weighingNotes?: string;
}

export interface Conversation extends DocumentTimestamps {
  conversationId: string;
  participantIds: string[];
  relatedListingId?: string;
  relatedOfferId?: string;
  relatedTransactionId?: string;
  lastMessage?: string;
  lastMessageAt?: FirestoreTimestamp;
}

export type MessageType = "text" | "image" | "file" | "system";

export interface Message {
  messageId: string;
  conversationId: string;
  senderId: string;
  messageText?: string;
  attachmentUrls: string[];
  messageType: MessageType;
  sentAt: FirestoreTimestamp;
  readBy: string[];
  isDeleted: boolean;
}

export type NotificationType =
  | "new_offer"
  | "offer_accepted"
  | "offer_rejected"
  | "listing_matched"
  | "collection_scheduled"
  | "pickup_confirmed"
  | "delivery_confirmed"
  | "weight_verified"
  | "transaction_completed"
  | "payment_updated";

export interface UserNotification {
  notificationId: string;
  recipientId: string;
  title: string;
  message: string;
  notificationType: NotificationType;
  relatedListingId?: string;
  relatedOfferId?: string;
  relatedTransactionId?: string;
  isRead: boolean;
  createdAt: FirestoreTimestamp;
  readAt?: FirestoreTimestamp;
  actionRoute?: string;
}

export interface ImpactSummary {
  totalVerifiedPETKg: number;
  totalCompletedCollections: number;
  totalCompletedTransactions: number;
  totalActiveSellers: number;
  totalActiveBuyers: number;
  monthlyVerifiedPETKg: number;
  weeklyVerifiedPETKg: number;
  monthlyTransactions: number;
  topCollectionAreas: Array<{
    area: string;
    verifiedPETKg: number;
  }>;
  impactLastUpdatedAt: FirestoreTimestamp;
}

/** Runtime validation helper for activity selection and profile updates. */
export function isValidEnabledActivities(
  activities: UserActivity[],
): boolean {
  return (
    activities.length >= 1 &&
    activities.length <= 2 &&
    activities.every((activity) => activity === "seller" || activity === "buyer") &&
    new Set(activities).size === activities.length
  );
}

/** A listing must offer the selected fulfilment method. */
export function listingSupportsFulfilment(
  listingOption: ListingFulfilmentOption,
  choice: FulfilmentChoice,
): boolean {
  return listingOption === "BOTH" || listingOption === choice;
}

/** Buyer collection cannot include a seller delivery fee. */
export function isValidAgreedDeliveryFee(
  choice: FulfilmentChoice,
  fee: number,
): boolean {
  return Number.isFinite(fee) &&
    fee >= 0 &&
    (choice !== "BUYER_COLLECTION" || fee === 0);
}
