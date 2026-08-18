import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe2, 
  Radar, 
  Rocket, 
  History, 
  Target, 
  Satellite, 
  BookOpen, 
  ShieldAlert, 
  CheckCircle2, 
  ArrowRight, 
  Zap, 
  Flame, 
  Cpu, 
  Activity,
  Layers,
  HelpCircle
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function HomePage({ backendStatus, onTriggerScan, scanData }) {
  const features = [
    {
      to: '/globe',
      title: '3D Orbital Radar Viewport',
      tag: 'VISUAL TELEMETRY',
      color: 'bg-neo-yellow',
      icon: Globe2,
      desc: 'Interactive Three.js Earth with real-time inclined satellite orbits, glowing conjunction beacons, and lock-on tracking.',
    },
    {
      to: '/screening',
      title: 'Two-Stage Conjunction Screening',
      tag: 'FAST FILTER + TCA',
      color: 'bg-neo-green',
      icon: Radar,
      desc: 'O(N²) altitude-band overlap filter (±50km) followed by numerical Scipy golden-section minimization to find true TCA.',
    },
    {
      to: '/maneuver',
      title: 'Clohessy-Wiltshire Maneuver Planner',
      tag: 'SVD OPTIMIZATION',
      color: 'bg-neo-cyan',
      icon: Rocket,
      desc: 'Impulsive ΔV burn calculation via SVD of the State Transition Matrix Φ_rv. Demonstrates 14× fuel savings on earlier burns.',
    },
    {
      to: '/historical',
      title: '2009 Iridium / Cosmos Collision Replay',
      tag: 'REAL-WORLD BENCHMARK',
      color: 'bg-neo-pink',
      icon: History,
      desc: 'Tested against real pre-collision TLEs (10 Feb 2009). Correctly triggers Critical Alert 48h prior & proves avoidance with 0.1 m/s burn.',
    },
    {
      to: '/bplane',
      title: 'B-Plane Encounter Geometry',
      tag: 'ANALYTIC Pc INTEGRAL',
      color: 'bg-neo-orange',
      icon: Target,
      desc: '2D cross-sectional encounter plane with Gaussian 1σ, 2σ, 3σ uncertainty contours and 10m Hard-Body collision radius.',
    },
    {
      to: '/catalog',
      title: 'Live Propagated Satellite Ephemeris',
      tag: 'GCRS / ECI FRAME',
      color: 'bg-[#B8EAFF]',
      icon: Satellite,
      desc: 'Instant search across catalog satellites with real-time coordinates, velocity magnitudes, and LEO altitude estimates.',
    },
  ];

  const pipelineSteps = [
    {
      step: '01',
      title: 'TLE Ingestion & SGP4 Propagation',
      desc: 'Fetches active Two-Line Element sets from CelesTrak cache and propagates coordinates to GCRS/ECI frame via SGP4.',
      badge: 'SKYFIELD ENGINE',
    },
    {
      step: '02',
      title: 'Coarse Altitude Filter (Stage 1)',
      desc: 'Filters out pairs whose apogee and perigee do not overlap within ±50 km margin, discarding 98% of non-threatening orbits cheaply.',
      badge: 'O(N²) FAST PASS',
    },
    {
      step: '03',
      title: 'Refined TCA Search & Analytic Pc',
      desc: 'Performs numerical minimization (scipy.optimize.minimize_scalar) to find true TCA, then integrates 2D Gaussian density (Foster/Alfano).',
      badge: 'FOSTER/ALFANO',
    },
    {
      step: '04',
      title: 'CW Maneuver Planning & SVD Thruster Burns',
      desc: 'Calculates optimal impulsive thruster burns via Clohessy-Wiltshire STM, steering satellites to safe clearance with minimal propellant.',
      badge: 'SVD OPTIMIZED',
    },
  ];

  return (
    <div className="flex flex-col gap-12 font-mono text-black pb-12">
      {/* 1. Hero Section */}
      <section className="p-8 sm:p-12 rounded-3xl bg-white border-4 border-black shadow-neo-lg flex flex-col gap-6 relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1 bg-neo-yellow border-2 border-black rounded-lg font-black text-xs shadow-neo-sm">
            SMART INDIA HACKATHON 2026
          </span>
          <span className="px-3 py-1 bg-neo-green border-2 border-black rounded-lg font-black text-xs shadow-neo-sm">
            PROBLEM STATEMENT #17
          </span>
          <span className="px-3 py-1 bg-neo-pink text-black border-2 border-black rounded-lg font-black text-xs shadow-neo-sm">
            SPACE DEBRIS DETECTION & COLLISION AVOIDANCE
          </span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="flex flex-col gap-3 max-w-4xl">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-sans tracking-tight leading-[1.08] text-black">
            Autonomous Space Debris & Conjunction Defense Platform
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-800 leading-relaxed max-w-3xl">
            A real-time orbital collision risk assessment system built on the same <strong className="bg-neo-yellow px-1 border border-black rounded">Foster/Alfano 2D Gaussian analytic Pc models</strong> used by ESA and NASA, integrated with <strong className="bg-neo-cyan px-1 border border-black rounded">Clohessy-Wiltshire impulsive thruster maneuver planning</strong>.
          </p>
        </div>

        {/* CTA Button Strip */}
        <div className="flex flex-wrap items-center gap-4 pt-2">
          <Link
            to="/screening"
            onClick={() => sound.playClick()}
            className="px-7 py-4 rounded-xl bg-neo-green text-black font-black text-sm uppercase tracking-wider border-3 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-2"
          >
            <Activity className="w-5 h-5" />
            <span>Launch Conjunction Screening</span>
            <ArrowRight className="w-5 h-5" />
          </Link>

          <Link
            to="/globe"
            onClick={() => sound.playClick()}
            className="px-6 py-4 rounded-xl bg-neo-yellow text-black font-black text-sm uppercase tracking-wider border-3 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-2"
          >
            <Globe2 className="w-5 h-5" />
            <span>Open 3D Orbital Radar</span>
          </Link>

          <Link
            to="/historical"
            onClick={() => sound.playClick()}
            className="px-6 py-4 rounded-xl bg-neo-pink text-black font-black text-sm uppercase tracking-wider border-3 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-2"
          >
            <History className="w-5 h-5" />
            <span>2009 Collision Replay</span>
          </Link>
        </div>

        {/* Quick Live Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t-3 border-black">
          <div className="p-3 bg-neo-cream border-2 border-black rounded-xl shadow-neo-sm">
            <span className="text-[10px] text-slate-600 font-bold uppercase block">Tracked Debris Threat</span>
            <strong className="text-xl font-black text-black">27,000+</strong>
          </div>
          <div className="p-3 bg-neo-cream border-2 border-black rounded-xl shadow-neo-sm">
            <span className="text-[10px] text-slate-600 font-bold uppercase block">Relative Closing Velocity</span>
            <strong className="text-xl font-black text-black">7 - 14 km/s</strong>
          </div>
          <div className="p-3 bg-neo-cream border-2 border-black rounded-xl shadow-neo-sm">
            <span className="text-[10px] text-slate-600 font-bold uppercase block">Analytic Pc Latency</span>
            <strong className="text-xl font-black text-black">&lt; 10 µs / pair</strong>
          </div>
          <div className="p-3 bg-neo-cream border-2 border-black rounded-xl shadow-neo-sm">
            <span className="text-[10px] text-slate-600 font-bold uppercase block">Fuel Efficiency Scaling</span>
            <strong className="text-xl font-black text-black">14× (24h early)</strong>
          </div>
        </div>
      </section>

      {/* 2. Problem Statement: Why Generic Approaches Fail */}
      <section className="p-8 rounded-3xl bg-neo-cream border-4 border-black shadow-neo flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-neo-red text-white border-2 border-black shadow-neo-sm">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-sans tracking-tight text-black">
              The Kessler Syndrome Threat & Our Scientific Approach
            </h2>
            <p className="text-xs text-slate-700 font-bold">
              Why Space-Guard is fundamentally different from generic hackathon projects
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-bold">
          <div className="p-5 rounded-2xl bg-white border-3 border-black shadow-neo flex flex-col gap-2">
            <span className="text-neo-red font-black uppercase text-xs">❌ Generic Student Submissions:</span>
            <ul className="list-disc list-inside space-y-1.5 text-slate-700">
              <li>Plots arbitrary satellite dots on a 3D globe with no real orbital propagation.</li>
              <li>Prints a mystery "AI Risk Score" manufactured from thin air with no mathematical derivation.</li>
              <li>Uses fixed time-step grid scans that miss the true closest approach time.</li>
              <li>Never validates against real historical collision data.</li>
            </ul>
          </div>

          <div className="p-5 rounded-2xl bg-neo-green border-3 border-black shadow-neo flex flex-col gap-2 text-black">
            <span className="font-black uppercase text-xs">✅ Space-Guard Rigorous Architecture:</span>
            <ul className="list-disc list-inside space-y-1.5 text-black">
              <li><strong>Two-Stage Screening:</strong> Altitude filter ±50km → Scipy numerical TCA minimization.</li>
              <li><strong>Foster/Alfano Pc Model:</strong> Analytic 2D Gaussian probability density over encounter B-plane.</li>
              <li><strong>ML as an Acceleration Layer:</strong> Surrogate model predicts Pc cheaply so heavy math runs only on shortlisted pairs.</li>
              <li><strong>2009 Collision Benchmark:</strong> Validated against actual Iridium 33 / Cosmos 2251 pre-collision TLEs.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. System Features Bento Grid */}
      <section className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black font-sans tracking-tight text-black">
              System Modules & Tool Suites
            </h2>
            <p className="text-xs text-slate-700 font-bold">
              Click any module to launch the dedicated workspace
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.to}
                to={f.to}
                onClick={() => sound.playClick()}
                className={`p-6 rounded-2xl ${f.color} border-4 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-1 transition-all flex flex-col justify-between gap-4 group`}
              >
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white border-2 border-black rounded-xl shadow-neo-sm group-hover:rotate-3 transition-transform">
                      <Icon className="w-6 h-6 text-black" />
                    </div>
                    <span className="px-2 py-0.5 bg-black text-white rounded text-[10px] font-black uppercase">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-lg font-black font-sans text-black group-hover:underline">
                    {f.title}
                  </h3>
                  <p className="text-xs font-bold text-slate-900 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs font-black text-black pt-2 border-t-2 border-black/20">
                  <span>Open Tool</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4. Interactive 4-Stage Pipeline Walkthrough */}
      <section className="p-8 rounded-3xl bg-white border-4 border-black shadow-neo-lg flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-neo-cyan border-3 border-black shadow-neo-sm">
            <Cpu className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-2xl font-black font-sans tracking-tight text-black">
              4-Stage Orbital Mechanics & Defense Pipeline
            </h2>
            <p className="text-xs text-slate-700 font-bold">
              End-to-end physics pipeline from CelesTrak TLE ingestion to optimal impulsive avoidance burns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineSteps.map((s) => (
            <div key={s.step} className="p-5 rounded-2xl bg-neo-cream border-3 border-black shadow-neo flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-black text-black">{s.step}</span>
                  <span className="px-2 py-0.5 bg-white border border-black rounded text-[9px] font-black uppercase">
                    {s.badge}
                  </span>
                </div>
                <h4 className="text-sm font-black font-sans text-black">{s.title}</h4>
                <p className="text-xs font-bold text-slate-700 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Historical Replay Highlight Banner */}
      <section className="p-8 rounded-3xl bg-neo-pink border-4 border-black shadow-neo-lg flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <span className="px-2.5 py-0.5 bg-black text-white font-black text-[10px] uppercase rounded w-fit">
            HISTORICAL VALIDATION CASE STUDY
          </span>
          <h3 className="text-2xl font-black font-sans text-black">
            The 2009 Iridium 33 / Cosmos 2251 Replay
          </h3>
          <p className="text-xs font-bold text-slate-900 leading-relaxed">
            Tested directly against pre-collision TLEs (epoch 09041), Space-Guard independently flags a <strong className="bg-white px-1 border border-black rounded">Critical Alert (Pc &gt; 10⁻⁴)</strong> and demonstrates how a small 0.1 m/s thruster burn 24h prior would have established +4.83 km clearance.
          </p>
        </div>

        <Link
          to="/historical"
          onClick={() => sound.playClick()}
          className="px-6 py-3.5 rounded-xl bg-white text-black font-black text-xs uppercase tracking-wider border-3 border-black shadow-neo hover:shadow-neo-lg hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
        >
          <span>Run Historical Replay</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
