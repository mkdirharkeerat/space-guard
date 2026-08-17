import React, { useState, useEffect } from 'react';
import { 
  Globe2, 
  Radar, 
  Rocket, 
  History, 
  Target, 
  Satellite, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Radio,
  Clock,
  Activity,
  ShieldCheck
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function Navbar({ activeTab, setActiveTab, backendStatus, dataAsOf }) {
  const [utcTime, setUtcTime] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setUtcTime(now.toISOString().slice(0, 19).replace('T', ' ') + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  const navItems = [
    { id: 'globe', label: '3D Orbit View', icon: Globe2 },
    { id: 'scan', label: 'Conjunction Screen', icon: Radar },
    { id: 'maneuver', label: 'CW Maneuver Planner', icon: Rocket },
    { id: 'historical', label: '2009 Collision Replay', icon: History },
    { id: 'bplane', label: 'B-Plane Geometry', icon: Target },
    { id: 'catalog', label: 'Live Objects', icon: Satellite },
    { id: 'math', label: 'Physics & Math', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-void/90 backdrop-blur-xl border-b border-hud-border">
      {/* Top Telemetry Strip */}
      <div className="hidden sm:flex items-center justify-between px-6 py-1 bg-deep/80 border-b border-hud-borderFaint text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-hud-green animate-pulse"></span>
            <span className="text-slate-300">DATA SOURCE:</span>
            <span className="text-hud-cyan font-bold">CelesTrak SGP4 Cache</span>
          </div>
          {dataAsOf && (
            <div className="flex items-center gap-1">
              <span>UPDATED:</span>
              <span className="text-slate-200">{new Date(dataAsOf).toLocaleTimeString()} UTC</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-hud-green" />
            <span className="text-hud-green font-bold">{utcTime}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-hud-green shadow-[0_0_8px_rgba(0,255,136,0.8)]' : 'bg-amber-400'}`}></span>
            <span className="text-slate-300">API:</span>
            <span className={backendStatus ? 'text-hud-green font-bold' : 'text-amber-400 font-bold'}>
              {backendStatus ? 'ONLINE (v2.1.0)' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-6 h-16">
        {/* Logo / Wordmark */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-hud-green/15 text-hud-green border border-hud-green/40 shadow-[0_0_12px_rgba(0,255,136,0.3)]">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-widest font-display">
                SPACE-GUARD
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-hud-green text-black">
                SIH 2026
              </span>
            </div>
            <span className="text-[10px] text-hud-green/80 font-mono tracking-wider block">
              ORBITAL COLLISION DEFENSE SYSTEM
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="hidden xl:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTab(item.id);
                }}
                className={`px-3 py-2 rounded-lg text-xs font-mono tracking-wide transition-all flex items-center gap-2 ${
                  isActive
                    ? 'bg-hud-green text-black font-bold shadow-[0_0_15px_rgba(0,255,136,0.35)]'
                    : 'text-slate-300 hover:text-white hover:bg-deep/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sound Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Telemetry Audio' : 'Unmute Telemetry Audio'}
            className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-hud-green/10 text-hud-green border-hud-green/30 hover:bg-hud-green/20'
                : 'bg-deep text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'AUDIO ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Strip */}
      <div className="xl:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-hud-borderFaint bg-deep/60">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(item.id);
              }}
              className={`px-2.5 py-1.5 rounded text-[11px] font-mono whitespace-nowrap flex items-center gap-1.5 transition-all ${
                isActive
                  ? 'bg-hud-green text-black font-bold'
                  : 'text-slate-300 hover:text-white bg-void/50 border border-slate-800'
              }`}
            >
              <Icon className="w-3 h-3" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
