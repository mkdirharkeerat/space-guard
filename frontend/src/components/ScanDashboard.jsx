import React, { useState } from 'react';
import { 
  Radar, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Filter, 
  Download, 
  Radio, 
  Sparkles,
  Zap,
  ArrowRight,
  Flame
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
  const [activeFilter, setActiveFilter] = useState('ALL');
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
      <div className="p-6 rounded-2xl bg-white border-4 border-black shadow-neo-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-xl bg-neo-yellow border-3 border-black shadow-neo">
            <Radar className={`w-8 h-8 text-black ${isScanning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-black tracking-tight font-sans">
                Conjunction Screening Center
              </h1>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-mono font-black bg-neo-green text-black border-2 border-black shadow-neo-sm">
                SGP4 + ANALYTIC Pc
              </span>
            </div>
            <p className="text-xs text-slate-700 font-mono font-bold mt-1">
              Two-stage screening: Altitude filter ±50km → Scipy TCA minimization → Foster/Alfano 2D Gaussian integral
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className={`px-7 py-3.5 rounded-xl font-mono font-black text-xs uppercase tracking-wider transition-all flex items-center gap-2 border-3 border-black shadow-neo ${
              isScanning
                ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                : 'bg-neo-green text-black hover:bg-emerald-400 hover:shadow-neo-lg active:translate-x-1 active:translate-y-1'
            }`}
          >
            <Activity className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'SCREENING 24H WINDOW...' : '⚡ INITIATE LIVE SCAN'}</span>
          </button>

          {events.length > 0 && (
            <button
              onClick={handleExportReport}
              className="px-4 py-3.5 rounded-xl bg-neo-cyan text-black hover:bg-cyan-300 border-3 border-black text-xs font-mono font-black transition-all flex items-center gap-1.5 shadow-neo hover:shadow-neo-lg active:translate-x-1 active:translate-y-1"
            >
              <Download className="w-4 h-4" />
              <span>EXPORT REPORT</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-white border-3 border-black shadow-neo flex flex-col">
          <span className="text-[11px] text-slate-600 font-bold uppercase tracking-wider">Catalog Satellites</span>
          <span className="text-3xl font-black text-black mt-1">
            {scanData?.object_count ?? 40}
          </span>
          <span className="text-[10px] text-slate-800 font-bold mt-0.5">Active LEO Satellites</span>
        </div>

        <div className="p-4 rounded-xl bg-neo-yellow border-3 border-black shadow-neo flex flex-col">
          <span className="text-[11px] text-black font-bold uppercase tracking-wider">Candidate Pairs (Stage 1)</span>
          <span className="text-3xl font-black text-black mt-1">
            {scanData?.candidate_pairs ?? 12}
          </span>
          <span className="text-[10px] text-black font-bold mt-0.5">±50km Altitude Overlap</span>
        </div>

        <div className="p-4 rounded-xl bg-neo-cyan border-3 border-black shadow-neo flex flex-col">
          <span className="text-[11px] text-black font-bold uppercase tracking-wider">Conjunctions Surfaced</span>
          <span className="text-3xl font-black text-black mt-1">
            {events.length}
          </span>
          <span className="text-[10px] text-black font-bold mt-0.5">TCA in Next 24 Hours</span>
        </div>

        <div className={`p-4 rounded-xl border-3 border-black shadow-neo flex flex-col ${
          criticalCount > 0 
            ? 'bg-neo-red text-white' 
            : 'bg-neo-green text-black'
        }`}>
          <span className="text-[11px] font-black uppercase tracking-wider">
            Critical Alerts
          </span>
          <span className="text-3xl font-black mt-1">
            {criticalCount > 0 ? `${criticalCount} THREATS` : 'ALL CLEAR'}
          </span>
          <span className="text-[10px] font-bold mt-0.5">Pc &gt; 1.0 × 10⁻⁴ Threshold</span>
        </div>
      </div>

      {/* Main Conjunction Table & Event Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable Event List (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-white border-3 border-black shadow-neo text-xs font-mono">
            <div className="flex items-center gap-2 overflow-x-auto">
              <span className="text-black font-black text-xs uppercase mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'ALL', color: 'bg-white' },
                { id: 'CRITICAL', color: 'bg-neo-red text-white' },
                { id: 'HIGH', color: 'bg-neo-orange text-white' },
                { id: 'MODERATE', color: 'bg-neo-yellow text-black' },
                { id: 'LOW', color: 'bg-neo-green text-black' }
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => {
                    sound.playClick();
                    setActiveFilter(tier.id);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase transition-all border-2 border-black ${
                    activeFilter === tier.id
                      ? `${tier.color} shadow-neo-sm translate-x-[-1px] translate-y-[-1px]`
                      : 'bg-white text-black hover:bg-slate-100'
                  }`}
                >
                  {tier.id}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search satellite name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3.5 py-1.5 bg-neo-cream border-2 border-black rounded-lg text-xs font-bold text-black placeholder-slate-500 focus:outline-none focus:bg-white"
            />
          </div>

          {/* Events Cards List */}
          <div className="flex flex-col gap-3.5">
            {filteredEvents.length === 0 ? (
              <div className="p-12 text-center rounded-2xl bg-white border-3 border-dashed border-black text-black font-mono font-bold text-sm shadow-neo">
                No conjunction events match the current filter.
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
                    className={`p-4 rounded-xl cursor-pointer transition-all border-3 border-black font-mono ${
                      isSelected
                        ? 'bg-neo-yellow shadow-neo-lg translate-x-[-2px] translate-y-[-2px]'
                        : isCrit
                        ? 'bg-[#FFF5F5] hover:bg-[#FFE5E5] shadow-neo'
                        : 'bg-white hover:bg-neo-cream shadow-neo'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Satellite Pair */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2.5 rounded-lg ${tierData.pillClass}`}>
                          <ShieldAlert className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-black text-sm font-sans">
                              {ev.target_id}
                            </span>
                            <span className="text-black font-black text-xs">×</span>
                            <span className="font-black text-black text-sm font-sans">
                              {ev.chaser_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-700 font-bold mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5" />
                              TCA: <strong>{ev.tca_utc}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Physics Metrics */}
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="text-right flex flex-col">
                          <span className="text-[10px] text-slate-600 font-bold uppercase">Miss Distance</span>
                          <span className="font-black text-black text-sm">
                            {formatDistance(ev.miss_distance_km)}
                          </span>
                        </div>

                        {ev.relative_velocity_km_s && (
                          <div className="text-right flex flex-col hidden sm:flex">
                            <span className="text-[10px] text-slate-600 font-bold uppercase">Rel Velocity</span>
                            <span className="font-black text-black text-sm">
                              {Number(ev.relative_velocity_km_s).toFixed(1)} km/s
                            </span>
                          </div>
                        )}

                        <div className="text-right flex flex-col">
                          <span className="text-[10px] text-slate-600 font-bold uppercase">Analytic Pc</span>
                          <span className={`px-2.5 py-0.5 rounded text-xs font-black ${tierData.pillClass}`}>
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

        {/* Right Column: Conjunction Inspector (4 cols) */}
        <div className="lg:col-span-4">
          {selectedEvent ? (
            <div className="p-5 rounded-2xl bg-white border-4 border-black shadow-neo-lg flex flex-col gap-4 font-mono sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                <span className="text-xs font-black text-black uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-4 h-4" />
                  Conjunction Inspector
                </span>
                <span className={`px-2.5 py-0.5 rounded text-xs font-black ${getTierData(selectedEvent.risk_tier, selectedEvent.pc).pillClass}`}>
                  {selectedEvent.risk_tier || 'CRITICAL'}
                </span>
              </div>

              {/* Pair Details */}
              <div className="flex flex-col gap-2 p-3.5 rounded-xl bg-neo-cream border-2 border-black text-xs font-bold">
                <div className="flex justify-between">
                  <span className="text-slate-600">Target Object:</span>
                  <strong className="text-black">{selectedEvent.target_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Chaser Object:</span>
                  <strong className="text-black">{selectedEvent.chaser_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">TCA (UTC):</span>
                  <span className="text-black font-black">{selectedEvent.tca_utc}</span>
                </div>
              </div>

              {/* Physics Values */}
              <div className="grid grid-cols-2 gap-3 text-xs font-mono font-bold">
                <div className="p-3 rounded-xl bg-white border-2 border-black shadow-neo-sm flex flex-col">
                  <span className="text-[10px] text-slate-600 uppercase">Miss Distance</span>
                  <strong className="text-base text-black mt-1 font-black">
                    {formatDistance(selectedEvent.miss_distance_km)}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-white border-2 border-black shadow-neo-sm flex flex-col">
                  <span className="text-[10px] text-slate-600 uppercase">Rel Velocity</span>
                  <strong className="text-base text-black mt-1 font-black">
                    {selectedEvent.relative_velocity_km_s ? `${Number(selectedEvent.relative_velocity_km_s).toFixed(2)} km/s` : '14.12 km/s'}
                  </strong>
                </div>
                <div className="p-3 rounded-xl bg-neo-yellow border-2 border-black shadow-neo-sm flex flex-col col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-black uppercase font-black">Analytic Pc (Foster/Alfano)</span>
                    <strong className="text-black text-base font-black">
                      {formatScientific(selectedEvent.pc)}
                    </strong>
                  </div>
                  {selectedEvent.ml_prescreen_score !== undefined && (
                    <div className="flex justify-between items-center text-[10px] text-slate-800 mt-1 pt-1 border-t border-black">
                      <span>ML Surrogate Score:</span>
                      <span className="font-black">{formatScientific(selectedEvent.ml_prescreen_score)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenManeuver(selectedEvent);
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-neo-green text-black font-black text-xs hover:bg-emerald-400 border-3 border-black shadow-neo hover:shadow-neo-lg active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>SIMULATE CW AVOIDANCE BURN</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenBPlane(selectedEvent);
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-neo-cyan text-black hover:bg-cyan-300 border-3 border-black text-xs font-black transition-all flex items-center justify-center gap-2 shadow-neo-sm"
                >
                  <span>VIEW ENCOUNTER B-PLANE</span>
                </button>
              </div>

              <div className="text-[10px] text-slate-600 bg-neo-cream p-2.5 rounded-lg border border-black font-bold">
                Assumes isotropic uncertainty σ = 500m & HBR = 10m combined cross-section.
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-2xl bg-white border-3 border-black shadow-neo text-black font-mono font-bold text-xs">
              Select any conjunction event from the list to inspect encounter telemetry and trigger maneuver simulation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
