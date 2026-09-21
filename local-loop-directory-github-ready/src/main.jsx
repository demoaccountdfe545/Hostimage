import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Search, MapPin, ChevronDown, ChevronRight, Star, Car, Utensils,
  House, BriefcaseBusiness, HeartPulse, Scissors, ShoppingBag,
  Users, CalendarDays, Ellipsis, Phone, Clock3, Wrench, Dumbbell,
  Stethoscope, ArrowUpRight, Menu, X, Radio, BookOpen, Megaphone,
  CheckCircle2
} from 'lucide-react';
import './styles.css';

const categories = [
  { name: 'Automotive', icon: Car },
  { name: 'Food & Dining', icon: Utensils },
  { name: 'Home Services', icon: House },
  { name: 'Professional Services', icon: BriefcaseBusiness },
  { name: 'Health & Wellness', icon: HeartPulse },
  { name: 'Beauty', icon: Scissors },
  { name: 'Shopping', icon: ShoppingBag },
  { name: 'Community', icon: Users },
  { name: 'Events', icon: CalendarDays },
  { name: 'More', icon: Ellipsis }
];

const featured = [
  {
    id: 1, name: 'Johnson Auto Group', category: 'Automotive', tagline: 'Driven by people. Powered by community.',
    description: 'New and pre-owned vehicles, flexible financing and expert service.', address: '2000 N 7th St, Monroe, LA', close: '7:00 PM',
    image: 'https://images.unsplash.com/photo-1562141961-b5d79ac7b035?auto=format&fit=crop&w=1200&q=85',
    services: ['Sales', 'Service', 'Financing']
  },
  {
    id: 2, name: 'The Olive Branch', category: 'Food & Dining', tagline: 'Great food. Greater community.',
    description: 'A locally owned restaurant serving steaks, seafood and Southern favorites.', address: '321 Desiard St, Monroe, LA', close: '10:00 PM',
    image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=85',
    services: ['Dine-In', 'Takeout', 'Catering']
  },
  {
    id: 3, name: 'Boudreaux Home Solutions', category: 'Home Services', tagline: 'Your local home improvement experts.',
    description: 'Roofing, remodeling and repairs you can trust. Quality work. Local people.', address: '1501 Louisville Ave, Monroe, LA', close: '6:00 PM',
    image: 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1200&q=85',
    services: ['Roofing', 'Remodeling', 'Repairs']
  }
];

const localBusinesses = [
  { id: 4, name: 'Parkside Pharmacy', category: 'Health & Wellness', address: '789 Louisville Ave, Monroe, LA', phone: '318-555-0175', close: '7:00 PM', icon: 'P' },
  { id: 5, name: 'Monroe Auto Care', category: 'Automotive', address: '123 Main St, Monroe, LA', phone: '318-555-0107', close: '6:00 PM', Icon: Wrench },
  { id: 6, name: 'Shear Perfection Salon', category: 'Beauty', address: '258 Tower Dr, Monroe, LA', phone: '318-555-0144', close: '6:00 PM', Icon: Scissors },
  { id: 7, name: "Carter's Pest Control", category: 'Home Services', address: '1420 N 18th St, Monroe, LA', phone: '318-555-0190', close: '5:00 PM', Icon: House },
  { id: 8, name: 'River City Dental', category: 'Health & Wellness', address: '456 Oak Ridge Drive, Monroe, LA', phone: '318-555-0122', close: '5:00 PM', Icon: Stethoscope },
  { id: 9, name: 'Elite Fitness Monroe', category: 'Health & Wellness', address: '200 Blanchard St, Monroe, LA', phone: '318-555-0155', close: '9:00 PM', Icon: Dumbbell }
];

function Logo() {
  return <a className="brand" href="#top" aria-label="Local Loop home"><span>LOCAL</span><b>LOOP</b><small>106.7 FM · Community Directory</small></a>;
}

function Header({ onList }) {
  const [open, setOpen] = useState(false);
  return <>
    <header className="hero" id="top">
      <div className="hero-inner">
        <Logo />
        <div className="hero-copy"><h1>Discover Local. Support Local.</h1><p>Find businesses, services, restaurants and community resources serving Monroe and the surrounding community.</p></div>
        <div className="together">Stronger<br/><span>Together</span></div>
      </div>
    </header>
    <nav className="nav">
      <div className="nav-inner">
        <button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button>
        <div className={`nav-links ${open ? 'open' : ''}`}>
          {['Home','Directory','Local Events','Local Stories','Digital Magazine','Listen Live'].map((item, i) => <a key={item} className={i===0?'active':''} href={i===1?'#directory':'#top'}>{item}</a>)}
        </div>
        <button className="red-cta" onClick={onList}>List Your Business <ChevronRight size={17}/></button>
      </div>
    </nav>
  </>;
}

