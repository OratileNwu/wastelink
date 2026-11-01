import { ArrowRight, BadgeCheck, Boxes, Handshake, Leaf, MapPin, Recycle, ShieldCheck, Truck } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/landing-page.css";

const heroImage = "https://images.pexels.com/photos/8286620/pexels-photo-8286620.jpeg?auto=compress&cs=tinysrgb&w=1600";

const steps = [
  { number: "01", icon: Boxes, title: "Discover materials", copy: "Explore available PET bottle listings and see what suppliers have made available." },
  { number: "02", icon: Handshake, title: "Connect and agree", copy: "Buyers and sellers can discuss requirements and agree on the details of an exchange." },
  { number: "03", icon: Truck, title: "Coordinate collection", copy: "Choose a fulfilment arrangement and coordinate the movement of recyclable materials." },
];

export default function LandingPage() {
  return (
    <div className="wl-landing">
      <header className="wl-landing-header">
        <Link to="/" className="wl-landing-brand" aria-label="WasteLink home">
          <span className="wl-landing-brand-icon"><Leaf size={23} /></span>
          <span>Waste<span>Link</span></span>
        </Link>
        <nav className="wl-landing-nav" aria-label="Main navigation">
          <a href="#how-it-works">How it works</a>
          <a href="#for-everyone">Who it's for</a>
          <a href="#our-focus">Our focus</a>
        </nav>
        <div className="wl-landing-actions">
          <Link className="wl-landing-signin" to="/login">Sign in</Link>
          <Link className="wl-landing-join" to="/register">Get started <ArrowRight size={16} /></Link>
        </div>
      </header>

      <main>
        <section className="wl-landing-hero">
          <div className="wl-landing-hero-image" style={{ backgroundImage: `url(${heroImage})` }} aria-hidden="true" />
          <div className="wl-landing-hero-shade" aria-hidden="true" />
          <div className="wl-landing-hero-content">
            <span className="wl-landing-kicker"><Leaf size={15} /> WASTE TO OPPORTUNITY</span>
            <h1>Give recyclable materials a <em>better destination.</em></h1>
            <p>WasteLink brings PET bottle suppliers and buyers together in one marketplace — helping turn recyclable waste into useful resources and new opportunities.</p>
            <div className="wl-landing-hero-actions">
              <Link to="/register" className="wl-landing-primary">Join WasteLink <ArrowRight size={18} /></Link>
              <Link to="/buyer/materials" className="wl-landing-secondary">Explore marketplace</Link>
            </div>
            <div className="wl-landing-proof"><span><BadgeCheck size={17} /> Buyer and seller workspaces</span><span><MapPin size={17} /> Local supply connections</span></div>
          </div>
          <div className="wl-landing-hero-note"><Recycle size={22} /><span><strong>Keep materials in circulation</strong><small>Connect supply with demand</small></span></div>
        </section>

        <section className="wl-landing-intro" id="for-everyone">
          <div className="wl-landing-section-label">ONE NETWORK. TWO SIDES.</div>
          <div className="wl-landing-intro-grid">
            <h2>A simpler way to connect the people behind recycling.</h2>
            <p>Finding reliable recyclable material — or finding a buyer for what you collect — can be difficult when information is scattered. WasteLink gives buyers and sellers a shared place to discover opportunities and coordinate with one another.</p>
          </div>
          <div className="wl-landing-audience-grid">
            <article className="wl-landing-audience-card">
              <span className="wl-landing-card-icon"><ShoppingBagIcon /></span>
              <span className="wl-landing-card-label">FOR BUYERS</span>
              <h3>Find the materials you need.</h3>
              <p>Discover PET bottle supply, publish buying requirements and connect with suppliers who can meet your needs.</p>
              <Link to="/buyer/materials">Explore materials <ArrowRight size={16} /></Link>
            </article>
            <article className="wl-landing-audience-card wl-landing-audience-green">
              <span className="wl-landing-card-icon"><Recycle size={25} /></span>
              <span className="wl-landing-card-label">FOR SELLERS</span>
              <h3>Find value in what you collect.</h3>
              <p>Showcase available PET bottles, share collection details and reach buyers looking for recyclable materials.</p>
              <Link to="/register">Start as a seller <ArrowRight size={16} /></Link>
            </article>
          </div>
        </section>

        <section className="wl-landing-how" id="how-it-works">
          <div className="wl-landing-section-label">HOW WASTELINK WORKS</div>
          <div className="wl-landing-how-heading"><h2>From discovery to collection.</h2><p>A connected process designed to make recyclable material exchanges easier to organise.</p></div>
          <div className="wl-landing-steps">
            {steps.map(({ number, icon: Icon, title, copy }) => (
              <article className="wl-landing-step" key={number}>
                <div className="wl-landing-step-top"><span>{number}</span><Icon size={25} /></div>
                <h3>{title}</h3><p>{copy}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="wl-landing-focus" id="our-focus">
          <div className="wl-landing-focus-copy">
            <div className="wl-landing-section-label">STARTING WITH PET</div>
            <h2>Small actions can keep valuable materials moving.</h2>
            <p>WasteLink's current marketplace focus is PET plastic bottles. By making supply and demand easier to find, the platform aims to support more organised collection and recycling activity.</p>
            <ul>
              <li><ShieldCheck size={18} /> Clearer listing and requirement details</li>
              <li><Handshake size={18} /> Direct connection between buyers and sellers</li>
              <li><Truck size={18} /> Collection and fulfilment coordination</li>
            </ul>
            <Link to="/register" className="wl-landing-primary">Become part of the network <ArrowRight size={17} /></Link>
          </div>
          <div className="wl-landing-focus-image" role="img" aria-label="PET plastic bottles collected for recycling" />
        </section>
      </main>

      <footer className="wl-landing-footer">
        <Link to="/" className="wl-landing-brand"><span className="wl-landing-brand-icon"><Leaf size={21} /></span><span>Waste<span>Link</span></span></Link>
        <p>Connecting waste to opportunity.</p>
        <div><Link to="/login">Sign in</Link><Link to="/register">Create account</Link><Link to="/buyer/materials">Marketplace</Link></div>
        <small>© {new Date().getFullYear()} WasteLink. All rights reserved.</small>
      </footer>
    </div>
  );
}

function ShoppingBagIcon() {
  return <Boxes size={25} />;
}
