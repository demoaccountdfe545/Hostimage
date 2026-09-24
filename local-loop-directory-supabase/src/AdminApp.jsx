import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, BriefcaseBusiness, ImageUp, Inbox, LoaderCircle,
  LogOut, Pencil, RefreshCw, Save, Trash2, X
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const emptyBusiness = {
  id: '', name: '', category_id: '', tagline: '', description: '', address: '',
  city: 'Monroe', state: 'LA', phone: '', website: '', services: '', close_time: '',
  image_url: '', is_featured: false, is_local_presence: false, status: 'pending'
};

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) return setError(authError.message);
    onLogin(data.session);
  }

  return <main className="admin-login-wrap">
    <a className="back-link" href="./"><ArrowLeft/> Back to directory</a>
    <section className="admin-login">
      <span className="admin-mark"><BriefcaseBusiness/></span>
      <p className="eyebrow">LOCAL LOOP</p><h1>Directory Admin</h1>
      <p>Sign in with the admin account you created in Supabase.</p>
      <form onSubmit={submit}>
        <label>Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"/></label>
        <label>Password<input type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"/></label>
        {error && <p className="form-error">{error}</p>}
        <button className="primary admin-submit" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : 'Sign in'}</button>
      </form>
    </section>
  </main>;
}

function BusinessForm({ categories, editing, onSaved, onCancel }) {
  const [form, setForm] = useState(emptyBusiness);
  const [image, setImage] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setForm(editing ? {
      ...emptyBusiness, ...editing,
      services: (editing.services || []).join(', '),
      close_time: editing.opening_hours?.close || ''
    } : { ...emptyBusiness, category_id: categories[0]?.id || '' });
    setImage(null); setError('');
  }, [editing, categories]);

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  async function uploadImage() {
    if (!image) return form.image_url || null;
    const extension = image.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('business-images').upload(path, image, {
      cacheControl: '3600', upsert: false, contentType: image.type
    });
    if (uploadError) throw uploadError;
    return supabase.storage.from('business-images').getPublicUrl(path).data.publicUrl;
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    try {
      const imageUrl = await uploadImage();
      const payload = {
        name: form.name.trim(), slug: slugify(form.name), category_id: Number(form.category_id),
        tagline: form.tagline.trim() || null, description: form.description.trim() || null,
        address: form.address.trim() || null, city: form.city.trim() || null, state: form.state.trim() || null,
        phone: form.phone.trim() || null, website: form.website.trim() || null, image_url: imageUrl,
        services: form.services.split(',').map(value => value.trim()).filter(Boolean),
        opening_hours: form.close_time.trim() ? { close: form.close_time.trim() } : {},
        is_featured: form.is_featured, is_local_presence: form.is_local_presence, status: form.status
      };
      const query = form.id
        ? supabase.from('businesses').update(payload).eq('id', form.id)
        : supabase.from('businesses').insert(payload);
      const { error: saveError } = await query;
      if (saveError) throw saveError;
      onSaved();
    } catch (saveError) {
      setError(saveError.message || 'Could not save the business.');
    } finally { setBusy(false); }
  }

  return <form className="admin-form" onSubmit={submit}>
    <div className="admin-form-title"><div><p className="eyebrow">BUSINESS EDITOR</p><h2>{form.id ? 'Edit business' : 'Add a business'}</h2></div>{form.id && <button type="button" className="icon-button" onClick={onCancel} aria-label="Close editor"><X/></button>}</div>
    <div className="form-grid">
      <label className="wide">Business name<input required value={form.name} onChange={e => set('name', e.target.value)}/></label>
      <label>Category<select required value={form.category_id} onChange={e => set('category_id', e.target.value)}>{categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
      <label>Status<select value={form.status} onChange={e => set('status', e.target.value)}><option value="pending">Pending</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select></label>
      <label className="wide">Tagline<input value={form.tagline} onChange={e => set('tagline', e.target.value)}/></label>
      <label className="wide">Description<textarea rows="3" value={form.description} onChange={e => set('description', e.target.value)}/></label>
      <label className="wide">Street address<input value={form.address} onChange={e => set('address', e.target.value)}/></label>
      <label>City<input value={form.city} onChange={e => set('city', e.target.value)}/></label>
      <label>State<input maxLength="2" value={form.state} onChange={e => set('state', e.target.value.toUpperCase())}/></label>
      <label>Phone<input type="tel" value={form.phone} onChange={e => set('phone', e.target.value)}/></label>
      <label>Website<input type="url" placeholder="https://..." value={form.website} onChange={e => set('website', e.target.value)}/></label>
      <label className="wide">Services <small>(separate with commas)</small><input value={form.services} onChange={e => set('services', e.target.value)}/></label>
      <label>Closing time<input placeholder="7:00 PM" value={form.close_time} onChange={e => set('close_time', e.target.value)}/></label>
      <label className="upload-label"><ImageUp/> Business image<input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setImage(e.target.files?.[0] || null)}/><span>{image?.name || (form.image_url ? 'Current image saved' : 'Choose an image')}</span></label>
    </div>
    <div className="check-row"><label><input type="checkbox" checked={form.is_featured} onChange={e => set('is_featured', e.target.checked)}/> Featured business</label><label><input type="checkbox" checked={form.is_local_presence} onChange={e => set('is_local_presence', e.target.checked)}/> Local presence</label></div>
    {error && <p className="form-error">{error}</p>}
    <button className="primary save-button" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : <Save/>}{form.id ? 'Save changes' : 'Add business'}</button>
  </form>;
}

