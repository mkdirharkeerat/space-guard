import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';
import { sound } from '../utils/audio';

export default function GuideBox({ title, badge = "USER GUIDE", steps = [], note, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const toggle = () => {
    sound.playClick();
    setIsOpen(!isOpen);
  };

  return (
    <div className="rounded-2xl bg-neo-cream border-3 border-black shadow-neo overflow-hidden font-mono text-black transition-all">
      <div 
        onClick={toggle}
        className="flex items-center justify-between p-4 bg-neo-yellow border-b-2 border-black cursor-pointer hover:bg-yellow-300 transition-colors select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-black text-neo-yellow rounded border border-black">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-black text-sm uppercase tracking-tight">{title}</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-black bg-black text-white">
              {badge}
            </span>
          </div>
        </div>
        <button className="p-1 bg-white border border-black rounded shadow-neo-sm">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5 flex flex-col gap-3 text-xs">
          {steps.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {steps.map((step, idx) => (
                <div key={idx} className="p-3 bg-white border-2 border-black rounded-xl shadow-neo-sm flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-neo-green text-black border border-black font-black text-xs flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <strong className="text-black font-black uppercase text-[11px]">{step.title}</strong>
                  </div>
                  <p className="text-slate-700 font-bold leading-relaxed text-[11px]">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {note && (
            <div className="p-3 bg-white border-2 border-black rounded-xl text-[11px] font-bold text-slate-800 flex items-start gap-2 shadow-neo-sm">
              <span className="px-1.5 py-0.5 bg-neo-pink text-black border border-black rounded text-[9px] font-black uppercase whitespace-nowrap">
                PRO TIP
              </span>
              <span>{note}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
