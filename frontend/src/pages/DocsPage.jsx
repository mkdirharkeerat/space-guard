import React from 'react';
import MathExplainer from '../components/MathExplainer';
import GuideBox from '../components/GuideBox';
import { BookOpen, Shield, Code2, Server, Award, CheckCircle } from 'lucide-react';

export default function DocsPage() {
  const guideSteps = [
    {
      title: 'Intellectual Honesty (§12)',
      description: 'TLEs lack covariance data, exact satellite mass, and physical dimensions. We explicitly state all assumed σ = 500m & HBR = 10m parameters.',
    },
    {
      title: 'Foster/Alfano Derivation',
      description: 'The encounter probability is calculated via an analytic 2D Gaussian integral rather than an opaque or fabricated "AI score".',
    },
    {
      title: 'Clohessy-Wiltshire STM SVD',
      description: 'The optimal impulsive avoidance burn direction is determined via SVD of Φ_rv, maximizing separation gain per m/s of ΔV.',
    },
  ];

  const apiEndpoints = [
    { method: 'GET', path: '/health', desc: 'Health check, service version, and ML triage pre-training status.' },
    { method: 'POST', path: '/scan', desc: 'Executes full two-stage screening (±50km altitude filter + Scipy TCA search + Foster/Alfano Pc).' },
    { method: 'GET', path: '/api/objects?limit=100', desc: 'Propagates catalog satellites to current UTC second in GCRS/ECI frame via SGP4.' },
    { method: 'POST', path: '/api/maneuver', desc: 'Computes optimal impulsive burn using Clohessy-Wiltshire STM SVD decomposition.' },
    { method: 'GET', path: '/api/validation/iridium-cosmos', desc: 'Replays the 2009 Iridium 33 / Cosmos 2251 collision benchmark from historical TLEs.' },
  ];

  return (
    <div className="flex flex-col gap-6 font-mono text-black">
      {/* GuideBox */}
      <GuideBox
        title="Orbital Mechanics Reference & Documentation · Evaluator Guide"
        badge="SIH 2026 SPECS"
        steps={guideSteps}
        note="Space-Guard strictly isolates physics from ML: ML acts as an acceleration surrogate, never a replacement for physical Pc."
      />

      {/* Math Explainer Section */}
      <MathExplainer />

      {/* Engineering Assumptions & Transparency */}
      <div className="p-6 rounded-2xl bg-white border-4 border-black shadow-neo flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-black">
          <div className="p-2.5 bg-neo-yellow border-2 border-black rounded-xl shadow-neo-sm">
            <Shield className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-black font-sans text-black">
              Engineering Assumptions & Compliance (§12)
            </h3>
            <p className="text-xs text-slate-700 font-bold">
              Full statement of operational assumptions for evaluation judges
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-bold">
          <div className="p-4 bg-neo-cream border-2 border-black rounded-xl shadow-neo-sm flex flex-col gap-1">
            <span className="text-[11px] text-black font-black uppercase">Positional Uncertainty (σ)</span>
            <p className="text-slate-800">
              Assumed isotropic Gaussian standard deviation of <strong>σ = 500 m</strong> (0.5 km) representing standard SGP4 TLE precision limits.
            </p>
          </div>

          <div className="p-4 bg-neo-cream border-2 border-black rounded-xl shadow-neo-sm flex flex-col gap-1">
            <span className="text-[11px] text-black font-black uppercase">Hard-Body Radius (HBR)</span>
            <p className="text-slate-800">
              Combined collision cross-section of <strong>HBR = 10 m</strong> (0.010 km) for typical LEO communications satellites.
            </p>
          </div>

          <div className="p-4 bg-neo-cream border-2 border-black rounded-xl shadow-neo-sm flex flex-col gap-1">
            <span className="text-[11px] text-black font-black uppercase">Impulsive Thruster Burn</span>
            <p className="text-slate-800">
              Instantaneous velocity change modeled via Clohessy-Wiltshire relative motion in representative circular LEO orbit (r ≈ 6,787 km).
            </p>
          </div>
        </div>
      </div>

      {/* REST API Reference */}
      <div className="p-6 rounded-2xl bg-white border-4 border-black shadow-neo flex flex-col gap-4">
        <div className="flex items-center gap-3 pb-3 border-b-2 border-black">
          <div className="p-2.5 bg-neo-cyan border-2 border-black rounded-xl shadow-neo-sm">
            <Server className="w-5 h-5 text-black" />
          </div>
          <div>
            <h3 className="text-lg font-black font-sans text-black">
              FastAPI REST Backend Endpoints
            </h3>
            <p className="text-xs text-slate-700 font-bold">
              Live REST API specifications running on port 8000
            </p>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border-3 border-black shadow-neo-sm bg-white">
          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-neo-yellow text-black border-b-2 border-black font-black uppercase">
              <tr>
                <th className="py-3 px-4 w-24">Method</th>
                <th className="py-3 px-4 w-64">Endpoint</th>
                <th className="py-3 px-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black font-bold">
              {apiEndpoints.map((ep, idx) => (
                <tr key={idx} className="hover:bg-neo-cream">
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black border border-black ${
                      ep.method === 'GET' ? 'bg-neo-green text-black' : 'bg-neo-pink text-black'
                    }`}>
                      {ep.method}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-black">{ep.path}</td>
                  <td className="py-3 px-4 text-slate-800">{ep.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
