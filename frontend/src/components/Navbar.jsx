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
  X,
  Shield
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
    { to: '/', label: 'Overview', icon: Home },
    { to: '/globe', label: '3D Radar', icon: Globe2 },
    { to: '/screening', label: 'Screening', icon: Radar },
    { to: '/maneuver', label: 'CW Maneuver', icon: Rocket },
    { to: '/historical', label: '2009 Replay', icon: History },
    { to: '/bplane', label: 'B-Plane', icon: Target },
    { to: '/catalog', label: 'Ephemeris', icon: Satellite },
    { to: '/docs', label: 'Documentation', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-space-950/95 backdrop-blur-md border-b border-space-800 font-mono">
      {/* Top Telemetry Strip */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-1 bg-space-900/90 border-b border-space-800/60 text-[11px] text-space-400 overflow-hidden">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-telemetry-emerald animate-pulse" />
            <span className="text-space-300 font-semibold uppercase tracking-wider">SYSTEM:</span>
            <span className="text-telemetry-emerald">SGP4 / CELESTRAK CACHE</span>
          </div>
          {dataAsOf && (
            <span className="hidden md:inline text-space-500">
              | UPDATED: {new Date(dataAsOf).toLocaleTimeString()} UTC
            </span>
          )}
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <div className="flex items-center gap-1.5 text-space-300">
            <Clock className="w-3.5 h-3.5 text-telemetry-cyan" />
            <span>{utcTime}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${backendStatus ? 'bg-telemetry-emerald' : 'bg-amber-400'}`} />
            <span className="text-space-400">API:</span>
            <span className={backendStatus ? 'text-telemetry-emerald font-medium' : 'text-amber-400 font-medium'}>
              {backendStatus ? 'ONLINE (v2.1.0)' : 'STANDBY'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="flex items-center justify-between px-4 sm:px-6 h-14">
        {/* Brand Wordmark */}
        <Link 
          to="/" 
          onClick={() => sound.playClick()}
          className="flex items-center gap-3 group"
        >
          <div className="p-1.5 rounded bg-space-850 border border-space-700 text-telemetry-emerald group-hover:border-telemetry-emerald/50 transition-colors">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold tracking-wider text-white font-sans uppercase">
                SPACE-GUARD
              </span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-medium bg-space-800 text-space-300 border border-space-700">
                SIH PS #17
              </span>
            </div>
            <span className="text-[10px] text-space-500 font-mono tracking-wider block">
              ORBITAL COLLISION DEFENSE PLATFORM
            </span>
          </div>
        </Link>

        {/* Desktop Tab Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => sound.playClick()}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-xs font-mono tracking-wide transition-all flex items-center gap-1.5 rounded-md border ${
                    isActive
                      ? 'bg-space-800 text-telemetry-emerald border-space-600 font-medium'
                      : 'bg-transparent text-space-400 hover:text-white hover:bg-space-900 border-transparent'
                  }`
                }
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleSound}
            title={soundEnabled ? 'Mute Telemetry Sound' : 'Unmute Telemetry Sound'}
            className={`p-1.5 rounded border text-xs font-mono transition-all flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-space-850 text-telemetry-cyan border-space-700 hover:bg-space-800'
                : 'bg-space-950 text-space-600 border-space-850'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden md:inline text-[11px]">{soundEnabled ? 'AUDIO' : 'MUTED'}</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-1.5 rounded border border-space-700 bg-space-850 text-space-300"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden flex flex-col gap-1 p-3 bg-space-900 border-t border-space-800">
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
                  `px-3 py-2 rounded text-xs font-mono flex items-center gap-2 transition-all ${
                    isActive
                      ? 'bg-space-800 text-telemetry-emerald font-medium'
                      : 'text-space-400 hover:text-white'
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