function SearchBar({ query, setQuery, category, setCategory }) {
  return <section className="search-band" aria-label="Business search">
    <div className="search-wrap">
      <label className="field grow"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="What are you looking for?"/></label>
      <div className="field location"><MapPin/><span>Monroe, LA</span><ChevronDown size={17}/></div>
      <label className="field category-select"><BriefcaseBusiness/><select value={category} onChange={e=>setCategory(e.target.value)}><option>All Categories</option>{categories.slice(0,-1).map(c=><option key={c.name}>{c.name}</option>)}</select><ChevronDown size={17}/></label>
      <a className="search-button" href="#directory"><Search/> Search</a>
    </div>
  </section>;
}

function CategoryRail({ selected, setSelected }) {
  return <div className="category-rail">{categories.map(({name,icon:Icon})=><button key={name} className={selected===name?'selected':''} onClick={()=>setSelected(selected===name?'All Categories':name)}><span><Icon/></span><em>{name}</em></button>)}</div>;
}

function SectionTitle({ children, note, action }) {
  return <div className="section-title"><div><h2>{children}</h2>{note&&<p>{note}</p>}</div>{action&&<button>{action}<ChevronRight size={16}/></button>}</div>;
}

function StatusLine({ close }) { return <div className="status"><span></span><strong>Open now</strong><i>·</i><span className="closes">Closes {close}</span></div>; }

function FeaturedCard({ item, onView }) {
  return <article className="featured-card">
    <div className="featured-image" style={{backgroundImage:`url(${item.image})`}}><span className="featured-label"><Star size={14} fill="currentColor"/> Featured partner</span></div>
    <div className="card-body"><span className="tag">{item.category}</span><h3>{item.name}</h3><p className="tagline">{item.tagline}</p><p>{item.description}</p>
      <div className="service-row">{item.services.map((s,i)=><span key={s}>{i===0?<CheckCircle2/>:i===1?<Wrench/>:<BriefcaseBusiness/>}{s}</span>)}</div>
      <div className="detail"><MapPin/> {item.address}</div><StatusLine close={item.close}/>
      <div className="card-actions"><button className="primary" onClick={()=>onView(item)}>View profile</button><a href="tel:3185550100"><Phone/> Call</a><a href={`https://maps.google.com/?q=${encodeURIComponent(item.address)}`} target="_blank">Directions</a></div>
    </div>
  </article>;
}

function PresenceCard({ business, type }) {
  const Icon = type==='dental'?Stethoscope:Dumbbell;
  return <article className="presence-card"><div className={`presence-logo ${type}`}><Icon/><b>{type==='dental'?'River City':'Elite'}</b></div><div className="presence-content"><span className="tag">Health & Wellness</span><h3>{business}</h3><p>{type==='dental'?'Compassionate, comprehensive dental care for the whole family.':'Stronger people. A healthier community.'}</p><div className="detail"><MapPin/> {type==='dental'?'456 Oak Ridge Drive':'200 Blanchard St'}, Monroe, LA</div><StatusLine close={type==='dental'?'5:00 PM':'9:00 PM'}/></div><div className={`presence-photo ${type}`}></div><div className="presence-actions"><button>View profile</button><a href="tel:3185550100"><Phone/> Call</a><a href="#top">Website <ArrowUpRight/></a></div></article>;
}

function BusinessCard({ item, onView }) {
  const Icon = item.Icon;
  return <article className="business-card"><div className="business-icon">{Icon?<Icon/>:<b>{item.icon}</b>}</div><div className="business-category">{item.category}</div><h3>{item.name}</h3><div className="detail"><MapPin/> {item.address}</div><div className="detail"><Phone/> {item.phone}</div><StatusLine close={item.close}/><div className="link-row"><a href="#top">Website</a><button onClick={()=>onView(item)}>View details</button></div></article>;
}

