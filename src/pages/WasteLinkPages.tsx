import { useMemo, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, BadgeCheck, Boxes, Check, ChevronRight, ClipboardList, Clock3, Handshake, Leaf, Package, PackageSearch, Plus, Recycle, Search, ShieldCheck, ShoppingBag, Sparkles } from 'lucide-react'
import { formatRequirementPrice, isActiveRequirement, todayLocal, useRequirements } from '../features/buyer/requirements'
import type { BuyerRequirementDraft, RequirementInput } from '../features/buyer/requirements'

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
function RequirementCard({ item }: { item: BuyerRequirementDraft }) {
  const active = isActiveRequirement(item)
  return <article className="wl-requirement-item">
    <div className="wl-requirement-symbol"><Package size={21} /></div>
    <div className="wl-requirement-main"><span className={'wl-status ' + (active ? 'status-active' : 'status-expired')}>{active ? 'Active' : 'Expired'}</span><h3>{item.acceptedSubcategories || item.materialCategory}</h3><p>{item.materialCategory} · {item.materialQualityRequirements || 'Quality not specified'} · {item.buyerCollectionAddress}</p></div>
    <div className="wl-requirement-price"><small>Buying price</small><strong>{formatRequirementPrice(item)}</strong></div>
    <div className="wl-requirement-quantity"><small>Quantity range</small><strong>{item.minimumQuantity.toLocaleString('en-ZA')}–{item.maximumQuantity === null ? 'No maximum' : item.maximumQuantity.toLocaleString('en-ZA')} kg</strong></div>
    <Link to={'/buyer/requirements/' + item.id + '/edit'} className="btn btn-outline wl-manage">Manage</Link>
  </article>
}

export function OverallDashboard() {
  return <>
    <div className="wl-overall-hero">
      <div className="wl-overall-hero-copy"><span className="wl-overall-pill"><Sparkles size={16} /> THE WASTELINK NETWORK</span><h1>Waste has value.<br /><em>Let's unlock it.</em></h1><p>A smarter way to connect recyclable materials with the people and businesses that need them. One marketplace. Two sides. Better outcomes.</p><div className="wl-hero-cta"><Link className="btn wl-white-btn" to="/buyer/materials">Explore materials <ArrowRight size={18} /></Link><Link className="btn wl-outline-light" to="/buyer">Open buyer workspace <ChevronRight size={17} /></Link></div></div>
      <div className="wl-hero-art" aria-hidden="true"><div className="wl-art-orbit orbit-one" /><div className="wl-art-orbit orbit-two" /><div className="wl-art-center"><Recycle size={86} strokeWidth={1.35} /></div><span className="wl-art-chip chip-one"><Package size={19} /> Materials</span><span className="wl-art-chip chip-two"><Handshake size={19} /> Connections</span><span className="wl-art-chip chip-three"><Leaf size={19} /> Impact</span></div>
    </div>

    <div className="wl-overall-main">
      <div className="wl-overall-section-heading"><div><Eyebrow>YOUR WORKSPACES</Eyebrow><h2>Where would you like to start?</h2><p>Move between buying and selling without switching accounts.</p></div></div>
      <div className="wl-destination-grid">
        <Link to="/buyer" className="wl-destination-card wl-buyer-destination"><span className="wl-destination-icon"><ShoppingBag size={28} /></span><span className="wl-destination-count">01 / BUY</span><h3>Source materials<br />with confidence</h3><p>Explore incoming recyclables, manage buying requirements and track purchasing activity.</p><span className="wl-destination-arrow">Enter buyer workspace <ArrowRight size={19} /></span></Link>
        <Link to="/seller" className="wl-destination-card wl-seller-destination"><span className="wl-destination-icon"><Recycle size={28} /></span><span className="wl-destination-count">02 / SELL</span><h3>Give your waste<br />a second life</h3><p>Connect with buyers who need materials. Seller functionality will be linked with the team's work.</p><span className="wl-destination-arrow">Seller workspace <ArrowRight size={19} /></span></Link>
      </div>
      <div className="wl-overall-split">
        <div className="wl-overall-process"><Eyebrow>THE WASTELINK WAY</Eyebrow><h2>A circular marketplace, made simple.</h2><p>From recyclable material to meaningful exchange, the platform keeps buyers and sellers connected.</p><div className="wl-process-items"><div><span>01</span><div><strong>Discover</strong><p>Find available materials or share what you want to buy.</p></div></div><div><span>02</span><div><strong>Connect</strong><p>Agree on requirements and coordinate directly with your counterparty.</p></div></div><div><span>03</span><div><strong>Complete</strong><p>Record purchases and verified material exchanges when services are connected.</p></div></div></div></div>
        <div className="wl-overall-promise"><span className="wl-promise-icon"><ShieldCheck size={28} /></span><Eyebrow>BUILT FOR REAL IMPACT</Eyebrow><h2>Useful materials shouldn't go to waste.</h2><p>WasteLink makes circular exchange more accessible for businesses, collectors and communities.</p><div className="wl-promise-footer"><Leaf size={18} /> Connecting waste to opportunity</div></div>
      </div>
    </div>
  </>
}

