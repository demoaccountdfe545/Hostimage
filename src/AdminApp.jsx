import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft, BriefcaseBusiness, ImageUp, Inbox, LoaderCircle,
  LogOut, Palette, Pencil, RefreshCw, Save, Trash2, X
} from 'lucide-react';
import { isSupabaseConfigured, supabase } from './lib/supabase';

const emptyBusiness = {
  id: '', name: '', category_id: '', tagline: '', description: '', address: '',
  city: 'Monroe', state: 'LA', phone: '', website: '', services: '', close_time: '',
  image_url: '', is_featured: false, is_local_presence: false, status: 'pending'
};

const defaultSettings = {
  id: 1, site_name: 'LOCAL LOOP', brand_subtitle: '106.7 FM · Community Directory', logo_url: '',
  hero_title: 'Discover Local. Support Local.',
  hero_description: 'Find businesses, services, restaurants and community resources serving Monroe and the surrounding community.',
  hero_badge: 'Stronger Together', location: 'Monroe, LA',
  visibility_title: 'Get the Visibility Your Business Deserves',
  visibility_subtitle: 'Three ways to be part of something bigger.',
  footer_title: 'Local businesses build stronger communities.'
};

function slugify(value) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  async function submit(event) {
    event.preventDefault();
    setBusy(true); setError('');
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (authError) return setError(authError.message);
    onLogin(data.session);
  }

  async function forgotPassword() {
    if (!email.trim()) return setError('Enter your admin email address first.');
    setBusy(true); setError(''); setNotice('');
    const redirectTo = `${window.location.origin}${window.location.pathname}?recovery=1`;
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo });
    setBusy(false);
    if (resetError) return setError(resetError.message);
    setNotice('Password reset email sent. Check your inbox and spam folder.');
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
        {notice && <p className="form-success">{notice}</p>}
        <button className="primary admin-submit" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : 'Sign in'}</button>
        <button className="forgot-button" type="button" disabled={busy} onClick={forgotPassword}>Forgot password?</button>
      </form>
    </section>
  </main>;
}

function PasswordRecovery({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event) {
    event.preventDefault(); setError('');
    if (password.length < 8) return setError('Use at least 8 characters.');
    if (password !== confirmPassword) return setError('The passwords do not match.');
    setBusy(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (updateError) return setError(updateError.message);
    window.history.replaceState({}, '', `${window.location.pathname}#/admin`);
    onDone();
  }

  return <main className="admin-login-wrap"><section className="admin-login">
    <span className="admin-mark"><Save/></span><p className="eyebrow">ACCOUNT RECOVERY</p><h1>Create new password</h1>
    <p>Choose a new password for your directory admin account.</p>
    <form onSubmit={submit}>
      <label>New password<input type="password" required minLength="8" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password"/></label>
      <label>Confirm new password<input type="password" required minLength="8" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password"/></label>
      {error && <p className="form-error">{error}</p>}
      <button className="primary admin-submit" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : 'Save new password'}</button>
    </form>
  </section></main>;
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
    const { data, error: loadError } = await supabase.from('listing_requests').select('*, categories(name)').order('created_at', { ascending: false });
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
      <div><h3>{item.business_name}</h3><p>{item.categories?.name || 'Community'} · {[item.address, item.city, item.state].filter(Boolean).join(', ') || 'Address not provided'}</p><p>{item.owner_name} · <a href={`mailto:${item.email}`}>{item.email}</a>{item.phone ? ` · ${item.phone}` : ''}</p>{item.website && <p><a href={/^https?:\/\//i.test(item.website) ? item.website : `https://${item.website}`} target="_blank" rel="noreferrer">{item.website}</a></p>}{item.message && <blockquote>{item.message}</blockquote>}<time>{new Date(item.created_at).toLocaleString()}</time></div>
      <select value={item.status} onChange={e => updateStatus(item.id, e.target.value)}><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="approved">Approved</option><option value="rejected">Rejected</option></select>
    </article>)}
  </section>;
}

