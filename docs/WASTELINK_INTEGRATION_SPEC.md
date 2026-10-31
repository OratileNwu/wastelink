# WasteLink — MVP Integration & Firebase Specification

**Version:** 2.0  
**Date:** 31 October 2026  
**Status:** Team integration baseline

This document is the shared implementation reference for the WasteLink MVP. If a screen mock-up or local component conflicts with these contracts, raise the conflict with the integration lead before changing shared field names or business rules.

## 1. Product scope

WasteLink connects sellers and buyers of **PET plastic bottles only**. Other recyclable materials are outside the current MVP.

The MVP supports two activities:
- **Seller** — lists PET bottles and agrees fulfilment with a buyer.
- **Buyer** — publishes purchasing requirements, discovers listings and purchases PET bottles.

A single account may enable seller, buyer, or both. There is no Transporter role, transporter dashboard, transporter earnings feature, or separate transport service in this MVP. A seller who delivers their own listing remains a seller.

## 2. Fulfilment rules

A seller chooses one fulfilment option per listing:

| Value | Meaning |
|---|---|
| BUYER_COLLECTION | Buyer arranges transport and collects from the seller's agreed collection address. |
| SELLER_DELIVERY | Seller arranges their own transport and delivers to the agreed buyer address. |
| BOTH | Seller offers both; buyer chooses one before accepting the offer. |

Rules:
1. Seller-set delivery fees are the MVP approach. Fees are in ZAR and must be non-negative.
2. A buyer must see the proposed delivery fee before accepting an offer.
3. The buyer's selected method must be one the listing supports.
4. Buyer collection has an agreed seller delivery fee of zero.
5. The agreed delivery fee, method, addresses and material price are copied into the transaction as an immutable agreement snapshot. Later listing edits must not alter an existing transaction.
6. Distance-based automatic fee calculation is out of scope for the MVP.
7. Any additional charge or deduction must be disclosed and explicitly agreed; do not silently deduct delivery costs from seller proceeds.

## 3. Transaction calculations

- **Material value** = verified accepted net weight (kg) × agreed price per kg.
- **Total buyer amount** = material value + agreed seller delivery fee + any separately disclosed and accepted charges.
- For BUYER_COLLECTION, agreed seller delivery fee is zero.
- Estimated listing weight is not verified weight. Do not calculate a final payable material value from an estimate when verified weight is required.

Example for illustration only: 100 kg at a total material value of R200 plus an agreed R50 seller delivery fee gives a buyer total of R250, before any other explicitly agreed charges.

## 4. Authenticated screens

The MVP has 17 authenticated screens:

### Account and onboarding
1. Registration
2. Login
3. Activity selection

### Main
4. Overall dashboard

### Seller workspace
5. Seller dashboard
6. Create PET listing
7. Listing details
8. My listings and sales

### Buyer workspace
9. Buyer dashboard
10. PET purchasing requirements
11. Browse and match listings
12. Offers and purchase management

### Shared
13. Transactions
14. Messages
15. Notifications
16. Profile and settings
17. Impact dashboard

The public landing page is separate and is not counted among the authenticated screens. The five former transporter screens are removed; collection/delivery coordination is handled through seller listings, offers and transactions.

## 5. Shared TypeScript and Firestore contracts

Use the shared contracts in src/types/index.ts. Firestore collection names are:

| Collection | Purpose |
|---|---|
| users | User profiles; document ID is the Firebase Auth UID. |
| listings | Seller PET bottle listings. |
| buyer_requirements | Buyer purchasing requirements. |
| offers | Buyer offers and seller responses. |
| transactions | Agreed purchases and fulfilment tracking. |
| weighing_records | Weight measurements and verification evidence. |
| conversations | Conversation metadata and participants. |
| messages | Individual conversation messages. |
| notifications | User notifications. |

Use the document ID as the canonical ID where possible; keep the matching ID field in the document only where it helps with typed data transfer and references. Never assume client-supplied IDs or ownership fields are trustworthy: validate them in trusted code and Security Rules.

### User profiles
- enabledActivities may contain seller, buyer, or both.
- Do not store passwords in Firestore. Firebase Authentication owns credentials.
- Profile activity values are not administrative privileges.

