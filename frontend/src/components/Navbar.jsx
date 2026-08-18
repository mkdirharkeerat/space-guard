import React, { useState, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
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
  Home,
  Menu,
  X
} from 'lucide-react';
import { sound } from '../utils/audio';

export default function Navbar({ backendStatus, dataAsOf }) {
  const [utcTime, setUtcTime] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    { to: '/', label: 'Home', icon: Home, color: 'bg-white' },
    { to: '/globe', label: '3D Radar', icon: Globe2, color: 'bg-neo-yellow' },
    { to: '/screening', label: 'Screening', icon: Radar, color: 'bg-neo-green' },
    { to: '/maneuver', label: 'CW Maneuver', icon: Rocket, color: 'bg-neo-cyan' },
    { to: '/historical', label: '2009 Collision', icon: History, color: 'bg-neo-pink' },
    { to: '/bplane', label: 'B-Plane', icon: Target, color: 'bg-neo-orange' },
    { to: '/catalog', label: 'Catalog', icon: Satellite, color: 'bg-[#B8EAFF]' },
    { to: '/docs', label: 'Docs & Math', icon: BookOpen, color: 'bg-[#E2D4F0]' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-4 border-black shadow-neo">
      {/* Top Retro Marquee Ticker */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-1 bg-neo-yellow border-b-2 border-black text-xs font-mono font-bold text-black overflow-hidden">
        <div className="flex items-center gap-3">
          <span className="px-2 py-0.5 bg-black text-neo-yellow font-black uppercase text-[10px] tracking-wider rounded">
            LIVE TELEMETRY
          </span>
          <span className="truncate text-[11px]">
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
            <span>{backendStatus ? 'API ONLINE (v2.1.0)' : 'API STANDBY'}</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-16">
        {/* Brand Wordmark */}
        <Link 
          to="/" 
          onClick={() => sound.playClick()}
          className="flex items-center gap-3 group"
        >
          <div className="p-2 rounded-lg bg-neo-green border-3 border-black shadow-neo-sm group-hover:bg-emerald-400 transition-colors">
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
        </Link>

        {/* Desktop Tab Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => sound.playClick()}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 rounded-lg border-2 border-black ${
                    isActive
                      ? `${item.color} text-black shadow-neo-sm font-black translate-x-[-1px] translate-y-[-1px]`
                      : 'bg-white text-black hover:bg-neo-cream shadow-none'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Sound Toggle & Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Audio' : 'Unmute Audio'}
            className={`px-3 py-1.5 rounded-lg border-2 border-black text-xs font-mono font-black transition-all flex items-center gap-1.5 shadow-neo-sm ${
              soundEnabled
                ? 'bg-neo-cyan text-black hover:bg-cyan-300'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline">{soundEnabled ? 'SFX ON' : 'MUTED'}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg border-2 border-black bg-neo-yellow shadow-neo-sm"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden flex flex-col gap-2 p-4 bg-neo-cream border-t-2 border-black">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => {
                  sound.playClick();
                  setMobileMenuOpen(false);
                }}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-xs font-mono font-black uppercase flex items-center gap-2 border-2 border-black transition-all ${
                    isActive
                      ? `${item.color} text-black shadow-neo-sm`
                      : 'bg-white text-black'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      )}
    </header>
  );
}
