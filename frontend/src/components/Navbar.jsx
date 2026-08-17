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
  Zap,
  Flame
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
    { id: 'globe', label: '3D Globe', icon: Globe2, color: 'bg-neo-yellow' },
    { id: 'scan', label: 'Conjunction Screen', icon: Radar, color: 'bg-neo-green' },
    { id: 'maneuver', label: 'CW Maneuver', icon: Rocket, color: 'bg-neo-cyan' },
    { id: 'historical', label: '2009 Collision Replay', icon: History, color: 'bg-neo-pink' },
    { id: 'bplane', label: 'B-Plane', icon: Target, color: 'bg-neo-orange' },
    { id: 'catalog', label: 'Live Catalog', icon: Satellite, color: 'bg-[#B8EAFF]' },
    { id: 'math', label: 'Math & Specs', icon: BookOpen, color: 'bg-[#E2D4F0]' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-4 border-black shadow-neo">
      {/* Top Retro Marquee Ticker */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-1.5 bg-neo-yellow border-b-2 border-black text-xs font-mono font-bold text-black overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-black text-neo-yellow font-black uppercase text-[10px] tracking-wider rounded">
            LIVE TELEMETRY
          </span>
          <span className="truncate">
            🛰️ SPACE-GUARD · SGP4 CELESTRAK PROPAGATION · FOSTER/ALFANO ANALYTIC Pc ENGINE
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 bg-white px-2 py-0.5 border border-black rounded shadow-neo-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{utcTime}</span>
          </div>

          <div className={`flex items-center gap-1.5 px-2 py-0.5 border border-black rounded shadow-neo-sm font-black ${
            backendStatus ? 'bg-neo-green text-black' : 'bg-neo-red text-white'
          }`}>
            <span className="w-2 h-2 rounded-full bg-black"></span>
            <span>{backendStatus ? 'API ONLINE (v2.1.0)' : 'API DISCONNECTED'}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand Wordmark */}
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-neo-green border-3 border-black shadow-neo-sm">
            <Radio className="w-5 h-5 text-black animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-black tracking-tight font-sans">
                SPACE-GUARD
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-neo-pink text-black border-2 border-black shadow-neo-sm">
                SIH 2026 #17
              </span>
            </div>
            <span className="text-[10px] text-slate-800 font-mono font-bold tracking-wider block">
              ORBITAL COLLISION DEFENSE PLATFORM
            </span>
          </div>
        </div>

        {/* Tab Buttons Navigation */}
        <nav className="hidden xl:flex items-center gap-2">
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
                className={`px-3.5 py-2 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-2 rounded-lg border-3 border-black ${
                  isActive
                    ? `${item.color} text-black shadow-neo translate-x-[-1px] translate-y-[-1px]`
                    : 'bg-white text-black hover:bg-neo-cream shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sound Toggle & Action */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className={`px-3 py-2 rounded-lg border-3 border-black text-xs font-mono font-black transition-all flex items-center gap-1.5 shadow-neo-sm ${
              soundEnabled
                ? 'bg-neo-cyan text-black hover:bg-cyan-300'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'SFX ON' : 'MUTED'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Horizontal Navigation Tabs */}
      <div className="xl:hidden flex items-center gap-2 overflow-x-auto px-4 py-2 bg-neo-cream border-t-2 border-black">
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
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-black uppercase whitespace-nowrap flex items-center gap-1.5 border-2 border-black transition-all ${
                isActive
                  ? `${item.color} text-black shadow-neo-sm`
                  : 'bg-white text-black'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
