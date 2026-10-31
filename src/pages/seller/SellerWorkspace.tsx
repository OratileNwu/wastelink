import { useState } from 'react'
import type { Offer, SellerListing, Transaction } from '../../types'
import CreateListing, { type CreateListingInput } from './CreateListing'
import SellerDashboard from './SellerDashboard'

type SellerWorkspaceProps = {
  sellerId: string
  listings: SellerListing[]
  offers: Offer[]
  transactions: Transaction[]
  loading?: boolean
  error?: string | null
  onCreateListing?: (listing: CreateListingInput) => Promise<void>
  onViewListings?: () => void
  onViewOffers?: () => void
  onViewTransactions?: () => void
  onOpenListing?: (listingId: string) => void
  onRetry?: () => void
}

/**
 * Seller-only navigation while the integration lead sets up app routing.
 * This component never invents data or claims that a listing is saved.
 */
export default function SellerWorkspace({
  sellerId,
  listings,
  offers,
  transactions,
  loading,
  error,
  onCreateListing,
  onViewListings,
  onViewOffers,
  onViewTransactions,
  onOpenListing,
  onRetry,
}: SellerWorkspaceProps) {
  const [view, setView] = useState<'dashboard' | 'create'>('dashboard')

  if (view === 'create') {
    return (
      <CreateListing
        onCancel={() => setView('dashboard')}
        onCreate={onCreateListing ? async (payload) => {
          await onCreateListing(payload)
          setView('dashboard')
        } : undefined}
      />
    )
  }

  return (
    <SellerDashboard
      sellerId={sellerId}
      listings={listings}
      offers={offers}
      transactions={transactions}
      loading={loading}
      error={error}
      onCreateListing={() => setView('create')}
      onViewListings={onViewListings}
      onViewOffers={onViewOffers}
      onViewTransactions={onViewTransactions}
      onOpenListing={onOpenListing}
      onRetry={onRetry}
    />
  )
}