### Listings
- materialType is always PET_BOTTLES in this MVP.
- Estimated weight is optional and must remain clearly labelled as estimated.
- A listing with SELLER_DELIVERY or BOTH must have a valid non-negative deliveryFee; if delivery is not offered, do not apply a seller delivery fee.
- Listing status values are defined in the shared TypeScript contracts.

### Buyer requirements and matching
- Requirements define acceptable PET condition/colour, quantity range, price and service area.
- Match only compatible material, conditions, quantity information, location and fulfilment methods.
- Unknown estimated weight must not be treated as meeting a buyer's minimum quantity.
- A match is a discovery aid, not a confirmed purchase.

### Offers
- Store the proposed method and delivery fee in the offer.
- Validate the selected method against the listing at offer acceptance.
- Counteroffers must preserve a clear history of the agreed commercial terms; do not silently overwrite accepted terms.

### Transactions
- Store agreed price, method, delivery fee, address snapshots and relevant weight values on the transaction.
- Protect accepted commercial terms from unilateral client-side changes.
- Track collection/delivery confirmation and buyer/seller confirmation.
- A transaction is not complete merely because a user clicks a button; persist and validate the required state transitions.

### Weighing
- Net weight = gross weight − container/tare weight.
- Validate gross and tare values and ensure net weight is not negative.
- Record who entered the measurement, evidence and who verified it.
- A measurement entered by one party is not automatically independently verified. The MVP must not claim certified scale compliance unless actually established.

### Messages and notifications
- Only conversation participants may read/write the conversation's messages.
- Users may only read and update their own notifications, within allowed fields.

## 6. Firebase responsibilities

- **Firebase Authentication:** registration, login, logout, password reset and authentication state.
- **Cloud Firestore:** profiles and all structured application records.
- **Firebase Storage:** profile photos, listing photos, weighing evidence and delivery evidence. Store storage paths or URLs in Firestore, not image binaries.
- Keep Firebase client configuration in environment variables. Never commit service-account JSON, private admin keys or credentials.
- Firestore Security Rules must enforce access and field-level restrictions. Frontend visibility checks are not security.
- Do not allow users to edit another user's profile, listings, requirements, offers or transaction records.
- Only transaction participants may access their transaction.
- Protect agreed transaction terms and verified weighing records from unauthorised modification.
- Payment status must only be updated by an authorised payment integration or trusted administrative process. Do not simulate successful payments.

## 7. No hardcoded application data

Production application functionality must use live Firebase data:
- Profiles, listings, buyer requirements, offers, transactions, weighing records, messages and notifications come from Firestore.
- Images and evidence come from Firebase Storage.
- Dashboard totals are calculated from real records, not manually typed constants.
- Temporary mock data is permitted only for isolated UI development, must be clearly separated from services, and must be removed/replaced before integration.
- Never ship fake sample users, listings, offers, transactions or success states.

Every data-driven screen must implement loading, empty, error and success states. Show success only after the relevant Firebase operation succeeds.

## 8. GitHub collaboration and integration

- Work in feature branches and submit pull requests; do not commit directly to main.
- Import shared types rather than redefining interfaces or enums in feature folders.
- Do not independently rename Firestore collections, fields, enum values or status values.
- Keep feature UI separated from Firebase service implementations.
- Coordinate changes to shared files with the integration lead.
- Preserve other developers' work; review the latest branch before changing shared files.

## 9. Screen ownership

- Integration lead: Firebase, authentication, shared types, account/activity selection, overall dashboard, profile/settings, security and integration.
- Landing page developer: public landing page.
- Seller developer: seller screens 5–8.
- Buyer developer: buyer screens 9–12.
- Shared screens 13–15 and 17: coordinate ownership and integration with the team; profile/settings is coordinated with the integration lead.

## 10. Out of scope for this MVP

- Separate transporter role/dashboard and transporter-specific collections.
- Automated distance-based delivery pricing.
- Non-PET recyclable materials.
- AI weight prediction or unverified environmental/carbon calculations.
- Automatic payments or payout claims without a real authorised payment integration.

**Core principle:** WasteLink is a PET seller-to-buyer marketplace. The seller may deliver their own goods for a seller-defined fee, or the buyer may collect. WasteLink records and coordinates the agreement; it does not operate a separate transporter service.
