import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Shield, ExternalLink, Landmark, AlertTriangle, Users } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import ReportIssueModal from '../components/heritage/ReportIssueModal';
import { getHeritageSiteById, getHeritageSites, getSourceCategory } from '../services/heritageService';
import { getNearbyHeritage } from '../utils/distance';

// ── Source badge config ──────────────────────────────────────
const SOURCE_BADGE = {
  'ASI Protected':  { label: 'ASI Protected',  color: '#d4af37', bg: 'rgba(212,175,55,0.12)', icon: '🛡️', desc: 'Centrally Protected Monument — Archaeological Survey of India' },
  'State Listed':   { label: 'State Listed',   color: '#4ade80', bg: 'rgba(74,222,128,0.12)', icon: '📜', desc: 'Protected under Goa State Act — TCP / Goa Archives & Archaeology' },
  'Tourism Context':{ label: 'Tourism',        color: '#60a5fa', bg: 'rgba(96,165,250,0.12)', icon: '🗺️', desc: 'Featured in tourism context' },
  'Community':      { label: 'Community',      color: '#c084fc', bg: 'rgba(192,132,252,0.12)', icon: '👥', desc: 'Community contributed record — pending verification' },
};

const CATEGORY_EMOJI = {
  'Fort': '🏰', 'Religious Heritage': '⛪', 'Archaeological': '🏺',
  'Monument': '🏛️', 'Historic Building': '🏠', 'Heritage Precinct': '🗺️', 'Cemetery': '✟',
};

function InfoSection({ title, content }) {
  if (!content || content.trim() === '') return null;
  return (
    <div className="card-glass rounded-2xl p-6">
      <h3 className="font-playfair text-lg font-bold text-white mb-3">{title}</h3>
      <p className="text-white/65 text-sm leading-relaxed">{content}</p>
    </div>
  );
}

