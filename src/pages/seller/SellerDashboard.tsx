import { useMemo, useState } from 'react'
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Handshake,
  LayoutDashboard,
  Leaf,
  MapPin,
  Package,
  PackageOpen,
  Plus,
  Recycle,
  Search,
  ShieldCheck,
  TrendingUp,
  Truck,
  Wallet,
  X,
  type LucideIcon,
} from 'lucide-react'
import type { ListingStatus, Offer, SellerListing, Transaction } from '../../types'
import './SellerDashboard.css'

type Section = 'overview' | 'listings' | 'offers' | 'sales'
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

const money = (value: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 2 }).format(value)

const kg = (value: number) =>
  new Intl.NumberFormat('en-ZA', { maximumFractionDigits: 2 }).format(value)

function dateLabel(seconds?: number) {
  if (!seconds || !Number.isFinite(seconds)) return 'Recently added'
  return new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(seconds * 1000))
}

const friendly = (status: string) => status.replaceAll('_', ' ')

const menu: Array<{ id: Section; label: string; icon: LucideIcon }> = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'listings', label: 'My listings', icon: Package },
  { id: 'offers', label: 'Buyer offers', icon: Handshake },
  { id: 'sales', label: 'Sales & collection', icon: Truck },
]

function BlankState({
  icon: Icon,
  title,
  message,
  action,
  onAction,
}: {
  icon: LucideIcon
  title: string
  message: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="sd-empty">
      <div className="sd-empty__icon"><Icon size={25} aria-hidden="true" /></div>
      <h3>{title}</h3>
      <p>{message}</p>
      {action && onAction && <button className="sd-empty__action" type="button" onClick={onAction}>{action}<ArrowRight size={15} /></button>}
    </div>
  )
}

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
  const [section, setSection] = useState<Section>('overview')
  const [queryText, setQueryText] = useState('')
  const [statusFilter, setStatusFilter] = useState<ListingStatus | 'all'>('all')
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null)

  const ownListings = useMemo(
    () => listings.filter((listing) => listing.sellerId === sellerId)
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)),
    [listings, sellerId],
  )
  const ownOffers = useMemo(
    () => offers.filter((offer) => offer.sellerId === sellerId)
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)),
    [offers, sellerId],
  )
  const ownSales = useMemo(
    () => transactions.filter((sale) => sale.sellerId === sellerId)
      .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)),
    [transactions, sellerId],
  )
  const active = ownListings.filter((item) => item.listingStatus === 'active').length
  const pendingOffers = ownOffers.filter((item) => item.offerStatus === 'pending').length
  const completed = ownSales.filter((item) => item.transactionStatus === 'completed').length
  // Only count paid, completed sales with verified weight; delivery fees are excluded.
  const paidSales = ownSales.filter((item) =>
    item.transactionStatus === 'completed' &&
    item.paymentStatus === 'paid' &&
    typeof item.verifiedWeightKg === 'number' &&
    Number.isFinite(item.verifiedWeightKg) &&
    item.verifiedWeightKg >= 0 &&
    Number.isFinite(item.agreedPricePerKg) &&
    item.agreedPricePerKg >= 0,
  )
  const earnings = paidSales.reduce((sum, item) => sum + item.verifiedWeightKg! * item.agreedPricePerKg, 0)
  const verifiedKg = paidSales.reduce((sum, item) => sum + item.verifiedWeightKg!, 0)

  const filteredListings = ownListings.filter((item) => {
    const search = queryText.trim().toLowerCase()
    const matchesText = !search || [item.listingTitle, item.quantityDescription, item.collectionAddress.city]
      .some((text) => text?.toLowerCase().includes(search))
    return matchesText && (statusFilter === 'all' || item.listingStatus === statusFilter)
  })
  const selectedListing = ownListings.find((item) => item.listingId === selectedListingId)
  const byListingId = new Map(ownListings.map((item) => [item.listingId, item]))

  function navigate(destination: Section) {
    setSelectedListingId(null)
    if (destination === 'listings' && onViewListings) return onViewListings()
    if (destination === 'offers' && onViewOffers) return onViewOffers()
    if (destination === 'sales' && onViewTransactions) return onViewTransactions()
    setSection(destination)
  }

  function openDetails(id: string) {
    if (onOpenListing) return onOpenListing(id)
    setSection('listings')
    setStatusFilter('all')
    setQueryText('')
    setSelectedListingId(id)
  }

  function listingRow(item: SellerListing) {
    return (
      <li className="sd-listing" key={item.listingId}>
        <div className="sd-listing__thumbnail">
          {item.imageUrls?.[0]
            ? <img src={item.imageUrls[0]} alt="" loading="lazy" />
            : <Recycle size={23} aria-hidden="true" />}
        </div>
        <div className="sd-listing__main">
          <strong>{item.listingTitle}</strong>
          <span><MapPin size={13} aria-hidden="true" /> {item.collectionAddress?.city || 'Location unavailable'} <span className="sd-dot">·</span> {item.estimatedWeightKg === undefined ? 'Weight unknown' : `Est. ${kg(item.estimatedWeightKg)} kg`}</span>
          <small>{dateLabel(item.createdAt?.seconds)}</small>
        </div>
        <span className="sd-status" data-status={item.listingStatus}>{friendly(item.listingStatus)}</span>
        <button type="button" className="sd-icon-button sd-listing__open" onClick={() => openDetails(item.listingId)} aria-label={`View ${item.listingTitle} details`}>
          <ChevronRight size={19} aria-hidden="true" />
        </button>
      </li>
    )
  }

  return (
    <div className="sd-shell">
      <aside className="sd-sidebar" aria-label="Seller navigation">
        <div className="sd-brand"><span className="sd-brand__mark"><Recycle size={24} strokeWidth={2.4} /></span><span><strong>WasteLink</strong><small>SELLER PORTAL</small></span></div>
        <div className="sd-sidebar__caption">WORKSPACE</div>
        <nav className="sd-nav" aria-label="Seller pages">
          {menu.map(({ id, label, icon: Icon }) => (
            <button className={section === id ? 'sd-nav__item is-active' : 'sd-nav__item'} type="button" key={id} onClick={() => navigate(id)} aria-current={section === id ? 'page' : undefined}>
              <Icon size={19} aria-hidden="true" /><span>{label}</span>
              {id === 'offers' && pendingOffers > 0 && <em>{pendingOffers}</em>}
            </button>
          ))}
        </nav>
        <div className="sd-sidebar__bottom">
          <div className="sd-sidebar__note"><Leaf size={24} /><strong>Every bottle matters.</strong><p>Keep PET out of waste streams and connected to real buyers.</p></div>
          <div className="sd-sidebar__footer"><ShieldCheck size={16} /> Seller workspace</div>
        </div>
      </aside>

      <div className="sd-content">
        <div className="sd-topbar">
          <div className="sd-breadcrumb">Workspace <ChevronRight size={14} /> <strong>{menu.find((item) => item.id === section)?.label}</strong></div>
          <div className="sd-topbar__right"><span className="sd-online-dot" /> PET marketplace <span className="sd-topbar__avatar" aria-label="Seller profile">S</span></div>
        </div>

        <main className="sd-main">
          <div className="sd-page-title">
            <div>
              <div className="sd-overline"><span /> SELLER WORKSPACE</div>
              <h1>{section === 'overview' ? 'Welcome to your dashboard' : menu.find((item) => item.id === section)?.label}</h1>
              <p>{section === 'overview' ? 'Your listings, offers and sales — all in one place.' : section === 'listings' ? 'Search, review and manage your PET bottle listings.' : section === 'offers' ? 'Track offers submitted by potential buyers.' : 'Follow your agreed PET sales and collection progress.'}</p>
            </div>
            <button className="sd-primary" type="button" onClick={onCreateListing} disabled={!onCreateListing}><Plus size={18} /> Create listing</button>
          </div>

          {error && <div className="sd-error" role="alert"><span>{error}</span>{onRetry && <button type="button" onClick={onRetry}>Retry</button>}</div>}
          {loading ? <div className="sd-loading" role="status"><span className="sd-spinner" /> Loading your workspace…</div> : error ? null : (
            <>
              {section === 'overview' && (
                <>
                  <section className="sd-hero">
                    <div className="sd-hero__content">
                      <span className="sd-hero__label"><Leaf size={14} /> YOUR CIRCULAR JOURNEY</span>
                      <h2>Give your PET bottles<br />a second life.</h2>
                      <p>List what you've collected, find interested buyers and track every sale from one dashboard.</p>
                      <button type="button" onClick={onCreateListing} disabled={!onCreateListing}>List recyclable PET <ArrowUpRight size={17}/></button>
                    </div>
                    <div className="sd-hero__illustration" aria-hidden="true"><div className="sd-hero__orb"><Recycle size={96} strokeWidth={1.2} /></div><span className="sd-hero__spark sd-hero__spark--one"><Leaf size={20}/></span><span className="sd-hero__spark sd-hero__spark--two"><BadgeCheck size={21}/></span></div>
                  </section>

                  <section className="sd-stats" aria-label="Seller performance">
                    <article className="sd-stat"><div className="sd-stat__top"><span>Active listings</span><span className="sd-stat__icon green"><Package size={20}/></span></div><strong>{active}</strong><small>Available PET bottle listings</small></article>
                    <article className="sd-stat"><div className="sd-stat__top"><span>Pending offers</span><span className="sd-stat__icon orange"><Handshake size={20}/></span></div><strong>{pendingOffers}</strong><small>Offers awaiting your response</small></article>
                    <article className="sd-stat"><div className="sd-stat__top"><span>Completed sales</span><span className="sd-stat__icon blue"><BadgeCheck size={20}/></span></div><strong>{completed}</strong><small>Recorded completed sales</small></article>
                    <article className="sd-stat"><div className="sd-stat__top"><span>Confirmed earnings</span><span className="sd-stat__icon purple"><Wallet size={20}/></span></div><strong>{money(earnings)}</strong><small>Paid PET material sales only</small></article>
                  </section>

                  <div className="sd-grid">
                    <section className="sd-panel" aria-labelledby="sd-recent-title">
                      <div className="sd-panel__heading"><div><div className="sd-panel__overline">YOUR MATERIALS</div><h2 id="sd-recent-title">Recent listings</h2></div><button type="button" className="sd-text-button" onClick={() => navigate('listings')}>View all <ArrowRight size={15}/></button></div>
                      {ownListings.length ? <ul className="sd-listings">{ownListings.slice(0, 4).map(listingRow)}</ul> : <BlankState icon={PackageOpen} title="Your listings start here" message="Add your PET bottles to let buyers know what's available. A weight estimate isn't required." action="Create first listing" onAction={onCreateListing} />}
                    </section>
                    <div className="sd-aside-stack">
                      <section className="sd-panel sd-panel--offers" aria-labelledby="sd-offers-title">
                        <div className="sd-panel__heading"><div><div className="sd-panel__overline">OPPORTUNITIES</div><h2 id="sd-offers-title">Buyer offers</h2></div><span className="sd-count">{pendingOffers} pending</span></div>
                        {ownOffers.length ? <div className="sd-offer-preview">{ownOffers.slice(0, 2).map((offer) => <div key={offer.offerId} className="sd-offer-preview__item"><div><strong>{byListingId.get(offer.listingId)?.listingTitle || 'PET bottle offer'}</strong><span>{money(offer.offeredPricePerKg)} / kg · {friendly(offer.offerStatus)}</span></div><Handshake size={18}/></div>)}<button type="button" className="sd-text-button" onClick={() => navigate('offers')}>All offers <ArrowRight size={15}/></button></div> : <BlankState icon={Handshake} title="No buyer offers yet" message="Offers will appear here when buyers express interest in your PET." />}
                      </section>
                      <section className="sd-mini-impact"><div className="sd-mini-impact__icon"><TrendingUp size={22}/></div><div><span>Verified PET sold</span><strong>{kg(verifiedKg)} kg</strong><small>From paid, completed sales</small></div><Leaf size={40} className="sd-mini-impact__leaf" aria-hidden="true"/></section>
                    </div>
                  </div>
                  <div className="sd-tip"><div className="sd-tip__icon"><CircleDollarSign size={21}/></div><div><strong>Not sure how much your bottles weigh?</strong><span>You can list them without a weight. Your final price is based on the accepted verified weight and agreed buyer rate.</span></div><button type="button" onClick={onCreateListing} disabled={!onCreateListing}>Get started <ArrowRight size={16}/></button></div>
                </>
              )}

              {section === 'listings' && (
                <section className="sd-panel sd-panel--full" aria-labelledby="sd-all-listings">
                  <div className="sd-panel__heading"><div><div className="sd-panel__overline">SELLER INVENTORY</div><h2 id="sd-all-listings">My listings <span className="sd-title-count">{ownListings.length}</span></h2></div></div>
                  <div className="sd-filters">
                    <label className="sd-search"><Search size={18} /><span className="sd-sr-only">Search listings</span><input value={queryText} onChange={(event) => setQueryText(event.target.value)} placeholder="Search your PET listings" /></label>
                    <label className="sd-filter"><span className="sd-sr-only">Filter listings by status</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ListingStatus | 'all')}><option value="all">All statuses</option><option value="active">Active</option><option value="draft">Draft</option><option value="reserved">Reserved</option><option value="collected">Collected</option><option value="delivered">Delivered</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
                  </div>
                  {filteredListings.length ? <ul className="sd-listings">{filteredListings.map(listingRow)}</ul> : <BlankState icon={PackageOpen} title={ownListings.length ? 'No matching listings' : 'No listings yet'} message={ownListings.length ? 'Try another search term or status filter.' : 'Start by creating your first PET listing.'} action={ownListings.length ? undefined : 'Create listing'} onAction={onCreateListing} />}
                  {selectedListing && <section className="sd-detail" aria-labelledby="sd-detail-heading">
                    <div className="sd-detail__heading"><h3 id="sd-detail-heading">{selectedListing.listingTitle}</h3><button type="button" aria-label="Close listing details" onClick={() => setSelectedListingId(null)}><X size={19}/></button></div>
                    <div className="sd-detail__grid"><div><span>Material</span><strong>PET bottles</strong></div><div><span>Quantity</span><strong>{selectedListing.quantityDescription}</strong></div><div><span>Estimated weight</span><strong>{selectedListing.estimatedWeightKg === undefined ? 'Unknown — to be verified' : `${kg(selectedListing.estimatedWeightKg)} kg (estimate)`}</strong></div><div><span>Collection method</span><strong>{friendly(selectedListing.collectionMethod)}</strong></div><div><span>Condition</span><strong>{friendly(selectedListing.bottleCondition)}</strong></div><div><span>Colour</span><strong>{friendly(selectedListing.bottleColour)}</strong></div></div>
                    {selectedListing.description && <p>{selectedListing.description}</p>}
                  </section>}
                </section>
              )}

              {section === 'offers' && <section className="sd-panel sd-panel--full" aria-labelledby="sd-all-offers"><div className="sd-panel__heading"><div><div className="sd-panel__overline">BUYER INTEREST</div><h2 id="sd-all-offers">Offers received <span className="sd-title-count">{ownOffers.length}</span></h2></div></div>
                {ownOffers.length ? <ul className="sd-records">{ownOffers.map((offer) => <li key={offer.offerId}><div className="sd-records__icon"><Handshake size={21}/></div><div className="sd-records__content"><strong>{byListingId.get(offer.listingId)?.listingTitle || 'PET bottle listing'}</strong><span>{offer.proposedWeightKg === undefined ? 'Weight to be verified' : `Proposed ${kg(offer.proposedWeightKg)} kg`} · {friendly(offer.selectedCollectionMethod)}</span><small>{dateLabel(offer.createdAt?.seconds)}</small></div><div className="sd-records__value"><strong>{money(offer.offeredPricePerKg)} / kg</strong><span className="sd-status" data-status={offer.offerStatus}>{friendly(offer.offerStatus)}</span></div></li>)}</ul> : <BlankState icon={Handshake} title="No offers received" message="Once buyers make offers on your listings, you can review them here." />}
              </section>}

              {section === 'sales' && <section className="sd-panel sd-panel--full" aria-labelledby="sd-all-sales"><div className="sd-panel__heading"><div><div className="sd-panel__overline">TRANSACTION HISTORY</div><h2 id="sd-all-sales">Sales & collection <span className="sd-title-count">{ownSales.length}</span></h2></div></div>
                {ownSales.length ? <ul className="sd-records">{ownSales.map((sale) => <li key={sale.transactionId}><div className="sd-records__icon"><Truck size={21}/></div><div className="sd-records__content"><strong>{byListingId.get(sale.listingId)?.listingTitle || 'PET bottle sale'}</strong><span>{sale.verifiedWeightKg === undefined ? 'Awaiting verified weight' : `${kg(sale.verifiedWeightKg)} kg verified`} · {friendly(sale.selectedCollectionMethod)}</span><small>{dateLabel(sale.createdAt?.seconds)}</small></div><div className="sd-records__value"><strong>{sale.verifiedWeightKg === undefined ? 'Final value pending' : money(sale.verifiedWeightKg * sale.agreedPricePerKg)}</strong><span className="sd-status" data-status={sale.transactionStatus}>{friendly(sale.transactionStatus)}</span><small>Payment: {friendly(sale.paymentStatus)}</small></div></li>)}</ul> : <BlankState icon={CalendarDays} title="No sales recorded yet" message="Sales and collection progress will show here once a buyer and seller agree to transact." />}
              </section>}
            </>
          )}

          <footer className="sd-footer"><span><Recycle size={16}/> WasteLink Seller Workspace</span><span><Clock3 size={14}/> Figures reflect the records provided to this dashboard</span></footer>
        </main>
      </div>
    </div>
  )
}
