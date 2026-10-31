import { useState, type ReactNode } from 'react'
import {
  ArrowRight, Bell, Box, Check, ChevronDown, ChevronRight,
  ClipboardList, Handshake, LayoutGrid, Leaf,
  Package, PackageOpen, Plus, Recycle, Search, Settings,
  Truck, Users, Wallet, type LucideIcon,
} from 'lucide-react'
import type { ListingMatch, ListingStatus, Offer, SellerListing, Transaction, UserNotification } from '../../types'
import './SellerDashboard.css'

type Page = 'overview' | 'materials' | 'matches' | 'groups' | 'collections' | 'transactions' | 'notifications' | 'profile'
type Props = {
  sellerId: string
  sellerName?: string
  listings: SellerListing[]
  offers: Offer[]
  transactions: Transaction[]
  matches?: ListingMatch[]
  notifications?: UserNotification[]
  loading?: boolean
  error?: string | null
  onCreateListing?: () => void
  onOpenListing?: (listingId: string) => void
  onRetry?: () => void
  createContent?: ReactNode
  onCloseCreate?: () => void
}
const cash = (n: number) => new Intl.NumberFormat('en-ZA',{style:'currency',currency:'ZAR'}).format(n)
const weight = (n: number) => new Intl.NumberFormat('en-ZA',{maximumFractionDigits:2}).format(n)
const human = (s: string) => s.replaceAll('_',' ')
const when = (seconds?:number) => seconds ? new Intl.DateTimeFormat('en-ZA',{day:'numeric',month:'short',year:'numeric'}).format(new Date(seconds*1000)) : 'Date pending'
const nav: {id:Page;label:string;icon:LucideIcon}[] = [
  {id:'overview',label:'Overview',icon:LayoutGrid},
  {id:'materials',label:'My materials',icon:Box},
  {id:'matches',label:'Buyer matches',icon:Handshake},
  {id:'groups',label:'Group collections',icon:Users},
  {id:'collections',label:'Collections',icon:Truck},
  {id:'transactions',label:'Transactions',icon:ClipboardList},
  {id:'notifications',label:'Notifications',icon:Bell},
  {id:'profile',label:'Profile & settings',icon:Settings},
]
function Empty({icon:Icon,title,detail,button,onClick}:{icon:LucideIcon;title:string;detail:string;button?:string;onClick?:()=>void}){
  return <div className="wl-empty"><span className="wl-empty-icon"><Icon size={23}/></span><strong>{title}</strong><p>{detail}</p>{button&&onClick&&<button type="button" onClick={onClick}>{button} <ArrowRight size={14}/></button>}</div>
}
export default function SellerDashboard({
  sellerId,sellerName,listings,offers,transactions,matches=[],notifications=[],
  loading=false,error=null,onCreateListing,onOpenListing,onRetry,createContent,onCloseCreate,
}:Props){
  const [page,setPage]=useState<Page>('overview')
  const [search,setSearch]=useState('')
  const [status,setStatus]=useState<ListingStatus|'all'>('all')
  const [expanded,setExpanded]=useState<string|null>(null)
  const [profileOpen,setProfileOpen]=useState(false)
  const mine=listings.filter(item=>item.sellerId===sellerId).sort((a,b)=>(b.createdAt?.seconds??0)-(a.createdAt?.seconds??0))
  const myOffers=offers.filter(item=>item.sellerId===sellerId).sort((a,b)=>(b.createdAt?.seconds??0)-(a.createdAt?.seconds??0))
  const mySales=transactions.filter(item=>item.sellerId===sellerId).sort((a,b)=>(b.createdAt?.seconds??0)-(a.createdAt?.seconds??0))
  const myMatches=matches.filter(m=>mine.some(l=>l.listingId===m.listingId))
  const myNotices=notifications.filter(n=>n.recipientId===sellerId)
  const currentOffer=myOffers.filter(x=>x.offerStatus==='pending')
  const scheduled=mySales.filter(x=>['collection_scheduled','in_progress','awaiting_weighing'].includes(x.transactionStatus))
  const completed=mySales.filter(x=>x.transactionStatus==='completed')
  const paid=completed.filter(x=>x.paymentStatus==='paid'&&typeof x.verifiedWeightKg==='number'&&Number.isFinite(x.verifiedWeightKg)&&x.verifiedWeightKg>=0&&Number.isFinite(x.agreedPricePerKg)&&x.agreedPricePerKg>=0)
  const paidKg=paid.reduce((sum,x)=>sum+x.verifiedWeightKg!,0)
  const paidValue=paid.reduce((sum,x)=>sum+x.verifiedWeightKg!*x.agreedPricePerKg,0)
  const active=mine.filter(x=>x.listingStatus==='active').length
  const filtered=mine.filter(x=>(status==='all'||x.listingStatus===status)&&[x.listingTitle,x.quantityDescription,x.collectionAddress?.city,x.collectionAddress?.suburb].some(s=>(s??'').toLowerCase().includes(search.toLowerCase())))
  const name=sellerName?.trim()||'Seller'
  const firstName=sellerName?.trim().split(/\s+/)[0]
  const initials=name.split(/\s+/).map(x=>x[0]).slice(0,2).join('').toUpperCase()
  const greeting = new Date().getHours()<12?'Good morning':new Date().getHours()<17?'Good afternoon':'Good evening'
  const calendarDate=new Intl.DateTimeFormat('en-ZA',{weekday:'long',day:'numeric',month:'long',year:'numeric'}).format(new Date())
  const listingName=(id:string)=>mine.find(x=>x.listingId===id)?.listingTitle||'PET bottles'
  const opening = page==='overview'?'Overview':nav.find(x=>x.id===page)?.label||'Overview'
  function go(target:Page){setPage(target);setExpanded(null);setProfileOpen(false);onCloseCreate?.()}
  function openListing(id:string){if(onOpenListing){onOpenListing(id);return}setExpanded(id);go('materials');setExpanded(id)}
  const listingRow=(l:SellerListing)=>(
    <li className="wl-material-row" key={l.listingId}>
      <div className="wl-material-photo">{l.imageUrls?.[0]?<img src={l.imageUrls[0]} alt="" loading="lazy"/>:<Recycle size={22}/>}</div>
      <div className="wl-material-name"><strong>{l.listingTitle}</strong><small>PET bottles · {l.collectionAddress?.suburb||l.collectionAddress?.city||'Location pending'}</small></div>
      <div className="wl-material-weight"><strong>{l.estimatedWeightKg===undefined?'Weight unknown':`${weight(l.estimatedWeightKg)} kg`}</strong><small>{l.quantityDescription}</small></div>
      <span className="wl-pill" data-kind={l.listingStatus}>{human(l.listingStatus)}</span>
      <button className="wl-arrow" type="button" aria-label={`View ${l.listingTitle}`} onClick={()=>openListing(l.listingId)}><ChevronRight size={19}/></button>
    </li>
  )
  const recordCard=(t:Transaction)=>(
    <li className="wl-record" key={t.transactionId}>
      <span className="wl-record-icon"><Truck size={18}/></span>
      <div><strong>{listingName(t.listingId)}</strong><small>{human(t.selectedCollectionMethod)} · {t.verifiedWeightKg===undefined?'Weight pending':`${weight(t.verifiedWeightKg)} kg verified`}</small></div>
      <div className="wl-record-right"><strong>{t.verifiedWeightKg===undefined?'Final price pending':cash(t.verifiedWeightKg*t.agreedPricePerKg)}</strong><span className="wl-pill" data-kind={t.transactionStatus}>{human(t.transactionStatus)}</span></div>
    </li>
  )
  return <div className="wl-app">
    <aside className="wl-sidebar">
      <div className="wl-brand"><span><Leaf size={20}/></span><strong>Waste<b>Link</b></strong></div>
      <div className="wl-nav-title">WORKSPACE</div>
      <nav aria-label="Seller pages" className="wl-nav">
        {nav.slice(0,6).map(({id,label,icon:Icon})=><button key={id} type="button" onClick={()=>go(id)} className={page===id&&!createContent?'active':''}><Icon size={17}/><span>{label}</span>{id==='matches'&&myMatches.length>0&&<em>{myMatches.length}</em>}</button>)}
      </nav>
      <div className="wl-nav-title wl-nav-title--account">ACCOUNT</div>
      <nav aria-label="Account pages" className="wl-nav">
        {nav.slice(6).map(({id,label,icon:Icon})=><button key={id} type="button" className={page===id&&!createContent?'active':''} onClick={()=>go(id)}><Icon size={17}/><span>{label}</span>{id==='notifications'&&myNotices.filter(n=>!n.isRead).length>0&&<em>{myNotices.filter(n=>!n.isRead).length}</em>}</button>)}
      </nav>
      <div className="wl-sidebar-bottom"><div className="wl-impact"><div><Leaf size={15}/> Your verified impact</div><strong>{weight(paidKg)} kg</strong><small>Recorded paid PET sales</small></div><small>WasteLink · Seller workspace</small></div>
    </aside>
    <div className="wl-right">
      <header className="wl-top">
        <label className="wl-search"><Search size={17}/><input aria-label="Search material listings" placeholder="Search your materials..." value={search} onChange={e=>{setSearch(e.target.value);if(e.target.value){setPage('materials');onCloseCreate?.()}}}/></label>
        <div className="wl-account">
          <div className="wl-role">Viewing as <strong>Supplier</strong></div>
          <span className="wl-divider"/>
          <button className="wl-notification" type="button" aria-label="View notifications" onClick={()=>go('notifications')}><Bell size={18}/>{myNotices.filter(n=>!n.isRead).length>0&&<em>{myNotices.filter(n=>!n.isRead).length}</em>}</button>
          <button className="wl-user" type="button" onClick={()=>setProfileOpen(!profileOpen)} aria-expanded={profileOpen}><span className="wl-avatar">{initials}</span><span><strong>{name}</strong><small>Supplier</small></span><ChevronDown size={13}/></button>
          {profileOpen&&<div className="wl-user-menu"><button type="button" onClick={()=>go('profile')}>Profile & settings</button><button type="button" onClick={()=>go('notifications')}>Notifications</button></div>}
        </div>
      </header>
      <main className="wl-main">
        {createContent ? createContent : <>
          <div className="wl-intro"><div><p className="wl-date">{calendarDate}</p><h1>{page==='overview'? `${greeting}${firstName?`, ${firstName}`:''}`:opening}</h1><p>{page==='overview'?"Here's what's happening with your recyclable materials today.":page==='materials'?'All your recyclable PET listings in one place.':page==='matches'?'Buyer compatibility records for your materials.':page==='groups'?'See whether your small quantities can be combined for pickup.':page==='collections'?'Follow the status of arranged pickups.':page==='transactions'?'Track confirmed transactions and payments.':page==='notifications'?'Updates associated with your seller account.':'Your account information and preferences.'}</p></div>{!['profile','notifications'].includes(page)&&<button type="button" className="wl-btn" disabled={!onCreateListing} onClick={onCreateListing}><Plus size={17}/> List recyclable material</button>}</div>
          {error&&<div className="wl-error" role="alert">{error} {onRetry&&<button type="button" onClick={onRetry}>Try again</button>}</div>}
          {loading?<div className="wl-loading" role="status">Loading seller records…</div>:error?null:<>
            {page==='overview'&&<>
              <section className="wl-kpis" aria-label="Seller dashboard summary">
                {[
                  {label:'Active listings',value:String(active),detail:'PET listings available',icon:Box,tone:'green'},
                  {label:'Buyer matches',value:String(myMatches.filter(x=>x.matchStatus==='compatible').length),detail:'Compatible matches',icon:Handshake,tone:'mint'},
                  {label:'Pending offers',value:String(currentOffer.length),detail:'Awaiting your response',icon:ClipboardList,tone:'yellow'},
                  {label:'Completed',value:String(completed.length),detail:'Transactions',icon:Check,tone:'blue'},
                  {label:'Verified PET sold',value:weight(paidKg)+' kg',detail:'Paid completed sales',icon:Leaf,tone:'green'},
                ].map(({label,value,detail,icon:Icon,tone})=><article className="wl-kpi" key={label}><div><span className={`wl-icon wl-icon--${tone}`}><Icon size={19}/></span><span className="wl-kpi-label">{label}</span></div><strong>{value}</strong><small>{detail}</small></article>)}
              </section>
              <div className="wl-columns">
                <div className="wl-stack">
                  <section className="wl-card"><div className="wl-card-heading"><div><h2>Recent material listings</h2><p>Your latest recyclable material activity</p></div><button type="button" onClick={()=>go('materials')}>View all <ArrowRight size={14}/></button></div>
                    {mine.length?<ul className="wl-material-list">{mine.slice(0,3).map(listingRow)}</ul>:<Empty icon={PackageOpen} title="No materials listed yet" detail="List your PET bottles to start connecting with buyers." button="Create your first listing" onClick={onCreateListing}/>}
                  </section>
                  <section className="wl-card"><div className="wl-card-heading"><div><h2>Incoming offers</h2><p>Respond to buyers interested in your materials</p></div><span className="wl-mini-pill">{currentOffer.length} pending</span></div>
                    {currentOffer.length?<ul className="wl-offer-list">{currentOffer.slice(0,3).map(o=><li key={o.offerId}><span className="wl-buyer-mark"><Handshake size={17}/></span><div><strong>Offer for {listingName(o.listingId)}</strong><small>{o.proposedWeightKg===undefined?'Weight to be verified':`${weight(o.proposedWeightKg)} kg proposed`}</small></div><strong>{cash(o.offeredPricePerKg)}/kg</strong><button type="button" onClick={()=>go('matches')}>View</button></li>)}</ul>:<Empty icon={Handshake} title="No incoming offers" detail="Offers will appear when a buyer is interested in your materials."/>}
                  </section>
                </div>
                <div className="wl-stack">
                  <section className="wl-card wl-match-card"><span className="wl-match-icon"><Handshake size={24}/></span><p className="wl-new-tag">BUYER OPPORTUNITIES</p><h2>{myMatches.filter(x=>x.matchStatus==='compatible').length} compatible buyer matches</h2><p>Your PET listings can be matched against buyer requirements.</p><button type="button" className="wl-btn" onClick={()=>go('matches')}>Explore matches <ArrowRight size={16}/></button></section>
                  <section className="wl-card"><div className="wl-card-heading"><div><h2>Upcoming collection</h2><p>Confirmed pickups and delivery progress</p></div></div>
                    {scheduled.length?<ul className="wl-record-list">{scheduled.slice(0,2).map(recordCard)}</ul>:<Empty icon={Truck} title="No collection scheduled" detail="Agreed pickup arrangements will appear here."/>}
                  </section>
                  <section className="wl-card"><div className="wl-card-heading"><div><h2>Recent notifications</h2><p>Seller account updates</p></div><button type="button" onClick={()=>go('notifications')}>View all <ArrowRight size={14}/></button></div>{myNotices.length?<ul className="wl-note-list">{myNotices.slice(0,3).map(n=><li key={n.notificationId}><Bell size={15}/><span><strong>{n.title}</strong><small>{n.message}</small></span></li>)}</ul>:<Empty icon={Bell} title="No new notifications" detail="You'll see account updates here when they arrive."/>}</section>
                </div>
              </div>
            </>}
            {page==='materials'&&<section className="wl-card wl-full"><div className="wl-card-heading"><div><h2>My material listings</h2><p>{mine.length} listing{mine.length===1?'':'s'} in your account</p></div><select aria-label="Filter listing status" value={status} onChange={e=>setStatus(e.target.value as ListingStatus|'all')}><option value="all">All statuses</option>{(['active','draft','reserved','collected','delivered','completed','cancelled'] as ListingStatus[]).map(s=><option key={s} value={s}>{human(s)}</option>)}</select></div>
              {filtered.length?<ul className="wl-material-list">{filtered.map(listingRow)}</ul>:<Empty icon={Package} title={mine.length?'No matching materials':'Your materials will appear here'} detail={mine.length?'Change your search or status filter.':'Start by adding PET bottles.'} button={mine.length?undefined:'List material'} onClick={onCreateListing}/>}
              {expanded&&mine.some(x=>x.listingId===expanded)&&(()=>{const item=mine.find(x=>x.listingId===expanded)!;return <div className="wl-detail"><button type="button" onClick={()=>setExpanded(null)}>Close details</button><h3>{item.listingTitle}</h3><p>{item.description||'No description supplied.'}</p><dl><div><dt>Quantity</dt><dd>{item.quantityDescription}</dd></div><div><dt>Weight</dt><dd>{item.estimatedWeightKg===undefined?'Unknown':`${weight(item.estimatedWeightKg)} kg (estimate)`}</dd></div><div><dt>Condition</dt><dd>{human(item.bottleCondition)}</dd></div><div><dt>Collection</dt><dd>{human(item.collectionMethod)}</dd></div></dl></div>})()}
            </section>}
            {page==='matches'&&<section className="wl-card wl-full"><div className="wl-card-heading"><div><h2>Buyer matches</h2><p>Compatibility is not the same as a confirmed purchase.</p></div></div>{myMatches.length?<ul className="wl-record-list">{myMatches.map((m,i)=><li className="wl-record" key={`${m.listingId}-${m.requirementId}-${i}`}><span className="wl-record-icon"><Handshake size={18}/></span><div><strong>{listingName(m.listingId)}</strong><small>Buyer requirement: {m.requirementId}</small></div><span className="wl-pill" data-kind={m.matchStatus}>{human(m.matchStatus)}</span></li>)}</ul>:<Empty icon={Handshake} title="No buyer matches yet" detail="Compatible buyer requirements will appear here when matching data becomes available."/>}</section>}
            {page==='matches'&&myOffers.length>0&&<section className="wl-card wl-full" style={{marginTop:16}}><div className="wl-card-heading"><div><h2>Incoming buyer offers</h2><p>Buyer-submitted PET rates; final price follows verified weight.</p></div></div><ul className="wl-offer-list">{myOffers.map(o=><li key={o.offerId}><span className="wl-buyer-mark"><Handshake size={17}/></span><div><strong>{listingName(o.listingId)}</strong><small>{human(o.offerStatus)} · {o.proposedWeightKg===undefined?'Weight pending':`${weight(o.proposedWeightKg)} kg proposed`}</small></div><strong>{cash(o.offeredPricePerKg)}/kg</strong></li>)}</ul></section>}
            {page==='groups'&&<section className="wl-card wl-full"><div className="wl-card-heading"><div><h2>Group collections</h2><p>Combine compatible quantities for fewer pickup trips.</p></div></div><Empty icon={Users} title="Group collection planning" detail="Collection pooling is not connected in this MVP yet. No groups or savings are claimed."/></section>}
            {page==='collections'&&<section className="wl-card wl-full"><div className="wl-card-heading"><div><h2>Collections</h2><p>Agreed pickup and delivery activity</p></div></div>{scheduled.length?<ul className="wl-record-list">{scheduled.map(recordCard)}</ul>:<Empty icon={Truck} title="No active collections" detail="Confirmed collection arrangements will appear here."/>}</section>}
            {page==='transactions'&&<section className="wl-card wl-full"><div className="wl-card-heading"><div><h2>Transaction history</h2><p>Material earnings: {cash(paidValue)} from paid completed sales</p></div></div>{mySales.length?<ul className="wl-record-list">{mySales.map(recordCard)}</ul>:<Empty icon={Wallet} title="No transactions yet" detail="Your sales will appear once you and a buyer agree on an offer."/>}</section>}
            {page==='notifications'&&<section className="wl-card wl-full"><div className="wl-card-heading"><div><h2>Notifications</h2><p>Updates related to your seller account</p></div></div>{myNotices.length?<ul className="wl-note-list">{myNotices.map(n=><li key={n.notificationId}><Bell size={16}/><span><strong>{n.title}</strong><small>{n.message}</small></span></li>)}</ul>:<Empty icon={Bell} title="All caught up" detail="You have no notifications yet."/>}</section>}
            {page==='profile'&&<section className="wl-card wl-full"><div className="wl-card-heading"><div><h2>Seller profile</h2><p>Account management is handled by your team's authentication screens.</p></div></div><div className="wl-profile"><span className="wl-avatar">{initials}</span><div><strong>{name}</strong><small>Supplier account</small></div></div></section>}
          </>}
        </>}
      </main>
    </div>
  </div>
}