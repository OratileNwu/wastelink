import { useEffect, useState } from 'react'
import type { ComponentType } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Bell, Boxes, ChartNoAxesCombined, ChevronDown, ClipboardList, CircleUserRound, Handshake, House, LayoutDashboard, Leaf, Menu, Package, Recycle, Search, Settings, ShoppingBag, Truck, X } from 'lucide-react'

type NavItem = { label: string; to: string; icon: ComponentType<{ size?: number; strokeWidth?: number }> }

const platformItems: NavItem[] = [
  { label: 'Platform overview', to: '/', icon: LayoutDashboard },
  { label: 'Explore marketplace', to: '/buyer/materials', icon: Boxes },
  { label: 'Buyer workspace', to: '/buyer', icon: ShoppingBag },
  { label: 'Seller workspace', to: '/seller', icon: Recycle },
]
const buyerItems: NavItem[] = [
  { label: 'Overview', to: '/buyer', icon: LayoutDashboard },
  { label: 'Incoming materials', to: '/buyer/materials', icon: Package },
  { label: 'Buying requirements', to: '/buyer/requirements', icon: Handshake },
  { label: 'Collections', to: '/buyer/collections', icon: Truck },
  { label: 'Transactions', to: '/buyer/transactions', icon: ClipboardList },
]
const accountItems: NavItem[] = [
  { label: 'Notifications', to: '/notifications', icon: Bell },
  { label: 'Profile & settings', to: '/settings', icon: Settings },
]

function NavSection({ title, items, onNavigate }: { title: string; items: NavItem[]; onNavigate: () => void }) {
  return <section className="wl-side-section" aria-label={title}>
    <span className="wl-side-label">{title}</span>
    <div className="wl-side-links">
      {items.map(({ label, to, icon: Icon }) => <NavLink key={to} to={to} end={to === '/' || to === '/buyer'} onClick={onNavigate} className={({ isActive }) => 'wl-side-link' + (isActive ? ' is-active' : '')}>
        <Icon size={20} strokeWidth={1.9} /><span>{label}</span>
      </NavLink>)}
    </div>
  </section>
}

export function WasteLinkLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const isBuyer = location.pathname.startsWith('/buyer') || ['/marketplace', '/offers', '/my-purchases'].includes(location.pathname)
  const isSeller = location.pathname.startsWith('/seller')
  const currentView = isBuyer ? 'buyer' : isSeller ? 'seller' : 'overall'
  const [navOpen, setNavOpen] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => { setNavOpen(false) }, [location.pathname])

  function searchRequirements(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    navigate('/buyer/requirements?q=' + encodeURIComponent(query.trim()))
  }

  return <div className="wl-shell">
    {navOpen && <button type="button" className="wl-sidebar-backdrop" aria-label="Close navigation" onClick={() => setNavOpen(false)} />}
    <aside className={'wl-sidebar' + (navOpen ? ' is-open' : '')}>
      <Link to="/" className="wl-brand" onClick={() => setNavOpen(false)}>
        <span className="wl-brand-icon"><Leaf size={25} /></span><span>Waste<span>Link</span></span>
      </Link>
      <div className="wl-sidebar-scroll">
        <NavSection title="WORKSPACE" items={isBuyer ? buyerItems : platformItems} onNavigate={() => setNavOpen(false)} />
        <NavSection title="ACCOUNT" items={accountItems} onNavigate={() => setNavOpen(false)} />
      </div>
      <div className="wl-impact"><div className="wl-impact-label"><Leaf size={18} /> Your verified impact</div><strong>— kg</strong><span>Will appear when verified transaction data is connected</span></div>
    </aside>
    <div className="wl-content-shell">
      <header className="wl-topbar">
        <button className="wl-menu-button" type="button" aria-label="Open navigation" onClick={() => setNavOpen(true)}><Menu size={23} /></button>
        <form className="wl-top-search" onSubmit={searchRequirements} role="search">
          <Search size={19} aria-hidden="true" />
          <input aria-label="Search buying requirements" placeholder="Search buying requirements" value={query} onChange={(e) => setQuery(e.target.value)} />
        </form>
        <div className="wl-topbar-right">
          <label className="wl-view-selector"><span>Viewing as</span>
            <span className="wl-view-select-wrap">
              <select aria-label="Switch workspace" value={currentView} onChange={(event) => navigate(event.target.value === 'overall' ? '/' : '/' + event.target.value)}>
                <option value="overall">Overall</option><option value="buyer">Buyer</option><option value="seller">Seller</option>
              </select><ChevronDown size={13} aria-hidden="true" />
            </span>
          </label>
          <Link to="/notifications" className="wl-icon-button" aria-label="Notifications"><Bell size={21} /></Link>
          <Link to="/settings" className="wl-user"><span className="wl-avatar"><CircleUserRound size={21} /></span><span className="wl-user-copy"><strong>Your account</strong><small>Profile</small></span><ChevronDown size={15} /></Link>
        </div>
      </header>
      <main className="wl-page"><Outlet /></main>
      <footer className="wl-bottom"><span>WasteLink · Connecting waste to opportunity</span><span>Buyer & seller marketplace</span></footer>
    </div>
  </div>
}