export function BuyerDashboard() {
  const { requirements } = useRequirements()
  const active = requirements.filter(isActiveRequirement)
  const expiring = active.filter((item) => {
    const expiry = new Date(item.requirementExpiry + 'T00:00:00')
    const days = Math.ceil((expiry.getTime() - new Date(todayLocal() + 'T00:00:00').getTime()) / 86400000)
    return days <= 7
  })
  return <div className="wl-screen">
    <PageTitle eyebrow="BUYER WORKSPACE" title="Procurement overview" description="Track material supply, active requirements and purchases." action={<Link to="/buyer/requirements/new" className="btn btn-primary wl-create-btn"><Plus size={19} /> Create buying requirement</Link>} />
    <div className="wl-stat-grid">
      <Stat icon={<Handshake size={23} />} label="Active requirements" value={active.length} detail={expiring.length > 0 ? expiring.length + ' expiring in 7 days' : 'Saved on this device'} tone="green" />
      <Stat icon={<Package size={23} />} label="Incoming listings" value="—" detail="Connect listings service" tone="mint" />
      <Stat icon={<ClipboardList size={23} />} label="Pending offers" value="—" detail="Connect offers service" tone="yellow" />
      <Stat icon={<Check size={23} />} label="Completed purchases" value="—" detail="Connect transaction service" tone="blue" />
      <Stat icon={<Leaf size={23} />} label="Material purchased" value="— kg" detail="Verified total unavailable" tone="green" />
    </div>
    <section className="wl-content-panel">
      <div className="wl-panel-heading"><div><h2>Recommended incoming materials</h2><p>Matched against your active buying requirements</p></div><Link className="wl-inline-link" to="/buyer/materials">Browse all <ArrowRight size={17} /></Link></div>
      <EmptyState title="Your material recommendations will appear here" description="Once the listing service is connected, available materials will be matched with your buying requirements." icon={<Boxes size={34} />} action={<Link to="/buyer/requirements" className="btn btn-outline">View buying requirements <ArrowRight size={17} /></Link>} />
    </section>
    <section className="wl-buyer-next"><div><span className="wl-next-icon"><Leaf size={23} /></span><h3>Build your sourcing pipeline</h3><p>Create a requirement so suppliers know what materials and quantities your business needs.</p></div><Link to="/buyer/requirements/new" className="btn btn-primary">Create requirement <ArrowRight size={16} /></Link></section>
  </div>
}

export function IncomingMaterials() {
  return <div className="wl-screen"><PageTitle eyebrow="MARKETPLACE" title="Incoming materials" description="Discover recyclable materials shared by suppliers." />
    <section className="wl-content-panel wl-spaced"><div className="wl-panel-heading"><div><h2>Available listings</h2><p>Listings and matched recommendations will load here after integration.</p></div></div>
      <EmptyState title="No materials to display yet" description="We haven't connected the team's listing service. No sample supplier names, prices or material quantities are shown." icon={<Boxes size={35} />} />
    </section>
  </div>
}

