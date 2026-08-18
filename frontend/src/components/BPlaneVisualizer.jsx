import React, { useState } from 'react';
import { Target, Compass } from 'lucide-react';
import { formatDistance, formatScientific } from '../utils/constants';

export default function BPlaneVisualizer({ selectedEvent }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const targetName = selectedEvent?.target_id || 'IRIDIUM 33';
  const chaserName = selectedEvent?.chaser_id || 'COSMOS 2251';
  const missKm = selectedEvent?.miss_distance_km ?? 0.003;
  const pc = selectedEvent?.pc ?? 0.0002;
  const isCritical = pc > 1e-4;

  const scale = 80 * zoomLevel;
  const chaserX = (missKm * scale * 0.7);
  const chaserY = -(missKm * scale * 0.7);

  const sigma1_radius = 0.5 * scale;
  const sigma2_radius = 1.0 * scale;
  const sigma3_radius = 1.5 * scale;
  const hbr_radius = Math.max(3, 0.010 * scale);

  return (
    <div className="flex flex-col gap-4 p-5 rounded-lg bg-space-900 border border-space-800 font-mono text-space-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-space-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-space-850 border border-space-700 text-telemetry-cyan">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide font-sans">
              B-Plane (Encounter Cross-Section) Visualizer
            </h2>
            <p className="text-xs text-space-400">
              2D Isotropic Gaussian Uncertainty & Hard-Body Collision Cross-Section
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            className="px-2.5 py-1 rounded bg-space-850 border border-space-700 text-xs text-space-300 hover:text-white"
          >
            -
          </button>
          <span className="text-xs text-space-400 px-1">{zoomLevel.toFixed(2)}x</span>
          <button
            onClick={() => setZoomLevel(Math.min(3.0, zoomLevel + 0.25))}
            className="px-2.5 py-1 rounded bg-space-850 border border-space-700 text-xs text-space-300 hover:text-white"
          >
            +
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[360px] bg-space-950 rounded border border-space-800 overflow-hidden flex items-center justify-center">
        <svg
          viewBox="-220 -180 440 360"
          className="w-full h-full cursor-crosshair select-none"
        >
          {/* Coordinate Axes */}
          <line x1="-200" y1="0" x2="200" y2="0" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="0" y1="-160" x2="0" y2="160" stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="3 3" />

          {/* Covariance Rings */}
          <circle cx="0" cy="0" r={sigma3_radius} fill="none" stroke="rgba(148, 163, 184, 0.3)" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r={sigma2_radius} fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="1.2" strokeDasharray="4 4" />
          <circle cx="0" cy="0" r={sigma1_radius} fill="rgba(16, 185, 129, 0.12)" stroke="rgba(16, 185, 129, 0.6)" strokeWidth="1.5" />

          {/* Labels */}
          <text x={sigma1_radius + 4} y="-6" fill="#10B981" fontSize="9" fontFamily="monospace">1σ (500m)</text>
          <text x={sigma2_radius + 4} y="-6" fill="#06B6D4" fontSize="9" fontFamily="monospace">2σ (1.0km)</text>
          <text x={sigma3_radius + 4} y="-6" fill="#64748B" fontSize="9" fontFamily="monospace">3σ (1.5km)</text>

          {/* Target Satellite at Center */}
          <circle cx="0" cy="0" r={hbr_radius} fill="#10B981" />
          <text x="8" y="14" fill="#E2E8F0" fontSize="10" fontWeight="bold" fontFamily="monospace">
            {targetName} (Target)
          </text>

          {/* Miss Vector */}
          <line
            x1="0"
            y1="0"
            x2={chaserX}
            y2={chaserY}
            stroke={isCritical ? '#EF4444' : '#F59E0B'}
            strokeWidth="1.5"
            strokeDasharray="2 2"
          />

          {/* Chaser Piercing Point */}
          <g transform={`translate(${chaserX}, ${chaserY})`}>
            <circle cx="0" cy="0" r="5" fill={isCritical ? '#EF4444' : '#F59E0B'} />
            <text x="10" y="-3" fill={isCritical ? '#F87171' : '#FBBF24'} fontSize="10" fontWeight="bold" fontFamily="monospace">
              {chaserName} (Chaser)
            </text>
            <text x="10" y="9" fill="#94A3B8" fontSize="9" fontFamily="monospace">
              Δr = {formatDistance(missKm)}
            </text>
          </g>
        </svg>

        {/* HUD Inset Box */}
        <div className="absolute bottom-3 left-3 p-2.5 rounded bg-space-900/90 border border-space-800 text-[11px] font-mono text-space-300 flex flex-col gap-0.5 backdrop-blur-md">
          <div className="flex items-center gap-1.5 text-white font-medium">
            <Compass className="w-3.5 h-3.5 text-telemetry-cyan" />
            <span>B-Plane Coordinates (ξ, ζ)</span>
          </div>
          <span>Target Origin: (0,0)</span>
          <span>Collision Sphere: HBR = 10 m</span>
          <span className={isCritical ? 'text-red-400 font-semibold' : 'text-amber-400'}>
            Pc = {formatScientific(pc)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-space-400 bg-space-950/60 p-3 rounded border border-space-800/80 leading-relaxed">
        <strong className="text-space-200">Foster/Alfano Formulation:</strong> In the encounter frame perpendicular to relative velocity, the 3D collision integral reduces to a 2D Gaussian density over the hard-body circle of radius <code className="text-telemetry-cyan">HBR</code>. Because <code className="text-telemetry-cyan">HBR ≪ σ</code>, the analytic formula delivers exact match to numerical quadrature with negligible latency.
      </div>
    </div>
  );
}
