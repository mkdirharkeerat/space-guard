import React from 'react';
import { BookOpen, Cpu, ShieldAlert, Binary, Rocket } from 'lucide-react';

export default function MathExplainer() {
  return (
    <div className="flex flex-col gap-5 p-5 rounded-lg bg-space-900 border border-space-800 font-mono text-space-200">
      {/* Header */}
      <div className="flex items-center gap-3 pb-3 border-b border-space-800">
        <div className="p-2.5 rounded bg-space-850 border border-space-700 text-telemetry-emerald">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-white tracking-wide font-sans">
            Orbital Mechanics & Algorithmic Foundations
          </h2>
          <p className="text-xs text-space-400">
            Mathematical formulation, Foster/Alfano Pc analytic derivation, and Clohessy-Wiltshire dynamics
          </p>
        </div>
      </div>

      {/* Grid of Math Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        {/* Stage 1 & 2 Screening */}
        <div className="p-4 rounded-lg bg-space-950/80 border border-space-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white font-medium uppercase text-xs">
            <Binary className="w-4 h-4 text-telemetry-emerald" />
            <span>1. Two-Stage Conjunction Screening</span>
          </div>
          <p className="text-space-300 leading-relaxed">
            Direct O(N²) pairwise grid scanning of 25,000+ objects is computationally prohibitive. Space-Guard employs a two-stage filter:
          </p>
          <ul className="list-disc list-inside text-space-400 space-y-1">
            <li><strong className="text-white">Coarse Filter:</strong> Discards pairs whose apogee/perigee altitude bands do not overlap within ±50 km margin.</li>
            <li><strong className="text-white">Fine TCA Search:</strong> Employs <code className="text-telemetry-cyan">scipy.optimize.minimize_scalar</code> (Golden section/Brent search) on relative separation to precisely locate the Time of Closest Approach.</li>
          </ul>
        </div>

        {/* Stage 3 Analytic Pc */}
        <div className="p-4 rounded-lg bg-space-950/80 border border-space-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white font-medium uppercase text-xs">
            <Cpu className="w-4 h-4 text-telemetry-cyan" />
            <span>2. Foster/Alfano Analytic Pc Formulation</span>
          </div>
          <p className="text-space-300 leading-relaxed">
            In the B-plane normal to relative velocity vector, encounter probability is the integral of a 2D Gaussian density over the hard-body circle of radius HBR:
          </p>
          <div className="p-2.5 rounded bg-space-900 text-telemetry-emerald font-semibold text-center border border-space-800 text-xs">
            Pc ≈ (HBR² / 2σ²) · exp(-d_miss² / 2σ²)
          </div>
          <p className="text-space-400">
            Because HBR ≈ 10m ≪ σ ≈ 500m, probability density is near-constant over the disk, yielding exact analytic evaluation in under 10 microseconds.
          </p>
        </div>

        {/* Stage 4 ML Surrogate */}
        <div className="p-4 rounded-lg bg-space-950/80 border border-space-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white font-medium uppercase text-xs">
            <ShieldAlert className="w-4 h-4 text-telemetry-amber" />
            <span>3. ML Surrogate Acceleration Layer</span>
          </div>
          <p className="text-space-300 leading-relaxed">
            Space-Guard employs machine learning strictly as an acceleration surrogate to reduce compute overhead:
          </p>
          <ul className="list-disc list-inside text-space-400 space-y-1">
            <li>Trained on orbital parameters (miss distance, relative velocity, altitude, radial rates).</li>
            <li>Predicts candidate priority instantaneously to filter high-consequence pairs before executing full numerical propagation.</li>
          </ul>
        </div>

        {/* Stage 5 CW Maneuver */}
        <div className="p-4 rounded-lg bg-space-950/80 border border-space-800 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-white font-medium uppercase text-xs">
            <Rocket className="w-4 h-4 text-telemetry-emerald" />
            <span>4. Clohessy-Wiltshire (CW) Maneuver Planning</span>
          </div>
          <p className="text-space-300 leading-relaxed">
            Relative motion in circular/near-circular orbit is governed by the CW State Transition Matrix Φ(Δt):
          </p>
          <div className="p-2.5 rounded bg-space-900 text-space-200 text-center border border-space-800 text-xs">
            r(Δt) = Φ_rr(Δt) · r₀ + Φ_rv(Δt) · (v₀ + Δv)
          </div>
          <p className="text-space-400">
            Optimal burn direction is determined via <strong className="text-white">Singular Value Decomposition (SVD)</strong> of Φ_rv, aligning Δv with the right singular vector to maximize miss distance shift.
          </p>
        </div>
      </div>
    </div>
  );
}
