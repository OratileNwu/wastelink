import { useState } from 'react'
import type { Offer, SellerListing, Transaction, UserNotification } from '../../types'
import CreateListing, { type CreateListingInput } from './CreateListing'
import SellerDashboard from './SellerDashboard'
import './SellerWorkspace.css'

type SellerWorkspaceProps = {
  sellerId: string
  sellerName?: string
  listings: SellerListing[]
  offers: Offer[]
  transactions: Transaction[]
  notifications?: UserNotification[]
  loading?: boolean
  error?: string | null
  onCreateListing?: (listing: CreateListingInput) => Promise<void>
  onOpenListing?: (listingId: string) => void
  onRetry?: () => void
}

/** Frontend-only seller navigation. No generated records, credentials or pretend saves. */
export default function SellerWorkspace({
  sellerId, sellerName, listings, offers, transactions, notifications = [], loading, error,
  onCreateListing, onOpenListing, onRetry,
}: SellerWorkspaceProps) {
  const [creating, setCreating] = useState(false)
  return (
    <SellerDashboard
      sellerId={sellerId}
      sellerName={sellerName}
      listings={listings}
      offers={offers}
      transactions={transactions}
      notifications={notifications}
      loading={loading}
      error={error}
      onCreateListing={() => setCreating(true)}
      onOpenListing={onOpenListing}
      onRetry={onRetry}
      onCloseCreate={() => setCreating(false)}
      createContent={creating ? (
        <CreateListing
          onCancel={() => setCreating(false)}
          onCreate={onCreateListing ? async (payload) => {
            await onCreateListing(payload)
            setCreating(false)
          } : undefined}
        />
      ) : undefined}
    />
  )
}
