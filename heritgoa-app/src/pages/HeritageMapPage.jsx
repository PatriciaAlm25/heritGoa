import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'; // Popup used in JSX below
import L from 'leaflet';
import { MapPin, Search, X, Shield, Landmark, List, Map as MapIcon } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import { getHeritageSites, filterHeritageSites, getHiddenGoa, getSourceCategory } from '../services/heritageService';
import { ALL_CATEGORIES } from '../data/heritageSites';
import ReportIssueModal from '../components/heritage/ReportIssueModal';

// ── Fix Leaflet default icon ────────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Category icon config ─────────────────────────────────────
const CATEGORY_CONFIG = {
  'Fort':              { emoji: '🏰', color: '#c2714f' },
  'Religious Heritage':{ emoji: '⛪', color: '#2d6a4f' },
  'Archaeological':    { emoji: '🏺', color: '#8b6914' },
  'Monument':          { emoji: '🏛️', color: '#4a6fa5' },
  'Historic Building': { emoji: '🏠', color: '#7c4d8e' },
  'Heritage Precinct': { emoji: '🗺️', color: '#d4af37' },
  'Cemetery':          { emoji: '✟',  color: '#5a6a5a' },
};

function createHeritageIcon(category, isActive = false) {
  const cfg = CATEGORY_CONFIG[category] || { emoji: '📍', color: '#d4af37' };
  return L.divIcon({
    html: `<div style="
      width:38px;height:38px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:${cfg.color};display:flex;align-items:center;justify-content:center;
      border:2px solid rgba(255,255,255,${isActive ? '0.9' : '0.35'});
      box-shadow:${isActive ? `0 0 0 4px ${cfg.color}55, 0 6px 20px rgba(0,0,0,0.5)` : '0 4px 12px rgba(0,0,0,0.4)'};
      transition:all .2s;
    ">
      <span style="transform:rotate(45deg);font-size:15px;line-height:1">${cfg.emoji}</span>
    </div>`,
    className: '',
    iconSize: [38, 38],
    iconAnchor: [19, 38],
    popupAnchor: [0, -42],
  });
}

// ── Source badge config ──────────────────────────────────────
const SOURCE_BADGE = {
  'ASI Protected':  { label: 'ASI Protected',  color: '#d4af37', bg: 'rgba(212,175,55,0.12)', icon: '🛡️' },
  'State Listed':   { label: 'State Listed',   color: '#4ade80', bg: 'rgba(74,222,128,0.12)', icon: '📜' },
  'Tourism Context':{ label: 'Tourism',        color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: '🗺️' },
  'Community':      { label: 'Community',      color: '#c084fc', bg: 'rgba(192,132,252,0.12)', icon: '👥' },
};

// ── Map pan/zoom controller ──────────────────────────────────
function MapController({ activeSite }) {
  const map = useMap();
  useEffect(() => {
    if (activeSite?.latitude && activeSite?.longitude) {
      map.flyTo([activeSite.latitude, activeSite.longitude], 14, { duration: 1 });
    }
  }, [activeSite, map]);
  return null;
}

