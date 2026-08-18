import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Shield, ExternalLink, Code2 } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Footer() {
  return (
    <footer className="w-full border-t border-space-800 bg-space-950 font-mono text-space-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* Top Row: Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded bg-space-850 border border-space-700 text-telemetry-emerald">
                <Radio className="w-4 h-4" />
              </div>
              <span className="text-base font-semibold font-sans tracking-wide text-white">SPACE-GUARD</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-space-800 text-space-300 border border-space-700">
                v2.1.0
              </span>
            </div>
            <p className="text-xs text-space-400 max-w-md leading-relaxed">
              Orbital Collision Defense System built for Smart India Hackathon 2026 (Problem Statement #17). Implements Foster/Alfano analytic 2D Gaussian Pc screening and Clohessy-Wiltshire impulsive maneuver planning.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-0.5 rounded bg-space-900 border border-space-800 text-space-300 text-[10px] font-mono">
                SGP4 / SKYFIELD
              </span>
              <span className="px-2 py-0.5 rounded bg-space-900 border border-space-800 text-space-300 text-[10px] font-mono">
                FASTAPI BACKEND
              </span>
              <span className="px-2 py-0.5 rounded bg-space-900 border border-space-800 text-space-300 text-[10px] font-mono">
                THREE.JS TELEMETRY
              </span>
            </div>
          </div>

          {/* Quick Nav Col */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-space-200 pb-1 border-b border-space-800">
              Navigation
            </span>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link to="/globe" onClick={() => sound.playClick()} className="hover:text-white transition-colors">
                3D Orbital Radar
              </Link>
              <Link to="/screening" onClick={() => sound.playClick()} className="hover:text-white transition-colors">
                Conjunction Screening
              </Link>
              <Link to="/maneuver" onClick={() => sound.playClick()} className="hover:text-white transition-colors">
                CW Maneuver Planner
              </Link>
              <Link to="/historical" onClick={() => sound.playClick()} className="hover:text-white transition-colors">
                2009 Collision Replay
              </Link>
            </div>
          </div>

          {/* Physics & Docs Col */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-space-200 pb-1 border-b border-space-800">
              Technical
            </span>
            <div className="flex flex-col gap-1.5 text-xs">
              <Link to="/bplane" onClick={() => sound.playClick()} className="hover:text-white transition-colors">
                B-Plane Geometry
              </Link>
              <Link to="/catalog" onClick={() => sound.playClick()} className="hover:text-white transition-colors">
                Satellite Ephemeris
              </Link>
              <Link to="/docs" onClick={() => sound.playClick()} className="hover:text-white transition-colors">
                System Documentation
              </Link>
              <a 
                href="https://github.com/mkdirharkeerat/space-guard" 
                target="_blank" 
                rel="noreferrer"
                className="hover:text-white transition-colors flex items-center gap-1 text-space-400"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-4 border-t border-space-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-space-500">
          <div>
            Smart India Hackathon 2026 · Problem Statement #17
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-space-900 border border-space-800 rounded text-[11px]">
              Foster/Alfano 2D Gaussian Pc
            </span>
            <span className="px-2 py-0.5 bg-space-900 border border-space-800 rounded text-[11px]">
              Clohessy-Wiltshire STM SVD
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
