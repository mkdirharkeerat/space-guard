import React, { useState } from 'react';
import { Target, Compass, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import { formatDistance, formatScientific } from '../utils/constants';

export default function BPlaneVisualizer({ selectedEvent }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const targetName = selectedEvent?.target_id || 'IRIDIUM 33';
  const chaserName = selectedEvent?.chaser_id || 'COSMOS 2251';
  const missKm = selectedEvent?.miss_distance_km ?? 0.003;
  const pc = selectedEvent?.pc ?? 0.0002;
  const isCritical = pc > 1e-4;

  // SVG coordinates setup (viewBox: -300 to +300)
  const center = 0;
  const scale = 80 * zoomLevel; // pixels per km
  // Compute encounter coords
  const chaserX = (missKm * scale * 0.7);
  const chaserY = -(missKm * scale * 0.7);

  const sigma1_radius = 0.5 * scale; // 500m sigma = 0.5 km
  const sigma2_radius = 1.0 * scale; // 1000m
  const sigma3_radius = 1.5 * scale; // 1500m
  const hbr_radius = Math.max(3, 0.010 * scale); // 10m HBR

  return (
    <div className="flex flex-col gap-5 p-6 rounded-xl glass-panel border border-hud-border">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-hud-borderFaint">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-hud-cyan/15 text-hud-cyan border border-hud-cyan/30 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-wide font-sans flex items-center gap-2">
              B-Plane (Encounter Plane) Geometry Visualizer
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              2D Isotropic Gaussian Uncertainty & Hard-Body Collision Cross-Section
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            className="px-2.5 py-1 rounded bg-deep border border-slate-700 text-xs font-mono hover:text-white"
          >
            -
          </button>
          <span className="text-xs font-mono text-slate-300 w-12 text-center">{zoomLevel.toFixed(2)}x</span>
          <button
            onClick={() => setZoomLevel(Math.min(3.0, zoomLevel + 0.25))}
            className="px-2.5 py-1 rounded bg-deep border border-slate-700 text-xs font-mono hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[380px] bg-void/95 rounded-lg border border-hud-borderFaint overflow-hidden flex items-center justify-center tactical-grid">
        <svg
          viewBox="-220 -180 440 360"
          className="w-full h-full cursor-crosshair select-none"
        >
          <defs>
            {/* Radial gradient for Gaussian density */}
            <radialGradient id="gaussianGlow" cx="0%" cy="0%" r="50%" fx="0%" fy="0%">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="0.3" />
              <stop offset="50%" stopColor="#00e5ff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0" />
            </radialGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Coordinate Axes */}
          <line x1="-200" y1="0" x2="200" y2="0" stroke="rgba(0, 255, 136, 0.2)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="-160" x2="0" y2="160" stroke="rgba(0, 255, 136, 0.2)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Gaussian Probability Ellipses (1-sigma, 2-sigma, 3-sigma) */}
          <circle cx="0" cy="0" r={sigma3_radius} fill="none" stroke="rgba(0, 229, 255, 0.2)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r={sigma2_radius} fill="none" stroke="rgba(0, 229, 255, 0.35)" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r={sigma1_radius} fill="url(#gaussianGlow)" stroke="rgba(0, 255, 136, 0.6)" strokeWidth="1.5" />

          {/* Labels for Covariance Rings */}
          <text x={sigma1_radius + 4} y="-6" fill="#00ff88" fontSize="9" fontFamily="monospace">1σ (500m)</text>
          <text x={sigma2_radius + 4} y="-6" fill="#00e5ff" fontSize="9" fontFamily="monospace">2σ (1.0km)</text>
          <text x={sigma3_radius + 4} y="-6" fill="#64748b" fontSize="9" fontFamily="monospace">3σ (1.5km)</text>

          {/* Target Satellite at Center (0, 0) */}
          <circle cx="0" cy="0" r={hbr_radius} fill="#00ff88" filter="url(#glow)" />
          <circle cx="0" cy="0" r={Math.max(6, hbr_radius * 1.5)} fill="none" stroke="#00ff88" strokeWidth="1" opacity="0.6" />
          <text x="8" y="14" fill="#c8ffd8" fontSize="10" fontWeight="bold" fontFamily="monospace">
            {targetName} (Target)
          </text>

          {/* Miss Vector line */}
          <line
            x1="0"
            y1="0"
            x2={chaserX}
            y2={chaserY}
            stroke={isCritical ? '#ff3b3b' : '#ffb830'}
            strokeWidth="1.8"
            strokeDasharray="2 2"
          />

          {/* Chaser Satellite Piercing Point */}
          <g transform={`translate(${chaserX}, ${chaserY})`}>
            <circle cx="0" cy="0" r="5" fill={isCritical ? '#ff3b3b' : '#ffb830'} filter="url(#glow)" />
            <circle cx="0" cy="0" r="10" fill="none" stroke={isCritical ? '#ff3b3b' : '#ffb830'} strokeWidth="1" opacity="0.8" className="animate-ping origin-center" />
            <text x="10" y="-4" fill={isCritical ? '#ff6b6b' : '#f0c330'} fontSize="10" fontWeight="bold" fontFamily="monospace">
              {chaserName} (Chaser)
            </text>
            <text x="10" y="8" fill="#94a3b8" fontSize="9" fontFamily="monospace">
              Δr = {formatDistance(missKm)}
            </text>
          </g>
        </svg>

        {/* HUD Inset Info Box */}
        <div className="absolute bottom-3 left-3 p-2.5 rounded bg-deep/90 border border-hud-borderFaint text-[11px] font-mono text-slate-300 flex flex-col gap-1 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-hud-green font-bold">
            <Compass className="w-3.5 h-3.5" />
            <span>B-Plane Coordinates (ξ, ζ)</span>
          </div>
          <span>Target at Origin (0,0)</span>
          <span>Collision Sphere HBR = 10 m</span>
          <span className={isCritical ? 'text-red-400 font-bold' : 'text-hud-amber'}>
            Collision Pc = {formatScientific(pc)}
          </span>
        </div>
      </div>

      {/* Math Explanation Footer */}
      <div className="text-xs text-slate-400 font-mono bg-void/60 p-3 rounded-lg border border-slate-800 leading-relaxed">
        <strong className="text-slate-200">Foster/Alfano Formulation:</strong> In the encounter frame perpendicular to relative velocity, the 3D collision integral reduces to a 2D Gaussian density over the hard-body circle of radius <code className="text-hud-cyan">HBR</code>. Because <code className="text-hud-cyan">HBR ≪ σ</code>, the analytic approximation <code className="text-hud-green">Pc ≈ (HBR² / (2σ²)) · exp(-d² / (2σ²))</code> delivers exact match to numerical quadrature with 10,000× lower latency.
      </div>
    </div>
  );
}
