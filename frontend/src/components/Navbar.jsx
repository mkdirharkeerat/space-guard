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
  Home,
  Menu,
  X,
  Orbit,
} from 'lucide-react';
import { sound } from '../utils/audio';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function Navbar({ backendStatus, dataAsOf }) {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    sound.enabled = false;
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sound.enabled = next;
    if (next) sound.playClick();
  };

  const navItems = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/globe', label: '3D Radar', icon: Globe2 },
    { to: '/screening', label: 'Screening', icon: Radar },
    { to: '/maneuver', label: 'Maneuver', icon: Rocket },
    { to: '/historical', label: '2009 Replay', icon: History },
    { to: '/bplane', label: 'B-Plane', icon: Target },
    { to: '/catalog', label: 'Catalog', icon: Satellite },
    { to: '/docs', label: 'Docs', icon: BookOpen },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between h-14 px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex items-center justify-center size-8 rounded-md bg-secondary text-primary transition-colors group-hover:bg-accent">
            <Orbit className="size-4" />
          </div>
          <div className="leading-tight">
            <span className="text-sm font-medium tracking-tight">Space-Guard</span>
            <span className="hidden sm:block text-[11px] text-muted-foreground">
              Orbital collision defense
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'px-2.5 py-1.5 text-[13px] rounded-md transition-colors flex items-center gap-1.5',
                    isActive
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  )
                }
              >
                <Icon className="size-3.5 opacity-70" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mr-1">
            <span
              className={cn(
                'size-1.5 rounded-full transition-colors',
                backendStatus ? 'bg-emerald-500/80' : 'bg-amber-500/80'
              )}
            />
            <span>{backendStatus ? 'API online' : 'Offline'}</span>
            {dataAsOf && (
              <span className="hidden xl:inline text-muted-foreground/70">
                · Updated {new Date(dataAsOf).toLocaleTimeString()}
              </span>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={toggleSound}
            title={soundEnabled ? 'Mute sounds' : 'Enable sounds'}
            className="text-muted-foreground"
          >
            {soundEnabled ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
          </Button>

          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-muted-foreground"
          >
            {mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <nav className="lg:hidden border-t border-border/60 px-3 py-2 flex flex-col gap-0.5 animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  cn(
                    'px-3 py-2 rounded-md text-sm flex items-center gap-2 transition-colors',
                    isActive
                      ? 'bg-secondary text-foreground font-medium'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent/60'
                  )
                }
              >
                <Icon className="size-4 opacity-70" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      )}
    </header>
  );
}
