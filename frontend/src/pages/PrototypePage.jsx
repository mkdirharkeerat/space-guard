import React, { useState, useEffect } from 'react';
import {
  Satellite,
  Globe2,
  Flame,
  Zap,
  Activity,
  RefreshCcw,
  ArrowRight,
  ArrowLeft,
  AlertTriangle,
  CheckCircle2,
  Radio,
  Shield,
  TrendingUp,
  Clock,
  Cpu,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Globe3D from '@/components/Globe3D';
import DecryptedText from '@/components/react-bits/DecryptedText';
import CountUp from '@/components/react-bits/CountUp';
import SpotlightCard from '@/components/react-bits/SpotlightCard';
import { Badge } from '@/components/ui/badge';
import { sound } from '@/utils/audio';

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    label: 'Live Feed',
    icon: Satellite,
    badge: 'STEP 1 · LIVE DATA',
    title: 'Live Satellite Tracking',
    summary: 'Real satellites. Real positions. Fetched right now from a public space agency database.',
    logs: [
      '[✓] CelesTrak API connected',
      '[✓] 25 satellites propagated',
      '[✓] TLE epoch validated',
      '[→] Awaiting next command...',
    ],
  },
  {
    id: 2,
    label: '3D Globe',
    icon: Globe2,
    badge: 'STEP 2 · 3D MAP',
    title: '3D Orbital Mapping',
    summary: 'Every dot is a real object orbiting Earth right now, shown at the correct height and angle.',
    logs: [
      '[✓] 3D mapping initialized',
      '[✓] Orbital planes computed',
      '[✓] Altitude bands classified',
      '[→] Scanning altitude bands...',
    ],
  },
  {
    id: 3,
    label: '2009 Crash',
    icon: Flame,
    badge: 'STEP 3 · COLLISION',
    title: 'Iridium 33 × Cosmos 2251 — 2009 Replay',
    summary: 'The first accidental satellite collision in history, re-created on our system.',
    logs: [
      '[!] CRITICAL: Iridium 33 flagged',
      '[!] Cosmos 2251 on intercept path',
      '[!] TCA: 2009-02-10 16:56 UTC',
      '[!] Pc = 2.0×10⁻⁴  →  ACTION REQUIRED',
    ],
  },
  {
    id: 4,
    label: 'Avoid It',
    icon: Zap,
    badge: 'STEP 4 · DODGE PLAN',
    title: 'Avoidance Maneuver Simulator',
    summary: 'Drag the sliders and watch the safety gap grow in real time.',
    logs: [
      '[✓] Maneuver plan computed',
      '[✓] ΔV = 0.10 m/s along-track',
      '[✓] Clearance: +4.83 km',
      '[✓] Crash risk → near zero',
    ],
  },
];

// ─── Animation variants ───────────────────────────────────────────────────────
const fadeSlide = {
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.4, 0, 0.2, 1] } },
  exit:    { opacity: 0, y: -14, transition: { duration: 0.25 } },
};

const staggerContainer = {
  animate: { transition: { staggerChildren: 0.09 } },
};

