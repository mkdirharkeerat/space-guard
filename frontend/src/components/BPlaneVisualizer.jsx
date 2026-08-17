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
  const hbr_radius = Math.max(4, 0.010 * scale);

  return (
    <div className="flex flex-col gap-5 p-6 rounded-2xl bg-white border-4 border-black shadow-neo-lg font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-3 border-black">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-neo-orange border-3 border-black shadow-neo">
            <Target className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black tracking-tight font-sans">
              B-Plane (Encounter Cross-Section) Visualizer
            </h2>
            <p className="text-xs text-slate-700 font-bold">
              2D Isotropic Gaussian Uncertainty & Hard-Body Collision Cross-Section
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
            className="px-3 py-1 rounded-lg bg-white border-2 border-black font-black text-sm hover:bg-slate-100 shadow-neo-sm"
          >
            -
          </button>
          <span className="text-xs font-black px-2">{zoomLevel.toFixed(2)}x</span>
          <button
            onClick={() => setZoomLevel(Math.min(3.0, zoomLevel + 0.25))}
            className="px-3 py-1 rounded-lg bg-white border-2 border-black font-black text-sm hover:bg-slate-100 shadow-neo-sm"
          >
            +
          </button>
        </div>
      </div>

      {/* SVG Canvas Area */}
      <div className="relative w-full h-[380px] bg-neo-cream rounded-xl border-3 border-black shadow-neo overflow-hidden flex items-center justify-center">
        <svg
          viewBox="-220 -180 440 360"
          className="w-full h-full cursor-crosshair select-none"
        >
          {/* Coordinate Axes */}
          <line x1="-200" y1="0" x2="200" y2="0" stroke="#000000" strokeWidth="2" strokeDasharray="4 4" />
          <line x1="0" y1="-160" x2="0" y2="160" stroke="#000000" strokeWidth="2" strokeDasharray="4 4" />

          {/* Covariance Rings */}
          <circle cx="0" cy="0" r={sigma3_radius} fill="none" stroke="#94A3B8" strokeWidth="2" strokeDasharray="5 5" />
          <circle cx="0" cy="0" r={sigma2_radius} fill="none" stroke="#00E5FF" strokeWidth="2.5" strokeDasharray="5 5" />
          <circle cx="0" cy="0" r={sigma1_radius} fill="rgba(0, 255, 102, 0.2)" stroke="#00FF66" strokeWidth="3" />

          {/* Labels */}
          <text x={sigma1_radius + 4} y="-6" fill="#000000" fontSize="10" fontWeight="bold" fontFamily="monospace">1σ (500m)</text>
          <text x={sigma2_radius + 4} y="-6" fill="#000000" fontSize="10" fontWeight="bold" fontFamily="monospace">2σ (1.0km)</text>
          <text x={sigma3_radius + 4} y="-6" fill="#64748B" fontSize="10" fontWeight="bold" fontFamily="monospace">3σ (1.5km)</text>

          {/* Target Satellite at Center */}
          <circle cx="0" cy="0" r={hbr_radius} fill="#00FF66" stroke="#000000" strokeWidth="2" />
          <text x="8" y="16" fill="#000000" fontSize="11" fontWeight="bold" fontFamily="monospace">
            {targetName} (Target)
          </text>

          {/* Miss Vector */}
          <line
            x1="0"
            y1="0"
            x2={chaserX}
            y2={chaserY}
            stroke="#FF3333"
            strokeWidth="3"
            strokeDasharray="4 4"
          />

          {/* Chaser Piercing Point */}
          <g transform={`translate(${chaserX}, ${chaserY})`}>
            <circle cx="0" cy="0" r="7" fill="#FF3333" stroke="#000000" strokeWidth="2" />
            <text x="12" y="-4" fill="#FF3333" fontSize="11" fontWeight="bold" fontFamily="monospace">
              {chaserName} (Chaser)
            </text>
            <text x="12" y="10" fill="#000000" fontSize="10" fontWeight="bold" fontFamily="monospace">
              Δr = {formatDistance(missKm)}
            </text>
          </g>
        </svg>

        {/* HUD Inset Box */}
        <div className="absolute bottom-4 left-4 p-3 rounded-xl bg-white border-2 border-black shadow-neo-sm text-xs font-mono font-bold text-black flex flex-col gap-1">
          <div className="flex items-center gap-1.5 font-black">
            <Compass className="w-4 h-4" />
            <span>B-Plane Coordinates (ξ, ζ)</span>
          </div>
          <span>Target Origin (0,0)</span>
          <span>Collision Disk HBR = 10 m</span>
          <span className={isCritical ? 'text-neo-red font-black' : 'text-black'}>
            Pc = {formatScientific(pc)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-slate-800 font-bold bg-neo-cream p-4 rounded-xl border-2 border-black leading-relaxed">
        <strong>Foster/Alfano Formulation:</strong> In the encounter frame perpendicular to relative velocity, the 3D collision integral simplifies to a 2D Gaussian density over the hard-body circle of radius <code className="bg-white px-1 border border-black rounded">HBR</code>. Because <code className="bg-white px-1 border border-black rounded">HBR ≪ σ</code>, the analytic formula delivers exact match to numerical integration with negligible latency.
      </div>
    </div>
  );
}