function Branding() {
  const [form, setForm] = useState(defaultSettings);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let active = true;
    supabase.from('site_settings').select('*').eq('id', 1).maybeSingle().then(({ data, error: loadError }) => {
      if (!active) return;
      if (loadError) setError(loadError.message);
      else if (data) setForm(current => ({ ...current, ...data }));
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const set = (key, value) => setForm(current => ({ ...current, [key]: value }));

  async function uploadLogo() {
    if (!logo) return form.logo_url || null;
    const extension = logo.name.split('.').pop()?.toLowerCase() || 'png';
    const path = `branding/logo-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('business-images').upload(path, logo, {
      cacheControl: '3600', upsert: false, contentType: logo.type
    });
    if (uploadError) throw uploadError;
    return supabase.storage.from('business-images').getPublicUrl(path).data.publicUrl;
  }

  async function submit(event) {
    event.preventDefault(); setBusy(true); setError(''); setSaved(false);
    try {
      const logoUrl = await uploadLogo();
      const payload = { ...form, id: 1, logo_url: logoUrl, updated_at: new Date().toISOString() };
      const { error: saveError } = await supabase.from('site_settings').upsert(payload, { onConflict: 'id' });
      if (saveError) throw saveError;
      setForm(payload); setLogo(null); setSaved(true);
    } catch (saveError) {
      setError(saveError.message || 'Could not save branding settings.');
    } finally { setBusy(false); }
  }

  if (loading) return <section className="admin-list requests-list"><div className="admin-empty"><LoaderCircle className="spin"/> Loading branding…</div></section>;

  return <form className="admin-form branding-form" onSubmit={submit}>
    <div className="admin-form-title"><div><p className="eyebrow">SITE SETTINGS</p><h2>Branding</h2></div></div>
    <p className="admin-help">Update the logo and text used in the public website header, visibility section and footer.</p>
    <div className="branding-preview">{form.logo_url ? <img src={form.logo_url} alt="Current logo"/> : <b>{form.site_name}</b>}</div>
    <div className="form-grid">
      <label className="upload-label wide"><ImageUp/> Upload logo<input type="file" accept="image/jpeg,image/png,image/webp,image/svg+xml" onChange={e => setLogo(e.target.files?.[0] || null)}/><span>{logo?.name || (form.logo_url ? 'Current logo saved — choose a file to replace it' : 'PNG, JPG, WebP or SVG')}</span></label>
      <label>Business / site name<input required value={form.site_name} onChange={e => set('site_name', e.target.value)}/></label>
      <label>Brand subtitle<input value={form.brand_subtitle} onChange={e => set('brand_subtitle', e.target.value)}/></label>
      <label className="wide">Main heading<input required value={form.hero_title} onChange={e => set('hero_title', e.target.value)}/></label>
      <label className="wide">Header description<textarea rows="3" value={form.hero_description} onChange={e => set('hero_description', e.target.value)}/></label>
      <label>Header badge text<input value={form.hero_badge} onChange={e => set('hero_badge', e.target.value)}/></label>
      <label>Directory location<input value={form.location} onChange={e => set('location', e.target.value)}/></label>
      <label className="wide">Visibility section heading<input value={form.visibility_title} onChange={e => set('visibility_title', e.target.value)}/></label>
      <label className="wide">Visibility section subtitle<input value={form.visibility_subtitle} onChange={e => set('visibility_subtitle', e.target.value)}/></label>
      <label className="wide">Footer heading<input value={form.footer_title} onChange={e => set('footer_title', e.target.value)}/></label>
    </div>
    {error && <p className="form-error">{error}</p>}
    {saved && <p className="form-success">Branding saved. Refresh the public website to see the changes.</p>}
    <button className="primary save-button" disabled={busy}>{busy ? <LoaderCircle className="spin"/> : <Save/>}Save branding</button>
  </form>;
}

export default function AdminApp() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const [categories, setCategories] = useState([]);
  const [tab, setTab] = useState('businesses');
  const [recovering, setRecovering] = useState(() => new URLSearchParams(window.location.search).get('recovery') === '1');

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

  const content = useMemo(() => {
    if (tab === 'businesses') return <Businesses categories={categories}/>;
    if (tab === 'requests') return <Requests/>;
    return <Branding/>;
  }, [tab, categories]);

  if (!isSupabaseConfigured) return <main className="setup-screen"><BriefcaseBusiness/><h1>Connect Supabase first</h1><p>Add your Supabase URL and publishable key to the environment variables, then rebuild the site.</p><a href="./">Back to directory</a></main>;
  if (checking) return <main className="setup-screen"><LoaderCircle className="spin"/><p>Checking your session…</p></main>;
  if (session && recovering) return <PasswordRecovery onDone={() => setRecovering(false)}/>;
  if (!session) return <Login onLogin={setSession}/>;

  return <div className="admin-shell">
    <header className="admin-header"><a className="admin-brand" href="./"><b>LOCAL</b><span>LOOP</span><small>Directory Admin</small></a><div><span>{session.user.email}</span><button onClick={() => supabase.auth.signOut()}><LogOut/> Sign out</button></div></header>
    <nav className="admin-tabs"><button className={tab === 'businesses' ? 'active' : ''} onClick={() => setTab('businesses')}><BriefcaseBusiness/> Businesses</button><button className={tab === 'requests' ? 'active' : ''} onClick={() => setTab('requests')}><Inbox/> Listing requests</button><button className={tab === 'branding' ? 'active' : ''} onClick={() => setTab('branding')}><Palette/> Branding</button></nav>
    <main className="admin-main">{content}</main>
  </div>;
}
