import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  ArrowUpRight, BriefcaseBusiness, CalendarDays, Car, CheckCircle2, ChevronDown,
  ChevronRight, Dumbbell, Ellipsis, HeartPulse, House, LoaderCircle, MapPin, Menu,
  Megaphone, Phone, Radio, Scissors, Search, ShoppingBag, Star, Users, Utensils,
  Wrench, X, BookOpen
} from 'lucide-react';
import AdminApp from './AdminApp';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import './styles.css';

const categoryIcons = {
  automotive: Car, 'food-dining': Utensils, 'home-services': House,
  'professional-services': BriefcaseBusiness, 'health-wellness': HeartPulse,
  beauty: Scissors, shopping: ShoppingBag, community: Users, events: CalendarDays
};
const fallbackImage = 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=85';

function mapBusiness(row) {
  return {
    ...row,
    category: row.categories?.name || 'Local Business',
    categorySlug: row.categories?.slug || '',
    image: row.image_url || fallbackImage,
    address: [row.address, row.city, row.state].filter(Boolean).join(', ') || 'Monroe, LA',
    close: row.opening_hours?.close || 'today',
    services: row.services || []
  };
}

function useDirectory() {
  const [categories, setCategories] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    async function load() {
      const [categoryResult, businessResult] = await Promise.all([
        supabase.from('categories').select('*').order('sort_order'),
        supabase.from('businesses').select('*, categories(name, slug)').order('created_at', { ascending: false })
      ]);
      if (!active) return;
      if (categoryResult.error || businessResult.error) setError(categoryResult.error?.message || businessResult.error?.message || 'Could not load the directory.');
      else {
        setCategories(categoryResult.data || []);
        setBusinesses((businessResult.data || []).map(mapBusiness));
      }
      setLoading(false);
    }
    load();
    return () => { active = false; };
  }, []);
  return { categories, businesses, loading, error };
}

function Logo() {
  return <a className="brand" href="#top" aria-label="Local Loop home"><span>LOCAL</span><b>LOOP</b><small>106.7 FM · Community Directory</small></a>;
}

function Header({ onList }) {
  const [open, setOpen] = useState(false);
  return <>
    <header className="hero" id="top"><div className="hero-inner"><Logo/><div className="hero-copy"><h1>Discover Local. Support Local.</h1><p>Find businesses, services, restaurants and community resources serving Monroe and the surrounding community.</p></div><div className="together">Stronger<br/><span>Together</span></div></div></header>
    <nav className="nav"><div className="nav-inner"><button className="mobile-menu" onClick={() => setOpen(!open)} aria-label="Toggle navigation">{open ? <X/> : <Menu/>}</button><div className={`nav-links ${open ? 'open' : ''}`}>{['Home','Directory','Local Events','Local Stories','Digital Magazine','Listen Live'].map((item, index) => <a key={item} className={index === 0 ? 'active' : ''} href={index === 1 ? '#directory' : '#top'}>{item}</a>)}</div><button className="red-cta" onClick={onList}>List Your Business <ChevronRight size={17}/></button></div></nav>
  </>;
}

function SearchBar({ query, setQuery, category, setCategory, categories }) {
  return <section className="search-band" aria-label="Business search"><div className="search-wrap"><label className="field grow"><Search/><input value={query} onChange={event => setQuery(event.target.value)} placeholder="What are you looking for?"/></label><div className="field location"><MapPin/><span>Monroe, LA</span><ChevronDown size={17}/></div><label className="field category-select"><BriefcaseBusiness/><select value={category} onChange={event => setCategory(event.target.value)}><option>All Categories</option>{categories.map(item => <option key={item.id}>{item.name}</option>)}</select><ChevronDown size={17}/></label><a className="search-button" href="#directory"><Search/> Search</a></div></section>;
}

function CategoryRail({ categories, selected, setSelected }) {
  const items = [...categories, { id: 'more', name: 'More', slug: 'more' }];
  return <div className="category-rail">{items.map(item => { const Icon = item.slug === 'more' ? Ellipsis : categoryIcons[item.slug] || BriefcaseBusiness; return <button key={item.id} className={selected === item.name ? 'selected' : ''} onClick={() => setSelected(selected === item.name ? 'All Categories' : item.name)}><span><Icon/></span><em>{item.name}</em></button>; })}</div>;
}

function SectionTitle({ children, note }) {
  return <div className="section-title"><div><h2>{children}</h2>{note && <p>{note}</p>}</div></div>;
}

function StatusLine({ close }) {
  return <div className="status"><span></span><strong>Open now</strong><i>·</i><span className="closes">Closes {close}</span></div>;
}

