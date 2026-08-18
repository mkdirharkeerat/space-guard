import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Shield, ExternalLink, Code2 } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Footer() {
  return (
    <footer className="w-full border-t-4 border-black bg-white font-mono text-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
        {/* Top Row: Brand & Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Col */}
          <div className="md:col-span-2 flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-neo-green border-2 border-black shadow-neo-sm">
                <Radio className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-black font-sans tracking-tight">SPACE-GUARD</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-neo-yellow border-2 border-black shadow-neo-sm">
                v2.1.0
              </span>
            </div>
            <p className="text-xs font-bold text-slate-700 max-w-md leading-relaxed">
              Orbital Collision Defense System built for Smart India Hackathon 2026 (Problem Statement #17). Features Foster/Alfano analytic 2D Gaussian Pc screening and Clohessy-Wiltshire impulsive maneuver optimization.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="px-2 py-1 rounded bg-neo-pink text-black border-2 border-black text-[10px] font-black shadow-neo-sm">
                SGP4 + SKYFIELD
              </span>
              <span className="px-2 py-1 rounded bg-neo-cyan text-black border-2 border-black text-[10px] font-black shadow-neo-sm">
                FASTAPI BACKEND
              </span>
              <span className="px-2 py-1 rounded bg-neo-green text-black border-2 border-black text-[10px] font-black shadow-neo-sm">
                THREE.JS RADAR
              </span>
            </div>
          </div>

          {/* Quick Nav Col */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-black pb-1 border-b-2 border-black">
              System Modules
            </span>
            <div className="flex flex-col gap-1.5 text-xs font-bold">
              <Link to="/globe" onClick={() => sound.playClick()} className="hover:underline hover:text-neo-blue">
                3D Orbital Radar
              </Link>
              <Link to="/screening" onClick={() => sound.playClick()} className="hover:underline hover:text-neo-blue">
                Conjunction Screening
              </Link>
              <Link to="/maneuver" onClick={() => sound.playClick()} className="hover:underline hover:text-neo-blue">
                CW Maneuver Planner
              </Link>
              <Link to="/historical" onClick={() => sound.playClick()} className="hover:underline hover:text-neo-blue">
                2009 Collision Replay
              </Link>
            </div>
          </div>

          {/* Physics & Docs Col */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-black pb-1 border-b-2 border-black">
              Physics & Docs
            </span>
            <div className="flex flex-col gap-1.5 text-xs font-bold">
              <Link to="/bplane" onClick={() => sound.playClick()} className="hover:underline hover:text-neo-blue">
                B-Plane Geometry
              </Link>
              <Link to="/catalog" onClick={() => sound.playClick()} className="hover:underline hover:text-neo-blue">
                Satellite Ephemeris
              </Link>
              <Link to="/docs" onClick={() => sound.playClick()} className="hover:underline hover:text-neo-blue">
                Docs & Math Guide
              </Link>
              <a 
                href="https://github.com/mkdirharkeerat/space-guard" 
                target="_blank" 
                rel="noreferrer"
                className="hover:underline flex items-center gap-1 text-slate-800"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>GitHub Repo</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-4 border-t-2 border-black flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-800">
          <div className="flex items-center gap-2">
            <span>Built for Smart India Hackathon 2026</span>
            <span>·</span>
            <span>SIH Problem Statement #17</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-neo-yellow border border-black rounded shadow-neo-sm">
              Foster/Alfano 2D Gaussian Model
            </span>
            <span className="px-2 py-0.5 bg-neo-green border border-black rounded shadow-neo-sm">
              SVD CW Thruster Optimization
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
