# Firebase rules and deployment

The web client uses Firebase Authentication, Cloud Firestore and Firebase Storage.

## Rules included in this branch

- `firestore.rules` protects user profiles, seller listings and buyer requirements by authenticated UID.
- Active PET listings and active buyer requirements are readable by signed-in marketplace users.
- Offers and transactions are participant-readable and client writes are disabled until their trusted transaction workflows are implemented.
- Listing photo uploads are limited to the authenticated seller's own listing folder and JPEG, PNG or WebP images up to 5 MB.
- Unimplemented collections are denied by default.

## Before testing Firebase writes

1. Confirm the Firebase project selected for this app is the intended development project.
2. Confirm `.env.local` contains `VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_AUTH_DOMAIN`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_STORAGE_BUCKET`, `VITE_FIREBASE_MESSAGING_SENDER_ID` and `VITE_FIREBASE_APP_ID`.
3. Review these rules against any existing project rules. Deploying them replaces the deployed Firestore and Storage rules for that Firebase project.
4. From the repository root, deploy with `firebase deploy --only firestore:rules,storage` after selecting the correct Firebase project with the Firebase CLI.

Do not deploy to a production Firebase project without reviewing the rules and confirming the project ID. The client intentionally cannot create offers or transactions yet; those need validated workflows that preserve agreed commercial terms.
