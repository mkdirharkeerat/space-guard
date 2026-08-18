import React from 'react';
import { Link } from 'react-router-dom';
import Globe3D from '../components/Globe3D';
import GuideBox from '../components/GuideBox';
import { Target, Zap, Clock, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { formatDistance, formatScientific, getTierData } from '../utils/constants';

export default function GlobePage({ scanData, objects = [], selectedEvent, onSelectEvent }) {
  const events = scanData?.events || [];
  const activeEvent = selectedEvent || (events.length > 0 ? events[0] : null);

  const guideSteps = [
    {
      title: 'Navigate 3D Orbit Viewport',
      description: 'Left-click and drag to rotate the orbital plane. Use mouse wheel or pinch gesture to zoom in/out.',
    },
    {
      title: 'Inspect Conjunction Nodes',
      description: 'Pulsing colored beacons mark predicted encounter points (Red for Critical, Amber for Moderate, Cyan/Green for Nominal).',
    },
    {
      title: 'Target Lock-On & Maneuver',
      description: 'Select an event from the panel below to isolate orbital tracks and launch the Clohessy-Wiltshire maneuver simulator.',
    },
  ];

  return (
    <div className="flex flex-col gap-5 font-mono text-space-200">
      {/* User Guide */}
      <GuideBox
        title="3D Orbital Radar & Telemetry Station · Operational Guide"
        badge="VISUAL TELEMETRY"
        steps={guideSteps}
        note="Orbit paths are inclined per satellite TLE elements (e.g. Iridium 33 at ~86.4° polar orbit, Cosmos 2251 at ~74°)."
      />

      {/* Main 3D Globe Visualizer */}
      <Globe3D 
        selectedEvent={activeEvent}
        activeEvents={events}
        objects={objects}
      />

      {/* Conjunction Encounter Selector & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Active Conjunctions List (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-2.5">
          <div className="flex items-center justify-between p-3 bg-space-900 border border-space-800 rounded">
            <span className="font-semibold text-xs text-white uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-telemetry-emerald animate-pulse" />
              Active Orbital Conjunctions ({events.length})
            </span>
            <span className="text-[11px] text-space-500">
              Click row to isolate tracks
            </span>
          </div>

          <div className="flex flex-col gap-2 max-h-[340px] overflow-y-auto pr-1">
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
                  className={`p-3 rounded cursor-pointer border transition-all flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-space-850 border-space-600 ring-1 ring-telemetry-emerald/30 shadow-md'
                      : 'bg-space-900/80 border-space-800 hover:border-space-700 hover:bg-space-850'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${tierData.badgeClass}`}>
                      {ev.risk_tier || 'CRITICAL'}
                    </span>
                    <div>
                      <strong className="text-xs font-semibold text-white block">
                        {ev.target_id} × {ev.chaser_id}
                      </strong>
                      <span className="text-[11px] text-space-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3 text-telemetry-cyan" /> TCA: {ev.tca_utc}
                      </span>
                    </div>
                  </div>

                  <div className="text-right flex flex-col">
                    <span className="text-[10px] text-space-500 uppercase">Miss Distance</span>
                    <strong className="text-xs font-semibold text-white">
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
            <div className="p-4 rounded-lg bg-space-900 border border-space-800 flex flex-col gap-3.5">
              <div className="flex items-center justify-between pb-2.5 border-b border-space-800">
                <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-telemetry-cyan" />
                  Target Telemetry Lock
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] ${getTierData(activeEvent.risk_tier, activeEvent.pc).badgeClass}`}>
                  {activeEvent.risk_tier || 'CRITICAL'}
                </span>
              </div>

              <div className="flex flex-col gap-1.5 p-3 bg-space-950/80 border border-space-800 rounded text-xs">
                <div className="flex justify-between">
                  <span className="text-space-500">Target Object:</span>
                  <strong className="text-white">{activeEvent.target_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-500">Chaser Object:</span>
                  <strong className="text-space-200">{activeEvent.chaser_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-500">TCA (UTC):</span>
                  <span className="text-telemetry-cyan">{activeEvent.tca_utc}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded bg-space-950/80 border border-space-800 flex flex-col">
                  <span className="text-[10px] text-space-500 uppercase">Miss Distance</span>
                  <strong className="text-sm text-white mt-0.5 font-semibold">
                    {formatDistance(activeEvent.miss_distance_km)}
                  </strong>
                </div>
                <div className="p-2.5 rounded bg-space-950/80 border border-space-800 flex flex-col">
                  <span className="text-[10px] text-space-500 uppercase">Collision Pc</span>
                  <strong className="text-sm text-telemetry-emerald mt-0.5 font-semibold">
                    {formatScientific(activeEvent.pc)}
                  </strong>
                </div>
              </div>

              <div className="flex flex-col gap-2 pt-1">
                <Link
                  to="/maneuver"
                  onClick={() => sound.playClick()}
                  className="w-full py-2.5 px-3.5 rounded bg-telemetry-emerald text-black font-semibold text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>SIMULATE CW AVOIDANCE BURN</span>
                </Link>

                <Link
                  to="/bplane"
                  onClick={() => sound.playClick()}
                  className="w-full py-2 px-3.5 rounded bg-space-850 hover:bg-space-800 text-space-300 hover:text-white border border-space-700 text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>INSPECT ENCOUNTER B-PLANE</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center rounded-lg bg-space-900/50 border border-space-800 text-space-500 text-xs">
              Select a conjunction from the list to view encounter telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