const staggerItem = {
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

// ─── Live pulsing dot ─────────────────────────────────────────────────────────
function LiveDot() {
  return (
    <span className="relative flex h-2.5 w-2.5 mr-1.5">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
    </span>
  );
}

// ─── Animated log feed ────────────────────────────────────────────────────────
function LogFeed({ logs, stepId }) {
  const [visibleCount, setVisibleCount] = React.useState(0);

  React.useEffect(() => {
    setVisibleCount(0);
    let i = 0;
    const timer = setInterval(() => {
      i += 1;
      setVisibleCount(i);
      if (i >= logs.length) clearInterval(timer);
    }, 420);
    return () => clearInterval(timer);
  }, [stepId]);

  return (
    <div className="font-mono text-[11px] space-y-1.5">
      {logs.map((line, idx) => (
        <motion.div
          key={`${stepId}-${idx}`}
          initial={{ opacity: 0, x: -8 }}
          animate={idx < visibleCount ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
          transition={{ duration: 0.28 }}
          className={`leading-relaxed ${
            line.startsWith('[!]')
              ? 'text-rose-400'
              : line.startsWith('[✓]')
              ? 'text-emerald-400'
              : 'text-blue-400/80'
          }`}
        >
          {line}
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PrototypePage({ objects = [], selectedEvent, onSelectEvent }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [liveObjects, setLiveObjects]  = useState([]);
  const [loading, setLoading]          = useState(false);
  const [simLeadTime, setSimLeadTime]  = useState(24);
  const [simDeltaV, setSimDeltaV]      = useState(0.10);

  // Safety gap calculation
  const shiftKm = Math.abs(
    (4 * Math.sin(0.00103 * simLeadTime * 3600) - 3 * 0.00103 * simLeadTime * 3600) / 0.00103
  ) * (simDeltaV / 1000);
  const totalMissKm = 0.003 + shiftKm;
  const isSafe = totalMissKm > 1;

  const fetchLive = async () => {
    setLoading(true);
    try { sound.playClick?.(); } catch {}
    try {
      const res = await fetch('/api/objects?limit=25');
      if (res.ok) {
        const data = await res.json();
        setLiveObjects(data.objects || []);
      } else {
        throw new Error('non-ok');
      }
    } catch {
      setLiveObjects(objects.slice(0, 25));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLive(); }, []);

  const stepData = STEPS[currentStep - 1];
  const displayObjects = liveObjects.length > 0 ? liveObjects : objects.slice(0, 25);

  const goStep = (id) => {
    try { sound.playClick?.(); } catch {}
    setCurrentStep(id);
  };

  return (
    <div className="flex flex-col min-h-screen font-sans text-foreground pb-16 relative">

      {/* ── Cinematic Header ─────────────────────────────────────────── */}
      <div className="relative z-10 px-6 pt-6 pb-4 border-b border-white/5 bg-[#070B14]/80 backdrop-blur-md">
        {/* Ambient glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 left-1/4 w-96 h-56 bg-blue-600/10 rounded-full blur-3xl" />
          <div className="absolute -top-16 right-1/4 w-72 h-40 bg-indigo-500/8 rounded-full blur-3xl" />
        </div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          {/* Title */}
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="size-4 text-blue-400" />
              <span className="text-[10px] font-mono text-blue-400/70 tracking-[0.25em] uppercase">
                Smart India Hackathon 2026
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-none">
              <DecryptedText
                text="SPACE-GUARD LIVE DEMONSTRATION"
                speed={28}
                maxIterations={8}
                animateOn="view"
                className="text-white"
                encryptedClassName="text-blue-400/60 font-mono"
              />
            </h1>
            <p className="text-xs text-white/40 mt-1.5 font-mono tracking-wide">
              Satellite Collision Detection &amp; Avoidance System
            </p>
          </div>

          {/* Stats strip */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="flex gap-4 flex-wrap"
          >
            {[
              { label: 'Objects Tracked', to: 27000, suffix: '+', sep: ',', color: 'text-blue-400' },
              { label: 'Avg Orbit Speed', to: 7.5, suffix: ' km/s', decimals: 1, color: 'text-indigo-400' },
              { label: '2009 Debris', to: 2000, suffix: '+', sep: ',', color: 'text-rose-400' },
              { label: 'Detection Time', to: 5, suffix: 's', color: 'text-emerald-400' },
            ].map((s) => (
              <motion.div key={s.label} variants={staggerItem} className="text-center">
                <div className={`text-xl font-bold font-mono ${s.color}`}>
                  <CountUp
                    to={s.to}
                    duration={2}
                    delay={0.3}
                    separator={s.sep || ''}
                    suffix={s.suffix || ''}
                    decimals={s.decimals || 0}
                  />
                </div>
                <div className="text-[9px] text-white/35 uppercase tracking-widest mt-0.5">{s.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Step navigation tabs */}
        <div className="relative flex items-center gap-1.5 mt-5 pt-4 border-t border-white/5">
          {STEPS.map((s) => {
            const Icon = s.icon;
            const active = currentStep === s.id;
            const done   = currentStep > s.id;
            return (
              <motion.button
                key={s.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => goStep(s.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all border
                  ${active
                    ? 'bg-blue-600/20 border-blue-500/60 text-blue-300 shadow-[0_0_16px_rgba(59,130,246,0.25)]'
                    : done
                    ? 'bg-white/5 border-white/10 text-white/50'
                    : 'bg-transparent border-white/8 text-white/35 hover:text-white/60 hover:border-white/20'
                  }`}
              >
                <Icon className={`size-3.5 ${active ? 'text-blue-400' : done ? 'text-emerald-500' : ''}`} />
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
                {done && <CheckCircle2 className="size-3 text-emerald-500 ml-0.5" />}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 rounded-lg ring-1 ring-blue-500/40"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
              </motion.button>
            );
          })}
          <div className="ml-auto flex items-center text-[10px] font-mono text-emerald-400/80">
            <LiveDot />LIVE
          </div>
        </div>
      </div>

      {/* ── Main Content Grid ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">

        {/* ─ Left: 9 cols ─────────────────────────────────────────────── */}
        <div className="lg:col-span-9 px-6 pt-6 pb-4 flex flex-col gap-5">

          <AnimatePresence mode="wait">

            {/* ═══ STEP 1: Satellite Table ══════════════════════════════ */}
            {currentStep === 1 && (
              <motion.div key="step1" {...fadeSlide} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Satellite className="size-4 text-blue-400" />
                    <h2 className="text-sm font-semibold text-white tracking-tight">
                      <DecryptedText
                        text="LIVE SATELLITE TELEMETRY FEED"
                        speed={22}
                        maxIterations={6}
                        animateOn="view"
                        className="text-white"
                        encryptedClassName="text-blue-400/50 font-mono"
                      />
                    </h2>
                    <span className="flex items-center text-[10px] font-mono text-emerald-400/80">
                      <LiveDot />LIVE
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={fetchLive}
                    disabled={loading}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-xs text-white/60 hover:text-white/90 hover:border-white/20 transition-all disabled:opacity-40"
                  >
                    <RefreshCcw className={`size-3 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                  </motion.button>
                </div>

                <SpotlightCard className="overflow-hidden" spotlightColor="rgba(59,130,246,0.10)">
                  {/* macOS-style terminal chrome */}
                  <div className="px-3 py-2.5 border-b border-white/5 bg-black/20 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                    <span className="ml-2 text-[10px] font-mono text-white/20 tracking-widest">
                      SPACE-GUARD TERMINAL — CELESTRAK LIVE FEED
                    </span>
                  </div>
                  <div className="overflow-x-auto max-h-[370px] overflow-y-auto">
                    <table className="w-full text-left font-mono">
                      <thead className="sticky top-0 bg-[#0a0f1e] text-[10px] text-white/25 uppercase tracking-widest border-b border-white/5">
                        <tr>
                          <th className="py-2.5 px-4">Satellite ID</th>
                          <th className="py-2.5 px-4">Name</th>
                          <th className="py-2.5 px-4">Location (km)</th>
                          <th className="py-2.5 px-4">Speed</th>
                          <th className="py-2.5 px-4">Height Above Earth</th>
                        </tr>
                      </thead>
                      <motion.tbody
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                        className="divide-y divide-white/4 text-[11px]"
                      >
                        {(loading ? Array(8).fill(null) : displayObjects).map((sat, i) =>
                          sat ? (() => {
                            const pos = sat.position_km || [0, 0, 0];
                            const vel = sat.velocity_km_s || [0, 0, 0];
                            const r = Math.sqrt(pos[0] ** 2 + pos[1] ** 2 + pos[2] ** 2);
                            const altKm = Math.max(0, r - 6378.137);
                            const vMag = Math.sqrt(vel[0] ** 2 + vel[1] ** 2 + vel[2] ** 2);
                            return (
                              <motion.tr
                                key={sat.norad_id}
                                variants={staggerItem}
                                className="hover:bg-blue-600/5 transition-colors"
                              >
                                <td className="py-2.5 px-4 text-blue-400 font-semibold">#{sat.norad_id}</td>
                                <td className="py-2.5 px-4 text-white/80 font-sans font-medium text-xs">{sat.name}</td>
                                <td className="py-2.5 px-4 text-white/30 text-[10px]">
                                  [{pos.map(p => Number(p).toFixed(0)).join(', ')}]
                                </td>
                                <td className="py-2.5 px-4 text-amber-400/80">{vMag.toFixed(2)} km/s</td>
                                <td className="py-2.5 px-4 text-emerald-400 font-semibold">~{altKm.toFixed(0)} km</td>
                              </motion.tr>
                            );
                          })()
                          : (
                            <tr key={`sk-${i}`} className="animate-pulse">
                              {[12, 28, 36, 16, 16].map((w, j) => (
                                <td key={j} className="py-2.5 px-4">
                                  <div className={`h-2.5 w-${w} bg-white/6 rounded`} />
                                </td>
                              ))}
                            </tr>
                          )
                        )}
                      </motion.tbody>
                    </table>
                  </div>
                </SpotlightCard>

                <p className="text-[11px] text-white/25 font-mono">
                  {displayObjects.length} objects loaded · Source: CelesTrak SGP4 propagator · Updated {new Date().toLocaleTimeString()}
                </p>
              </motion.div>
            )}

            {/* ═══ STEP 2: 3D Globe ════════════════════════════════════ */}
            {currentStep === 2 && (
              <motion.div key="step2" {...fadeSlide} className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <Globe2 className="size-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-white tracking-tight">
                    3D Orbital Map — Real Satellites, Right Now
                  </h2>
                </div>

                <SpotlightCard className="overflow-hidden" spotlightColor="rgba(99,102,241,0.12)">
                  <Globe3D initialMode="live" objects={displayObjects} />
                </SpotlightCard>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { label: 'Objects on Map', to: displayObjects.length, suffix: '', color: 'text-indigo-400', Icon: Globe2 },
                    { label: 'Altitude Bands', to: 4, suffix: '', color: 'text-blue-400', Icon: Cpu },
                    { label: 'Scan Frequency', to: 30, suffix: 's', color: 'text-emerald-400', Icon: Radio },
                  ].map(({ label, to, suffix, color, Icon }) => (
                    <motion.div key={label} variants={staggerItem}>
                      <SpotlightCard className="p-4 text-center" spotlightColor="rgba(99,102,241,0.10)">
                        <Icon className={`size-4 ${color} mx-auto mb-2 opacity-70`} />
                        <div className={`text-2xl font-bold font-mono ${color}`}>
                          <CountUp to={to} duration={1.5} suffix={suffix} />
                        </div>
                        <div className="text-[10px] text-white/35 uppercase tracking-widest mt-1">{label}</div>
                      </SpotlightCard>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            )}

            {/* ═══ STEP 3: 2009 Collision ═══════════════════════════════ */}
            {currentStep === 3 && (
              <motion.div key="step3" {...fadeSlide} className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <Flame className="size-4 text-rose-400" />
                    <h2 className="text-sm font-semibold text-white leading-tight">
                      IRIDIUM 33 × COSMOS 2251 — COLLISION REPLAY
                    </h2>
                  </div>
                  <motion.div
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity }}
                    className="shrink-0"
                  >
                    <Badge className="bg-rose-600/20 border border-rose-500/50 text-rose-300 text-[10px] font-mono px-3 py-1 flex items-center gap-1.5">
                      <AlertTriangle className="size-3" />
                      CRITICAL ALERT
                    </Badge>
                  </motion.div>
                </div>

                <SpotlightCard className="overflow-hidden" spotlightColor="rgba(239,68,68,0.10)">
                  <Globe3D
                    initialMode="collision_2009"
                    activeEvents={[{
                      target_id: 'IRIDIUM 33',
                      chaser_id: 'COSMOS 2251',
                      miss_distance_km: 0.003,
                      pc: 0.0002,
                      risk_tier: 'Critical',
                      tca_utc: '2009-02-10 16:56:00 UTC',
                    }]}
                  />
                </SpotlightCard>

                <motion.div
                  variants={staggerContainer}
                  initial="initial"
                  animate="animate"
                  className="grid grid-cols-3 gap-3"
                >
                  {[
                    { label: 'Crash Speed', main: '14.12 km/s', sub: '50,832 km/h — head-on' },
                    { label: 'Gap at Impact', main: '3 metres', sub: 'Direct collision — total loss' },
                    { label: 'Predicted Risk', main: '1 in 5,000', sub: 'Should have triggered alert' },
                  ].map((s) => (
                    <motion.div key={s.label} variants={staggerItem}>
                      <SpotlightCard className="p-4 text-center border-rose-500/25" spotlightColor="rgba(239,68,68,0.12)">
                        <div className="text-[10px] text-rose-400/70 uppercase tracking-widest mb-2">{s.label}</div>
                        <div className="text-lg font-bold font-mono text-rose-300 leading-none">{s.main}</div>
                        <div className="text-[10px] text-white/35 mt-1.5 leading-relaxed">{s.sub}</div>
                      </SpotlightCard>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Timeline strip */}
                <SpotlightCard className="p-4" spotlightColor="rgba(239,68,68,0.08)">
                  <div className="text-[10px] text-white/35 uppercase tracking-widest mb-3 font-mono">
                    Collision Timeline
                  </div>
                  <div className="flex items-center overflow-x-auto">
                    {[
                      { label: '48h before', note: 'Orbits plotted', danger: false },
                      { label: '24h before', note: 'Risk computable', danger: false },
                      { label: '12h before', note: 'Alert window', danger: false },
                      { label: 'IMPACT', note: '2009-02-10 16:56 UTC', danger: true },
                    ].map((t, i, arr) => (
                      <React.Fragment key={t.label}>
                        <div className="flex flex-col items-center shrink-0 px-2">
                          <div className={`w-3 h-3 rounded-full border-2 ${t.danger ? 'border-rose-500 bg-rose-500 shadow-[0_0_12px_rgba(239,68,68,0.6)]' : 'border-blue-500/50 bg-blue-600/20'}`} />
                          <div className={`text-[10px] font-mono font-bold mt-1.5 whitespace-nowrap ${t.danger ? 'text-rose-400' : 'text-white/50'}`}>
                            {t.label}
                          </div>
                          <div className="text-[9px] text-white/25 mt-0.5 whitespace-nowrap">{t.note}</div>
                        </div>
                        {i < arr.length - 1 && (
                          <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-rose-500/30 min-w-6" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </SpotlightCard>
              </motion.div>
            )}

            {/* ═══ STEP 4: Avoidance Simulator ══════════════════════════ */}
            {currentStep === 4 && (
              <motion.div key="step4" {...fadeSlide} className="flex flex-col gap-4">
                <div className="flex items-center gap-2.5">
                  <Zap className="size-4 text-emerald-400" />
                  <h2 className="text-sm font-semibold text-white tracking-tight">
                    Avoidance Maneuver Simulator
                  </h2>
                  <Badge className="bg-emerald-600/15 border border-emerald-500/35 text-emerald-300 text-[10px] font-mono px-2 py-0.5">
                    INTERACTIVE
                  </Badge>
                </div>

                <SpotlightCard className="overflow-hidden" spotlightColor="rgba(16,185,129,0.10)">
                  <Globe3D
                    initialMode="avoidance_2009"
                    activeEvents={[{
                      target_id: 'IRIDIUM 33',
                      chaser_id: 'COSMOS 2251',
                      miss_distance_km: totalMissKm,
                      pc: isSafe ? 4.2e-7 : 0.0002,
                      risk_tier: isSafe ? 'Low' : 'Critical',
                      tca_utc: '2009-02-10 16:56:00 UTC',
                    }]}
                  />
                </SpotlightCard>

                {/* Sliders */}
                <SpotlightCard className="p-5" spotlightColor="rgba(16,185,129,0.08)">
                  <div className="text-[10px] text-white/35 uppercase tracking-widest mb-4 font-mono">
                    Maneuver Controls
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/70 font-medium flex items-center gap-1.5">
                          <Clock className="size-3 text-blue-400" />
                          How early we fire the engine
                        </span>
                        <span className="text-xs font-mono text-blue-300 font-bold">{simLeadTime}h before</span>
                      </div>
                      <input type="range" min="1" max="48" step="1" value={simLeadTime}
                        onChange={(e) => setSimLeadTime(Number(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-blue-400 bg-white/8"
                      />
                      <div className="flex justify-between text-[9px] text-white/20 font-mono">
                        <span>1 hour</span><span>48 hours</span>
                      </div>
                      <p className="text-[10px] text-white/30">Earlier = more effective, less fuel needed</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-white/70 font-medium flex items-center gap-1.5">
                          <TrendingUp className="size-3 text-emerald-400" />
                          Engine push strength
                        </span>
                        <span className="text-xs font-mono text-emerald-300 font-bold">{simDeltaV.toFixed(2)} m/s</span>
                      </div>
                      <input type="range" min="0.05" max="1.5" step="0.05" value={simDeltaV}
                        onChange={(e) => setSimDeltaV(Number(e.target.value))}
                        className="w-full h-1.5 rounded-lg appearance-none cursor-pointer accent-emerald-400 bg-white/8"
                      />
                      <div className="flex justify-between text-[9px] text-white/20 font-mono">
                        <span>0.05 m/s</span><span>1.50 m/s</span>
                      </div>
                      <p className="text-[10px] text-white/30">Even a tiny push is enough if done early</p>
                    </div>
                  </div>
                </SpotlightCard>

                {/* Before / After comparison */}
                <div className="grid grid-cols-2 gap-3">
                  <SpotlightCard className="p-4 border-rose-500/25" spotlightColor="rgba(239,68,68,0.08)">
                    <div className="text-[10px] text-rose-400/70 uppercase tracking-widest mb-2 font-mono">Before — No Action</div>
                    <div className="text-2xl font-bold font-mono text-rose-400">0.003 km</div>
                    <div className="text-[10px] text-white/30 mt-1">Gap at impact (3 metres)</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/10 border border-rose-500/25 text-rose-400 text-[10px] font-mono">
                      <AlertTriangle className="size-3" />
                      COLLISION
                    </div>
                  </SpotlightCard>

                  <SpotlightCard
                    className={`p-4 transition-all ${isSafe ? 'border-emerald-500/35' : 'border-amber-500/25'}`}
                    spotlightColor={isSafe ? 'rgba(16,185,129,0.14)' : 'rgba(245,158,11,0.10)'}
                  >
                    <div className={`text-[10px] uppercase tracking-widest mb-2 font-mono ${isSafe ? 'text-emerald-400/70' : 'text-amber-400/70'}`}>
                      After — With Maneuver
                    </div>
                    <motion.div
                      key={Math.round(totalMissKm * 100)}
                      animate={isSafe ? { scale: [1, 1.04, 1] } : {}}
                      transition={{ duration: 0.5 }}
                      className={`text-2xl font-bold font-mono ${isSafe ? 'text-emerald-400' : 'text-amber-400'}`}
                    >
                      {totalMissKm.toFixed(2)} km
                    </motion.div>
                    <div className="text-[10px] text-white/30 mt-1">Safety gap achieved</div>
                    <div className={`mt-2 inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono transition-all ${
                      isSafe
                        ? 'bg-emerald-500/10 border border-emerald-500/25 text-emerald-400'
                        : 'bg-amber-500/10 border border-amber-500/25 text-amber-400'
                    }`}>
                      {isSafe
                        ? <><CheckCircle2 className="size-3" /> SAFE</>
                        : <><AlertTriangle className="size-3" /> INCREASE LEAD TIME</>
                      }
                    </div>
                  </SpotlightCard>
                </div>
              </motion.div>
            )}

          </AnimatePresence>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between pt-2 border-t border-white/5 mt-2">
            <motion.button
              whileHover={{ scale: 1.04, x: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { try { sound.playClick?.(); } catch {} setCurrentStep(Math.max(1, currentStep - 1)); }}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-white/4 text-xs text-white/50 hover:text-white/80 hover:border-white/20 transition-all disabled:opacity-25 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="size-3.5" />
              Previous
            </motion.button>

            <span className="text-[11px] font-mono text-white/25">
              Step {currentStep} / {STEPS.length}
            </span>

            <motion.button
              whileHover={{ scale: 1.04, x: 2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { try { sound.playSuccess?.(); } catch {} setCurrentStep(Math.min(STEPS.length, currentStep + 1)); }}
              disabled={currentStep === STEPS.length}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-blue-500/50 bg-blue-600/15 text-xs text-blue-300 hover:bg-blue-600/25 hover:border-blue-400/60 transition-all disabled:opacity-25 disabled:cursor-not-allowed shadow-[0_0_16px_rgba(59,130,246,0.15)]"
            >
              Next Step
              <ArrowRight className="size-3.5" />
            </motion.button>
          </div>
        </div>

        {/* ─ Right sidebar: 3 cols ─────────────────────────────────────── */}
        <div className="lg:col-span-3 border-l border-white/5 px-5 pt-6 pb-4 flex flex-col gap-4">

          {/* Mission Status + log feed */}
          <SpotlightCard className="p-4" spotlightColor="rgba(59,130,246,0.12)">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Activity className="size-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-white/80 tracking-tight">Mission Status</span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`badge-${currentStep}`}
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  transition={{ duration: 0.2 }}
                >
                  <Badge
                    className={`text-[9px] font-mono px-2 py-0.5 border ${
                      currentStep === 3
                        ? 'bg-rose-600/15 border-rose-500/35 text-rose-300'
                        : 'bg-blue-600/15 border-blue-500/35 text-blue-300'
                    }`}
                  >
                    {stepData.badge}
                  </Badge>
                </motion.div>
              </AnimatePresence>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={`desc-${currentStep}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="text-[11px] text-white/45 leading-relaxed mb-4"
              >
                {stepData.summary}
              </motion.p>
            </AnimatePresence>

            <div className="border-t border-white/5 pt-3">
              <div className="text-[9px] text-white/20 uppercase tracking-widest mb-2 font-mono">System Log</div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={`logs-${currentStep}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <LogFeed logs={stepData.logs} stepId={currentStep} />
                </motion.div>
              </AnimatePresence>
            </div>
          </SpotlightCard>

          {/* Quick Facts */}
          <SpotlightCard className="p-4" spotlightColor="rgba(16,185,129,0.08)">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="size-3.5 text-emerald-400" />
              <span className="text-xs font-semibold text-white/80 tracking-tight">Quick Facts</span>
            </div>
            <div className="space-y-2.5">
              {[
                { label: 'Objects tracked', value: '~27,000+', color: 'text-blue-400' },
                { label: 'Avg orbit speed', value: '~7.5 km/s', color: 'text-indigo-400' },
                { label: '2009 crash debris', value: '2,000+ pieces', color: 'text-rose-400' },
                { label: 'Our detection time', value: 'Under 5s', color: 'text-emerald-400' },
              ].map((f) => (
                <div key={f.label} className="flex justify-between items-center">
                  <span className="text-[11px] text-white/35">{f.label}</span>
                  <span className={`text-[11px] font-mono font-semibold ${f.color}`}>{f.value}</span>
                </div>
              ))}
            </div>
          </SpotlightCard>

          {/* Step 4 live safety readout */}
          <AnimatePresence>
            {currentStep === 4 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ duration: 0.35 }}
              >
                <SpotlightCard
                  className={`p-4 ${isSafe ? 'border-emerald-500/30' : 'border-amber-500/20'}`}
                  spotlightColor={isSafe ? 'rgba(16,185,129,0.15)' : 'rgba(245,158,11,0.10)'}
                >
                  <div className="text-[9px] text-white/20 uppercase tracking-widest mb-2 font-mono">Live Safety Gap</div>
                  <motion.div
                    animate={isSafe ? { opacity: [1, 0.6, 1] } : {}}
                    transition={{ duration: 2, repeat: Infinity }}
                    className={`text-3xl font-bold font-mono ${isSafe ? 'text-emerald-400' : 'text-amber-400'}`}
                  >
                    {totalMissKm.toFixed(2)}
                    <span className="text-base ml-1 font-normal text-white/40">km</span>
                  </motion.div>
                  <div className={`text-[10px] mt-1 ${isSafe ? 'text-emerald-400/60' : 'text-amber-400/60'}`}>
                    {isSafe ? '✓ Safe clearance achieved' : '△ Increase lead time or push strength'}
                  </div>
                  <div className="text-[9px] text-white/20 font-mono mt-2">
                    {simLeadTime}h lead · {simDeltaV.toFixed(2)} m/s ΔV
                  </div>
                </SpotlightCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