export function BuyingRequirements() {
  const { requirements } = useRequirements()
  const [params, setParams] = useSearchParams()
  const query = params.get('q') || ''
  const filtered = useMemo(() => requirements.filter((item) => [item.materialCategory, item.acceptedSubcategories, item.materialQualityRequirements, item.buyerCollectionAddress].some((value) => value.toLowerCase().includes(query.toLowerCase()))), [requirements, query])
  return <div className="wl-screen">
    <PageTitle eyebrow="PROCUREMENT" title="Buying requirements" description="Manage the materials and prices your business is actively seeking." action={<Link className="btn btn-primary wl-create-btn" to="/buyer/requirements/new"><Plus size={19} /> Create requirement</Link>} />
    <div className="wl-demo-notice"><BadgeCheck size={18} /> Prototype mode: requirements you create are saved in this browser only, not to a shared backend.</div>
    {requirements.length > 0 && <div className="wl-requirement-toolbar"><Search size={18} /><input aria-label="Filter your requirements" placeholder="Filter by material, quality or location" value={query} onChange={(e) => setParams(e.target.value ? { q: e.target.value } : {})} /></div>}
    <div className="wl-requirement-list">
      {filtered.length ? filtered.map((item) => <RequirementCard item={item} key={item.id} />) :
        <EmptyState title={query ? 'No matching requirements' : 'No buying requirements yet'} description={query ? 'Try a different search term.' : 'Create your first buying requirement to specify the materials and quantities you want to purchase.'} icon={<Handshake size={34} />} action={!query && <Link className="btn btn-primary" to="/buyer/requirements/new"><Plus size={18} /> Create requirement</Link>} />}
    </div>
  </div>
}

type RequirementFormState = {
  materialCategory: string
  acceptedSubcategories: string
  minimumQuantity: string
  maximumQuantity: string
  buyingPrice: string
  pricingMethod: 'fixed' | 'negotiable'
  materialQualityRequirements: string
  collectionAvailability: string
  requirementExpiry: string
  buyerCollectionAddress: string
  acceptUnsortedMaterials: boolean
  supplierDeliveryRequired: boolean
}

const blankForm: RequirementFormState = {
  materialCategory: '', acceptedSubcategories: '', minimumQuantity: '', maximumQuantity: '', buyingPrice: '',
  pricingMethod: 'fixed', materialQualityRequirements: '', collectionAvailability: '', requirementExpiry: '',
  buyerCollectionAddress: '', acceptUnsortedMaterials: false, supplierDeliveryRequired: false,
}

function toForm(item?: BuyerRequirementDraft): RequirementFormState {
  if (!item) return { ...blankForm }
  return { ...item, minimumQuantity: String(item.minimumQuantity), maximumQuantity: item.maximumQuantity === null ? '' : String(item.maximumQuantity), buyingPrice: item.buyingPrice === null ? '' : String(item.buyingPrice) }
}

