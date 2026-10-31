import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import FirebaseSellerWorkspace from './FirebaseSellerWorkspace'

/**
 * Temporary seller-only integration entry for local testing.
 * When the team's central Firebase setup is available, pass its Auth, Firestore
 * and Storage instances directly to FirebaseSellerWorkspace instead.
 */
export default function SellerFirebaseEntry() {
  const config = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  }
  if (Object.values(config).some((value) => typeof value !== 'string' || !value.trim())) {
    return (
      <main style={{ padding: '2rem', maxWidth: 720, margin: 'auto' }}>
        <h1>Connect WasteLink to Firebase</h1>
        <p>Firebase configuration is missing. Copy the VITE_FIREBASE_* settings from your team's Firebase web app into a local .env file, install the Firebase SDK, and restart Vite.</p>
        <p>No listing is saved until Firebase is configured and you have signed in.</p>
      </main>
    )
  }

  const app = getApps().length > 0 ? getApp() : initializeApp(config)
  return (
    <FirebaseSellerWorkspace
      auth={getAuth(app)}
      db={getFirestore(app)}
      storage={getStorage(app)}
    />
  )
}
