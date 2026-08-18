import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Globe3D from '../components/Globe3D';
import GuideBox from '../components/GuideBox';
import { ShieldAlert, Zap, Clock, Target, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { formatDistance, formatScientific, getTierData } from '../utils/constants';

export default function GlobePage({ scanData, objects = [], selectedEvent, onSelectEvent }) {
  const events = scanData?.events || [];
  const activeEvent = selectedEvent || (events.length > 0 ? events[0] : null);

  const guideSteps = [
    {
      title: 'Navigate the 3D Sphere',
      description: 'Left-click and drag anywhere on the globe to freely rotate the orbital perspective. Use mouse wheel or pinch to zoom in/out.',
    },
    {
      title: 'Inspect Conjunction Beacons',
      description: 'Pulsing colored rings represent flagged orbital conjunctions (Red for Critical, Orange/Yellow for Moderate, Cyan/Green for Nominal).',
    },
    {
      title: 'Target Lock-On & Maneuver',
      description: 'Select any event from the sidebar below to center the orbital tracks and click "Plan Avoidance Burn" to compute an impulsive CW burn.',
    },
  ];

  return (
    <div className="flex flex-col gap-6 font-mono text-black">
      {/* How to Use Guide */}
      <GuideBox
        title="3D Orbital Radar & Telemetry Station · User Guide"
        badge="INTERACTIVE 3D"
        steps={guideSteps}
        note="Orbit paths are inclined per satellite TLE elements (e.g. Iridium 33 at ~86.4° polar orbit, Cosmos 2251 at ~74°)."
      />

      {/* Main 3D Globe Visualizer */}
      <div className="flex flex-col gap-4">
        <Globe3D 
          selectedEvent={activeEvent}
          activeEvents={events}
          objects={objects}
        />
      </div>

      {/* Conjunction Encounter Selector & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Active Conjunctions List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-3">
          <div className="flex items-center justify-between p-3.5 bg-neo-yellow border-3 border-black rounded-xl shadow-neo">
            <span className="font-black text-xs uppercase flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-black animate-pulse" />
              Active Orbital Conjunctions ({events.length})
            </span>
            <span className="text-[11px] font-bold text-slate-800">
              Click to Lock View
            </span>
          </div>

          <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
            {events.map((ev, idx) => {
              const isSelected = activeEvent && activeEvent.target_id === ev.target_id && activeEvent.chaser_id === ev.chaser_id;
              const tierData = getTierData(ev.risk_tier, ev.pc);
              return (
                <div
                  key={idx}
                  onClick={() => {
                    sound.playClick();
                    onSelectEvent(ev);
                  }}
                  className={`p-3.5 rounded-xl cursor-pointer border-3 border-black transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-neo-yellow shadow-neo translate-x-[-1px] translate-y-[-1px]'
                      : 'bg-white hover:bg-neo-cream shadow-neo-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${tierData.pillClass}`}>
                      {ev.risk_tier || 'CRITICAL'}
                    </span>
                    <div>
                      <strong className="text-xs font-black font-sans block text-black">
                        {ev.target_id} × {ev.chaser_id}
                      </strong>
                      <span className="text-[11px] text-slate-700 font-bold flex items-center gap-1">
                        <Clock className="w-3 h-3" /> TCA: {ev.tca_utc}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col">
                    <span className="text-[10px] text-slate-600 font-bold uppercase">Miss Distance</span>
                    <strong className="text-xs font-black text-black">
                      {formatDistance(ev.miss_distance_km)}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Quick Target Lock Drawer (5 cols) */}
        <div className="lg:col-span-5">
          {activeEvent ? (
            <div className="p-5 rounded-2xl bg-white border-4 border-black shadow-neo flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <span className="text-xs font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-4 h-4 text-neo-red" />
                  Target Telemetry Lock
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-black ${getTierData(activeEvent.risk_tier, activeEvent.pc).pillClass}`}>
                  {activeEvent.risk_tier || 'CRITICAL'}
                </span>
              </div>

              <div className="flex flex-col gap-2 p-3 bg-neo-cream border-2 border-black rounded-xl text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-slate-600">Target Object:</span>
                  <strong className="text-black">{activeEvent.target_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Chaser Object:</span>
                  <strong className="text-black">{activeEvent.chaser_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">TCA (UTC):</span>
                  <span className="text-black font-black">{activeEvent.tca_utc}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                <div className="p-3 rounded-xl bg-white border-2 border-black shadow-neo-sm flex flex-col">
                  <span className="text-[10px] text-slate-600 uppercase">Miss Distance</span>
                  <strong className="text-base text-black mt-0.5 font-black">
                    {formatDistance(activeEvent.miss_distance_km)}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-neo-yellow border-2 border-black shadow-neo-sm flex flex-col">
                  <span className="text-[10px] text-black uppercase font-black">Collision Pc</span>
                  <strong className="text-base text-black mt-0.5 font-black">
                    {formatScientific(activeEvent.pc)}
                  </strong>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/maneuver"
                  onClick={() => sound.playClick()}
                  className="w-full py-3 px-4 rounded-xl bg-neo-green text-black font-black text-xs hover:bg-emerald-400 border-3 border-black shadow-neo-sm flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>SIMULATE CW AVOIDANCE BURN</span>
                </Link>

                <Link
                  to="/bplane"
                  onClick={() => sound.playClick()}
                  className="w-full py-2.5 px-4 rounded-xl bg-neo-cyan text-black hover:bg-cyan-300 border-2 border-black text-xs font-black flex items-center justify-center gap-2"
                >
                  <span>INSPECT ENCOUNTER B-PLANE</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white border-3 border-black shadow-neo text-xs font-bold">
              Select a conjunction from the list to view encounter telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
