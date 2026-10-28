import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CheckCircle2, Code2, Search, ShieldCheck, Users, X } from "lucide-react";
import { getEvents, getRegistrations, registerForEvent } from "./api.js";

const INTERESTS = ["Web Development", "AI / Data Science", "Cybersecurity", "App Development", "Cloud / DevOps", "Open Source"];

function App() {
  const [page, setPage] = useState("events");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notice, setNotice] = useState(null);

  const refreshEvents = useCallback(async () => {
    try {
      setLoadError("");
      setEvents(await getEvents());
    } catch (error) {
      setLoadError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshEvents(); }, [refreshEvents]);

  function openRegistration(event) {
    setNotice(null);
    setSelectedEvent(event);
  }

  async function onRegistered(result) {
    setSelectedEvent(null);
    setNotice({ type: "success", text: result });
    await refreshEvents();
  }

  return (
    <div className="app-shell">
      <header className="navbar">
        <button className="brand" onClick={() => { setPage("events"); setSelectedEvent(null); }} aria-label="CodeNova home">
          <span className="brand-mark"><Code2 size={22} /></span>
          <span>CodeNova<span className="brand-light">.events</span></span>
        </button>
        <nav>
          <button className={page === "events" ? "nav-link active" : "nav-link"} onClick={() => { setPage("events"); setSelectedEvent(null); }}>Explore events</button>
          <button className={page === "admin" ? "nav-link active" : "nav-link"} onClick={() => { setPage("admin"); setSelectedEvent(null); }}>Admin <ShieldCheck size={15} /></button>
        </nav>
      </header>

      {page === "events" ? (
        <main>
          <section className="hero">
            <div className="hero-glow glow-one" /><div className="hero-glow glow-two" />
            <div className="hero-content">
              <div className="eyebrow"><span className="live-dot" /> BATCH 01 · COMMUNITY EVENTS</div>
              <h1>Ideas become<br /><span className="gradient-text">real things.</span></h1>
              <p className="hero-copy">Meet curious people, learn something useful, and build what comes next. Find your next event.</p>
              <a className="hero-cta" href="#events">Explore events <ArrowRight size={17} /></a>
            </div>
            <div className="hero-side-card">
              <div className="mini-code"><span className="code-dot red" /><span className="code-dot yellow" /><span className="code-dot green" /><span className="code-label">your_next_chapter.js</span></div>
              <pre><span className="code-purple">const</span> idea = <span className="code-green">"something cool"</span>;{"\n"}<span className="code-purple">while</span> (curious) {"{"}{"\n"}  learn();{"\n"}  build(idea);{"\n"}  share();{"\n"}{"}"}</pre>
              <div className="code-foot"><span className="foot-check"><CheckCircle2 size={14} /></span> Ready when you are</div>
            </div>
            <div className="hero-bottom"><span><Users size={16} /> Open to all curious minds</span><span><CalendarDays size={16} /> New events added regularly</span></div>
          </section>

          <section id="events" className="events-section">
            <div className="section-heading">
              <div><p className="eyebrow dark-eyebrow">YOUR NEXT STEP</p><h2>Find your people.</h2><p className="section-subtitle">Small steps, new skills, good conversations.</p></div>
              <div className="event-count">{events.length} EVENTS <span>AVAILABLE</span></div>
            </div>

            {notice && <div className={`notice ${notice.type}`}><CheckCircle2 size={18} /> {notice.text}<button onClick={() => setNotice(null)} aria-label="Dismiss"><X size={16} /></button></div>}
            {loading && <div className="empty-state">Loading events…</div>}
            {!loading && loadError && <div className="error-panel"><strong>Could not load events.</strong><p>{loadError}</p><button className="button primary" onClick={refreshEvents}>Try again</button><small>Make sure MongoDB and the Express server are running, and that you've seeded sample events.</small></div>}
            {!loading && !loadError && events.length === 0 && <div className="empty-state">No events yet. Run <code>npm run seed</code> in the server folder.</div>}

            <div className="event-grid">
              {events.map((event, index) => <article className="event-card" key={event._id}>
                <div className={`event-art art-${index % 3}`}><div className="art-orbit orbit-a" /><div className="art-orbit orbit-b" /><div className="art-symbol">{index === 0 ? "{ }" : index === 1 ? "✳" : "⌘"}</div><span className="art-tag">{event.domain}</span></div>
                <div className="event-body">
                  <div className="event-meta"><CalendarDays size={15} /> {event.schedule}</div>
                  <h3>{event.title}</h3><p className="event-description">{event.description}</p>
                  <div className="capacity-row"><span><Users size={15} /> {event.registered} registered</span><span className={event.available === 0 ? "full-text" : "available-text"}>{event.available} seats left</span></div>
                  <div className="capacity-track"><span style={{ width: `${Math.min(100, (event.registered / event.capacity) * 100)}%` }} /></div>
                  <button className="button primary full-width" disabled={event.isFull} onClick={() => openRegistration(event)}>{event.isFull ? "Event is full" : "Register now"} {!event.isFull && <ArrowRight size={16} />}</button>
                </div>
              </article>)}
            </div>
          </section>
        </main>
      ) : <AdminPage />}
      <footer className="footer"><span className="footer-brand"><Code2 size={17} /> CodeNova.events</span><span>Made for people who like to learn by building.</span><span>© {new Date().getFullYear()} CodeNova</span></footer>

      {selectedEvent && <RegistrationModal event={selectedEvent} onClose={() => setSelectedEvent(null)} onRegistered={onRegistered} />}
    </div>
  );
}

function RegistrationModal({ event, onClose, onRegistered }) {
  const [form, setForm] = useState({ name: "", email: "", college: "", interests: [] });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  function update(field, value) { setForm((old) => ({ ...old, [field]: value })); }
  function toggleInterest(item) {
    update("interests", form.interests.includes(item) ? form.interests.filter((x) => x !== item) : [...form.interests, item]);
  }
  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const result = await registerForEvent(event._id, form);
      setDone(true);
      setTimeout(() => onRegistered(`${event.title}: registration confirmed. You’re on the list!`), 900);
      return result;
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-close" onClick={onClose} aria-label="Close registration form"><X size={19} /></button>
      {done ? <div className="success-screen"><span className="success-icon"><CheckCircle2 size={34} /></span><h2>You're registered!</h2><p>Your spot for <strong>{event.title}</strong> is confirmed.</p></div> : <>
        <div className="modal-kicker">EVENT REGISTRATION</div><h2 id="modal-title">Save your spot.</h2><p className="modal-event">{event.title}<span>{event.schedule}</span></p>
        <form onSubmit={submit} className="registration-form">
          <label>Full name<input required maxLength="100" autoComplete="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="e.g. Aditi Sharma" /></label>
          <label>Email address<input required type="email" autoComplete="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" /></label>
          <label>College / organization<input required maxLength="150" value={form.college} onChange={(e) => update("college", e.target.value)} placeholder="Where do you study or work?" /></label>
          <fieldset><legend>Domains you're interested in <span>(choose at least one)</span></legend><div className="interest-grid">{INTERESTS.map((item) => <label key={item} className={form.interests.includes(item) ? "interest-option chosen" : "interest-option"}><input type="checkbox" checked={form.interests.includes(item)} onChange={() => toggleInterest(item)} /><span className="fake-check">{form.interests.includes(item) ? "✓" : "+"}</span>{item}</label>)}</div></fieldset>
          {error && <div className="form-error" role="alert">{error}</div>}
          <button className="button primary full-width submit-button" disabled={busy}>{busy ? "Registering…" : "Confirm registration"} <ArrowRight size={16} /></button>
          <p className="form-footnote">One registration per email for this event.</p>
        </form>
      </>}
    </section>
  </div>;
}

function AdminPage() {
  const [key, setKey] = useState("");
  const [draftKey, setDraftKey] = useState("");
  const [search, setSearch] = useState("");
  const [registrations, setRegistrations] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [authorized, setAuthorized] = useState(false);

  const load = useCallback(async (adminKey, term = "") => {
    setLoading(true); setError("");
    try {
      const data = await getRegistrations(adminKey, term);
      setRegistrations(data.registrations); setTotal(data.total);
      setKey(adminKey); setAuthorized(true);
    } catch (err) {
      setError(err.message);
      if (err.status === 401) setAuthorized(false);
    } finally { setLoading(false); }
  }, []);

  function login(e) { e.preventDefault(); load(draftKey); }
  useEffect(() => {
    if (!authorized || !key) return;
    const timer = setTimeout(() => load(key, search), 250);
    return () => clearTimeout(timer);
  }, [search]); // intentionally debounce search only; login/reload calls load directly

  const eventCount = useMemo(() => new Set(registrations.map((r) => r.event?.title).filter(Boolean)).size, [registrations]);

  return <main className="admin-page">
    <div className="admin-heading"><p className="eyebrow dark-eyebrow">MANAGE YOUR COMMUNITY</p><h1>Registration <span className="gradient-text">dashboard.</span></h1><p>Search and review every attendee in one place.</p></div>
    {!authorized ? <form className="admin-login" onSubmit={login}><span className="admin-lock"><ShieldCheck size={24} /></span><h2>Admin access</h2><p>Enter the ADMIN_KEY from your server/.env file.</p><label>Admin key<input type="password" required value={draftKey} onChange={(e) => setDraftKey(e.target.value)} placeholder="Your admin key" /></label>{error && <div className="form-error">{error}</div>}<button className="button primary full-width" disabled={loading}>{loading ? "Checking…" : "Open dashboard"} <ArrowRight size={16} /></button></form> :
      <section className="dashboard">
        <div className="stats-grid"><div className="stat-card"><span>Total registrations</span><strong>{total}</strong><small>Across all events</small></div><div className="stat-card"><span>Events represented</span><strong>{eventCount}</strong><small>With registered attendees</small></div><div className="stat-card"><span>View</span><strong>Live</strong><small>Refreshes as you search</small></div></div>
        <div className="table-panel"><div className="table-heading"><div><h2>Registered attendees</h2><p>{total} result{total === 1 ? "" : "s"}</p></div><div className="search-box"><Search size={17} /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search attendees…" /></div></div>
          {error && <div className="form-error">{error}</div>}
          <div className="table-scroll"><table><thead><tr><th>ATTENDEE</th><th>EVENT</th><th>COLLEGE / ORG</th><th>INTERESTS</th><th>REGISTERED</th></tr></thead><tbody>
            {registrations.map((r) => <tr key={r.id}><td><strong>{r.name}</strong><small>{r.email}</small></td><td>{r.event?.title || "Event removed"}<small>{r.event?.schedule || ""}</small></td><td>{r.college}</td><td><div className="tag-list">{r.interests.map((i) => <span key={i} className="interest-tag">{i}</span>)}</div></td><td>{new Date(r.createdAt).toLocaleDateString()}</td></tr>)}
            {!loading && registrations.length === 0 && <tr><td colSpan="5" className="table-empty">No registrations found.</td></tr>}
          </tbody></table></div>
          <div className="table-bottom"><span>{loading ? "Updating…" : `Showing ${registrations.length} registration(s)`}</span><button className="button secondary" onClick={() => load(key, search)}>Refresh data</button><button className="button text-button" onClick={() => { setAuthorized(false); setKey(""); setDraftKey(""); setRegistrations([]); }}>Log out</button></div>
        </div>
      </section>}
  </main>;
}

export default App;
