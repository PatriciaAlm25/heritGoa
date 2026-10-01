import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import ReportIssueModal from '../components/heritage/ReportIssueModal';

/* ── Counter hook ─────────────────────────────────────── */
function useCounter(target, duration = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        obs.disconnect();
        let start = 0;
        const step = target / (duration / 16);
        const tick = () => {
          start = Math.min(start + step, target);
          setCount(Math.floor(start));
          if (start < target) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [target, duration]);
  return [count, ref];
}

/* ── Particle canvas ──────────────────────────────────── */
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, particles = [], raf;
    const resize = () => {
      W = canvas.width = canvas.offsetWidth;
      H = canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * 1000, y: Math.random() * 800,
        r: Math.random() * 2 + 0.5,
        a: Math.random() * Math.PI * 2,
        sp: (Math.random() - 0.5) * 0.3,
        vy: -Math.random() * 0.4 - 0.1,
        op: Math.random() * 0.5 + 0.1,
      });
    }
    const draw = () => {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => {
        p.a += p.sp * 0.02;
        p.x += Math.sin(p.a) * 0.3;
        p.y += p.vy;
        if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; }
        ctx.beginPath();
        ctx.arc(p.x % W, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${p.op})`;
        ctx.fill();
      });
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);
  return (
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />
  );
}

/* ── Site card filter ─────────────────────────────────── */
const SITE_CARDS = [
  {
    id: 'bom-jesus', cat: 'church', img: '/assets/bom_jesus_goa.jpg',
    status: 'good', statusLabel: '🟢 Good Condition', catLabel: '⛪ Church',
    name: 'Basilica of Bom Jesus', loc: '📍 Old Goa, North Goa',
    desc: 'A UNESCO World Heritage Site and one of the finest examples of Baroque architecture in India. Houses the mortal remains of St. Francis Xavier.',
    meta: ['🏛️ Est. 1605', '📸 142 photos', '👥 38 stories'],
    siteId: 'ASI-GOA-006',
  },
  {
    id: 'chapora', cat: 'fort', img: '/assets/chapora_fort_goa.jpg',
    status: 'warn', statusLabel: '⚠️ Needs Attention', catLabel: '🏰 Fort',
    name: 'Chapora Fort', loc: '📍 Vagator, North Goa',
    desc: 'Perched dramatically above Vagator Beach, this 16th-century fort offers panoramic views of the Arabian Sea. Parts of the structure show visible deterioration.',
    meta: ['🏛️ Est. 1617', '📸 89 photos', '👥 21 stories'],
    siteId: 'STATE-GOA-017',
  },
  {
    id: 'se-cathedral', cat: 'church', img: '/assets/se_cathedral_goa.jpg',
    status: 'good', statusLabel: '🟢 Good Condition', catLabel: '⛪ Cathedral',
    name: "Sé Cathedral", loc: '📍 Old Goa, North Goa',
    desc: 'The largest church in Asia, built during the reign of the Portuguese Viceroy. Dedicated to St. Catherine of Alexandria and known for its Golden Bell.',
    meta: ['🏛️ Est. 1619', '📸 207 photos', '👥 54 stories'],
    siteId: 'ASI-GOA-017',
  },
  {
    id: 'fontainhas', cat: 'quarter', img: '/assets/fontainhas_goa.jpg',
    status: 'warn', statusLabel: '⚠️ Monitoring Active', catLabel: '🏠 Heritage Quarter',
    name: 'Fontainhas, Panaji', loc: '📍 Panaji, North Goa',
    desc: "Goa's famous Latin Quarter with brightly painted Portuguese-era houses, narrow winding lanes, and azulejo tile façades. A living heritage neighbourhood.",
    meta: ['🏛️ 18th Century', '📸 315 photos', '👥 76 stories'],
    siteId: null,
  },
  {
    id: 'mangeshi', cat: 'temple', img: '/assets/mangeshi_temple_goa.jpg',
    status: 'good', statusLabel: '🟢 Good Condition', catLabel: '⛩️ Temple',
    name: 'Shri Mangeshi Temple', loc: '📍 Priol, South Goa',
    desc: "One of Goa's most visited temples, dedicated to Lord Mangesh (Shiva). Known for its distinctive seven-storeyed lamp tower (deepastambha).",
    meta: ['🏛️ 16th Century', '📸 178 photos', '👥 63 stories'],
    siteId: null,
  },
];

const STATUS_MAP = {
  good: 'bg-green-900/40 text-green-400 border-green-700/30',
  warn: 'bg-amber-900/40 text-amber-400 border-amber-700/30',
};

export default function HomePage() {
  const [reportOpen, setReportOpen]     = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [c340, ref340] = useCounter(340);
  const [c12k, ref12k] = useCounter(12);
  const [c6,   ref6  ] = useCounter(6);

  // Stats section counters
  const [cs1, rs1] = useCounter(340);
  const [cs2, rs2] = useCounter(8700);
  const [cs3, rs3] = useCounter(2400);
  const [cs4, rs4] = useCounter(127);
  const [cs5, rs5] = useCounter(540);
  const [cs6, rs6] = useCounter(12);

  const filteredCards = activeFilter === 'all'
    ? SITE_CARDS
    : SITE_CARDS.filter(c => c.cat === activeFilter);

  return (
    <div className="min-h-screen bg-navy text-white overflow-x-hidden">
      <Navbar onOpenReport={() => setReportOpen(true)} />

      {/* ═══════════════════════════ HERO ══════════════════════════════ */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* BG image */}
        <div className="absolute inset-0">
          <img
            src="/assets/hero_goa_heritage.jpg"
            alt="Goa coastal fort with Arabian Sea"
            id="hero-img"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(135deg,rgba(10,22,40,.92) 0%,rgba(10,22,40,.7) 50%,rgba(10,22,40,.85) 100%)'
          }} />
        </div>
        {/* Particles */}
        <div id="hero-particles" className="absolute inset-0 overflow-hidden">
          <ParticleCanvas />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="hero-badge animate-fade-up inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium"
            style={{ '--delay':'0.1s', background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.25)', color:'#d4af37' }}>
            <span className="w-2 h-2 rounded-full bg-gold-DEFAULT animate-pulse-slow" style={{background:'#d4af37'}} />
            Goa's Living Heritage Platform
          </div>

          <h1 className="hero-title animate-fade-up font-playfair text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white"
            style={{ '--delay':'0.25s' }}>
            Preserving Goa's<br />
            <em className="text-gradient not-italic">Timeless Stories</em><br />
            with AI Intelligence
          </h1>

          <p className="hero-subtitle animate-fade-up text-lg sm:text-xl text-white/75 max-w-2xl mx-auto mb-10 leading-relaxed"
            style={{ '--delay':'0.4s' }}>
            From Chapora's sunlit ramparts to the azulejo tiles of Fontainhas — HeritGoa tracks, documents, and protects every layer of Goa's irreplaceable cultural heritage.
          </p>

          <div className="animate-fade-up flex flex-col sm:flex-row gap-4 justify-center mb-12"
            style={{ '--delay':'0.55s' }}>
            <Link to="/heritage-map" className="btn-hero-primary" id="btn-discover">
              <span>Discover Heritage Sites</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </Link>
            <a href="#ai-preview" className="btn-hero-secondary" id="btn-ai-identify">
              <span>🤖 AI Identify</span>
            </a>
          </div>

          <div className="animate-fade-up flex flex-wrap justify-center gap-8 sm:gap-12"
            style={{ '--delay':'0.7s' }}>
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span ref={ref340} className="stat-num text-gold-DEFAULT" style={{color:'#d4af37'}}>{c340}</span>
                <span className="text-2xl font-bold text-gold-DEFAULT" style={{color:'#d4af37'}}>+</span>
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Heritage Sites</span>
            </div>
            <div className="w-px h-12 bg-white/10 self-center hidden sm:block" />
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span ref={ref12k} className="stat-num text-gold-DEFAULT" style={{color:'#d4af37'}}>{c12k}</span>
                <span className="text-2xl font-bold text-gold-DEFAULT" style={{color:'#d4af37'}}>K+</span>
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Community Reports</span>
            </div>
            <div className="w-px h-12 bg-white/10 self-center hidden sm:block" />
            <div className="text-center">
              <div className="flex items-baseline justify-center gap-1">
                <span ref={ref6} className="stat-num text-gold-DEFAULT" style={{color:'#d4af37'}}>{c6}</span>
              </div>
              <span className="text-xs text-white/50 uppercase tracking-wider">Talukas Covered</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 text-xs flex flex-col items-center gap-2"
          id="hero-scroll">
          <span>Scroll to explore</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-bounce" />
        </div>
      </section>

      {/* ═══════════════════════════ MARQUEE ═══════════════════════════ */}
      <div className="marquee-bar overflow-hidden py-3 border-y border-white/5"
        style={{background:'rgba(212,175,55,0.06)'}}>
        <div className="marquee-track flex gap-8 text-sm font-medium whitespace-nowrap"
          style={{color:'rgba(212,175,55,0.7)'}}>
          {['🏰 Chapora Fort','⛪ Basilica of Bom Jesus','🏛️ Sé Cathedral','🕌 Safa Masjid',
            '🏠 Fontainhas Quarter','⛩️ Shri Mangeshi Temple','🏰 Aguada Fort',
            '🎨 Goa State Museum','🌿 Tambdi Surla Temple','🏺 Rachol Seminary',
            '🏰 Chapora Fort','⛪ Basilica of Bom Jesus','🏛️ Sé Cathedral','🕌 Safa Masjid',
            '🏠 Fontainhas Quarter','⛩️ Shri Mangeshi Temple','🏰 Aguada Fort'].map((t, i) => (
            <span key={i} className="px-4">{t}</span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════ ABOUT ═════════════════════════════ */}
      <section id="about" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-tag mb-4">About HeritGoa</div>
              <h2 className="font-playfair text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Goa's Heritage Is <em className="text-gradient not-italic">Living</em>,<br />Not Just Historic
              </h2>
              <p className="text-white/65 text-lg leading-relaxed mb-4">
                Most tourism platforms show you the famous forts and churches. HeritGoa goes deeper — we document the crumbling house at the end of a narrow Panaji lane, the fishermen's chapel no guidebook mentions, and the oral stories that only elders still remember.
              </p>
              <p className="text-white/65 text-lg leading-relaxed mb-8">
                Powered by Gemini AI, our platform connects citizens, historians, authorities, and tourists in a shared mission: to see Goa's heritage not just as a relic of the past, but as a living, breathing part of the present.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  { icon:'🤖', title:'AI-Powered Analysis', desc:'Upload any photo; Gemini Vision identifies architectural styles, cultural context, and deterioration signals.' },
                  { icon:'📡', title:'Real-Time Condition Tracking', desc:'Our deterioration engine compares images across years to flag at-risk sites before they collapse.' },
                  { icon:'🧑‍🤝‍🧑', title:'Community-Verified Stories', desc:'Local voices — not just textbook facts — shape how we understand each heritage location.' },
                ].map(f => (
                  <div key={f.title} className="flex gap-4 items-start">
                    <span className="text-2xl mt-0.5">{f.icon}</span>
                    <div>
                      <strong className="text-white font-semibold">{f.title}</strong>
                      <p className="text-white/55 text-sm mt-1">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative h-80 lg:h-96">
                <img src="/assets/bom_jesus_goa.jpg" alt="Basilica of Bom Jesus"
                  className="absolute top-0 right-0 w-4/5 h-full object-cover rounded-2xl shadow-heritage" />
                <img src="/assets/fontainhas_goa.jpg" alt="Fontainhas heritage quarter"
                  className="absolute bottom-0 left-0 w-3/5 h-3/5 object-cover rounded-2xl shadow-heritage border-2 border-navy" />
                <div className="absolute -bottom-4 right-8 card-glass px-4 py-3 flex items-center gap-3 animate-float">
                  <span className="text-xl">🛡️</span>
                  <div>
                    <strong className="text-white text-sm block">Heritage Protected</strong>
                    <span className="text-white/50 text-xs">AI-verified condition reports</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FEATURES ══════════════════════════ */}
      <section id="features" className="py-24 px-4" style={{background:'rgba(255,255,255,0.015)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-tag mb-4 inline-block">Platform Features</div>
            <h2 className="font-playfair text-4xl lg:text-5xl font-bold mb-4">
              Everything Goa's Heritage<br />Deserves
            </h2>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              A complete intelligence ecosystem — from discovery to preservation to community storytelling.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Hero Feature Card */}
            <div className="sm:col-span-2 lg:col-span-2 relative rounded-2xl overflow-hidden min-h-72 cursor-pointer group" id="feat-map">
              <div className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                style={{backgroundImage:"url('/assets/chapora_fort_goa.jpg')"}} />
              <div className="absolute inset-0" style={{background:'linear-gradient(135deg,rgba(10,22,40,.85),rgba(10,22,40,.4))'}} />
              <div className="relative p-8 h-full flex flex-col justify-end">
                <div className="text-4xl mb-3">🗺️</div>
                <h3 className="font-playfair text-2xl font-bold mb-2">Interactive Heritage Map</h3>
                <p className="text-white/65 text-sm mb-4">
                  Explore all 340+ heritage sites across Goa's 12 talukas on a real-time interactive map. Filter by category, condition, and cultural significance.
                </p>
                <Link to="/heritage-map" className="btn-primary self-start" id="feat-map-link">Explore Map →</Link>
              </div>
            </div>

            {[
              {
                id: 'feat-ai',
                c: '#2563eb',
                icon: '🤖',
                title: 'AI Heritage Identification',
                desc: 'Upload any photo. Gemini Vision analyses architectural styles, detects heritage categories, and links you to verified historical records.',
                tag: '⭐ High Hackathon Value',
                tagClass: 'text-amber-400',
                anchor: '#ai-preview',
                actionLabel: 'Try AI Identification ↓',
              },
              {
                id: 'feat-detr',
                c: '#059669',
                icon: '📊',
                title: 'Deterioration Tracking',
                desc: 'Compare photos from 2018 → 2022 → 2026. AI detects paint loss, structural cracks, vegetation growth, and flags at-risk sites.',
                tag: '🔥🔥🔥 Signature Feature',
                tagClass: 'text-red-400',
                anchor: '#deterioration',
                actionLabel: 'View Deterioration Engine ↓',
              },
              {
                id: 'feat-oral',
                c: '#7c3aed',
                icon: '👵',
                title: 'Local Oral Histories',
                desc: 'Community members contribute text, audio, and video stories. AI transcribes and moderates. Local voices preserved forever.',
                tag: '🔥 Cultural Innovation',
                tagClass: 'text-orange-400',
                linkTo: '/heritage/ASI-GOA-006',
                actionLabel: 'Explore Oral Stories →',
              },
              {
                id: 'feat-report',
                c: '#dc2626',
                icon: '🚨',
                title: 'Damage Reporting',
                desc: 'Citizens can report damage instantly. AI classifies severity and type, creating a direct pipeline to the heritage authority dashboard.',
                tag: 'Civic Action',
                tagClass: 'text-white/50',
                isReportModal: true,
                actionLabel: 'Report Damage Now 🚨',
              },
              {
                id: 'feat-photos',
                c: '#0891b2',
                icon: '📸',
                title: 'Historical Photo Archive',
                desc: 'Upload old photographs from family albums. Link them to heritage sites and years to build a visual timeline of Goa\'s evolution.',
                tag: 'Community-Powered',
                tagClass: 'text-white/50',
                anchor: '#ai-preview',
                actionLabel: 'Upload Photo Archive ↑',
              },
              {
                id: 'feat-trans',
                c: '#d97706',
                icon: '🌐',
                title: 'AI Translation',
                desc: 'Heritage content in Konkani, Marathi, and Portuguese translated to English and Hindi — without AI fabricating historical facts.',
                tag: 'Multilingual · Text + Voice',
                tagClass: 'text-amber-400',
                linkTo: '/ai-translation',
                actionLabel: 'Open AI Translator (Text & Voice) →',
              },
            ].map(f => {
              const cardContent = (
                <div className="flex flex-col h-full justify-between">
                  <div>
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                      style={{ background: `${f.c}22`, border: `1px solid ${f.c}44` }}>
                      {f.icon}
                    </div>
                    <h3 className="font-semibold text-white mb-2 group-hover:text-amber-300 transition-colors">{f.title}</h3>
                    <p className="text-white/55 text-sm leading-relaxed mb-3">{f.desc}</p>
                  </div>
                  <div className="pt-2 border-t border-white/8 flex items-center justify-between mt-auto">
                    <span className={`text-xs font-medium ${f.tagClass}`}>{f.tag}</span>
                    <span className="text-xs font-semibold text-amber-400 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      {f.actionLabel}
                    </span>
                  </div>
                </div>
              );

              if (f.linkTo) {
                return (
                  <Link key={f.id} id={f.id} to={f.linkTo}
                    className="card-glass p-6 rounded-2xl hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 group cursor-pointer block">
                    {cardContent}
                  </Link>
                );
              }

              if (f.isReportModal) {
                return (
                  <div key={f.id} id={f.id} onClick={() => setReportOpen(true)}
                    className="card-glass p-6 rounded-2xl hover:border-red-500/40 transition-all duration-300 hover:-translate-y-1 group cursor-pointer block">
                    {cardContent}
                  </div>
                );
              }

              return (
                <a key={f.id} id={f.id} href={f.anchor}
                  className="card-glass p-6 rounded-2xl hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 group cursor-pointer block">
                  {cardContent}
                </a>
              );
            })}

            {/* +5 card */}
            <div className="card-glass p-6 rounded-2xl flex flex-col items-center justify-center text-center" id="feat-more">
              <span className="font-playfair text-6xl font-bold text-gradient mb-2">+5</span>
              <h3 className="font-semibold text-white mb-2">More Features Coming</h3>
              <p className="text-white/55 text-sm mb-4">AR Reconstruction, Heritage Trails, Artisan Directory, and more.</p>
              <a href="#" className="btn-primary">See Roadmap</a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ HERITAGE SITES ════════════════════ */}
      <section id="heritage-sites" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag mb-4 inline-block">Featured Heritage Sites</div>
            <h2 className="font-playfair text-4xl lg:text-5xl font-bold mb-4">
              The Soul of Goa,<br /><em className="text-gradient not-italic">Site by Site</em>
            </h2>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              From UNESCO World Heritage landmarks to hidden gems only locals know — every site has a story worth preserving.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 justify-center mb-10" id="sites-filter">
            {[{v:'all',l:'All Sites'},{v:'fort',l:'🏰 Forts'},{v:'church',l:'⛪ Churches'},
              {v:'temple',l:'⛩️ Temples'},{v:'quarter',l:'🏠 Heritage Quarters'}].map(f => (
              <button key={f.v} id={`filter-${f.v}`}
                onClick={() => setActiveFilter(f.v)}
                className={`filter-btn ${activeFilter === f.v ? 'active' : ''}`}>
                {f.l}
              </button>
            ))}
          </div>

          {/* Cards grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map(card => (
              <div key={card.id} id={`site-${card.id}`}
                className="card-glass rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 hover:shadow-gold">
                <div className="relative h-52">
                  <img src={card.img} alt={card.name} className="w-full h-full object-cover" />
                  <div className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full border ${STATUS_MAP[card.status]}`}>
                    {card.statusLabel}
                  </div>
                  <div className="absolute bottom-3 left-3 bg-navy/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full text-white">
                    {card.catLabel}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-playfair text-xl font-bold text-white mb-1">{card.name}</h3>
                  <p className="text-white/50 text-xs mb-3">{card.loc}</p>
                  <p className="text-white/65 text-sm leading-relaxed mb-4">{card.desc}</p>
                  <div className="flex gap-4 text-xs text-white/40 mb-4">
                    {card.meta.map(m => <span key={m}>{m}</span>)}
                  </div>
                  {card.siteId ? (
                    <Link to={`/heritage/${card.siteId}`}
                      className="text-sm font-semibold transition-colors"
                      style={{color:'#d4af37'}}>
                      View Full Profile →
                    </Link>
                  ) : (
                    <Link to="/heritage-map"
                      className="text-sm font-semibold transition-colors"
                      style={{color:'#d4af37'}}>
                      View Full Profile →
                    </Link>
                  )}
                </div>
              </div>
            ))}

            {/* View All card */}
            <div className="card-glass rounded-2xl flex items-center justify-center p-8 text-center" id="site-view-all">
              <div>
                <span className="font-playfair text-6xl font-bold text-gradient block mb-2">340+</span>
                <h3 className="font-semibold text-white mb-2">Heritage Sites Catalogued</h3>
                <p className="text-white/55 text-sm mb-4">Explore the complete interactive map of Goa's documented heritage sites.</p>
                <Link to="/heritage-map" className="btn-primary" id="btn-view-all-sites">View All on Map</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ DETERIORATION ═════════════════════ */}
      <section id="deterioration" className="py-24 px-4" style={{background:'rgba(255,255,255,0.015)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-tag mb-4">Signature Feature</div>
              <h2 className="font-playfair text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Track How Heritage<br /><em className="text-gradient not-italic">Changes Over Time</em>
              </h2>
              <p className="text-white/65 text-lg leading-relaxed mb-8">
                Our AI deterioration engine compares photographs of the same site uploaded across different years. It identifies subtle and severe changes — alerting preservation authorities before irreversible damage occurs.
              </p>

              {/* Timeline */}
              <div className="flex items-center gap-2 mb-8">
                {[{yr:'2018',label:'Original Condition',cls:'bg-green-500'},{yr:'→',label:'',cls:''},{yr:'2022',label:'Paint Fading Detected',cls:'bg-amber-500'},{yr:'→',label:'',cls:''},{yr:'2026',label:'Structural Risk Flagged',cls:'bg-red-500'}].map((t,i) => (
                  t.yr === '→'
                    ? <span key={i} className="text-white/30 font-bold">→</span>
                    : (
                      <div key={i} className="text-center flex-1">
                        <div className="text-xs text-white/50 mb-1">{t.yr}</div>
                        <div className={`h-2 rounded-full ${t.cls}`} />
                        <div className="text-xs text-white/40 mt-1">{t.label}</div>
                      </div>
                    )
                ))}
              </div>

              {/* Indicators */}
              <div className="space-y-3 mb-8">
                {[
                  {label:'Wall Integrity',pct:58,cls:'bg-amber-500'},
                  {label:'Paint Condition',pct:32,cls:'bg-red-500'},
                  {label:'Architecture',pct:81,cls:'bg-green-500'},
                  {label:'Vegetation Risk',pct:74,cls:'bg-red-500'},
                ].map(ind => (
                  <div key={ind.label} className="flex items-center gap-3">
                    <span className="w-28 text-xs text-white/60">{ind.label}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${ind.cls}`} style={{width:`${ind.pct}%`}} />
                    </div>
                    <span className="text-xs text-white/40">{ind.pct}%</span>
                  </div>
                ))}
              </div>

              <a href="#" className="btn-primary" id="btn-upload-photo">Upload Heritage Photo →</a>
            </div>

            {/* Demo card */}
            <div className="card-glass rounded-2xl overflow-hidden p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-white">⚠️ Chapora Fort — North Wall</span>
                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">AI Analysis Active</span>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="relative">
                  <img src="/assets/chapora_fort_goa.jpg" alt="2018" className="w-full h-36 object-cover rounded-xl" />
                  <span className="absolute bottom-2 left-2 text-xs bg-navy/80 px-2 py-0.5 rounded text-white">2018</span>
                </div>
                <div className="relative">
                  <img src="/assets/chapora_fort_goa.jpg" alt="2026" className="w-full h-36 object-cover rounded-xl" style={{filter:'contrast(1.1) saturate(0.7) brightness(0.85)'}} />
                  <span className="absolute bottom-2 left-2 text-xs bg-red-500/80 px-2 py-0.5 rounded text-white">2026</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white mb-2">AI Detected Changes</h4>
                <ul className="space-y-1 text-xs text-white/60">
                  <li>🧱 Increased mortar erosion along north wall</li>
                  <li>🌿 Significant vegetation encroachment</li>
                  <li>💧 Moisture staining patterns expanding</li>
                  <li>🪟 Window arch showing micro-fractures</li>
                </ul>
                <div className="mt-3 flex items-center gap-2">
                  <span className="text-xs text-white/50">Risk Level:</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">HIGH — Immediate Inspection Recommended</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ STATS ═════════════════════════════ */}
      <section id="stats" className="py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0" style={{background:'linear-gradient(135deg,#0a1628 0%,#1a2d4a 50%,#0a1628 100%)'}} />
        <div className="absolute inset-0 opacity-10"
          style={{backgroundImage:'radial-gradient(circle at 2px 2px,rgba(212,175,55,0.4) 1px,transparent 0)',backgroundSize:'40px 40px'}} />
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="section-tag mb-4 inline-block" style={{color:'#d4af37',background:'rgba(212,175,55,0.12)',borderColor:'rgba(212,175,55,0.25)'}}>Platform Impact</div>
            <h2 className="font-playfair text-4xl lg:text-5xl font-bold">
              Goa's Heritage,<br />Quantified
            </h2>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {ref:rs1,val:cs1,suf:'+',icon:'🏛️',name:'Heritage Sites Mapped',desc:"Across all 12 talukas of Goa"},
              {ref:rs2,val:cs2,suf:'+',icon:'📸',name:'Photographs Archived',desc:"Historical & current condition photos"},
              {ref:rs3,val:cs3,suf:'+',icon:'👥',name:'Community Members',desc:"Citizens, historians & locals"},
              {ref:rs4,val:cs4,suf:'',icon:'🚨',name:'Sites Flagged for Rescue',desc:"AI-identified at-risk locations"},
              {ref:rs5,val:cs5,suf:'+',icon:'🎙️',name:'Oral Stories Preserved',desc:"Local legends, traditions & memories"},
              {ref:rs6,val:cs6,suf:'K+',icon:'🤖',name:'AI Analyses Run',desc:"Heritage identification & deterioration checks"},
            ].map((s,i) => (
              <div key={i} id={`stat-${i+1}`} className="card-glass rounded-2xl p-6 text-center hover:-translate-y-1 transition-transform">
                <div className="text-3xl mb-3">{s.icon}</div>
                <div className="flex items-end justify-center gap-1 mb-1">
                  <span ref={s.ref} className="font-outfit font-extrabold text-4xl" style={{color:'#d4af37'}}>{s.val.toLocaleString()}</span>
                  <span className="font-bold text-2xl mb-1" style={{color:'#d4af37'}}>{s.suf}</span>
                </div>
                <div className="font-semibold text-white text-sm mb-1">{s.name}</div>
                <div className="text-white/40 text-xs">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ COMMUNITY ════════════════════════ */}
      <section id="community" className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="section-tag mb-4 inline-block">Community Voice</div>
            <h2 className="font-playfair text-4xl lg:text-5xl font-bold mb-4">
              Oral Histories That<br /><em className="text-gradient not-italic">Must Not Be Lost</em>
            </h2>
            <p className="text-white/55 text-lg max-w-2xl mx-auto">
              Stories submitted by Goa's residents, verified by the community, preserved by HeritGoa.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              {id:'story-1',avatar:'👵',name:'Maria Fernandes',role:'Panaji resident · Verified Contributor',type:'Oral History',typeCls:'bg-amber-500/10 text-amber-400',text:'"My grandfather used to say the old well behind the Fontainhas chapel was where Portuguese soldiers stored their maps. We children were forbidden from playing near it. The well is gone now, filled in during the 1990s road widening."',site:'📍 Fontainhas Chapel, Panaji',likes:42,verified:false},
              {id:'story-2',avatar:'👨‍🏫',name:'Prof. Ramakant Naik',role:'Historian · Expert Contributor',type:'Historical Record',typeCls:'bg-blue-500/10 text-blue-400',text:'"The Tambdi Surla temple is the only surviving Kadamba-era temple in Goa. Built entirely of basalt rock, it predates the Portuguese arrival by at least 300 years. Its isolation in the forest is what saved it from destruction."',site:'📍 Tambdi Surla Temple, South Goa',likes:89,verified:true},
              {id:'story-3',avatar:'🎣',name:'Anthony D\'Costa',role:'Fisherman · Anjuna Village',type:'Oral History',typeCls:'bg-amber-500/10 text-amber-400',text:'"Chapora Fort — we called it our fort. In the 1970s, there was still a freshwater spring inside the walls. Our fathers drank from it. Today it\'s dry, and the walls are breaking piece by piece every monsoon."',site:'📍 Chapora Fort, Vagator',likes:67,verified:false},
            ].map(s => (
              <div key={s.id} id={s.id} className="card-glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-xl">{s.avatar}</div>
                    <div>
                      <strong className="text-white text-sm block">{s.name}</strong>
                      <span className="text-white/40 text-xs">{s.role}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${s.typeCls}`}>{s.type}</span>
                </div>
                <blockquote className="text-white/70 text-sm leading-relaxed italic mb-4">{s.text}</blockquote>
                <div className="text-white/40 text-xs mb-4">{s.site}</div>
                <div className="flex gap-2">
                  <button id={`${s.id}-like`} className="flex-1 text-xs py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">❤️ {s.likes}</button>
                  <button id={`${s.id}-verify`} className="flex-1 text-xs py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    {s.verified ? '✅ Verified' : '✅ Verify'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="card-glass rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-playfair text-2xl font-bold text-white mb-2">Have a story about Goa's heritage?</h3>
              <p className="text-white/55">Your family memories, local legends, and lived experiences are irreplaceable historical data.</p>
            </div>
            <a href="#" className="btn-primary whitespace-nowrap" id="btn-share-story">Share Your Story</a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ AI PREVIEW ════════════════════════ */}
      <section id="ai-preview" className="py-24 px-4" style={{background:'rgba(255,255,255,0.015)'}}>
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="section-tag mb-4">AI Feature</div>
              <h2 className="font-playfair text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Upload a Photo.<br /><em className="text-gradient not-italic">Let AI Tell the Story.</em>
              </h2>
              <p className="text-white/65 text-lg leading-relaxed mb-6">
                Snap any old building, artifact, or architectural detail in Goa. Our Gemini Vision AI analyses the image, identifies possible architectural styles, and connects you to verified historical records in our database.
              </p>
              <ul className="space-y-2 mb-6">
                {['Portuguese Baroque architecture detection','Hindu temple style classification','Damage and deterioration assessment','Similarity matching with known sites','Historical context from curated database'].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-green-400">✅</span>{item}
                  </li>
                ))}
              </ul>
              <div className="flex items-start gap-2 p-4 rounded-xl bg-white/4 border border-white/8">
                <span>ℹ️</span>
                <em className="text-white/50 text-xs">AI provides architectural analysis, not definitive historical claims. All identifications are clearly labelled as AI suggestions pending community or authority verification.</em>
              </div>
            </div>

            <div>
              <div id="ai-upload-box" className="card-glass rounded-2xl p-8 text-center mb-4 border-dashed border-2 border-white/15 hover:border-white/30 transition-colors cursor-pointer">
                <div className="text-5xl mb-4">📸</div>
                <h4 className="font-semibold text-white mb-2">Upload Heritage Photo</h4>
                <p className="text-white/50 text-sm mb-2">Drag & drop or click to upload</p>
                <p className="text-white/30 text-xs mb-4">JPG, PNG, HEIC · Max 10MB</p>
                <button className="btn-primary" id="btn-ai-upload">Choose Photo</button>
              </div>
              <div className="card-glass rounded-2xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-white/8">
                  <span className="text-sm text-white/70">🤖 AI Analysis Preview</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-white/50">Sample Output</span>
                </div>
                <div className="p-5 space-y-3">
                  {[
                    {label:'Architectural Style',val:'Portuguese Baroque',valCls:'text-white'},
                    {label:'Estimated Period',val:'17th–18th Century',valCls:'text-white'},
                    {label:'Heritage Category',val:'Religious Heritage',valCls:'text-white'},
                    {label:'Similar Known Sites',val:'Bom Jesus, Sé Cathedral +3',valCls:'text-[#d4af37] cursor-pointer'},
                    {label:'Condition Signal',val:'⚠️ Minor Deterioration',valCls:'text-amber-400'},
                  ].map(r => (
                    <div key={r.label} className="flex items-center justify-between">
                      <span className="text-xs text-white/50">{r.label}</span>
                      <span className={`text-xs font-medium ${r.valCls}`}>{r.val}</span>
                    </div>
                  ))}
                  <p className="text-white/30 text-xs pt-2 border-t border-white/8">AI analysis suggests these characteristics. Historical verification pending.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ CTA ═══════════════════════════════ */}
      <section id="cta" className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0">
          <img src="/assets/se_cathedral_goa.jpg" alt="Sé Cathedral Goa" className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg,rgba(10,22,40,.92),rgba(10,22,40,.8))'}} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="section-tag mb-6 inline-block" style={{color:'#d4af37'}}>Join the Movement</div>
          <h2 className="font-playfair text-5xl lg:text-6xl font-bold mb-6">
            Goa's Heritage Belongs<br />to <em className="text-gradient not-italic">All of Us</em>
          </h2>
          <p className="text-white/65 text-xl mb-10 max-w-2xl mx-auto">
            Whether you're a historian, a tourist, a local resident, or a concerned citizen — you have a role to play in keeping Goa's heritage alive.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/heritage-map" className="btn-hero-primary" id="btn-cta-explore">🗺️ Explore Heritage Map</Link>
            <a href="#" className="btn-hero-secondary" id="btn-cta-report">🚨 Report Damage</a>
          </div>
          <div className="flex flex-wrap gap-4 justify-center text-sm text-white/40">
            <span>🏛️ UNESCO World Heritage Sites</span>
            <span>🤖 Powered by Gemini AI</span>
            <span>🌿 Goa Culture Department</span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FOOTER ════════════════════════════ */}
      <footer id="footer" className="border-t border-white/8 py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🏛️</span>
                <span className="font-playfair text-xl font-bold">Herit<span style={{color:'#d4af37'}}>Goa</span></span>
              </Link>
              <p className="text-white/40 text-sm leading-relaxed mb-5">
                Goa's AI Heritage Intelligence Platform — documenting, preserving, and celebrating the living culture of Goa.
              </p>
              <div className="flex gap-2">
                {[{id:'social-x',l:'𝕏'},{id:'social-ig',l:'📷'},{id:'social-yt',l:'▶️'}].map(s => (
                  <a key={s.id} href="#" id={s.id} aria-label={s.id}
                    className="w-9 h-9 rounded-lg bg-white/8 hover:bg-white/15 flex items-center justify-center text-sm transition-colors">
                    {s.l}
                  </a>
                ))}
              </div>
            </div>
            {[
              {title:'Platform',links:['Heritage Map','AI Identification','Deterioration Tracker','Oral Histories','Photo Archive']},
              {title:'Heritage Regions',links:['Old Goa (Velha Goa)','Panaji & Fontainhas','North Goa Talukas','South Goa Talukas','Coastal & Fort Trails']},
              {title:'Get Involved',links:['Report Damage','Share a Story','Upload Old Photos','Volunteer','Authority Portal']},
            ].map(col => (
              <div key={col.title}>
                <h4 className="font-semibold text-white mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}><a href="#" className="text-white/40 hover:text-white/70 text-sm transition-colors">{l}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-white/30 text-sm">© 2026 HeritGoa — AI Heritage Intelligence Platform · Goa, India</p>
            <div className="flex gap-4">
              {['Privacy Policy','Terms of Use','Contact'].map(l => (
                <a key={l} href="#" className="text-white/30 hover:text-white/60 text-xs transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* ── Report Issue Modal ────────────────────────────────────────── */}
      <ReportIssueModal
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        site={{ name: 'Goa Heritage Site' }}
      />
    </div>
  );
}
