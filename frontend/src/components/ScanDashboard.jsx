import React, { useState } from 'react';
import { 
  Radar, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Filter, 
  Download, 
  Radio, 
  Zap,
  ArrowRight
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
    <div className="flex flex-col gap-5 font-mono text-space-200">
      {/* Top Banner / Initiate Scan Bar */}
      <div className="p-5 rounded-lg bg-space-900 border border-space-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded bg-space-850 border border-space-700 text-telemetry-emerald">
            <Radar className={`w-6 h-6 ${isScanning ? 'animate-spin' : ''}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-white tracking-wide font-sans">
                Conjunction Screening & Triage Center
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-space-800 text-telemetry-emerald border border-space-700">
                SGP4 + ANALYTIC Pc
              </span>
            </div>
            <p className="text-xs text-space-400 mt-0.5">
              Two-stage filter: Altitude band ±50km → Scipy TCA minimization → Foster/Alfano 2D Gaussian integral
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onTriggerScan}
            disabled={isScanning}
            className={`px-5 py-2.5 rounded font-mono text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 border ${
              isScanning
                ? 'bg-space-850 text-space-500 border-space-800 cursor-not-allowed'
                : 'bg-telemetry-emerald text-black hover:bg-emerald-400 border-emerald-400 shadow-sm active:scale-95'
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'SCREENING 24H WINDOW...' : 'RUN CONJUNCTION SCAN'}</span>
          </button>

          {events.length > 0 && (
            <button
              onClick={handleExportReport}
              className="px-3.5 py-2.5 rounded bg-space-850 text-space-300 hover:text-white border border-space-700 text-xs font-mono transition-all flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-telemetry-cyan" />
              <span>EXPORT JSON</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-3.5 rounded-lg bg-space-900/90 border border-space-800 flex flex-col">
          <span className="text-[10px] text-space-500 uppercase tracking-wider">Catalog Satellites</span>
          <span className="text-xl font-semibold text-white mt-1">
            {scanData?.object_count ?? 40}
          </span>
          <span className="text-[10px] text-space-400 mt-0.5">Active LEO Objects</span>
        </div>

        <div className="p-3.5 rounded-lg bg-space-900/90 border border-space-800 flex flex-col">
          <span className="text-[10px] text-space-500 uppercase tracking-wider">Candidate Pairs (Stage 1)</span>
          <span className="text-xl font-semibold text-telemetry-cyan mt-1">
            {scanData?.candidate_pairs ?? 12}
          </span>
          <span className="text-[10px] text-space-400 mt-0.5">±50km Altitude Overlap</span>
        </div>

        <div className="p-3.5 rounded-lg bg-space-900/90 border border-space-800 flex flex-col">
          <span className="text-[10px] text-space-500 uppercase tracking-wider">Conjunctions Surfaced</span>
          <span className="text-xl font-semibold text-white mt-1">
            {events.length}
          </span>
          <span className="text-[10px] text-space-400 mt-0.5">TCA in Next 24 Hours</span>
        </div>

        <div className={`p-3.5 rounded-lg border flex flex-col ${
          criticalCount > 0 
            ? 'bg-red-950/20 border-red-500/30' 
            : 'bg-space-900/90 border-space-800'
        }`}>
          <span className={`text-[10px] uppercase tracking-wider ${criticalCount > 0 ? 'text-red-400 font-semibold' : 'text-space-500'}`}>
            Critical Alerts
          </span>
          <span className={`text-xl font-semibold mt-1 ${criticalCount > 0 ? 'text-red-400' : 'text-telemetry-emerald'}`}>
            {criticalCount > 0 ? `${criticalCount} THREATS` : 'ALL CLEAR'}
          </span>
          <span className="text-[10px] text-space-500 mt-0.5">Pc &gt; 1.0 × 10⁻⁴ Threshold</span>
        </div>
      </div>

      {/* Main Conjunction Table & Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Filterable Event List (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-lg bg-space-900/90 border border-space-800 text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-space-400 text-[11px] uppercase mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Tier:
              </span>
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((tier) => (
                <button
                  key={tier}
                  onClick={() => {
                    sound.playClick();
                    setActiveFilter(tier);
                  }}
                  className={`px-2.5 py-1 rounded text-xs transition-all font-mono ${
                    activeFilter === tier
                      ? 'bg-space-800 text-white border border-space-600 font-medium'
                      : 'bg-transparent text-space-400 hover:text-space-200 border border-transparent'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Search satellite name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1 bg-space-950 border border-space-700 rounded text-xs text-white placeholder-space-500 focus:outline-none focus:border-space-500"
            />
          </div>

          {/* Events Cards List */}
          <div className="flex flex-col gap-2.5">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center rounded-lg bg-space-900/50 border border-dashed border-space-800 text-space-400 text-xs">
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
                    className={`p-3.5 rounded-lg cursor-pointer transition-all border font-mono ${
                      isSelected
                        ? 'bg-space-850 border-space-600 shadow-md ring-1 ring-telemetry-emerald/40'
                        : isCrit
                        ? 'bg-red-950/10 border-red-500/25 hover:border-red-500/40'
                        : 'bg-space-900/80 border-space-800 hover:border-space-700 hover:bg-space-850'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Satellite Pair */}
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded ${tierData.pillClass}`}>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white text-xs">
                              {ev.target_id}
                            </span>
                            <span className="text-space-500 text-xs">×</span>
                            <span className="font-semibold text-space-200 text-xs">
                              {ev.chaser_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-space-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-telemetry-cyan" />
                              TCA: <strong className="text-space-300">{ev.tca_utc}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Physics Metrics */}
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="text-right flex flex-col">
                          <span className="text-[10px] text-space-500 uppercase">Miss Distance</span>
                          <span className="font-semibold text-white text-xs">
                            {formatDistance(ev.miss_distance_km)}
                          </span>
                        </div>

                        {ev.relative_velocity_km_s && (
                          <div className="text-right flex flex-col hidden sm:flex">
                            <span className="text-[10px] text-space-500 uppercase">Rel Velocity</span>
                            <span className="font-semibold text-white text-xs">
                              {Number(ev.relative_velocity_km_s).toFixed(1)} km/s
                            </span>
                          </div>
                        )}

                        <div className="text-right flex flex-col">
                          <span className="text-[10px] text-space-500 uppercase">Analytic Pc</span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${tierData.badgeClass}`}>
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
            <div className="p-4 rounded-lg bg-space-900 border border-space-800 flex flex-col gap-3.5 sticky top-20">
              <div className="flex items-center justify-between pb-2.5 border-b border-space-800">
                <span className="text-xs font-semibold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-telemetry-emerald" />
                  Conjunction Inspector
                </span>
                <span className={`px-2 py-0.5 rounded text-[11px] ${getTierData(selectedEvent.risk_tier, selectedEvent.pc).badgeClass}`}>
                  {selectedEvent.risk_tier || 'CRITICAL'}
                </span>
              </div>

              {/* Pair Details */}
              <div className="flex flex-col gap-1.5 p-3 rounded bg-space-950/80 border border-space-800 text-xs">
                <div className="flex justify-between">
                  <span className="text-space-500">Target Object:</span>
                  <strong className="text-white">{selectedEvent.target_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-500">Chaser Object:</span>
                  <strong className="text-space-200">{selectedEvent.chaser_id}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-space-500">TCA (UTC):</span>
                  <span className="text-telemetry-cyan">{selectedEvent.tca_utc}</span>
                </div>
              </div>

              {/* Physics Values */}
              <div className="grid grid-cols-2 gap-2.5 text-xs font-mono">
                <div className="p-2.5 rounded bg-space-950/80 border border-space-800 flex flex-col">
                  <span className="text-[10px] text-space-500 uppercase">Miss Distance</span>
                  <strong className="text-sm text-white mt-0.5 font-semibold">
                    {formatDistance(selectedEvent.miss_distance_km)}
                  </strong>
                </div>
                <div className="p-2.5 rounded bg-space-950/80 border border-space-800 flex flex-col">
                  <span className="text-[10px] text-space-500 uppercase">Rel Velocity</span>
                  <strong className="text-sm text-white mt-0.5 font-semibold">
                    {selectedEvent.relative_velocity_km_s ? `${Number(selectedEvent.relative_velocity_km_s).toFixed(2)} km/s` : '14.12 km/s'}
                  </strong>
                </div>
                <div className="p-2.5 rounded bg-space-950/80 border border-space-800 flex flex-col col-span-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-space-400 uppercase">Analytic Pc (Foster/Alfano)</span>
                    <strong className="text-telemetry-emerald text-sm font-semibold">
                      {formatScientific(selectedEvent.pc)}
                    </strong>
                  </div>
                  {selectedEvent.ml_prescreen_score !== undefined && (
                    <div className="flex justify-between items-center text-[10px] text-space-500 mt-1 pt-1 border-t border-space-850">
                      <span>ML Surrogate Score:</span>
                      <span className="text-space-300">{formatScientific(selectedEvent.ml_prescreen_score)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenManeuver(selectedEvent);
                  }}
                  className="w-full py-2.5 px-3.5 rounded bg-telemetry-emerald text-black font-semibold text-xs hover:bg-emerald-400 transition-colors flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 fill-black" />
                  <span>SIMULATE CW AVOIDANCE BURN</span>
                </button>

                <button
                  onClick={() => {
                    sound.playClick();
                    onOpenBPlane(selectedEvent);
                  }}
                  className="w-full py-2 px-3.5 rounded bg-space-850 hover:bg-space-800 text-space-200 hover:text-white border border-space-700 text-xs transition-colors flex items-center justify-center gap-2"
                >
                  <span>VIEW ENCOUNTER B-PLANE</span>
                </button>
              </div>

              <div className="text-[10px] text-space-500 bg-space-950/40 p-2 rounded border border-space-850 leading-relaxed">
                Assumes isotropic uncertainty σ = 500m & HBR = 10m combined cross-section.
              </div>
            </div>
          ) : (
            <div className="p-6 text-center rounded-lg bg-space-900/50 border border-space-800 text-space-500 text-xs">
              Select any conjunction from the list to inspect encounter telemetry.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
