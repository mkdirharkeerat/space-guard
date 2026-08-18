import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { sound } from '../utils/audio';

export default function GuideBox({ title, badge = "OPERATIONAL GUIDE", steps = [], note, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    sound.playClick();
    setIsOpen(!isOpen);
  };

  return (
    <div className="rounded-lg bg-space-900/90 border border-space-700/80 overflow-hidden font-mono text-space-200 transition-all">
      <div 
        onClick={toggle}
        className="flex items-center justify-between px-4 py-3 bg-space-850 border-b border-space-700/60 cursor-pointer hover:bg-space-800 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <Info className="w-4 h-4 text-telemetry-emerald" />
          <div className="flex items-center gap-2">
            <span className="font-semibold text-xs text-white uppercase tracking-wider">{title}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-space-700 text-space-300 border border-space-600">
              {badge}
            </span>
          </div>
        </div>
        <button className="p-1 text-space-400 hover:text-white">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 flex flex-col gap-3 text-xs">
          {steps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {steps.map((step, idx) => (
                <div key={idx} className="p-3 bg-space-950/60 border border-space-800 rounded-md flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded text-space-300 bg-space-800 font-mono text-[10px] flex items-center justify-center border border-space-700 font-semibold">
                      {idx + 1}
                    </span>
                    <strong className="text-white font-medium uppercase text-[11px] tracking-wide">{step.title}</strong>
                  </div>
                  <p className="text-space-400 leading-relaxed text-[11px]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {note && (
            <div className="p-2.5 bg-space-850/80 border border-space-700/50 rounded text-[11px] text-space-300 flex items-start gap-2">
              <span className="px-1.5 py-0.5 bg-telemetry-emerald/20 text-telemetry-emerald border border-telemetry-emerald/30 rounded text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap">
                TECHNICAL NOTE
              </span>
              <span className="leading-relaxed">{note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
