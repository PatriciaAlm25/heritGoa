import React from 'react';
import { MapPin } from 'lucide-react';

export default function LocationSelector({ value, onChange }) {
  const districts = [
    { label: 'All Goa (Unspecified)', value: '' },
    { label: 'North Goa', value: 'North Goa' },
    { label: 'South Goa', value: 'South Goa' }
  ];

  return (
    <div className="bg-slate-800/40 border border-slate-700/60 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-2 mb-2 text-slate-200 text-sm font-semibold">
        <MapPin className="w-4 h-4 text-amber-400" />
        <span>Where was this photograph taken? <span className="text-slate-400 font-normal">(Optional)</span></span>
      </div>
      <p className="text-xs text-slate-400 mb-3">
        Providing the location dramatically improves dataset matching accuracy against registered Goa heritage records.
      </p>

      <div className="flex flex-wrap gap-2">
        {districts.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => onChange({ district: item.value })}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              (value?.district || '') === item.value
                ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400'
                : 'bg-slate-700/60 text-slate-300 hover:bg-slate-700 hover:text-slate-100'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
