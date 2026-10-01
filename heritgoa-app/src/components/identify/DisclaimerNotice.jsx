import React from 'react';
import { ShieldCheck, Info, Flag } from 'lucide-react';

export default function DisclaimerNotice() {
  return (
    <div className="mt-12 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-400 text-xs space-y-4">
      <div className="flex items-start gap-3">
        <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <h4 className="text-sm font-bold text-slate-200 mb-1">
            AI-Assisted Identification & Responsible Technology Disclaimer
          </h4>
          <p className="leading-relaxed text-slate-400">
            HeritGoa strictly separates <strong className="text-slate-200">AI visual observations</strong> from <strong className="text-slate-200">official historical records</strong>. Gemini Vision analyzes observable architectural characteristics (arches, materials, facade shapes), while HeritGoa's curated dataset provides verified heritage ground truth. Visual identification alone does not establish official legal protection or historical identity.
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Curated against Archaeological Survey of India (ASI) & TCP Goa Official Lists</span>
        </div>

        <a
          href="mailto:contact@heritgoa.org?subject=Heritage Site Suggestion"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
        >
          <Flag className="w-3.5 h-3.5 text-amber-400" />
          <span>Is this an unlisted heritage site? Report or Contribute</span>
        </a>
      </div>
    </div>
  );
}