function Footer({ onList }) {
  return <footer><div className="footer-top"><div><h2>Local businesses build stronger communities.</h2><div className="footer-features"><span><Radio/><b>106.7 FM</b><small>On air. In the community.</small></span><span><BookOpen/><b>Digital Magazine</b><small>Stories that inspire.</small></span><span><Users/><b>Local Directory</b><small>Find. Support. Grow.</small></span></div></div><button onClick={onList}>Add Your Business Today <ChevronRight/></button></div><div className="footer-bottom"><Logo/><div className="footer-links"><a href="#top">About</a><a href="#top">Contact</a><a href="#top">Advertise</a><a href="#top">Privacy</a></div><div className="social"><a href="#top">f</a><a href="#top">◎</a><a href="#top">▶</a></div></div></footer>;
}

function Modal({ type, item, onClose }) {
  const [sent,setSent]=useState(false);
  if (!type) return null;
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={onClose}><X/></button>{type==='list'?<>{sent?<div className="success"><CheckCircle2/><h2>Thanks! We’ll be in touch.</h2><p>Your listing request has been received.</p></div>:<><span className="modal-icon"><Megaphone/></span><h2>Put your business on the map.</h2><p>Tell us a little about your business and our local directory team will contact you.</p><form onSubmit={e=>{e.preventDefault();setSent(true)}}><label>Business name<input required placeholder="Your business name"/></label><label>Your name<input required placeholder="Full name"/></label><label>Email address<input required type="email" placeholder="you@business.com"/></label><button className="primary" type="submit">Request a listing <ChevronRight/></button></form></> }</>:<><span className="modal-icon"><BriefcaseBusiness/></span><span className="tag">{item.category}</span><h2>{item.name}</h2><p>{item.description||'A trusted local business serving the Monroe community.'}</p><div className="modal-detail"><MapPin/> {item.address}</div>{item.phone&&<div className="modal-detail"><Phone/> {item.phone}</div>}<StatusLine close={item.close}/><button className="primary full" onClick={onClose}>Done</button></>}</div></div>;
}

function App() {
  const [query,setQuery]=useState(''); const [category,setCategory]=useState('All Categories'); const [sort,setSort]=useState('Relevance'); const [page,setPage]=useState(1); const [modal,setModal]=useState(null);
  const filtered=useMemo(()=>localBusinesses.filter(b=>(category==='All Categories'||category==='More'||b.category===category)&&b.name.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>sort==='A–Z'?a.name.localeCompare(b.name):0),[query,category,sort]);
  return <><Header onList={()=>setModal({type:'list'})}/><SearchBar query={query} setQuery={setQuery} category={category} setCategory={setCategory}/><main><CategoryRail selected={category} setSelected={setCategory}/><section><SectionTitle note="Top businesses in our community." action="See all featured">Featured Local Businesses</SectionTitle><div className="featured-grid">{featured.map(i=><FeaturedCard key={i.id} item={i} onView={item=>setModal({type:'view',item})}/>)}</div></section><section className="presence-section"><SectionTitle note="More information. More connection." action="See all local presence">Local Presence Businesses</SectionTitle><div className="presence-grid"><PresenceCard business="River City Dental" type="dental"/><PresenceCard business="Elite Fitness Monroe" type="fitness"/></div></section><section className="directory" id="directory"><div className="directory-head"><SectionTitle note="Find the services you need.">All Local Businesses</SectionTitle><div className="results">Showing {filtered.length?1:0}–{filtered.length} of {filtered.length} results</div><label className="sort">Sort by:<select value={sort} onChange={e=>setSort(e.target.value)}><option>Relevance</option><option>A–Z</option></select><ChevronDown/></label></div>{filtered.length?<div className="business-grid">{filtered.map(i=><BusinessCard key={i.id} item={i} onView={item=>setModal({type:'view',item})}/>)}</div>:<div className="empty"><Search/><h3>No local businesses found</h3><p>Try another search or category.</p></div>}<div className="pagination">{[1,2,3,4,5].map(n=><button key={n} className={page===n?'active':''} onClick={()=>setPage(n)}>{n}</button>)}<span>…</span><button>17</button><button onClick={()=>setPage(Math.min(17,page+1))}>Next <ChevronRight/></button></div></section></main><Footer onList={()=>setModal({type:'list'})}/><Modal type={modal?.type} item={modal?.item} onClose={()=>setModal(null)}/></>;
}

createRoot(document.getElementById('root')).render(<App/>);
