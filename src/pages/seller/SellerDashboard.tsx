import type { Offer, SellerListing, Transaction } from '../../types'
import './SellerDashboard.css'

type SellerDashboardProps = {
  sellerId: string
  listings: SellerListing[]
  offers: Offer[]
  transactions: Transaction[]
  loading?: boolean
  error?: string | null
  onCreateListing?: () => void
  onViewListings?: () => void
  onViewOffers?: () => void
  onViewTransactions?: () => void
  onOpenListing?: (listingId: string) => void
  onRetry?: () => void
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount)

const formatDate = (seconds: number) =>
  new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium' }).format(new Date(seconds * 1000))

const statusLabel = (status: string) => status.replaceAll('_', ' ')

export default function SellerDashboard({
  sellerId,
  listings,
  offers,
  transactions,
  loading = false,
  error = null,
  onCreateListing,
  onViewListings,
  onViewOffers,
  onViewTransactions,
  onOpenListing,
  onRetry,
}: SellerDashboardProps) {
  // Always scope data to the signed-in seller; Firestore rules must enforce this too.
  const myListings = listings.filter((item) => item.sellerId === sellerId)
  const myOffers = offers.filter((item) => item.sellerId === sellerId)
  const myTransactions = transactions.filter((item) => item.sellerId === sellerId)
  const activeCount = myListings.filter((item) => item.listingStatus === 'active').length
  const pendingOffers = myOffers.filter((item) => item.offerStatus === 'pending').length
  const completedSales = myTransactions.filter((item) => item.transactionStatus === 'completed').length

  // Earnings reflect only recorded, paid, completed material sales (not buyer delivery fees).
  // Do not count estimates, pending payments, or unverified quantities as earnings.
  const earnings = myTransactions
    .filter(
      (item) =>
        item.transactionStatus === 'completed' &&
        item.paymentStatus === 'paid' &&
        item.verifiedWeightKg !== undefined &&
        Number.isFinite(item.verifiedWeightKg) &&
        item.verifiedWeightKg >= 0 &&
        Number.isFinite(item.agreedPricePerKg) &&
        item.agreedPricePerKg >= 0,
    )
    .reduce((total, item) => total + item.verifiedWeightKg! * item.agreedPricePerKg, 0)

  const recent = [...myListings]
    .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
    .slice(0, 5)

  return (
    <main className="seller-dashboard">
      <header className="seller-dashboard__heading">
        <div>
          <p className="seller-dashboard__eyebrow">WasteLink · Seller workspace</p>
          <h1>Seller Dashboard</h1>
          <p>Manage your PET bottle listings, buyer offers and sales.</p>
        </div>
        <button type="button" className="seller-dashboard__primary" onClick={onCreateListing} disabled={!onCreateListing}>
          + Create Listing
        </button>
      </header>

      {error && (
        <section className="seller-dashboard__error" role="alert">
          <span>We couldn't load your seller data. {error}</span>
          {onRetry && <button type="button" onClick={onRetry}>Try again</button>}
        </section>
      )}

      {loading ? (
        <div className="seller-dashboard__loading" role="status">Loading your dashboard…</div>
      ) : error ? null : (
        <>
          <section className="seller-dashboard__metrics" aria-label="Your seller activity">
            <article className="seller-dashboard__metric">
              <span>Active listings</span><strong>{activeCount}</strong><small>Currently available PET listings</small>
            </article>
            <article className="seller-dashboard__metric">
              <span>Pending offers</span><strong>{pendingOffers}</strong><small>Buyer offers awaiting a response</small>
            </article>
            <article className="seller-dashboard__metric">
              <span>Completed sales</span><strong>{completedSales}</strong><small>Recorded completed transactions</small>
            </article>
            <article className="seller-dashboard__metric">
              <span>Confirmed material earnings</span><strong>{formatCurrency(earnings)}</strong><small>Paid completed sales only</small>
            </article>
          </section>

          <div className="seller-dashboard__columns">
            <section className="seller-dashboard__panel" aria-labelledby="seller-recent-title">
              <div className="seller-dashboard__panel-heading">
                <h2 id="seller-recent-title">My recent listings</h2>
                <button type="button" onClick={onViewListings} disabled={!onViewListings}>View all</button>
              </div>
              {recent.length === 0 ? (
                <div className="seller-dashboard__empty">
                  <p>You haven't listed any PET bottles yet.</p>
                  <button type="button" onClick={onCreateListing} disabled={!onCreateListing}>Create your first listing</button>
                </div>
              ) : (
                <ul className="seller-dashboard__listing-list">
                  {recent.map((listing) => (
                    <li key={listing.listingId} className="seller-dashboard__listing">
                      <div className="seller-dashboard__listing-details">
                        <strong>{listing.listingTitle}</strong>
                        <small>{listing.collectionAddress.city} · {listing.estimatedWeightKg === undefined ? 'Weight unknown' : `Estimated ${listing.estimatedWeightKg} kg`}</small>
                        <small>Created {formatDate(listing.createdAt.seconds)}</small>
                      </div>
                      <div className="seller-dashboard__listing-actions">
                        <span className="seller-dashboard__status">{statusLabel(listing.listingStatus)}</span>
                        <button type="button" onClick={() => onOpenListing?.(listing.listingId)} disabled={!onOpenListing}>Details</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="seller-dashboard__panel" aria-labelledby="seller-actions-title">
              <div className="seller-dashboard__panel-heading"><h2 id="seller-actions-title">Quick actions</h2></div>
              <div className="seller-dashboard__quick-actions">
                <button type="button" onClick={onCreateListing} disabled={!onCreateListing}>+ List PET bottles <span>›</span></button>
                <button type="button" onClick={onViewOffers} disabled={!onViewOffers}>Review buyer offers <span>›</span></button>
                <button type="button" onClick={onViewTransactions} disabled={!onViewTransactions}>Track sales & collection <span>›</span></button>
              </div>
              <p className="seller-dashboard__hint">Don't know the weight? You can list your bottles without one. Final material value depends on verified accepted weight and the agreed buyer rate.</p>
            </section>
          </div>
        </>
      )}
    </main>
  )
}
