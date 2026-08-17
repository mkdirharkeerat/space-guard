import React, { useState } from 'react';
import { 
  Radar, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Clock, 
  Navigation, 
  Activity, 
  ArrowUpRight, 
  Filter, 
  Download, 
  Radio, 
  ExternalLink,
  Sparkles,
  Zap
} from 'lucide-react';
import { sound } from '../utils/audio';
import { RISK_TIERS, formatScientific, formatDistance, formatVelocity, getTierData } from '../utils/constants';

export default function ScanDashboard({ 
  scanData, 
  onTriggerScan, 
  isScanning, 
  selectedEvent, 
  onSelectEvent,
  onOpenManeuver,
  onOpenBPlane
}) {
  const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL' | 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW'
  const [searchTerm, setSearchTerm] = useState('');

  const events = scanData?.events || [];

  const filteredEvents = events.filter(ev => {
    const tier = (ev.risk_tier || '').toUpperCase();
    const matchesFilter = 
      activeFilter === 'ALL' ? true :
      activeFilter === 'CRITICAL' ? tier.includes('CRIT') :
      activeFilter === 'HIGH' ? tier.includes('HIGH') :
      activeFilter === 'MODERATE' ? tier.includes('MOD') :
      tier.includes('LOW');

    const matchesSearch = 
      ev.target_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.chaser_id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const criticalCount = events.filter(e => (e.risk_tier || '').toLowerCase().includes('crit') || e.pc > 1e-4).length;
  const highCount = events.filter(e => (e.risk_tier || '').toLowerCase().includes('high')).length;

  const handleExportReport = () => {
    sound.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `space-guard-conjunction-report-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Banner / Initiate Scan Bar */}
      <div className="p-6 rounded-xl glass-panel border border-hud-border flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 rounded-xl bg-hud-green/15 text-hud-green border border-hud-green/40 shadow-[0_0_20px_rgba(0,255,136,0.25)]">
            <Radar className={`w-8 h-8 ${isScanning ? 'animate-spin' : 'animate-pulse'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide font-sans">
                Orbital Conjunction Screening Center
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-hud-green/20 text-hud-green border border-hud-green/40">
                SGP4 + ANALYTIC Pc
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Two-stage screening (Altitude filter ±50km → Scipy TCA minimization → Foster/Alfano 2D Gaussian integral)
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className={`px-6 py-3 rounded-lg font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg ${
              isScanning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-hud-green text-black hover:bg-hud-emerald shadow-[0_0_25px_rgba(0,255,136,0.4)] active:scale-95'
            }`}
          >
            <Activity className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'SCREENING 24H WINDOW...' : 'INITIATE LIVE SCAN'}</span>
          </button>

          {events.length > 0 && (
            <button
              onClick={handleExportReport}
              className="px-4 py-3 rounded-lg bg-deep text-slate-200 hover:text-white border border-hud-border text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <Download className="w-4 h-4 text-hud-cyan" />
              <span>EXPORT REPORT</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-lg bg-deep/80 border border-hud-borderFaint flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Tracked Catalog Objects</span>
          <span className="text-2xl font-bold text-white mt-1">
            {scanData?.object_count ?? 40}
          </span>
          <span className="text-[10px] text-hud-green mt-0.5">Active LEO Satellites</span>
        </div>

        <div className="p-4 rounded-lg bg-deep/80 border border-hud-borderFaint flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Candidate Pairs (Stage 1)</span>
          <span className="text-2xl font-bold text-hud-cyan mt-1">
            {scanData?.candidate_pairs ?? 12}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">±50km Altitude Overlap</span>
        </div>

        <div className="p-4 rounded-lg bg-deep/80 border border-hud-borderFaint flex flex-col">
          <span className="text-[11px] text-slate-400 uppercase tracking-wider">Conjunctions Surfaced</span>
          <span className="text-2xl font-bold text-slate-100 mt-1">
            {events.length}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">TCA in Next 24h</span>
        </div>

        <div className={`p-4 rounded-lg flex flex-col ${
          criticalCount > 0 
            ? 'bg-red-950/40 border border-red-500/50 shadow-[0_0_15px_rgba(255,59,59,0.2)]' 
            : 'bg-deep/80 border border-hud-borderFaint'
        }`}>
          <span className={`text-[11px] uppercase tracking-wider ${criticalCount > 0 ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
            Critical Alert Status
          </span>
          <span className={`text-2xl font-bold mt-1 ${criticalCount > 0 ? 'text-red-400 animate-pulse' : 'text-hud-green'}`}>
            {criticalCount > 0 ? `${criticalCount} THREATS` : 'ALL NOMINAL'}
          </span>
          <span className="text-[10px] text-slate-400 mt-0.5">Pc &gt; 1.0 × 10⁻⁴</span>
        </div>
      </div>

      {/* Main Conjunction Table & Event Inspector Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable Event List (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-deep/90 border border-hud-borderFaint text-xs font-mono">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-slate-400 text-[11px] uppercase mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Tier:
              </span>
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    sound.playClick();
                    setActiveFilter(tier);
                  }}
                  className={`px-3 py-1 rounded text-xs transition-all font-semibold ${
                    activeFilter === tier
                      ? 'bg-hud-green text-black shadow-[0_0_10px_rgba(0,255,136,0.3)]'
                      : 'bg-void text-slate-300 hover:text-white border border-slate-800'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Filter by satellite name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 bg-void border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-hud-green"
            />
          </div>

          {/* Events Cards / Table */}
          <div className="flex flex-col gap-3">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-deep/40 border border-dashed border-hud-borderFaint text-slate-400 font-mono text-xs">
                No conjunction events match the selected criteria.
              </div>
            ) : (
              filteredEvents.map((ev, idx) => {
                const tierData = getTierData(ev.risk_tier, ev.pc);
                const isSelected = selectedEvent && selectedEvent.target_id === ev.target_id && selectedEvent.chaser_id === ev.chaser_id;
                const isCrit = (ev.risk_tier || '').toLowerCase().includes('crit') || ev.pc > 1e-4;

                return (
                  <div
                    key={`${ev.target_id}-${ev.chaser_id}-${idx}`}
                    onClick={() => {
                      sound.playClick();
                      onSelectEvent(ev);
                    }}
                    className={`p-4 rounded-xl cursor-pointer transition-all border font-mono ${
                      isSelected
                        ? 'bg-hud-green/10 border-hud-green shadow-[0_0_18px_rgba(0,255,136,0.2)]'
                        : isCrit
                        ? 'bg-red-950/20 border-red-500/30 hover:border-red-500/60'
                        : 'bg-deep/70 border-hud-borderFaint hover:border-hud-green/40 hover:bg-deep/90'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Satellite Pair Names */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${tierData.bgClass} border`}>
                          <ShieldAlert className="w-5 h-5" style={{ color: tierData.color }} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {ev.target_id}
                            </span>
                            <span className="text-slate-500 text-xs font-semibold">×</span>
                            <span className="font-bold text-slate-200 text-sm">
                              {ev.chaser_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-hud-cyan" />
                              TCA: <strong className="text-slate-300">{ev.tca_utc}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Metrics Badges */}
                      <div className="flex flex-wrap items-center gap-3">
                        {/* Miss Distance */}
                        <div className="text-right flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase">Miss Distance</span>
                          <span className="font-bold text-slate-200 text-sm">
                            {formatDistance(ev.miss_distance_km)}
                          </span>
                        </div>

                        {/* Relative Velocity */}
                        {ev.relative_velocity_km_s && (
                          <div className="text-right flex flex-col hidden sm:flex">
                            <span className="text-[10px] text-slate-400 uppercase">Rel Velocity</span>
                            <span className="font-bold text-slate-200 text-sm">
                              {Number(ev.relative_velocity_km_s).toFixed(1)} km/s
                            </span>
                          </div>
                        )}

                        {/* Pc Badge */}
                        <div className="text-right flex flex-col">
                          <span className="text-[10px] text-slate-400 uppercase">Analytic Pc</span>
                          <span className={`px-2.5 py-0.5 rounded text-xs font-bold ${tierData.badgeClass}`}>
                            {formatScientific(ev.pc)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Selected Event Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4">
          {selectedEvent ? (
            <div className="p-5 rounded-xl glass-panel border border-hud-border flex flex-col gap-4 font-mono sticky top-20">
              <div className="flex items-center justify-between pb-3 border-b border-hud-borderFaint">
                <span className="text-xs font-bold text-hud-green uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4" />
                  Conjunction Inspector
                </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getTierData(selectedEvent.risk_tier, selectedEvent.pc).badgeClass}`}>
                  {selectedEvent.risk_tier || 'CRITICAL'}
                </span>
              </div>

              {/* Pair Details */}
              <div className="flex flex-col gap-1.5 p-3 rounded-lg bg-void/80 border border-slate-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Target Object:</span>
                  <strong className="text-white">{selectedEvent.target_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Chaser Object:</span>
                  <strong className="text-slate-200">{selectedEvent.chaser_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">TCA (UTC):</span>
                  <span className="text-hud-cyan">{selectedEvent.tca_utc}</span>
                </div>
              </div>

              {/* Physics Values */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-void/80 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase">Miss Distance</span>
                  <strong className="text-sm text-slate-100 mt-1">
                    {formatDistance(selectedEvent.miss_distance_km)}
                  </strong>
                </div>
                <div className="p-3 rounded bg-void/80 border border-slate-800 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase">Rel Velocity</span>
                  <strong className="text-sm text-slate-100 mt-1">
                    {selectedEvent.relative_velocity_km_s ? `${Number(selectedEvent.relative_velocity_km_s).toFixed(2)} km/s` : '14.1 km/s'}
                  </strong>
                </div>
                <div className="p-3 rounded bg-void/80 border border-slate-800 flex flex-col col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-400 uppercase">Analytic Pc (Foster/Alfano)</span>
                    <strong className="text-hud-green text-sm">
                      {formatScientific(selectedEvent.pc)}
                    </strong>
                  </div>
                  {selectedEvent.ml_prescreen_score !== undefined && (
                    <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1 pt-1 border-t border-slate-800/80">
                      <span>ML Surrogate Score:</span>
                      <span className="text-hud-cyan">{formatScientific(selectedEvent.ml_prescreen_score)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenManeuver(selectedEvent);
                  }}
                  className="w-full py-2.5 px-4 rounded-lg bg-hud-green text-black font-bold text-xs hover:bg-hud-emerald transition-all shadow-[0_0_15px_rgba(0,255,136,0.3)] flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>SIMULATE CW AVOIDANCE BURN</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenBPlane(selectedEvent);
                  }}
                  className="w-full py-2 px-4 rounded-lg bg-deep border border-hud-border text-slate-300 hover:text-white text-xs transition-all flex items-center justify-center gap-2"
                >
                  <span>VIEW ENCOUNTER B-PLANE</span>
                </button>
              </div>

              {/* Engineering Assumptions Footer */}
              <div className="text-[10px] text-slate-500 bg-void/40 p-2.5 rounded border border-slate-900 leading-relaxed">
                Assumes isotropic TLE positional uncertainty σ = 500m & HBR = 10m combined hard-body cross-section.
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl bg-deep/40 border border-hud-borderFaint text-slate-400 font-mono text-xs">
              Select any conjunction event from the list to inspect encounter telemetry and trigger maneuver simulation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
