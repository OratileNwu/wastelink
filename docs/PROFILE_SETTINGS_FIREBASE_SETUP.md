# Firebase setup for WasteLink Profile & Settings

1. In the Firebase Console, enable Email/Password under Authentication.
2. Create or select the project's Cloud Firestore database.
3. Enable Firebase Storage and confirm the Storage bucket is shown in the web app configuration.
4. Copy `.env.example` to `.env.local` and replace every placeholder with the web app configuration values. Do not commit `.env.local`.
5. From the repository root, deploy the included profile rules with:

```bash
firebase deploy --only firestore:rules,storage
```

The Firestore rules allow a signed-in user to read and update only their own `users/{uid}` profile. They keep account status, onboarding state and phone-verification state outside the profile editor's update permissions. Email fields must match the verified Firebase Authentication token.

The Storage rules allow an authenticated user to access only their own `users/{uid}/profile/` images, limited to JPEG, PNG or WebP files up to 5 MB.

These rules intentionally deny access to other Firestore collections and Storage paths until those features have their own reviewed rules. Do not deploy them as a replacement for any separately maintained production rules without reviewing the combined policy.

After configuration, run `npm ci`, `npm run build` and `npm run lint`. Test profile reads and writes using a real authenticated Firebase test account.
