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
  ArrowRight, 
  Activity,
  Layers,
  Cpu,
  Shield,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function HomePage({ backendStatus, onTriggerScan, scanData }) {
  const features = [
    {
      to: '/globe',
      title: '3D Orbital Radar & Tracking',
      tag: 'TELEMETRY VIEWPORT',
      icon: Globe2,
      desc: 'Interactive Earth visualization with propagated inclined satellite orbits, conjunction encounter nodes, and vector coordinate frames.',
    },
    {
      to: '/screening',
      title: 'Two-Stage Conjunction Screening',
      tag: 'FAST FILTER + TCA',
      icon: Radar,
      desc: 'Altitude-band coarse overlap filter (±50km) followed by numerical Scipy golden-section minimization to pinpoint precise encounter times.',
    },
    {
      to: '/maneuver',
      title: 'Clohessy-Wiltshire Maneuver Planner',
      tag: 'SVD THRUSTER OPTIMIZER',
      icon: Rocket,
      desc: 'Impulsive burn calculation via SVD of the State Transition Matrix Φ_rv. Demonstrates 14× fuel efficiency scaling for early burns.',
    },
    {
      to: '/historical',
      title: '2009 Collision Benchmark Replay',
      tag: 'VALIDATION LAB',
      icon: History,
      desc: 'Tested directly against pre-collision TLEs of the 2009 Iridium 33 / Cosmos 2251 collision. Flags Critical Alert 48h prior.',
    },
    {
      to: '/bplane',
      title: 'B-Plane Encounter Geometry',
      tag: 'ANALYTIC Pc INTEGRAL',
      icon: Target,
      desc: 'Cross-sectional encounter plane with Gaussian 1σ, 2σ, 3σ uncertainty contours and 10m hard-body collision cross-section.',
    },
    {
      to: '/catalog',
      title: 'Live Satellite Ephemeris',
      tag: 'GCRS / ECI FRAME',
      icon: Satellite,
      desc: 'Search and inspect propagated coordinates, orbital velocity vectors, and altitude bands across active catalog satellites.',
    },
  ];

  const pipelineSteps = [
    {
      step: '01',
      title: 'TLE Ingestion & SGP4 Propagation',
      desc: 'Ingests active Two-Line Element sets from CelesTrak cache and propagates states to GCRS/ECI frame via Skyfield SGP4.',
      badge: 'PROPAGATION',
    },
    {
      step: '02',
      title: 'Coarse Altitude Filter (Stage 1)',
      desc: 'Filters pairs whose apogee and perigee do not overlap within ±50 km margin, discarding over 98% of candidate combinations.',
      badge: 'O(N²) FILTER',
    },
    {
      step: '03',
      title: 'Refined TCA Search & Analytic Pc',
      desc: 'Numerical scalar minimization locates true Time of Closest Approach. Foster/Alfano 2D Gaussian integral computes Pc.',
      badge: 'FOSTER/ALFANO',
    },
    {
      step: '04',
      title: 'CW Maneuver Optimization',
      desc: 'Calculates optimal impulsive thruster burn vectors via Clohessy-Wiltshire STM, steering satellites to safe clearance.',
      badge: 'SVD IMPULSE',
    },
  ];

  return (
    <div className="flex flex-col gap-10 font-mono text-space-200 pb-12">
      {/* 1. Hero Section */}
      <section className="p-8 sm:p-12 rounded-lg bg-space-900 border border-space-800 flex flex-col gap-6 relative overflow-hidden">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-0.5 bg-space-850 border border-space-700 rounded text-space-300 font-medium text-xs">
            SMART INDIA HACKATHON 2026
          </span>
          <span className="px-2.5 py-0.5 bg-space-850 border border-space-700 rounded text-telemetry-emerald font-medium text-xs">
            PROBLEM STATEMENT #17
          </span>
          <span className="px-2.5 py-0.5 bg-space-850 border border-space-700 rounded text-space-300 font-medium text-xs">
            SPACE DEBRIS DETECTION & COLLISION AVOIDANCE
          </span>
        </div>

        {/* Hero Title & Subtitle */}
        <div className="flex flex-col gap-3 max-w-4xl">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-semibold font-sans tracking-tight text-white leading-tight">
            Autonomous Orbital Conjunction Assessment & Collision Avoidance Platform
          </h1>
          <p className="text-sm sm:text-base text-space-400 leading-relaxed max-w-3xl">
            A real-time satellite conjunction risk assessment platform built on the same <strong className="text-white">Foster/Alfano 2D Gaussian analytic Pc models</strong> used by ESA and NASA, integrated with <strong className="text-white">Clohessy-Wiltshire impulsive maneuver optimization</strong>.
          </p>
        </div>

        {/* CTA Button Strip */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            to="/screening"
            onClick={() => sound.playClick()}
            className="px-6 py-3 rounded bg-telemetry-emerald text-black font-semibold text-xs uppercase tracking-wider hover:bg-emerald-400 transition-colors flex items-center gap-2"
          >
            <Activity className="w-4 h-4" />
            <span>Launch Conjunction Screening</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/globe"
            onClick={() => sound.playClick()}
            className="px-5 py-3 rounded bg-space-850 text-space-200 hover:text-white border border-space-700 hover:border-space-600 font-medium text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <Globe2 className="w-4 h-4 text-telemetry-cyan" />
            <span>Open 3D Radar</span>
          </Link>

          <Link
            to="/historical"
            onClick={() => sound.playClick()}
            className="px-5 py-3 rounded bg-space-850 text-space-200 hover:text-white border border-space-700 hover:border-space-600 font-medium text-xs uppercase tracking-wider transition-colors flex items-center gap-2"
          >
            <History className="w-4 h-4 text-red-400" />
            <span>2009 Collision Replay</span>
          </Link>
        </div>

        {/* Quick Telemetry Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-space-800">
          <div className="p-3 bg-space-950/60 border border-space-800 rounded">
            <span className="text-[10px] text-space-500 uppercase block">Tracked Catalog Objects</span>
            <strong className="text-lg font-semibold text-white">27,000+</strong>
          </div>
          <div className="p-3 bg-space-950/60 border border-space-800 rounded">
            <span className="text-[10px] text-space-500 uppercase block">Relative Closing Speed</span>
            <strong className="text-lg font-semibold text-white">7 - 14 km/s</strong>
          </div>
          <div className="p-3 bg-space-950/60 border border-space-800 rounded">
            <span className="text-[10px] text-space-500 uppercase block">Analytic Pc Latency</span>
            <strong className="text-lg font-semibold text-telemetry-emerald">&lt; 10 µs / pair</strong>
          </div>
          <div className="p-3 bg-space-950/60 border border-space-800 rounded">
            <span className="text-[10px] text-space-500 uppercase block">Fuel Efficiency Scaling</span>
            <strong className="text-lg font-semibold text-telemetry-cyan">14× (24h prior)</strong>
          </div>
        </div>
      </section>

      {/* 2. System Modules Bento Grid */}
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-semibold font-sans tracking-wide text-white">
            Operational Modules & Technical Tools
          </h2>
          <p className="text-xs text-space-400">
            Dedicated workstations for orbital screening, visual telemetry, and maneuver planning
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <Link
                key={f.to}
                to={f.to}
                onClick={() => sound.playClick()}
                className="p-5 rounded-lg bg-space-900 border border-space-800 hover:border-space-700 hover:bg-space-850 transition-all flex flex-col justify-between gap-4 group"
              >
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="p-2 bg-space-800 border border-space-700 rounded text-telemetry-cyan">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 bg-space-800 text-space-400 border border-space-700 rounded text-[10px] uppercase font-mono">
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold font-sans text-white group-hover:text-telemetry-cyan transition-colors">
                    {f.title}
                  </h3>
                  <p className="text-xs text-space-400 leading-relaxed">
                    {f.desc}
                  </p>
                </div>

                <div className="flex items-center gap-1 text-xs text-space-500 group-hover:text-space-300 pt-2 border-t border-space-800">
                  <span>Open Tool</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 3. 4-Stage Orbital Mechanics Pipeline */}
      <section className="p-6 sm:p-8 rounded-lg bg-space-900 border border-space-800 flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-space-850 border border-space-700 text-telemetry-emerald">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold font-sans tracking-wide text-white">
              Four-Stage Orbital Mechanics Architecture
            </h2>
            <p className="text-xs text-space-400">
              End-to-end mathematical pipeline from TLE ingestion to impulsive avoidance burns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {pipelineSteps.map((s) => (
            <div key={s.step} className="p-4 rounded-lg bg-space-950/80 border border-space-800 flex flex-col justify-between gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-semibold text-telemetry-cyan font-mono">{s.step}</span>
                  <span className="px-1.5 py-0.2 bg-space-900 border border-space-800 rounded text-[9px] text-space-400 uppercase">
                    {s.badge}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-white">{s.title}</h4>
                <p className="text-[11px] text-space-400 leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Historical Replay Highlight */}
      <section className="p-6 sm:p-8 rounded-lg bg-space-900 border border-space-800 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col gap-2 max-w-2xl">
          <span className="px-2 py-0.5 bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] uppercase font-semibold rounded w-fit">
            HISTORICAL VALIDATION CASE STUDY
          </span>
          <h3 className="text-lg font-semibold font-sans text-white">
            The 2009 Iridium 33 / Cosmos 2251 Collision Replay
          </h3>
          <p className="text-xs text-space-400 leading-relaxed">
            Evaluated against real pre-collision TLEs (epoch 09041), Space-Guard independently flags a <strong className="text-white">Critical Alert (Pc &gt; 10⁻⁴)</strong> and demonstrates how a small 0.1 m/s burn 24h prior creates +4.83 km clearance.
          </p>
        </div>

        <Link
          to="/historical"
          onClick={() => sound.playClick()}
          className="px-5 py-2.5 rounded bg-space-850 hover:bg-space-800 text-white border border-space-700 text-xs uppercase font-medium transition-colors flex items-center gap-2 whitespace-nowrap self-start md:self-auto"
        >
          <span>Run Historical Replay</span>
          <ArrowRight className="w-4 h-4 text-telemetry-cyan" />
        </Link>
      </section>
    </div>
  );
}
