import React from 'react';
import { BookOpen, CheckCircle, Cpu, ShieldAlert, Binary, Rocket, HelpCircle } from 'lucide-react';

export default function MathExplainer() {
  return (
    <div className="flex flex-col gap-6 p-6 rounded-xl glass-panel border border-hud-border font-mono">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-hud-borderFaint">
        <div className="p-2.5 rounded-lg bg-hud-cyan/15 text-hud-cyan border border-hud-cyan/30">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide font-sans">
            Orbital Mathematics & Algorithmic Foundations
          </h2>
          <p className="text-xs text-slate-400">
            Mathematical formulation, Foster/Alfano Pc analytic derivation, and Clohessy-Wiltshire dynamics
          </p>
        </div>
      </div>

      {/* Grid of Math Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        {/* Stage 1 & 2 Screening */}
        <div className="p-4 rounded-lg bg-void/80 border border-hud-borderFaint flex flex-col gap-2">
          <div className="flex items-center gap-2 text-hud-green font-bold uppercase">
            <Binary className="w-4 h-4" />
            <span>1. Two-Stage Conjunction Screening</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Direct O(N²) pairwise grid scanning of 25,000+ objects is computationally prohibitive. Space-Guard employs a two-stage filter:
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li><strong className="text-slate-200">Coarse Filter:</strong> Discards pairs whose apogee/perigee altitude bands do not overlap within ±50 km margin.</li>
            <li><strong className="text-slate-200">Fine TCA Search:</strong> Employs <code className="text-hud-cyan">scipy.optimize.minimize_scalar</code> (Golden section/Brent search) on relative separation to precisely locate the Time of Closest Approach without grid quantization errors.</li>
          </ul>
        </div>

        {/* Stage 3 Analytic Pc */}
        <div className="p-4 rounded-lg bg-void/80 border border-hud-borderFaint flex flex-col gap-2">
          <div className="flex items-center gap-2 text-hud-cyan font-bold uppercase">
            <Cpu className="w-4 h-4" />
            <span>2. Foster/Alfano Analytic Pc Formulation</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            In the B-plane normal to relative velocity vector, the encounter probability is the integral of a 2D Gaussian density over the hard-body circle of radius HBR:
          </p>
          <div className="p-2.5 rounded bg-deep text-hud-green font-bold text-center border border-hud-borderFaint">
            Pc ≈ (HBR² / 2σ²) · exp(-d_miss² / 2σ²)
          </div>
          <p className="text-slate-400">
            Because HBR ≈ 10m ≪ σ ≈ 500m, the probability density is near-constant over the disk, providing exact analytic evaluation in under 10 microseconds.
          </p>
        </div>

        {/* Stage 3 ML Surrogate */}
        <div className="p-4 rounded-lg bg-void/80 border border-hud-borderFaint flex flex-col gap-2">
          <div className="flex items-center gap-2 text-hud-amber font-bold uppercase">
            <ShieldAlert className="w-4 h-4" />
            <span>3. ML Surrogate Speed/Triage Layer</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Rather than manufacturing an ungrounded "AI score", Space-Guard uses machine learning strictly as an acceleration surrogate:
          </p>
          <ul className="list-disc list-inside text-slate-400 space-y-1">
            <li>Trained on orbital parameters (miss distance, relative velocity, altitude, radial rates).</li>
            <li>Predicts candidate priority instantaneously to filter high-consequence pairs before executing full high-precision numerical propagation.</li>
          </ul>
        </div>

        {/* Stage 4 CW Maneuver */}
        <div className="p-4 rounded-lg bg-void/80 border border-hud-borderFaint flex flex-col gap-2">
          <div className="flex items-center gap-2 text-hud-green font-bold uppercase">
            <Rocket className="w-4 h-4" />
            <span>4. Clohessy-Wiltshire (CW) Maneuver Planning</span>
          </div>
          <p className="text-slate-300 leading-relaxed">
            Relative motion in circular/near-circular orbit is governed by the CW State Transition Matrix Φ(Δt):
          </p>
          <div className="p-2 rounded bg-deep text-slate-200 text-center border border-hud-borderFaint text-[11px]">
            r(Δt) = Φ_rr(Δt) · r₀ + Φ_rv(Δt) · (v₀ + Δv)
          </div>
          <p className="text-slate-400">
            Optimal burn direction is determined via <strong className="text-slate-200">Singular Value Decomposition (SVD)</strong> of Φ_rv, aligning Δv with the right singular vector to maximize miss distance shift.
          </p>
        </div>
      </div>
    </div>
  );
}
