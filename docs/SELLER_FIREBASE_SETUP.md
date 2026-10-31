# Seller Firebase integration (feature/seller-dashboard)

This file supplements `docs/WASTELINK_INTEGRATION_SPEC.md`. It does not replace the team's shared contracts or Firebase security rules.

## What is implemented

- `CreateListing.tsx`: validated PET listing form, photos, estimated/unknown weight, delivery methods.
- `SellerWorkspace.tsx`: seller-only dashboard/create-screen navigation.
- `sellerFirebaseService.ts`: uploads photos to Firebase Storage, then creates the listing in Firestore with an authenticated seller UID and server timestamps; cleans up uploads if saving fails.
- `FirebaseSellerWorkspace.tsx`: watches `listings`, `offers`, and `transactions` for the signed-in seller and passes live records to the dashboard.
- `SellerFirebaseEntry.tsx`: optional standalone entry for local testing until the integration lead supplies shared Firebase Auth, Firestore, and Storage instances.

## Required setup (not yet configured in this repository)

1. In your local clone, switch to this feature branch and run `npm.cmd install firebase`. This adds the SDK and updates package.json and package-lock.json *locally*. Coordinate committing those dependency changes with the integration lead; they are intentionally not overwritten remotely by this seller-only feature.
2. In Firebase console, register a web app, enable Authentication (email/password or your chosen sign-in method), create a Firestore database, and enable Storage. Configure secure rules before allowing real user data.
3. Copy `.env.example` to `.env` and fill in your project's **web-app** Firebase settings. Never commit `.env` or service-account/admin keys. Restart Vite after edits.
4. Sign in using the team's real Authentication screen. The seller workspace **does not create fake users or bypass login**.
5. To preview the integrated version locally, temporarily use this `src/App.tsx` (do not commit this shared entry-point change):

```tsx
import SellerFirebaseEntry from './pages/seller/SellerFirebaseEntry'

export default function App() {
  return <SellerFirebaseEntry />
}
```

6. Once the integration lead creates shared Firebase instances, import `FirebaseSellerWorkspace` instead and provide `auth`, `db`, and `storage` as props. **Avoid initializing duplicate Firebase apps.**

If Firebase isn't configured, the standalone entry displays a configuration message. If no account is signed in, it displays a sign-in notice instead of permitting saves.

## Security requirements before demo deployment

The integration lead must deploy Firestore and Storage rules. The following is a starting **fragment**, not a replacement for the entire team's rules. Merge with their existing rules and test access from both roles.

```javascript
// Inside: match /databases/{database}/documents { ... }
match /listings/{listingId} {
  allow read: if request.auth != null;
  allow create: if request.auth != null
    && request.resource.data.sellerId == request.auth.uid
    && request.resource.data.listingId == listingId
    && request.resource.data.materialType == 'PET_BOTTLES'
    && request.resource.data.listingStatus == 'active'
    && request.resource.data.createdAt == request.time
    && request.resource.data.updatedAt == request.time
    && request.resource.data.collectionAddress.keys().hasOnly([
      'city', 'province', 'country', 'suburb'
    ]);
  // Seller editing/deleting and status transitions require their own protected rules.
}
match /offers/{offerId} {
  allow read: if request.auth != null
    && (resource.data.sellerId == request.auth.uid
      || resource.data.buyerId == request.auth.uid);
}
match /transactions/{transactionId} {
  allow read: if request.auth != null
    && (resource.data.sellerId == request.auth.uid
      || resource.data.buyerId == request.auth.uid);
}
```

```javascript
// Inside Firebase Storage: match /b/{bucket}/o { ... }
match /seller-listings/{sellerId}/{listingId}/{imageFile} {
  allow write: if request.auth != null
    && request.auth.uid == sellerId
    && request.resource.size <= 5 * 1024 * 1024
    && request.resource.contentType.matches('image/(jpeg|png|webp)');
  allow read: if request.auth != null;
}
```

These rules intentionally do not give users blanket write access to offers, transactions or other people's listings. Ensure any other collection rules remain in place. Firebase Storage download URLs can be viewed by people who possess the token URL; don't put sensitive information into uploaded photos.

**Privacy:** The create-listing form only stores general collection area; exact street address is arranged privately after an offer is accepted.

## Test cases

- Not signed in -> sign-in notice; no publishing.
- Signed-in seller with no records -> genuine zero counts/empty state.
- Publish PET listing without estimated weight -> Firestore listing has no `estimatedWeightKg`; quantity description remains.
- Upload one or more photos -> Storage files exist and `imageUrls` contains their URLs.
- Choose seller delivery -> valid non-negative fee is required.
- Invalid photo or failed Firestore/Storage operation -> error shown, not fake success.
- Successful publish -> seller returns to dashboard; active listing appears via Firestore snapshot.
- Listings/offers/transactions from other seller accounts -> excluded by auth-filtered queries and enforced by rules.
- Confirmed material earnings -> only completed + paid + verified-weight transactions count.

**Limitations:** Firebase Auth login, Firebase project creation, security rules deployment and real payment verification are tasks for the team's integration lead. Do not mark payment as successful without trusted evidence.
