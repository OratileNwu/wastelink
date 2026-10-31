import { BrowserRouter, NavLink, Link, Outlet, Route, Routes } from 'react-router-dom'
import { ArrowLeft, ArrowRight, ClipboardList, HandCoins, Leaf, PackageSearch, Recycle, ShoppingBag } from 'lucide-react'

function Shell() {
  return (
    <div className="wl-app">
      <header className="navbar wl-header">
        <div className="container navbar-inner wl-header-inner">
          <Link to="/" className="navbar-brand"><span className="wl-logo"><Leaf size={20} /></span>WasteLink</Link>
          <nav className="navbar-links wl-nav" aria-label="Main navigation">
            <NavLink to="/" end className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Home</NavLink>
            <NavLink to="/marketplace" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Marketplace</NavLink>
            <NavLink to="/buyer" className={({ isActive }) => 'navbar-link' + (isActive ? ' active' : '')}>Buyer dashboard</NavLink>
          </nav>
        </div>
      </header>
      <main className="wl-main"><Outlet /></main>
      <footer className="wl-footer"><div className="container wl-footer-inner"><strong>WasteLink</strong><span>Connecting waste to opportunity</span></div></footer>
    </div>
  )
}

function OverallDashboard() {
  return (
    <>
      <section className="wl-hero">
        <div className="container wl-hero-content">
          <span className="wl-eyebrow"><Recycle size={17} /> Recycling marketplace</span>
          <h1>Connect waste to opportunity.</h1>
          <p>WasteLink connects buyers and sellers of recyclable materials in one marketplace.</p>
          <div className="wl-actions">
            <Link className="btn wl-hero-primary" to="/marketplace">Browse materials <ArrowRight size={17} /></Link>
            <Link className="btn wl-hero-secondary" to="/buyer">Buyer dashboard</Link>
          </div>
        </div>
      </section>
      <section className="container wl-section">
        <span className="wl-kicker">Get started</span>
        <h2>A marketplace for buyers and sellers</h2>
        <p>Explore available materials or connect with someone looking for recyclable resources.</p>
        <div className="wl-grid wl-two">
          <article className="card wl-tile">
            <span className="wl-tile-icon"><ShoppingBag size={23} /></span>
            <h3>I'm buying</h3><p>Discover materials, manage offers and keep track of purchases.</p>
            <Link className="wl-text-link" to="/marketplace">Explore marketplace <ArrowRight size={16} /></Link>
          </article>
          <article className="card wl-tile">
            <span className="wl-tile-icon"><Recycle size={23} /></span>
            <h3>I'm selling</h3><p>List recyclable materials for buyers. The seller experience will be integrated from the team's work.</p>
            <span className="wl-muted">Seller screens are not part of this branch yet.</span>
          </article>
        </div>
      </section>
    </>
  )
}

function EmptyPanel({ title, description }: { title: string; description: string }) {
  return <div className="card wl-empty" role="status"><PackageSearch size={34} aria-hidden="true" /><h2>{title}</h2><p>{description}</p></div>
}

function Marketplace() {
  return (
    <section className="container wl-section">
      <span className="wl-kicker">Discover materials</span>
      <h1>Marketplace</h1>
      <p>Browse recyclable materials posted by sellers.</p>
      <div className="wl-content"><EmptyPanel title="No listings to display yet" description="Listings will appear when the team's marketplace data source is connected." /></div>
    </section>
  )
}

function BuyerDashboard() {
  return (
    <section className="container wl-section">
      <div className="wl-heading-row">
        <div><span className="wl-kicker">Buyer area</span><h1>Buyer dashboard</h1><p>Manage your purchasing activity in one place.</p></div>
        <Link className="btn btn-primary" to="/marketplace">Browse materials <ArrowRight size={16} /></Link>
      </div>
      <div className="wl-grid wl-three">
        <article className="card wl-tile">
          <span className="wl-tile-icon"><ShoppingBag size={23} /></span>
          <h2>Marketplace</h2><p>Find recyclable materials available from sellers.</p>
          <Link className="wl-text-link" to="/marketplace">Find materials <ArrowRight size={16} /></Link>
        </article>
        <article className="card wl-tile">
          <span className="wl-tile-icon"><HandCoins size={23} /></span>
          <h2>Offers</h2><p>No offers to display yet.</p>
          <Link className="wl-text-link" to="/offers">View offers <ArrowRight size={16} /></Link>
        </article>
        <article className="card wl-tile">
          <span className="wl-tile-icon"><ClipboardList size={23} /></span>
          <h2>My purchases</h2><p>No purchases to display yet.</p>
          <Link className="wl-text-link" to="/my-purchases">View purchases <ArrowRight size={16} /></Link>
        </article>
      </div>
    </section>
  )
}

function BuyerActivity({ activity }: { activity: 'offers' | 'purchases' }) {
  const offers = activity === 'offers'
  return (
    <section className="container wl-section">
      <Link className="wl-back" to="/buyer"><ArrowLeft size={16} /> Buyer dashboard</Link>
      <span className="wl-kicker">Buyer area</span><h1>{offers ? 'My offers' : 'My purchases'}</h1>
      <div className="wl-content"><EmptyPanel title={offers ? 'No offers to display yet' : 'No purchases to display yet'} description={offers ? 'Offers will appear when the offers service is connected.' : 'Purchases will appear when the purchases service is connected.'} /></div>
    </section>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<OverallDashboard />} />
          <Route path="marketplace" element={<Marketplace />} />
          <Route path="buyer" element={<BuyerDashboard />} />
          <Route path="offers" element={<BuyerActivity activity="offers" />} />
          <Route path="my-purchases" element={<BuyerActivity activity="purchases" />} />
          <Route path="*" element={<section className="container wl-section"><h1>Page not found</h1></section>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
export default App
