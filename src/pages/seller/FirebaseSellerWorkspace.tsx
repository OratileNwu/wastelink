import { useEffect, useState } from 'react'
import { onAuthStateChanged, type Auth, type User } from 'firebase/auth'
import {
  collection,
  onSnapshot,
  query,
  where,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore'
import type { FirebaseStorage } from 'firebase/storage'
import type { Offer, SellerListing, Transaction } from '../../types'
import SellerWorkspace from './SellerWorkspace'
import { publishSellerListing } from './sellerFirebaseService'

type FirebaseSellerWorkspaceProps = {
  auth: Auth
  db: Firestore
  storage: FirebaseStorage
}

/**
 * Firebase-powered seller entry point. The integration lead provides the shared
 * Firebase instances. Signed-out visitors cannot publish listings.
 */
export default function FirebaseSellerWorkspace({
  auth,
  db,
  storage,
}: FirebaseSellerWorkspaceProps) {
  const [user, setUser] = useState<User | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [listings, setListings] = useState<SellerListing[]>([])
  const [offers, setOffers] = useState<Offer[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pending, setPending] = useState({ listings: true, offers: true, transactions: true })
  const [error, setError] = useState<string | null>(null)
  const [reload, setReload] = useState(0)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser)
        setAuthLoading(false)
      },
      (authError) => {
        setError(authError.message)
        setAuthLoading(false)
      },
    )
    return unsubscribe
  }, [auth])

  useEffect(() => {
    if (!user) {
      return
    }
    let active = true
    const listeners: Unsubscribe[] = []
    // Clear previous account data immediately on a signed-in user change.
    const reset = () => {
      setListings([])
      setOffers([])
      setTransactions([])
      setPending({ listings: true, offers: true, transactions: true })
      setError(null)
    }
    reset()

    function handleError(failure: Error, key: keyof typeof pending) {
      if (!active) return
      setError(failure.message)
      setPending((previous) => ({ ...previous, [key]: false }))
    }
    function loaded(key: keyof typeof pending) {
      if (!active) return
      setPending((previous) => ({ ...previous, [key]: false }))
    }

    listeners.push(onSnapshot(
      query(collection(db, 'listings'), where('sellerId', '==', user.uid)),
      (snapshot) => {
        if (!active) return
        setListings(snapshot.docs.map((item) => ({
          ...item.data({ serverTimestamps: 'estimate' }),
          listingId: item.id,
        } as SellerListing)))
        loaded('listings')
      },
      (failure) => handleError(failure, 'listings'),
    ))

    listeners.push(onSnapshot(
      query(collection(db, 'offers'), where('sellerId', '==', user.uid)),
      (snapshot) => {
        if (!active) return
        setOffers(snapshot.docs.map((item) => ({
          ...item.data({ serverTimestamps: 'estimate' }),
          offerId: item.id,
        } as Offer)))
        loaded('offers')
      },
      (failure) => handleError(failure, 'offers'),
    ))

    listeners.push(onSnapshot(
      query(collection(db, 'transactions'), where('sellerId', '==', user.uid)),
      (snapshot) => {
        if (!active) return
        setTransactions(snapshot.docs.map((item) => ({
          ...item.data({ serverTimestamps: 'estimate' }),
          transactionId: item.id,
        } as Transaction)))
        loaded('transactions')
      },
      (failure) => handleError(failure, 'transactions'),
    ))

    return () => {
      active = false
      listeners.forEach((unsubscribe) => unsubscribe())
    }
  }, [db, user, reload])

  if (authLoading) {
    return <main role="status" style={{ padding: '2rem' }}>Checking your account…</main>
  }

  if (!user) {
    return (
      <main style={{ padding: '2rem', maxWidth: 700, margin: 'auto' }}>
        <h1>Sign in to manage PET listings</h1>
        <p>The seller dashboard needs your authenticated WasteLink account. Ask the authentication developer to connect the login flow.</p>
        {error && <p role="alert">{error}</p>}
      </main>
    )
  }

  return (
    <SellerWorkspace
      sellerId={user.uid}
      listings={listings}
      offers={offers}
      transactions={transactions}
      loading={pending.listings || pending.offers || pending.transactions}
      error={error}
      onRetry={() => setReload((previous) => previous + 1)}
      onCreateListing={async (input) => {
        // Re-check the actual auth session at submission time.
        const current = auth.currentUser
        if (!current || current.uid !== user.uid) {
          throw new Error('Your session changed. Please sign in again.')
        }
        await publishSellerListing(current, db, storage, input)
      }}
    />
  )
}
