import React from 'react';
import { Bot, CheckCircle2, ShieldAlert, Sparkles, Layers, Building2, Paintbrush } from 'lucide-react';

export default function AiAnalysisCard({ analysis }) {
  if (!analysis) return null;

  const {
    identified_subject = 'Unspecified Structure',
    confidence_level = 'Moderate',
    architectural_characteristics = [],
    visible_materials = [],
    possible_architectural_style = [],
    possible_heritage_category = 'Traditional Architecture',
    visual_observations = [],
    warning = ''
  } = analysis;

  const getConfidenceBadge = (level) => {
    switch (level?.toLowerCase()) {
      case 'high':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'moderate':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/40';
      case 'low':
      default:
        return 'bg-slate-500/20 text-slate-300 border-slate-500/40';
    }
  };

  return (
    <div className="bg-slate-900/90 border border-amber-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-md">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">🤖 AI Visual Analysis</span>
              <span className="text-xs text-slate-500">• Powered by Gemini Vision</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-100 mt-0.5">
              {identified_subject}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Confidence:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getConfidenceBadge(confidence_level)}`}>
            {confidence_level}
          </span>
        </div>
      </div>

      {/* Grid of Visual Observations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Category & Style */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Building2 className="w-4 h-4 text-amber-400" />
              <span>Possible Category</span>
            </div>
            <div className="inline-block px-3.5 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-sm font-semibold">
              {possible_heritage_category}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
              <Paintbrush className="w-4 h-4 text-amber-400" />
              <span>Possible Architectural Style</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {possible_architectural_style.map((style, idx) => (
                <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                  {style}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Visible Materials */}
        <div>
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4 text-amber-400" />
            <span>Visible Materials</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visible_materials.map((mat, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded-md bg-slate-800 text-slate-300 text-xs font-medium border border-slate-700">
                🧱 {mat}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Architectural Characteristics */}
      <div className="mb-6">
        <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Architectural Characteristics Detected</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {architectural_characteristics.map((feat, idx) => (
            <div key={idx} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-slate-200 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{feat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Visual Observations */}
      {visual_observations.length > 0 && (
        <div className="mb-6 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Visual Notes
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {visual_observations.map((obs, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-amber-400">•</span>
                <span>{obs}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Responsible AI Disclaimer Banner */}
      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200/90 text-xs flex items-start gap-3">
        <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-amber-300 font-semibold">Responsible AI Visual Observation:</strong>{' '}
          {warning || 'Visual analysis alone cannot establish official historical identity or protected status. Historical facts are verified separately against HeritGoa official datasets below.'}
        </div>
      </div>
    </div>
  );
}
