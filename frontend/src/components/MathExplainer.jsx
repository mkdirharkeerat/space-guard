import React from 'react';
import { BookOpen, Cpu, ShieldAlert, Binary, Rocket } from 'lucide-react';

export default function MathExplainer() {
  return (
    <div className="flex flex-col gap-6 p-6 rounded-2xl bg-white border-4 border-black shadow-neo-lg font-mono">
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b-3 border-black">
        <div className="p-3 rounded-xl bg-[#E2D4F0] border-3 border-black shadow-neo">
          <BookOpen className="w-6 h-6 text-black" />
        </div>
        <div>
          <h2 className="text-xl font-black text-black tracking-tight font-sans">
            Orbital Mathematics & Algorithmic Foundations
          </h2>
          <p className="text-xs text-slate-700 font-bold">
            Mathematical formulation, Foster/Alfano Pc analytic derivation, and Clohessy-Wiltshire dynamics
          </p>
        </div>
      </div>

      {/* Grid of Math Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs font-bold">
        {/* Stage 1 & 2 Screening */}
        <div className="p-5 rounded-xl bg-neo-cream border-3 border-black shadow-neo flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-black font-black uppercase text-sm">
            <Binary className="w-5 h-5 text-neo-green" />
            <span>1. Two-Stage Conjunction Screening</span>
          </div>
          <p className="text-slate-800 leading-relaxed">
            Direct O(N²) pairwise grid scanning of 25,000+ objects is computationally prohibitive. Space-Guard employs a two-stage filter:
          </p>
          <ul className="list-disc list-inside text-slate-900 space-y-1">
            <li><strong className="text-black">Coarse Filter:</strong> Discards pairs whose apogee/perigee altitude bands do not overlap within ±50 km margin.</li>
            <li><strong className="text-black">Fine TCA Search:</strong> Employs <code className="bg-white px-1 border border-black rounded">scipy.optimize.minimize_scalar</code> (Golden section/Brent search) on relative separation to precisely locate the Time of Closest Approach.</li>
          </ul>
        </div>

        {/* Stage 3 Analytic Pc */}
        <div className="p-5 rounded-xl bg-neo-cream border-3 border-black shadow-neo flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-black font-black uppercase text-sm">
            <Cpu className="w-5 h-5 text-neo-cyan" />
            <span>2. Foster/Alfano Analytic Pc Formulation</span>
          </div>
          <p className="text-slate-800 leading-relaxed">
            In the B-plane normal to relative velocity vector, encounter probability is the integral of a 2D Gaussian density over the hard-body circle of radius HBR:
          </p>
          <div className="p-3 rounded-xl bg-neo-yellow text-black font-black text-center border-2 border-black shadow-neo-sm text-sm">
            Pc ≈ (HBR² / 2σ²) · exp(-d_miss² / 2σ²)
          </div>
          <p className="text-slate-800">
            Because HBR ≈ 10m ≪ σ ≈ 500m, probability density is near-constant over the disk, yielding exact analytic evaluation in under 10 microseconds.
          </p>
        </div>

        {/* Stage 4 ML Surrogate */}
        <div className="p-5 rounded-xl bg-neo-cream border-3 border-black shadow-neo flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-black font-black uppercase text-sm">
            <ShieldAlert className="w-5 h-5 text-neo-orange" />
            <span>3. ML Surrogate Speed/Triage Layer</span>
          </div>
          <p className="text-slate-800 leading-relaxed">
            Rather than manufacturing an ungrounded "AI score", Space-Guard uses machine learning strictly as an acceleration surrogate:
          </p>
          <ul className="list-disc list-inside text-slate-900 space-y-1">
            <li>Trained on orbital parameters (miss distance, relative velocity, altitude, radial rates).</li>
            <li>Predicts candidate priority instantaneously to filter high-consequence pairs before executing numerical propagation.</li>
          </ul>
        </div>

        {/* Stage 5 CW Maneuver */}
        <div className="p-5 rounded-xl bg-neo-cream border-3 border-black shadow-neo flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-black font-black uppercase text-sm">
            <Rocket className="w-5 h-5 text-neo-pink" />
            <span>4. Clohessy-Wiltshire (CW) Maneuver Planning</span>
          </div>
          <p className="text-slate-800 leading-relaxed">
            Relative motion in circular/near-circular orbit is governed by the CW State Transition Matrix Φ(Δt):
          </p>
          <div className="p-3 rounded-xl bg-neo-green text-black font-black text-center border-2 border-black shadow-neo-sm text-xs">
            r(Δt) = Φ_rr(Δt) · r₀ + Φ_rv(Δt) · (v₀ + Δv)
          </div>
          <p className="text-slate-800">
            Optimal burn direction is determined via <strong className="text-black">Singular Value Decomposition (SVD)</strong> of Φ_rv, aligning Δv with the right singular vector to maximize miss distance shift.
          </p>
        </div>
      </div>
    </div>
  );
}