function safeWebsite(value) {
  if (!value) return null;
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function FeaturedCard({ item, onView }) {
  return <article className="featured-card"><div className="featured-image" style={{ backgroundImage: `url(${item.image})` }}><span className="featured-label"><Star size={14} fill="currentColor"/> Featured partner</span></div><div className="card-body"><span className="tag">{item.category}</span><h3>{item.name}</h3>{item.tagline && <p className="tagline">{item.tagline}</p>}<p>{item.description || 'A trusted local business serving our community.'}</p>{item.services.length > 0 && <div className="service-row">{item.services.slice(0, 3).map((service, index) => <span key={service}>{index === 0 ? <CheckCircle2/> : index === 1 ? <Wrench/> : <BriefcaseBusiness/>}{service}</span>)}</div>}<div className="detail"><MapPin/> {item.address}</div><StatusLine close={item.close}/><div className="card-actions"><button className="primary" onClick={() => onView(item)}>View profile</button>{item.phone && <a href={`tel:${item.phone}`}><Phone/> Call</a>}<a href={`https://maps.google.com/?q=${encodeURIComponent(item.address)}`} target="_blank" rel="noreferrer">Directions</a></div></div></article>;
}

function PresenceCard({ item, onView }) {
  const Icon = categoryIcons[item.categorySlug] || Dumbbell;
  return <article className="presence-card"><div className="presence-logo"><Icon/><b>{item.name.split(' ').slice(0, 2).join(' ')}</b></div><div className="presence-content"><span className="tag">{item.category}</span><h3>{item.name}</h3><p>{item.tagline || item.description || 'Proudly serving the Monroe community.'}</p><div className="detail"><MapPin/> {item.address}</div><StatusLine close={item.close}/></div><div className="presence-photo" style={{ backgroundImage: `url(${item.image})` }}></div><div className="presence-actions"><button onClick={() => onView(item)}>View profile</button>{item.phone ? <a href={`tel:${item.phone}`}><Phone/> Call</a> : <span/>}{item.website ? <a href={safeWebsite(item.website)} target="_blank" rel="noreferrer">Website <ArrowUpRight/></a> : <span/>}</div></article>;
}

function BusinessCard({ item, onView }) {
  const Icon = categoryIcons[item.categorySlug] || BriefcaseBusiness;
  return <article className="business-card"><div className="business-icon"><Icon/></div><div className="business-category">{item.category}</div><h3>{item.name}</h3><div className="detail"><MapPin/> {item.address}</div>{item.phone && <div className="detail"><Phone/> {item.phone}</div>}<StatusLine close={item.close}/><div className="link-row">{item.website && <a href={safeWebsite(item.website)} target="_blank" rel="noreferrer">Website</a>}<button onClick={() => onView(item)}>View details</button></div></article>;
}

function Footer({ onList }) {
  return <footer><div className="footer-top"><div><h2>Local businesses build stronger communities.</h2><div className="footer-features"><span><Radio/><b>106.7 FM</b><small>On air. In the community.</small></span><span><BookOpen/><b>Digital Magazine</b><small>Stories that inspire.</small></span><span><Users/><b>Local Directory</b><small>Find. Support. Grow.</small></span></div></div><button onClick={onList}>Add Your Business Today <ChevronRight/></button></div><div className="footer-bottom"><Logo/><div className="footer-links"><a href="#top">About</a><a href="#top">Contact</a><a href="#top">Advertise</a><a href="#top">Privacy</a><a href="#/admin">Admin</a></div><div className="social"><a href="#top">f</a><a href="#top">◎</a><a href="#top">▶</a></div></div></footer>;
}

function Modal({ type, item, onClose }) {
  const [form, setForm] = useState({ business_name: '', owner_name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  if (!type) return null;
  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    if (!supabase) { setBusy(false); return setError('The directory is not connected yet. Please try again after setup.'); }
    const { error: insertError } = await supabase.from('listing_requests').insert({ ...form, status: 'pending' });
    setBusy(false);
    if (insertError) return setError(insertError.message);
    setSent(true);
  }
  return <div className="modal-backdrop" onMouseDown={event => event.target === event.currentTarget && onClose()}><div className="modal" role="dialog" aria-modal="true"><button className="modal-close" onClick={onClose}><X/></button>{type === 'list' ? <>{sent ? <div className="success"><CheckCircle2/><h2>Thanks! We’ll be in touch.</h2><p>Your listing request has been received.</p></div> : <><span className="modal-icon"><Megaphone/></span><h2>Put your business on the map.</h2><p>Tell us a little about your business and our local directory team will contact you.</p><form onSubmit={submit}><label>Business name<input required value={form.business_name} onChange={event => set('business_name', event.target.value)} placeholder="Your business name"/></label><label>Your name<input required value={form.owner_name} onChange={event => set('owner_name', event.target.value)} placeholder="Full name"/></label><label>Email address<input required type="email" value={form.email} onChange={event => set('email', event.target.value)} placeholder="you@business.com"/></label><label>Phone <small>(optional)</small><input type="tel" value={form.phone} onChange={event => set('phone', event.target.value)}/></label><label>Message <small>(optional)</small><textarea rows="3" value={form.message} onChange={event => set('message', event.target.value)}/></label>{error && <p className="form-error">{error}</p>}<button className="primary" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : 'Request a listing'}<ChevronRight/></button></form></>}</> : <><span className="modal-icon"><BriefcaseBusiness/></span><span className="tag">{item.category}</span><h2>{item.name}</h2><p>{item.description || 'A trusted local business serving the Monroe community.'}</p><div className="modal-detail"><MapPin/> {item.address}</div>{item.phone && <div className="modal-detail"><Phone/> {item.phone}</div>}<StatusLine close={item.close}/>{item.website && <a className="website-button" href={safeWebsite(item.website)} target="_blank" rel="noreferrer">Visit website <ArrowUpRight/></a>}<button className="primary full" onClick={onClose}>Done</button></>}</div></div>;
}

function App() {
  const { categories, businesses, loading, error } = useDirectory();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Categories');
  const [sort, setSort] = useState('Relevance');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const perPage = 8;
  const featured = businesses.filter(item => item.is_featured);
  const presence = businesses.filter(item => item.is_local_presence);
  const filtered = useMemo(() => businesses.filter(item => {
    const categoryMatch = category === 'All Categories' || category === 'More' || item.category === category;
    const text = `${item.name} ${item.category} ${item.description || ''} ${(item.services || []).join(' ')}`.toLowerCase();
    return categoryMatch && text.includes(query.toLowerCase());
  }).sort((a, b) => sort === 'A–Z' ? a.name.localeCompare(b.name) : 0), [businesses, category, query, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageItems = filtered.slice((page - 1) * perPage, page * perPage);
  useEffect(() => setPage(1), [query, category, sort]);

  return <><Header onList={() => setModal({ type: 'list' })}/><SearchBar query={query} setQuery={setQuery} category={category} setCategory={setCategory} categories={categories}/><main><CategoryRail categories={categories} selected={category} setSelected={setCategory}/>{error && <div className="connection-error"><b>Could not load the live directory.</b><span>{error}</span></div>}{!isSupabaseConfigured && <div className="connection-error"><b>Supabase setup is not finished.</b><span>Add the two environment variables described in the README.</span></div>}{loading ? <div className="directory-loading"><LoaderCircle className="spin"/> Loading local businesses…</div> : <>{featured.length > 0 && <section><SectionTitle note="Top businesses in our community.">Featured Local Businesses</SectionTitle><div className="featured-grid">{featured.map(item => <FeaturedCard key={item.id} item={item} onView={selected => setModal({ type: 'view', item: selected })}/>)}</div></section>}{presence.length > 0 && <section className="presence-section"><SectionTitle note="More information. More connection.">Local Presence Businesses</SectionTitle><div className="presence-grid">{presence.map(item => <PresenceCard key={item.id} item={item} onView={selected => setModal({ type: 'view', item: selected })}/>)}</div></section>}<section className="directory" id="directory"><div className="directory-head"><SectionTitle note="Find the services you need.">All Local Businesses</SectionTitle><div className="results">Showing {filtered.length ? (page - 1) * perPage + 1 : 0}–{Math.min(page * perPage, filtered.length)} of {filtered.length} results</div><label className="sort">Sort by:<select value={sort} onChange={event => setSort(event.target.value)}><option>Relevance</option><option>A–Z</option></select><ChevronDown/></label></div>{pageItems.length ? <div className="business-grid">{pageItems.map(item => <BusinessCard key={item.id} item={item} onView={selected => setModal({ type: 'view', item: selected })}/>)}</div> : <div className="empty"><Search/><h3>No local businesses found</h3><p>{businesses.length ? 'Try another search or category.' : 'Add your first approved business in the admin page.'}</p></div>}{pages > 1 && <div className="pagination">{Array.from({ length: pages }, (_, index) => index + 1).map(number => <button key={number} className={page === number ? 'active' : ''} onClick={() => setPage(number)}>{number}</button>)}<button onClick={() => setPage(Math.min(pages, page + 1))}>Next <ChevronRight/></button></div>}</section></>}</main><Footer onList={() => setModal({ type: 'list' })}/><Modal type={modal?.type} item={modal?.item} onClose={() => setModal(null)}/></>;
}

function RootRouter() {
  const [isAdminRoute, setIsAdminRoute] = useState(window.location.hash.startsWith('#/admin'));
  useEffect(() => {
    const updateRoute = () => setIsAdminRoute(window.location.hash.startsWith('#/admin'));
    window.addEventListener('hashchange', updateRoute);
    return () => window.removeEventListener('hashchange', updateRoute);
  }, []);
  return isAdminRoute ? <AdminApp/> : <App/>;
}

createRoot(document.getElementById('root')).render(<RootRouter/>);