export default function HeritageDetailPage() {
  const { siteId } = useParams();
  const navigate   = useNavigate();
  const [site,        setSite]        = useState(null);
  const [allSites,    setAllSites]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [reportOpen,  setReportOpen]  = useState(false);

  useEffect(() => {
    Promise.all([
      getHeritageSiteById(siteId),
      getHeritageSites(),
    ]).then(([found, all]) => {
      setSite(found);
      setAllSites(all);
      setLoading(false);
      window.scrollTo(0, 0);
    }).catch(() => setLoading(false));
  }, [siteId]);

  if (loading) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <Navbar />
      <div className="text-center">
        <div className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mb-4 mx-auto"
          style={{ borderColor: 'rgba(212,175,55,0.3)', borderTopColor: '#d4af37' }} />
        <p className="text-white/60">Loading heritage record...</p>
      </div>
    </div>
  );

  if (!site) return (
    <div className="min-h-screen bg-navy flex items-center justify-center">
      <Navbar />
      <div className="text-center max-w-md px-4">
        <div className="text-5xl mb-4">🏛️</div>
        <h2 className="font-playfair text-2xl font-bold text-white mb-2">Heritage Site Not Found</h2>
        <p className="text-white/55 mb-6">The site ID "{siteId}" doesn't exist in our dataset.</p>
        <Link to="/heritage-map" className="btn-primary">← Back to Map</Link>
      </div>
    </div>
  );

  const srcKey  = getSourceCategory(site);
  const src     = SOURCE_BADGE[srcKey] || SOURCE_BADGE['State Listed'];
  const nearby  = getNearbyHeritage(site, allSites, 5, 50);

  return (
    <div className="min-h-screen bg-navy">
      <Navbar />
      <div className="pt-16 lg:pt-20">

        {/* ── Back nav ─────────────────────────────────────── */}
        <div className="px-4 py-4 border-b border-white/8" style={{background:'rgba(255,255,255,0.02)'}}>
          <div className="max-w-5xl mx-auto">
            <button onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
              <ArrowLeft size={16} /> Back to Heritage Map
            </button>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

          {/* ── Header ──────────────────────────────────────── */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-2xl">{CATEGORY_EMOJI[site.category] || '🏛️'}</span>
              <span className="section-tag">{site.category}</span>
              <span className="text-xs px-2 py-1 rounded-full font-medium"
                style={{ background: src.bg, color: src.color, border: `1px solid ${src.color}40` }}>
                {src.icon} {src.label}
              </span>
            </div>
            <h1 className="font-playfair text-3xl sm:text-4xl font-bold text-white mb-3">{site.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-white/50 text-sm">
              <span className="flex items-center gap-1">
                <MapPin size={14} />
                {[site.locality, site.taluka, site.district, 'Goa'].filter(Boolean).join(', ')}
              </span>
              <span className="text-white/20">·</span>
              <span className="text-white/35 font-mono text-xs">{site.site_id}</span>
            </div>
          </div>

          {/* ── Image ─────────────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden bg-white/4 border border-white/8 h-64 sm:h-80">
            {site.image_url ? (
              <img src={site.image_url} alt={site.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-white/20">
                <Landmark size={48} />
                <span className="text-sm">Heritage image unavailable</span>
              </div>
            )}
          </div>

          {/* ── Two column layout ────────────────────────── */}
          <div className="grid lg:grid-cols-3 gap-6">

            {/* Left: text sections */}
            <div className="lg:col-span-2 space-y-4">
              <InfoSection title="Historical Background"  content={site.historical_background} />
              <InfoSection title="Architecture"           content={site.architecture} />
              <InfoSection title="Cultural Significance"  content={site.cultural_significance} />

              {/* If all three are empty */}
              {!site.historical_background && !site.architecture && !site.cultural_significance && (
                <div className="card-glass rounded-2xl p-6 text-center">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-white/45 text-sm">
                    Descriptive information for this site has not yet been entered into the dataset.
                  </p>
                  <p className="text-white/25 text-xs mt-2">
                    This record was created from the official heritage listing — content enrichment pending.
                  </p>
                </div>
              )}

              {/* Community Stories */}
              <div className="card-glass rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Users size={18} className="text-white/40" />
                  <h3 className="font-playfair text-lg font-bold text-white">Community Stories</h3>
                </div>
                {site.community_story_status === 'None yet' || !site.community_story_status ? (
                  <div>
                    <p className="text-white/45 text-sm mb-4">
                      No community stories have been submitted yet for this heritage site.
                    </p>
                    <button
                      className="text-sm px-4 py-2 rounded-xl border transition-colors disabled:opacity-50"
                      style={{ border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.4)' }}
                      disabled>
                      Share a Story <span className="text-xs ml-1">(Coming Soon)</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-white/55 text-sm">{site.community_story_status}</p>
                )}
              </div>
            </div>

            {/* Right: status cards */}
            <div className="space-y-4">

              {/* Heritage Status */}
              <div className="card-glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={16} style={{ color: src.color }} />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50">Heritage Status</span>
                </div>
                <div className="font-semibold text-white mb-2">{src.icon} {src.label}</div>
                <p className="text-white/40 text-xs mb-4 leading-relaxed">{src.desc}</p>

                <div className="border-t border-white/8 pt-3 space-y-2">
                  <div>
                    <span className="text-xs text-white/30 block mb-0.5">Source</span>
                    {site.source_url ? (
                      <a href={site.source_url} target="_blank" rel="noopener noreferrer"
                        className="text-xs flex items-center gap-1 hover:underline transition-colors"
                        style={{ color: src.color }}>
                        {site.source_name}
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="text-xs text-white/55">{site.source_name || 'Information not yet available'}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs text-white/30 block mb-0.5">Verification</span>
                    <span className="text-xs text-white/55">{site.verification_status || 'Information not yet available'}</span>
                  </div>
                  {site.source_reference && (
                    <div>
                      <span className="text-xs text-white/30 block mb-0.5">Reference</span>
                      <span className="text-xs text-white/45 italic">{site.source_reference}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Condition */}
              <div className="card-glass rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <AlertTriangle size={16} className="text-amber-400/70" />
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50">Heritage Condition</span>
                </div>
                <div className="font-semibold text-white mb-3">
                  {site.current_condition || 'Not Yet Assessed'}
                </div>

                <div className="space-y-2 border-t border-white/8 pt-3">
                  <div>
                    <span className="text-xs text-white/30 block mb-0.5">Condition Basis</span>
                    <span className="text-xs text-white/50">
                      {site.condition_basis || 'Information not yet available'}
                    </span>
                  </div>
                  <div>
                    <span className="text-xs text-white/30 block mb-0.5">Community Reports</span>
                    <span className="text-xs text-white/55">
                      {site.reported_issues_count === 0
                        ? 'No issues currently reported'
                        : `${site.reported_issues_count} reported issue${site.reported_issues_count > 1 ? 's' : ''}`}
                    </span>
                    {site.reported_issues_count === 0 && (
                      <p className="text-white/25 text-xs mt-1">
                        Note: Zero reports does not imply the site is in good condition.
                      </p>
                    )}
                  </div>
                  {site.ownership && (
                    <div>
                      <span className="text-xs text-white/30 block mb-0.5">Ownership</span>
                      <span className="text-xs text-white/50">{site.ownership}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Provenance badge */}
              <div className="rounded-xl p-4" style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <Shield size={14} style={{ color: '#d4af37' }} />
                  <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#d4af37' }}>Verified Heritage Data</span>
                </div>
                <p className="text-white/40 text-xs leading-relaxed">
                  This record originates from an official government heritage listing. No AI-generated or community-submitted content has been added to this profile.
                </p>
              </div>

              {/* Report Button */}
              <button
                onClick={() => setReportOpen(true)}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all border border-red-500/25 text-red-400 hover:bg-red-500/10">
                🚨 Report an Issue
              </button>
            </div>
          </div>

          {/* ── Nearby Heritage ──────────────────────────── */}
          {site.latitude && site.longitude && nearby.length > 0 && (
            <div>
              <h3 className="font-playfair text-xl font-bold text-white mb-4">Explore Nearby Heritage</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {nearby.map(({ site: n, distanceKm }) => (
                  <Link key={n.site_id} to={`/heritage/${n.site_id}`}
                    className="card-glass rounded-xl p-4 hover:-translate-y-0.5 transition-all hover:shadow-gold">
                    <div className="flex items-center gap-2 mb-1">
                      <span>{CATEGORY_EMOJI[n.category] || '📍'}</span>
                      <span className="font-medium text-white text-sm leading-snug">{n.name}</span>
                    </div>
                    <p className="text-white/40 text-xs mb-2">
                      {[n.locality, n.district].filter(Boolean).join(', ')}
                    </p>
                    <span className="text-xs font-semibold" style={{ color: '#d4af37' }}>
                      {distanceKm} km away
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Note for sites without coordinates */}
          {(!site.latitude || !site.longitude) && (
            <div className="text-center py-6 text-white/25 text-xs">
              <MapPin size={16} className="mx-auto mb-2 opacity-30" />
              <p>Map location pending geocoding. Nearby heritage cannot be calculated without coordinates.</p>
            </div>
          )}
        </div>
      </div>

      <ReportIssueModal open={reportOpen} onClose={() => setReportOpen(false)} site={site} />
    </div>
  );
}
