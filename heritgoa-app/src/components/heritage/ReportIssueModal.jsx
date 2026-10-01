import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

const ISSUE_TYPES = [
  { id: 'structural',    label: '🧱 Structural damage' },
  { id: 'graffiti',     label: '🖌️ Graffiti' },
  { id: 'waste',        label: '🗑️ Waste / pollution' },
  { id: 'encroachment', label: '🏗️ Encroachment' },
  { id: 'vandalism',    label: '⚠️ Vandalism' },
  { id: 'accessibility',label: '♿ Accessibility issue' },
  { id: 'other',        label: '📌 Other' },
];

// ─────────────────────────────────────────────────────────────
// ReportIssueModal
// UI only — backend not yet implemented.
// Architecture ready to connect to /api/reports → Supabase damage_reports table.
// ─────────────────────────────────────────────────────────────
export default function ReportIssueModal({ open, onClose, site }) {
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [description,   setDescription]   = useState('');
  const [image,         setImage]         = useState(null);
  const [submitted,     setSubmitted]     = useState(false);

  if (!open) return null;

  const toggleType = (id) => {
    setSelectedTypes(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: POST to backend → Supabase damage_reports table
    // const report = { site_id: site?.site_id, issue_types: selectedTypes, description, image };
    setSubmitted(true);
  };

  const handleClose = () => {
    setSelectedTypes([]);
    setDescription('');
    setImage(null);
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-lg rounded-2xl overflow-hidden"
        style={{ background: '#1a2332', border: '1px solid rgba(212,175,55,0.2)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/8">
          <div className="flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-400" />
            <h2 className="font-playfair text-lg font-bold text-white">Report an Issue</h2>
          </div>
          <button onClick={handleClose} className="text-white/40 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="font-playfair text-xl font-bold text-white mb-2">Report Received</h3>
            <p className="text-white/55 text-sm mb-2">
              Thank you for contributing to heritage preservation.
            </p>
            <p className="text-amber-400/70 text-xs mb-6">
              ⚠️ Backend integration pending — report queued locally. Full submission will be enabled once the reporting system is live.
            </p>
            <button onClick={handleClose} className="btn-primary">Close</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
            {site && (
              <div className="text-xs text-white/40 px-3 py-2 rounded-lg bg-white/4 border border-white/8">
                📍 Reporting for: <span className="text-white/70">{site.name}</span>
              </div>
            )}

            {/* Issue types */}
            <div>
              <label className="text-sm font-semibold text-white block mb-3">What did you observe?</label>
              <div className="grid grid-cols-2 gap-2">
                {ISSUE_TYPES.map(issue => (
                  <button
                    key={issue.id}
                    type="button"
                    onClick={() => toggleType(issue.id)}
                    className={`px-3 py-2.5 rounded-xl text-xs font-medium text-left transition-all border ${
                      selectedTypes.includes(issue.id)
                        ? 'border-amber-500/50 text-amber-300 bg-amber-500/10'
                        : 'border-white/10 text-white/60 bg-white/4 hover:bg-white/8'
                    }`}>
                    {issue.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-sm font-semibold text-white block mb-2">Description</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={4}
                placeholder="Describe what you observed in detail..."
                className="w-full bg-white/6 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-white/25 resize-none transition-colors"
              />
            </div>

            {/* Image upload */}
            <div>
              <label className="text-sm font-semibold text-white block mb-2">Upload photo (optional)</label>
              <label className="flex items-center gap-3 px-4 py-3 rounded-xl border border-dashed border-white/15 cursor-pointer hover:border-white/30 transition-colors">
                <span className="text-white/40 text-xs">
                  {image ? `📷 ${image.name}` : '📷 Choose Image (JPG, PNG · Max 10MB)'}
                </span>
                <input type="file" accept="image/*" className="hidden"
                  onChange={e => setImage(e.target.files?.[0] ?? null)} />
              </label>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 text-xs text-amber-400/60 bg-amber-500/5 border border-amber-500/15 rounded-xl p-3">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>The report submission backend is not yet active. This UI is ready to connect to the damage_reports table once the API endpoint is deployed.</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={handleClose} className="btn-ghost flex-1">Cancel</button>
              <button
                type="submit"
                disabled={selectedTypes.length === 0}
                className="flex-1 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#d4af37,#a8892a)', color: '#0a1628' }}>
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