// ── Mini popup content ───────────────────────────────────────
function PopupContent({ site, onViewHeritage }) {
  const src = SOURCE_BADGE[getSourceCategory(site)] || SOURCE_BADGE['State Listed'];
  return (
    <div className="font-outfit" style={{minWidth:240}}>
      {/* Image */}
      <div className="relative h-36 bg-slate-800 overflow-hidden rounded-t-2xl">
        {site.image_url ? (
          <img src={site.image_url} alt={site.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-white/25">
            <Landmark size={32} />
            <span className="text-xs">Heritage image unavailable</span>
          </div>
        )}
        <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full"
          style={{ background: src.bg, color: src.color, border: `1px solid ${src.color}40` }}>
          {src.icon} {src.label}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-playfair text-base font-bold text-white mb-2 leading-snug">{site.name}</h3>
        <div className="flex items-center gap-1 text-white/50 text-xs mb-1">
          <MapPin size={10} />
          <span>{[site.locality, site.district].filter(Boolean).join(', ')}</span>
        </div>
        <div className="text-white/40 text-xs mb-3">
          {CATEGORY_CONFIG[site.category]?.emoji} {site.category}
        </div>
        <div className="text-xs mb-3">
          <span className="text-white/40">Condition: </span>
          <span className="text-white/70">{site.current_condition || 'Not Yet Assessed'}</span>
        </div>
        <button
          onClick={() => onViewHeritage(site.site_id)}
          className="w-full py-2 rounded-xl text-xs font-semibold transition-all"
          style={{ background: 'linear-gradient(135deg,#d4af37,#a8892a)', color: '#0a1628' }}>
          View Heritage →
        </button>
      </div>
    </div>
  );
}

// ── Heritage site list item ───────────────────────────────────
function SiteListItem({ site, isActive, onClick }) {
  const src = SOURCE_BADGE[getSourceCategory(site)] || SOURCE_BADGE['State Listed'];
  const hasCoords = site.latitude && site.longitude;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 border-b transition-all duration-150 ${
        isActive ? 'bg-white/8 border-l-2' : 'hover:bg-white/4 border-transparent border-l-2'
      }`}
      style={{
        borderLeftColor: isActive ? '#d4af37' : 'transparent',
        borderBottomColor: 'rgba(255,255,255,0.06)',
      }}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs">{CATEGORY_CONFIG[site.category]?.emoji || '📍'}</span>
            <span className="font-medium text-white text-sm truncate">{site.name}</span>
          </div>
          <div className="text-white/40 text-xs truncate">
            {[site.locality, site.taluka, site.district].filter(Boolean).join(', ')}
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ background: src.bg, color: src.color, fontSize: '0.6rem' }}>
            {src.icon} {src.label}
          </span>
          {!hasCoords && (
            <span className="text-xs text-white/25" title="No coordinates yet">📍?</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ── Main Page ─────────────────────────────────────────────────
export default function HeritageMapPage() {
  const navigate = useNavigate();
  const [allSites,    setAllSites]    = useState([]);
  const [filtered,    setFiltered]    = useState([]);
  const [activeSite,  setActiveSite]  = useState(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState(null);
  const [mobileView,  setMobileView]  = useState('map'); // 'map' | 'list'

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sourceFilter,   setSourceFilter]   = useState('All Sources');
  const [districtFilter, setDistrictFilter] = useState('All Goa');
  const [searchQuery,    setSearchQuery]    = useState('');

  // Report modal
  const [reportOpen, setReportOpen] = useState(false);

  // markerRefs reserved for future imperative map control (e.g., open popup programmatically)
  // const markerRefs = useRef({});

  // ── Load data ──────────────────────────────────────────────
  useEffect(() => {
    getHeritageSites()
      .then(sites => {
        setAllSites(sites);
        setFiltered(sites);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("We couldn't load the heritage map right now. Please try again.");
        setLoading(false);
      });
  }, []);

  // ── Apply filters ──────────────────────────────────────────
  useEffect(() => {
    setFiltered(filterHeritageSites(allSites, {
      category: categoryFilter,
      source:   sourceFilter,
      district: districtFilter,
      query:    searchQuery,
    }));
  }, [allSites, categoryFilter, sourceFilter, districtFilter, searchQuery]);

  const handleViewHeritage = useCallback((siteId) => {
    navigate(`/heritage/${siteId}`);
  }, [navigate]);

  const handleSiteClick = useCallback((site) => {
    setActiveSite(site);
    if (window.innerWidth < 768) setMobileView('map');
  }, []);

  const mappableSites = filtered.filter(s => s.latitude && s.longitude);
  const hiddenGoa     = getHiddenGoa(allSites);

  if (loading) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <Navbar />
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mb-4 mx-auto"
          style={{ borderColor: 'rgba(212,175,55,0.3)', borderTopColor: '#d4af37' }} />
        <p className="text-white/60 font-outfit">Loading Goa's heritage...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <Navbar />
      <div className="text-center max-w-md px-4">
        <div className="text-5xl mb-4">⚠️</div>
        <h2 className="font-playfair text-2xl font-bold text-white mb-2">Heritage Map Unavailable</h2>
        <p className="text-white/55 mb-6">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-primary">Try Again</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-navy flex flex-col">
      <Navbar />

      {/* ── Hero Banner ─────────────────────────────────────── */}
      <div className="pt-16 lg:pt-20 px-4 py-6 text-center"
        style={{ background: 'linear-gradient(135deg,rgba(10,22,40,1) 0%,rgba(26,35,50,1) 100%)', borderBottom: '1px solid rgba(212,175,55,0.12)' }}>
        <div className="section-tag mb-3 inline-block">Goa Heritage Intelligence</div>
        <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-white mb-2">
          Explore Goa's Living Heritage
        </h1>
        <p className="text-white/55 text-sm sm:text-base max-w-2xl mx-auto mb-3">
          Discover historic monuments, sacred spaces, archaeological sites and cultural places across Goa — with information grounded in verified heritage sources.
        </p>
        <div className="inline-flex items-center gap-2 text-xs text-white/35 px-3 py-1 rounded-full border border-white/10">
          <Shield size={12} className="text-gold-DEFAULT" style={{ color: '#d4af37' }} />
          Heritage data sourced from official and verified records
        </div>
      </div>

      {/* ── Filters + Search bar ────────────────────────────── */}
      <div className="px-4 py-3 flex flex-col gap-3" style={{ background: 'rgba(255,255,255,0.025)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        {/* Search */}
        <div className="max-w-7xl mx-auto w-full">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search heritage sites by name, locality, taluka, district..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-white/6 border border-white/10 rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-white/25 transition-colors"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category filters */}
        <div className="max-w-7xl mx-auto w-full flex flex-wrap gap-2">
          {ALL_CATEGORIES.map(cat => (  /* ALL_CATEGORIES already starts with 'All' */
            <button key={cat} onClick={() => setCategoryFilter(cat)}
              className={`filter-btn text-xs ${categoryFilter === cat ? 'active' : ''}`}>
              {CATEGORY_CONFIG[cat]?.emoji ?? ''} {cat}
            </button>
          ))}
        </div>

        {/* Source + District filters */}
        <div className="max-w-7xl mx-auto w-full flex flex-wrap gap-2 items-center">
          <span className="text-white/30 text-xs">Source:</span>
          {['All Sources', 'ASI Protected', 'State Listed'].map(s => (
            <button key={s} onClick={() => setSourceFilter(s)}
              className={`filter-btn text-xs ${sourceFilter === s ? 'active' : ''}`}>{s}</button>
          ))}
          <div className="w-px h-4 bg-white/15 mx-1 hidden sm:block" />
          <span className="text-white/30 text-xs">District:</span>
          {['All Goa', 'North Goa', 'South Goa'].map(d => (
            <button key={d} onClick={() => setDistrictFilter(d)}
              className={`filter-btn text-xs ${districtFilter === d ? 'active' : ''}`}>{d}</button>
          ))}
          <span className="ml-auto text-white/30 text-xs">
            {filtered.length} site{filtered.length !== 1 ? 's' : ''} · {mappableSites.length} on map
          </span>
        </div>
      </div>

      {/* ── Mobile view toggle ──────────────────────────────── */}
      <div className="md:hidden flex border-b border-white/8">
        <button onClick={() => setMobileView('map')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${mobileView === 'map' ? 'text-white border-b-2' : 'text-white/40'}`}
          style={{ borderColor: mobileView === 'map' ? '#d4af37' : 'transparent' }}>
          <MapIcon size={15} /> Map
        </button>
        <button onClick={() => setMobileView('list')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium transition-colors ${mobileView === 'list' ? 'text-white border-b-2' : 'text-white/40'}`}
          style={{ borderColor: mobileView === 'list' ? '#d4af37' : 'transparent' }}>
          <List size={15} /> List ({filtered.length})
        </button>
      </div>

      {/* ── Main workspace: list + map ─────────────────────── */}
      <div className="flex-1 flex overflow-hidden" style={{ minHeight: 0 }}>
        {/* Site List */}
        <aside className={`${mobileView === 'list' ? 'flex' : 'hidden'} md:flex flex-col
          md:w-80 lg:w-96 border-r border-white/8 overflow-hidden`}>
          <div className="flex-1 overflow-y-auto scrollbar-hide">
            {filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-white/50 text-sm">No heritage locations found.</p>
                <p className="text-white/30 text-xs mt-1">Try changing your filters or search term.</p>
              </div>
            ) : (
              filtered.map(site => (
                <SiteListItem
                  key={site.site_id}
                  site={site}
                  isActive={activeSite?.site_id === site.site_id}
                  onClick={() => handleSiteClick(site)}
                />
              ))
            )}
          </div>
        </aside>

        {/* Map */}
        <main className={`${mobileView === 'map' ? 'flex' : 'hidden'} md:flex flex-1 flex-col`}>
          <MapContainer
            center={[15.3004, 74.1240]}
            zoom={10}
            style={{ height: '100%', width: '100%', minHeight: '400px' }}
            className="flex-1"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='© <a href="https://openstreetmap.org">OpenStreetMap</a> contributors'
              maxZoom={19}
            />
            <MapController activeSite={activeSite} />

            {mappableSites.map(site => (
              <Marker
                key={site.site_id}
                position={[site.latitude, site.longitude]}
                icon={createHeritageIcon(site.category, activeSite?.site_id === site.site_id)}
                eventHandlers={{
                  click: () => setActiveSite(site),
                }}
              >
                <Popup className="heritage-popup">
                  <PopupContent site={site} onViewHeritage={handleViewHeritage} />
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </main>
      </div>

      {/* ── Discover Hidden Goa ─────────────────────────────── */}
      {hiddenGoa.length > 0 && (
        <section className="px-4 py-10 border-t border-white/8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="section-tag mb-2">Discover Hidden Goa</div>
                <p className="text-white/45 text-sm">Explore lesser-known heritage locations across Goa.</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hiddenGoa.map(site => {
                const src = SOURCE_BADGE[getSourceCategory(site)] || SOURCE_BADGE['State Listed'];
                return (
                  <button key={site.site_id}
                    onClick={() => navigate(`/heritage/${site.site_id}`)}
                    className="card-glass rounded-xl p-4 text-left hover:-translate-y-0.5 transition-all hover:shadow-gold">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">{CATEGORY_CONFIG[site.category]?.emoji || '📍'}</span>
                      <span className="font-medium text-white text-sm">{site.name}</span>
                    </div>
                    <p className="text-white/40 text-xs mb-3">
                      {[site.locality, site.taluka, site.district].filter(Boolean).join(', ')}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs px-2 py-0.5 rounded-full"
                        style={{ background: src.bg, color: src.color }}>{src.icon} {src.label}</span>
                      <span className="text-xs text-white/30">View Profile →</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Report Issue Modal */}
      <ReportIssueModal open={reportOpen} onClose={() => setReportOpen(false)} site={activeSite} />
    </div>
  );
}
