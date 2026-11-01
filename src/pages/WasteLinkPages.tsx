import { useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Boxes, Check, ChevronRight, ClipboardList, Clock3, Handshake, Leaf, Package, PackageSearch, Plus, Recycle, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react'
import { emptyRequirementForm, todayLocal, toRequirementEditableFields, validateRequirementForm } from '../features/buyer/requirements'
import type { RequirementEditableFields, RequirementFormValues } from '../features/buyer/requirements'
import type { BuyerRequirement, BottleColour, BottleCondition, FulfilmentChoice, SellerListing } from '../types'

/** Presentation-only imagery; never used for material listings or user content.
 * Pexels licensed photography (free for website/app use, attribution appreciated).
 * https://www.pexels.com/photo/photograph-of-plastic-bottles-on-a-white-surface-8286620/
 * https://www.pexels.com/photo/a-large-bag-filled-with-plastic-bottles-27666146/
 * https://www.pexels.com/photo/crop-woman-putting-plastic-bottle-into-bag-7262391/
 */
const DASHBOARD_PHOTOS = {
  hero: 'https://images.pexels.com/photos/8286620/pexels-photo-8286620.jpeg?auto=compress&cs=tinysrgb&w=1500',
  feature: 'https://images.pexels.com/photos/27666146/pexels-photo-27666146.jpeg?auto=compress&cs=tinysrgb&w=1100',
  buy: 'https://images.pexels.com/photos/8286620/pexels-photo-8286620.jpeg?auto=compress&cs=tinysrgb&w=1100',
  sell: 'https://images.pexels.com/photos/7262391/pexels-photo-7262391.jpeg?auto=compress&cs=tinysrgb&w=1100',
} as const

const BOTTLE_COLOURS: BottleColour[] = ['clear', 'green', 'mixed']
const BOTTLE_CONDITIONS: BottleCondition[] = ['clean', 'unclean', 'mixed']
const FULFILMENT_CHOICES: FulfilmentChoice[] = ['BUYER_COLLECTION', 'SELLER_DELIVERY']

function Eyebrow({ children }: { children: ReactNode }) { return <span className="wl-eyebrow">{children}</span> }
function PageTitle({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) {
  return <div className="wl-page-title"><div><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{description}</p></div>{action && <div className="wl-page-title-action">{action}</div>}</div>
}
function EmptyState({ title, description, action, icon }: { title: string; description: string; action?: ReactNode; icon?: ReactNode }) {
  return <div className="wl-empty-state"><div className="wl-empty-illustration"><span className="wl-empty-circle"><span className="wl-empty-circle-inner">{icon ?? <PackageSearch size={33} />}</span></span></div><h3>{title}</h3><p>{description}</p>{action && <div className="wl-empty-action">{action}</div>}</div>
}
function Stat({ icon, label, value, detail, tone }: { icon: ReactNode; label: string; value: string | number; detail: string; tone: string }) {
  return <div className="wl-stat-card"><span className={'wl-stat-icon tone-' + tone}>{icon}</span><div><span className="wl-stat-label">{label}</span><strong>{value}</strong><span className="wl-stat-detail">{detail}</span></div></div>
}
export function OverallDashboard() {
  return <>
    <div className="wl-overall-hero">
      <div className="wl-overall-hero-copy"><span className="wl-overall-pill"><Sparkles size={16} /> THE WASTELINK NETWORK</span><h1>Waste has value.<br /><em>Let's unlock it.</em></h1><p>A smarter way to connect PET plastic bottles with the buyers and sellers who need them. One marketplace. Two sides. Better outcomes.</p><div className="wl-hero-cta"><Link className="btn wl-white-btn" to="/buyer/materials">Explore materials <ArrowRight size={18} /></Link><Link className="btn wl-outline-light" to="/buyer">Open buyer workspace <ChevronRight size={17} /></Link></div></div>
      <div className="wl-hero-photo-backdrop" style={{ backgroundImage: `url(${DASHBOARD_PHOTOS.hero})` }} aria-hidden="true" />
      <div className="wl-hero-photo-frame">
        <img className="wl-hero-photo-main" src={DASHBOARD_PHOTOS.feature} alt="Collected PET bottles prepared for recycling" />
        <div className="wl-hero-photo-badge"><Recycle size={21} /><span><strong>One circular marketplace</strong><small>Connect · Trade · Reuse</small></span></div>
      </div>
    </div>

    <div className="wl-overall-main">
      <div className="wl-overall-section-heading"><div><Eyebrow>YOUR WORKSPACES</Eyebrow><h2>Where would you like to start?</h2><p>Move between buying and selling without switching accounts.</p></div></div>
      <div className="wl-destination-grid">
        <Link to="/buyer" className="wl-destination-card wl-buyer-destination"><div className="wl-workspace-photo"><img src={DASHBOARD_PHOTOS.buy} alt="Clear recyclable plastic bottles" loading="lazy" /><span className="wl-workspace-photo-label">PET · BUY</span></div><span className="wl-destination-icon"><ShoppingBag size={28} /></span><span className="wl-destination-count">01 / BUY</span><h3>Source materials<br />with confidence</h3><p>Explore PET listings, manage buying requirements and track purchasing activity.</p><span className="wl-destination-arrow">Enter buyer workspace <ArrowRight size={19} /></span></Link>
        <Link to="/seller" className="wl-destination-card wl-seller-destination"><div className="wl-workspace-photo"><img src={DASHBOARD_PHOTOS.sell} alt="Recyclable plastic bottles being collected" loading="lazy" /><span className="wl-workspace-photo-label">PET · SELL</span></div><span className="wl-destination-icon"><Recycle size={28} /></span><span className="wl-destination-count">02 / SELL</span><h3>Give PET bottles<br />a second life</h3><p>Connect with buyers who need materials. Seller functionality will be linked with the team's work.</p><span className="wl-destination-arrow">Seller workspace <ArrowRight size={19} /></span></Link>
      </div>
      <div className="wl-overall-split">
        <div className="wl-overall-process"><Eyebrow>THE WASTELINK WAY</Eyebrow><h2>A circular marketplace, made simple.</h2><p>From recyclable material to meaningful exchange, the platform keeps buyers and sellers connected.</p><div className="wl-process-items"><div><span>01</span><div><strong>Discover</strong><p>Find available materials or share what you want to buy.</p></div></div><div><span>02</span><div><strong>Connect</strong><p>Agree on requirements and coordinate directly with your counterparty.</p></div></div><div><span>03</span><div><strong>Complete</strong><p>Record purchases and verified material exchanges when services are connected.</p></div></div></div></div>
        <div className="wl-overall-promise"><span className="wl-promise-icon"><ShieldCheck size={28} /></span><Eyebrow>BUILT FOR REAL IMPACT</Eyebrow><h2>PET bottles shouldn't go to waste.</h2><p>WasteLink connects PET bottle buyers and sellers to keep recyclable plastic in circulation.</p><div className="wl-promise-footer"><Leaf size={18} /> Connecting waste to opportunity</div></div>
      </div>
    </div>
  </>
}

export function BuyerDashboard() {
  return <div className="wl-screen">
    <PageTitle eyebrow="BUYER WORKSPACE" title="Buying overview" description="Track PET bottle supply, active requirements and purchases." action={<Link to="/buyer/requirements/new" className="btn btn-primary wl-create-btn"><Plus size={19} /> Create buying requirement</Link>} />
    <div className="wl-stat-grid">
      <Stat icon={<Handshake size={23} />} label="Active requirements" value="—" detail="Awaiting Firestore" tone="green" />
      <Stat icon={<Package size={23} />} label="Incoming PET listings" value="—" detail="Awaiting Firestore" tone="mint" />
      <Stat icon={<ClipboardList size={23} />} label="Pending offers" value="—" detail="Awaiting Firestore" tone="yellow" />
      <Stat icon={<Check size={23} />} label="Completed purchases" value="—" detail="Awaiting Firestore" tone="blue" />
      <Stat icon={<Leaf size={23} />} label="Verified PET purchased" value="— kg" detail="Awaiting verified weighing data" tone="green" />
    </div>
    <section className="wl-content-panel">
      <div className="wl-panel-heading"><div><h2>Recommended incoming PET bottles</h2><p>Match results will be based on your active buying requirements and compatible seller listings.</p></div><Link className="wl-inline-link" to="/buyer/materials">Browse all <ArrowRight size={17} /></Link></div>
      <EmptyState title="PET bottle recommendations will appear here" description="Matching will consider bottle colour and condition, known quantity, service area and fulfilment method. Unknown estimated weight cannot satisfy a minimum quantity requirement." icon={<Boxes size={34} />} action={<Link to="/buyer/requirements" className="btn btn-outline">View buying requirements <ArrowRight size={17} /></Link>} />
    </section>
    <section className="wl-buyer-next"><div><span className="wl-next-icon"><Leaf size={23} /></span><h3>Start buying smarter</h3><p>Preview your purchasing criteria. Publishing will be enabled after Firebase integration.</p></div><Link to="/buyer/requirements/new" className="btn btn-primary">Preview requirement <ArrowRight size={16} /></Link></section>
  </div>
}

type IncomingMaterialsProps = {
  listings?: SellerListing[];
  loading?: boolean;
  error?: string | null;
};
export function IncomingMaterials({ listings = [], loading = false, error = null }: IncomingMaterialsProps) {
  return <div className="wl-screen">
    <PageTitle eyebrow="MARKETPLACE" title="Incoming materials" description="Discover active PET plastic bottle listings shared by suppliers." />
    <section className="wl-content-panel wl-spaced">
      <div className="wl-panel-heading"><div><h2>Available listings</h2><p>Live listings published by WasteLink sellers.</p></div><span>{listings.length} available</span></div>
      {loading ? <p role="status">Loading available PET listings…</p> : error ? <div className="wl-form-error" role="alert">{error}</div> : listings.length ? <div className="wl-requirement-list">
        {listings.map((listing) => <article className="wl-content-panel wl-spaced" key={listing.listingId}>
          <div className="wl-panel-heading"><div><h2>{listing.listingTitle}</h2><p>PET bottles · {listing.collectionAddress.suburb ? listing.collectionAddress.suburb + ", " : ""}{listing.collectionAddress.city}, {listing.collectionAddress.province}</p></div><span className="wl-status-pill">{listing.listingStatus}</span></div>
          {listing.imageUrls[0] && <img src={listing.imageUrls[0]} alt={listing.listingTitle} loading="lazy" style={{ width: "100%", maxHeight: 260, objectFit: "cover", borderRadius: 12 }} />}
          <p>{listing.description || "No additional description provided."}</p>
          <div className="wl-form-grid">
            <p><strong>Quantity:</strong> {listing.quantityDescription}</p>
            <p><strong>Estimated weight:</strong> {listing.estimatedWeightKg === undefined ? "Not provided" : listing.estimatedWeightKg.toLocaleString("en-ZA") + " kg (estimate)"}</p>
            <p><strong>Condition:</strong> {listing.bottleCondition}</p>
            <p><strong>Colour:</strong> {listing.bottleColour}</p>
            <p><strong>Fulfilment:</strong> {listing.collectionMethod.replaceAll("_", " ")}</p>
            <p><strong>Seller delivery fee:</strong> {listing.deliveryFee === undefined ? "Not offered" : new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(listing.deliveryFee)}</p>
          </div>
          <p className="wl-preview-disclaimer">This listing is available for discovery. A match is not a confirmed purchase.</p>
        </article>)}
      </div> : <EmptyState title="No active PET listings yet" description="When sellers publish PET bottle listings, they will appear here. No sample listings or prices are shown." icon={<Boxes size={35} />} />}
      <div className="wl-form-actions"><Link to="/buyer/requirements/new" className="btn btn-primary">Create a buying requirement <ArrowRight size={16} /></Link></div>
    </section>
  </div>
}

type BuyingRequirementsProps = {
  requirements?: BuyerRequirement[];
  loading?: boolean;
  error?: string | null;
};
export function BuyingRequirements({ requirements = [], loading = false, error = null }: BuyingRequirementsProps) {
  const money = (value: number) => new Intl.NumberFormat("en-ZA", { style: "currency", currency: "ZAR" }).format(value);
  return <div className="wl-screen">
    <PageTitle eyebrow="BUYING" title="Buying requirements" description="Manage the PET bottles, quantities and prices you want to buy." action={<Link className="btn btn-primary wl-create-btn" to="/buyer/requirements/new"><Plus size={19} /> Create requirement</Link>} />
    <div className="wl-requirement-list">
      {loading ? <p role="status">Loading your buying requirements…</p> : error ? <div className="wl-form-error" role="alert">{error}</div> : requirements.length ? requirements.map((requirement) => <article className="wl-content-panel wl-spaced" key={requirement.requirementId}>
        <div className="wl-panel-heading"><div><h2>{requirement.requirementTitle}</h2><p>{requirement.collectionAreas.join(", ")}</p></div><span className="wl-status-pill">{requirement.availabilityStatus}</span></div>
        <p>{requirement.description}</p>
        <div className="wl-form-grid">
          <p><strong>Price:</strong> {money(requirement.pricePerKg)}/kg</p>
          <p><strong>Quantity:</strong> {requirement.minimumWeightKg.toLocaleString("en-ZA")} kg minimum{requirement.maximumWeightKg === undefined ? "" : " · " + requirement.maximumWeightKg.toLocaleString("en-ZA") + " kg maximum"}</p>
          <p><strong>Colours:</strong> {requirement.acceptedBottleColours.join(", ")}</p>
          <p><strong>Conditions:</strong> {requirement.acceptedConditions.join(", ")}</p>
          <p><strong>Fulfilment:</strong> {requirement.acceptedCollectionMethods.map((method) => method.replaceAll("_", " ")).join(", ")}</p>
          <p><strong>Collection fee policy:</strong> {requirement.collectionFeePolicy.replaceAll("_", " ")}</p>
        </div>
      </article>) : <EmptyState title="No buying requirements yet" description="Create and publish your first PET buying requirement. It will be saved to your WasteLink account." icon={<Handshake size={34} />} action={<Link className="btn btn-primary" to="/buyer/requirements/new"><Plus size={18} /> Create requirement</Link>} />}
    </div>
  </div>
}

export function RequirementForm({ onPublish }: { onPublish?: (fields: RequirementEditableFields, validUntilInput: string) => Promise<void> }) {
  const [form, setForm] = useState<RequirementFormValues>(emptyRequirementForm)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<RequirementEditableFields | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState('')
  async function publish() {
    if (!preview || !onPublish) return
    setPublishing(true)
    setPublishError('')
    try { await onPublish(preview, form.validUntilInput) }
    catch (reason) { setPublishError(reason instanceof Error ? reason.message : 'Unable to publish your requirement.') }
    finally { setPublishing(false) }
  }
  function update<K extends keyof RequirementFormValues>(key: K, value: RequirementFormValues[K]) {
    setForm((current) => ({ ...current, [key]: value }))
    setPreview(null)
  }
  function toggle<T extends string>(list: T[], value: T): T[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const validationError = validateRequirementForm(form)
    setError(validationError ?? '')
    if (validationError) { setPreview(null); return }
    setPreview(toRequirementEditableFields(form))
  }
  return <div className="wl-screen">
    <PageTitle eyebrow="BUYING" title="Create PET buying requirement" description="Tell suppliers what PET bottles you want to buy." />
    <div className="wl-demo-notice"><BadgeCheck size={18} /> Preview your PET buying criteria, then publish it to your WasteLink account.</div>
    <form className="wl-form-card" onSubmit={submit}>
      <div className="wl-form-grid">
        <label className="wl-field">Material type<input className="form-input" value="PET plastic bottles" readOnly /></label>
        <label className="wl-field">Requirement title *<input className="form-input" required value={form.requirementTitle} onChange={(e) => update('requirementTitle', e.target.value)} placeholder="Name this PET buying requirement" /></label>
        <label className="wl-field">Minimum weight (kg) *<input className="form-input" type="number" required min="0.01" step="any" value={form.minimumWeightKg} onChange={(e) => update('minimumWeightKg', e.target.value)} placeholder="Minimum accepted weight" /></label>
        <label className="wl-field">Maximum weight (kg) <small>OPTIONAL</small><input className="form-input" type="number" min="0.01" step="any" value={form.maximumWeightKg} onChange={(e) => update('maximumWeightKg', e.target.value)} placeholder="No maximum" /></label>
        <label className="wl-field">Buying price (R/kg) *<input className="form-input" type="number" required min="0.01" step="any" value={form.pricePerKg} onChange={(e) => update('pricePerKg', e.target.value)} placeholder="Rand per kilogram" /></label>
        <label className="wl-field">Collection areas *<input className="form-input" required value={form.collectionAreasInput} onChange={(e) => update('collectionAreasInput', e.target.value)} placeholder="Separate areas with commas" /></label>
        <label className="wl-field">Requirements description *<textarea className="form-textarea" required value={form.description} onChange={(e) => update('description', e.target.value)} placeholder="Explain acceptable PET condition and buyer expectations" /></label>
        <label className="wl-field">Collection fee policy<select className="form-select" value={form.collectionFeePolicy} onChange={(e) => update('collectionFeePolicy', e.target.value as RequirementFormValues['collectionFeePolicy'])}><option value="buyer_pays">Buyer pays</option><option value="seller_pays">Seller pays</option><option value="shared">Shared</option><option value="included_in_rate">Included in rate</option></select></label>
        <fieldset className="wl-choice-fieldset"><legend>Accepted PET bottle colours *</legend><div className="wl-choice-options">{BOTTLE_COLOURS.map((choice) => <label key={choice}><input type="checkbox" checked={form.acceptedBottleColours.includes(choice)} onChange={() => update('acceptedBottleColours', toggle(form.acceptedBottleColours, choice))} /> {choice[0].toUpperCase() + choice.slice(1)}</label>)}</div></fieldset>
        <fieldset className="wl-choice-fieldset"><legend>Accepted bottle conditions *</legend><div className="wl-choice-options">{BOTTLE_CONDITIONS.map((choice) => <label key={choice}><input type="checkbox" checked={form.acceptedConditions.includes(choice)} onChange={() => update('acceptedConditions', toggle(form.acceptedConditions, choice))} /> {choice[0].toUpperCase() + choice.slice(1)}</label>)}</div></fieldset>
        <fieldset className="wl-choice-fieldset"><legend>Accepted fulfilment methods *</legend><div className="wl-choice-options">{FULFILMENT_CHOICES.map((choice) => <label key={choice}><input type="checkbox" checked={form.acceptedCollectionMethods.includes(choice)} onChange={() => update('acceptedCollectionMethods', toggle(form.acceptedCollectionMethods, choice))} /> {choice === 'BUYER_COLLECTION' ? 'Buyer collection' : 'Seller delivery'}</label>)}</div></fieldset>
        <label className="wl-field">Valid until <small>OPTIONAL</small><input className="form-input" type="date" min={todayLocal()} value={form.validUntilInput} onChange={(e) => update('validUntilInput', e.target.value)} /></label>
      </div>
      <div className="wl-form-checks">
        <label><input type="checkbox" checked={form.requiresSortedBottles} onChange={(e) => update('requiresSortedBottles', e.target.checked)} /> Require sorted PET bottles</label>
        <label><input type="checkbox" checked={form.requiresCleanBottles} onChange={(e) => update('requiresCleanBottles', e.target.checked)} /> Require clean PET bottles</label>
      </div>
      {error && <div className="wl-form-error" role="alert">{error}</div>}
      <div className="wl-form-actions"><Link to="/buyer/requirements" className="btn btn-outline">Cancel</Link><button type="submit" className="btn btn-primary">Preview requirement</button></div>
      {preview && <section className="wl-form-preview" aria-label="Requirement preview"><div className="wl-preview-heading"><BadgeCheck size={20}/><strong>Requirement preview</strong></div><h3>{preview.requirementTitle}</h3><p>Material: PET bottles</p><p>Price: {new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(preview.pricePerKg)}/kg</p><p>Weight: {preview.minimumWeightKg.toLocaleString('en-ZA')} kg minimum{preview.maximumWeightKg === undefined ? ', no maximum' : ' – ' + preview.maximumWeightKg.toLocaleString('en-ZA') + ' kg maximum'}</p><p>Areas: {preview.collectionAreas.join(', ')}</p><p>Fulfilment: {preview.acceptedCollectionMethods.map((value) => value === 'BUYER_COLLECTION' ? 'Buyer collection' : 'Seller delivery').join(', ')}</p><p>Accepted conditions: {preview.acceptedConditions.join(', ')} | Colours: {preview.acceptedBottleColours.join(', ')}</p><p>Expiry: {form.validUntilInput || 'Not specified'}</p><p className="wl-preview-disclaimer">Review your criteria before publishing. The requirement will be saved to your authenticated WasteLink account.</p>{publishError && <div className="wl-form-error" role="alert">{publishError}</div>}{onPublish && <div className="wl-form-actions"><button type="button" className="btn btn-primary" disabled={publishing} onClick={() => void publish()}>{publishing ? "Publishing…" : "Publish requirement"}</button></div>}</section>}
    </form>
  </div>
}

type EmptyKind = 'collections' | 'transactions' | 'notifications' | 'settings' | 'not-found'
const emptyPages: Record<EmptyKind, { label: string; title: string; description: string; emptyTitle: string; emptyDescription: string }> = {
  collections: { label: 'LOGISTICS', title: 'Collections', description: 'Coordinate pickups for recyclable materials.', emptyTitle: 'No collection data yet', emptyDescription: 'Collections will appear when the team connects the collection workflow.' },
  transactions: { label: 'PURCHASING', title: 'Transactions', description: 'View the progress and history of your purchases.', emptyTitle: 'No transaction data yet', emptyDescription: 'Completed purchases and verified material weights will appear when the transaction service is connected.' },
  notifications: { label: 'ACCOUNT', title: 'Notifications', description: 'Stay informed about your marketplace activity.', emptyTitle: 'No notifications to show', emptyDescription: 'Notifications will appear when the team connects the messaging and notification service.' },
  settings: { label: 'ACCOUNT', title: 'Profile & settings', description: 'Manage your WasteLink account.', emptyTitle: 'Your profile is not connected', emptyDescription: 'Account information will appear when team authentication and profile services are integrated.' },
  'not-found': { label: 'WASTELINK', title: 'Page not found', description: 'This page could not be found.', emptyTitle: 'We could not find this page', emptyDescription: 'Return to the overall dashboard to continue.' },
}
export function WorkspaceEmptyPage({ kind }: { kind: EmptyKind }) {
  const page = emptyPages[kind]
  return <div className="wl-screen"><PageTitle eyebrow={page.label} title={page.title} description={page.description} /><section className="wl-content-panel wl-spaced"><EmptyState title={page.emptyTitle} description={page.emptyDescription} icon={<Clock3 size={34} />} action={<Link className="btn btn-outline" to="/">Return to overall dashboard <ArrowRight size={16} /></Link>} /></section></div>
}
export function SellerHandoff() {
  return <div className="wl-screen"><PageTitle eyebrow="SELLER WORKSPACE" title="Seller dashboard" description="The seller area will be integrated with your teammates' screens." /><div className="wl-seller-handoff"><span><Recycle size={31} /></span><h2>One marketplace. Two experiences.</h2><p>The overall navigation is ready for seller integration. We have not invented a separate seller implementation or backend contracts in this branch.</p><Link to="/" className="btn btn-primary">Back to platform overview <ArrowRight size={16} /></Link></div></div>
}
