import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Globe3D from '../components/Globe3D';
import GuideBox from '../components/GuideBox';
import { Target, Zap, Clock, Flame, ShieldAlert, ArrowRight } from 'lucide-react';
import { sound } from '../utils/audio';
import { formatDistance, formatScientific, getTierData } from '../utils/constants';

export default function GlobePage({ scanData, objects = [], selectedEvent, onSelectEvent }) {
  const events = scanData?.events || [];
  const activeEvent = selectedEvent || (events.length > 0 ? events[0] : null);
  const [activeGlobeMode, setActiveGlobeMode] = useState('live');

  const guideSteps = [
    {
      title: 'Interactive 3D Radar Modes',
      description: 'Switch between Live Catalog Radar, 1. Simulate 2009 Collision (impact shockwave + debris cloud), and 2. Simulate Escape Maneuver (+4.83 km safe passage).',
    },
    {
      title: 'Timeline Scrubbing & Speed',
      description: 'In simulation modes, use the bottom scrub bar or Play/Pause buttons to advance time from T-24h to TCA encounter at 1x, 5x, or 15x speeds.',
    },
    {
      title: 'Physical 3D Satellite Models',
      description: 'Target and Chaser satellites orbit in 3D with metallic solar panel wings, illustrating orbital plane intersections and impulsive maneuvers.',
    },
  ];

  return (
    <div className="flex flex-col gap-5 font-mono text-space-200">
      {/* User Guide */}
      <GuideBox
        title="3D Orbital Radar & Simulation Station · Operational Guide"
        badge="VISUAL TELEMETRY & SIMULATION"
        steps={guideSteps}
        note="Use the top buttons on the 3D globe to switch between Live Telemetry, Historical Collision Reenactment, and Escape Maneuver Planning."
      />

      {/* Main 3D Globe with Interactive Simulations */}
      <Globe3D 
        selectedEvent={activeEvent}
        activeEvents={events}
        objects={objects}
        initialMode={activeGlobeMode}
        onModeChange={setActiveGlobeMode}
      />

      {/* Mode Information & Quick Triggers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-space-900 border border-red-500/30 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-red-400 font-semibold text-xs">
              <Flame className="w-4 h-4" />
              <span>1. 2009 Iridium 33 / Cosmos 2251 Collision Replay</span>
            </div>
            <p className="text-xs text-space-400 leading-relaxed">
              Reenacts the 10 Feb 2009 hypervelocity impact over Siberia (14.1 km/s relative speed), demonstrating the catastrophic destruction of both spacecraft and the resulting expanding debris cloud.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              setActiveGlobeMode('collision_2009');
            }}
            className="px-3.5 py-2 rounded bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 self-start"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Load 2009 Collision on Globe</span>
          </button>
        </div>

        <div className="p-4 rounded-lg bg-space-900 border border-telemetry-cyan/30 flex flex-col justify-between gap-3">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 text-telemetry-cyan font-semibold text-xs">
              <Zap className="w-4 h-4" />
              <span>2. Space-Guard CW Avoidance Maneuver Simulation</span>
            </div>
            <p className="text-xs text-space-400 leading-relaxed">
              Simulates an impulsive ΔV = 0.10 m/s thruster burn on Iridium 33 executed 24 hours prior, steering it along a green avoidance trajectory to achieve +4.83 km safe clearance.
            </p>
          </div>
          <button
            onClick={() => {
              sound.playSuccess();
              setActiveGlobeMode('avoidance_2009');
            }}
            className="px-3.5 py-2 rounded bg-telemetry-cyan/20 hover:bg-telemetry-cyan/30 text-telemetry-cyan border border-telemetry-cyan/40 text-xs font-semibold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 self-start"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Load Avoidance Maneuver on Globe</span>
          </button>
        </div>
      </div>

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
                    setActiveGlobeMode('live');
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