export function RequirementForm() {
  const navigate = useNavigate()
  const { requirementId } = useParams()
  const { requirements, saveRequirement } = useRequirements()
  const original = requirements.find((item) => item.id === requirementId)
  const [form, setForm] = useState<RequirementFormState>(() => toForm(original))
  const [error, setError] = useState('')
  const editing = Boolean(requirementId)
  function update<K extends keyof RequirementFormState>(key: K, value: RequirementFormState[K]) { setForm((current) => ({ ...current, [key]: value })) }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    if (editing && !original) { setError('This local requirement could not be found.'); return }
    const min = Number(form.minimumQuantity)
    const max = form.maximumQuantity.trim() ? Number(form.maximumQuantity) : null
    const price = form.pricingMethod === 'fixed' ? Number(form.buyingPrice) : null
    if (!Number.isFinite(min) || min <= 0) { setError('Minimum quantity must be greater than zero.'); return }
    if (max !== null && (!Number.isFinite(max) || max < min)) { setError('Maximum quantity must be at least the minimum quantity.'); return }
    if (form.pricingMethod === 'fixed' && (!Number.isFinite(price) || price === null || price <= 0)) { setError('Enter a valid buying price per kilogram.'); return }
    if (form.requirementExpiry < todayLocal()) { setError('Requirement expiry cannot be in the past.'); return }
    const payload: RequirementInput = {
      materialCategory: form.materialCategory.trim(), acceptedSubcategories: form.acceptedSubcategories.trim(),
      minimumQuantity: min, maximumQuantity: max, buyingPrice: price, pricingMethod: form.pricingMethod,
      materialQualityRequirements: form.materialQualityRequirements.trim(), collectionAvailability: form.collectionAvailability.trim(),
      requirementExpiry: form.requirementExpiry, buyerCollectionAddress: form.buyerCollectionAddress.trim(),
      acceptUnsortedMaterials: form.acceptUnsortedMaterials, supplierDeliveryRequired: form.supplierDeliveryRequired,
    }
    saveRequirement(payload, requirementId)
    navigate('/buyer/requirements')
  }

  if (editing && !original) return <div className="wl-screen"><PageTitle eyebrow="PROCUREMENT" title="Requirement not found" description="This requirement isn't stored in this browser." /><Link to="/buyer/requirements" className="btn btn-outline">Back to requirements</Link></div>

  return <div className="wl-screen">
    <PageTitle eyebrow="BUYER PROCUREMENT" title={editing ? 'Manage buying requirement' : 'Create buying requirement'} description="Publish clear purchasing criteria for nearby suppliers." />
    <div className="wl-demo-notice"><BadgeCheck size={18} /> Prototype mode: this saves on your device until the team's backend service is connected.</div>
    <form className="wl-form-card" onSubmit={submit}>
      <div className="wl-form-grid">
        <label className="wl-field">Material category <span>*</span><input className="form-input" required value={form.materialCategory} onChange={(e) => update('materialCategory', e.target.value)} placeholder="e.g. Plastics" /></label>
        <label className="wl-field">Accepted subcategories <span>*</span><input className="form-input" required value={form.acceptedSubcategories} onChange={(e) => update('acceptedSubcategories', e.target.value)} placeholder="Specify accepted material types" /></label>
        <label className="wl-field">Minimum quantity (kg) <span>*</span><input className="form-input" required type="number" min="0.01" step="any" value={form.minimumQuantity} onChange={(e) => update('minimumQuantity', e.target.value)} placeholder="Minimum kg" /></label>
        <label className="wl-field">Maximum quantity (kg) <small>OPTIONAL</small><input className="form-input" type="number" min="0.01" step="any" value={form.maximumQuantity} onChange={(e) => update('maximumQuantity', e.target.value)} placeholder="No maximum" /></label>
        <label className="wl-field">Buying price (R/kg) {form.pricingMethod === 'fixed' && <span>*</span>}<input className="form-input" required={form.pricingMethod === 'fixed'} type="number" min="0.01" step="any" disabled={form.pricingMethod === 'negotiable'} value={form.buyingPrice} onChange={(e) => update('buyingPrice', e.target.value)} placeholder="Rand per kilogram" /></label>
        <label className="wl-field">Pricing method <span>*</span><select className="form-select" value={form.pricingMethod} onChange={(e) => update('pricingMethod', e.target.value as RequirementFormState['pricingMethod'])}><option value="fixed">Fixed</option><option value="negotiable">Negotiable</option></select></label>
        <label className="wl-field">Material quality requirements <span>*</span><textarea className="form-textarea" required value={form.materialQualityRequirements} onChange={(e) => update('materialQualityRequirements', e.target.value)} placeholder="Describe acceptable quality, sorting and condition" /></label>
        <label className="wl-field">Collection availability <span>*</span><input className="form-input" required value={form.collectionAvailability} onChange={(e) => update('collectionAvailability', e.target.value)} placeholder="When can the material be collected?" /></label>
        <label className="wl-field">Requirement expiry <span>*</span><input className="form-input" required type="date" min={todayLocal()} value={form.requirementExpiry} onChange={(e) => update('requirementExpiry', e.target.value)} /></label>
        <label className="wl-field">Buyer collection address <span>*</span><input className="form-input" required value={form.buyerCollectionAddress} onChange={(e) => update('buyerCollectionAddress', e.target.value)} placeholder="Enter the collection address" /></label>
      </div>
      <div className="wl-form-checks">
        <label><input type="checkbox" checked={form.acceptUnsortedMaterials} onChange={(e) => update('acceptUnsortedMaterials', e.target.checked)} /> Accept unsorted materials</label>
        <label><input type="checkbox" checked={form.supplierDeliveryRequired} onChange={(e) => update('supplierDeliveryRequired', e.target.checked)} /> Supplier delivery required</label>
      </div>
      {error && <div role="alert" className="wl-form-error">{error}</div>}
      <div className="wl-form-actions"><Link to="/buyer/requirements" className="btn btn-outline">Cancel</Link><button type="submit" className="btn btn-primary">{editing ? 'Save changes' : 'Publish requirement'}</button></div>
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