function Businesses({ categories }) {
  const [businesses, setBusinesses] = useState([]);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const { data, error: loadError } = await supabase.from('businesses').select('*, categories(name)').order('created_at', { ascending: false });
    setLoading(false);
    if (loadError) return setError(loadError.message);
    setBusinesses(data || []);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function remove(item) {
    if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) return;
    const { error: deleteError } = await supabase.from('businesses').delete().eq('id', item.id);
    if (deleteError) return setError(deleteError.message);
    if (editing?.id === item.id) setEditing(null);
    load();
  }

  return <div className="admin-grid">
    <BusinessForm categories={categories} editing={editing} onCancel={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }}/>
    <section className="admin-list">
      <div className="list-heading"><div><p className="eyebrow">DIRECTORY</p><h2>Businesses <span>{businesses.length}</span></h2></div><button className="icon-button" onClick={load} aria-label="Refresh"><RefreshCw/></button></div>
      {error && <p className="form-error">{error}</p>}
      {loading ? <div className="admin-empty"><LoaderCircle className="spin"/> Loading businesses…</div> : businesses.length === 0 ? <div className="admin-empty"><BriefcaseBusiness/><b>No businesses yet</b><span>Add your first business using the form.</span></div> : businesses.map(item => <article className="admin-row" key={item.id}>
        <div><h3>{item.name}</h3><p>{item.categories?.name || 'No category'} · <span className={`status-pill ${item.status}`}>{item.status}</span></p></div>
        <button className="icon-button" onClick={() => setEditing(item)} aria-label={`Edit ${item.name}`}><Pencil/></button>
        <button className="icon-button danger" onClick={() => remove(item)} aria-label={`Delete ${item.name}`}><Trash2/></button>
      </article>)}
    </section>
  </div>;
}

function Requests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    const { data, error: loadError } = await supabase.from('listing_requests').select('*').order('created_at', { ascending: false });
    setLoading(false);
    if (loadError) return setError(loadError.message);
    setRequests(data || []);
  }, []);
  useEffect(() => { load(); }, [load]);

  async function updateStatus(id, status) {
    const { error: updateError } = await supabase.from('listing_requests').update({ status }).eq('id', id);
    if (updateError) return setError(updateError.message);
    setRequests(items => items.map(item => item.id === id ? { ...item, status } : item));
  }

  return <section className="admin-list requests-list">
    <div className="list-heading"><div><p className="eyebrow">INBOX</p><h2>Listing requests <span>{requests.length}</span></h2></div><button className="icon-button" onClick={load} aria-label="Refresh"><RefreshCw/></button></div>
    {error && <p className="form-error">{error}</p>}
    {loading ? <div className="admin-empty"><LoaderCircle className="spin"/> Loading requests…</div> : requests.length === 0 ? <div className="admin-empty"><Inbox/><b>No requests yet</b><span>New submissions from the public site will appear here.</span></div> : requests.map(item => <article className="request-row" key={item.id}>
      <div><h3>{item.business_name}</h3><p>{item.owner_name} · <a href={`mailto:${item.email}`}>{item.email}</a>{item.phone ? ` · ${item.phone}` : ''}</p>{item.message && <blockquote>{item.message}</blockquote>}<time>{new Date(item.created_at).toLocaleString()}</time></div>
      <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)}><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
    </article>)}
  </section>;
}

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState('businesses');

  useEffect(() => {
    if (!supabase) { setChecking(false); return; }
    supabase.auth.getSession().then(({ data }) => { setSession(data.session); setChecking(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => setCategories(data || []));
  }, [session]);

  const content = useMemo(() => tab === 'businesses' ? <Businesses categories={categories}/> : <Requests/>, [tab, categories]);

  if (!isSupabaseConfigured) return <main className="setup-screen"><BriefcaseBusiness/><h1>Connect Supabase first</h1><p>Add your Supabase URL and publishable key to the environment variables, then rebuild the site.</p><a href="./">Back to directory</a></main>;
  if (checking) return <main className="setup-screen"><LoaderCircle className="spin"/><p>Checking your session…</p></main>;
  if (!session) return <Login onLogin={setSession}/>;

  return <div className="admin-shell">
    <header className="admin-header"><a className="admin-brand" href="./"><b>LOCAL</b><span>LOOP</span><small>Directory Admin</small></a><div><span>{session.user.email}</span><button onClick={() => supabase.auth.signOut()}><LogOut/> Sign out</button></div></header>
    <nav className="admin-tabs"><button className={tab === 'businesses' ? 'active' : ''} onClick={() => setTab('businesses')}><BriefcaseBusiness/> Businesses</button><button className={tab === 'requests' ? 'active' : ''} onClick={() => setTab('requests')}><Inbox/> Listing requests</button></nav>
    <main className="admin-main">{content}</main>
  </div>;
}
