import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MapPin, ExternalLink, HelpCircle, CheckCircle } from 'lucide-react';

export default function MatchedSitesGrid({ matches }) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="mt-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>✓ VERIFIED HERITAGE DATASET CONTEXT</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100">
            Potentially Related Registered Sites
          </h2>
          <p className="text-slate-400 text-xs mt-1">
            Based on visual features and regional tags detected in your image, these official Goan heritage locations match our database records.
          </p>
        </div>

        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold">
          {matches.length} Matches Found
        </span>
      </div>

      {/* Grid of Matched Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {matches.map((item) => {
          const site = item;
          return (
            <div
              key={site.site_id}
              className="bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-amber-500/5 group flex flex-col justify-between"
            >
              <div>
                {/* Header row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[11px] font-bold uppercase tracking-wider mb-1.5">
                      {site.category || 'Heritage Site'}
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
                      {site.name}
                    </h3>
                  </div>
                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-400 text-[10px] font-mono shrink-0">
                    {site.site_id}
                  </span>
                </div>

                {/* Location & Status */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                    {site.locality ? `${site.locality}, ` : ''}{site.district || 'Goa'}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-slate-300 font-medium truncate max-w-[220px]" title={site.heritage_status}>
                    {site.heritage_status || 'Registered Site'}
                  </span>
                </div>

                {/* Match Reason Breakdown */}
                {site.matchReasons && site.matchReasons.length > 0 && (
                  <div className="mb-4 p-3 rounded-xl bg-slate-950/60 border border-slate-800/80">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 mb-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                      <span>Why these matches?</span>
                    </div>
                    <div className="space-y-1">
                      {site.matchReasons.map((reason, rIdx) => (
                        <div key={rIdx} className="text-[11px] text-slate-300 flex items-center gap-1.5">
                          <CheckCircle className="w-3 h-3 text-emerald-400 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Card Footer Link */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between mt-2">
                <span className="text-[11px] text-slate-500">
                  Verified Source: <span className="text-slate-400">{site.source_name || 'ASI / State Listing'}</span>
                </span>

                <Link
                  to={`/heritage-map?siteId=${site.site_id}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>View Heritage Record</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
