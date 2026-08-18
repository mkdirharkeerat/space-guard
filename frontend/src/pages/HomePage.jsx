import React from 'react';
import { Link } from 'react-router-dom';
import {
  Globe2,
  Radar,
  Rocket,
  History,
  Target,
  Satellite,
  ArrowRight,
  Activity,
  Shield,
  Zap,
  Flame,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import FadeIn from '@/components/FadeIn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BlurText from '@/components/react-bits/BlurText';
import CountUp from '@/components/react-bits/CountUp';
import SpotlightCard from '@/components/react-bits/SpotlightCard';
import DotGrid from '@/components/react-bits/DotGrid';
import { sound } from '@/utils/audio';

export default function HomePage({ backendStatus, scanData }) {
  const features = [
    {
      to: '/globe',
      title: '3D Orbital Radar',
      icon: Globe2,
      tag: '3D TELEMETRY',
      desc: 'Interactive Earth with real satellite orbits, conjunction nodes, and 2009 collision simulation.',
    },
    {
      to: '/screening',
      title: 'Conjunction Screening',
      icon: Radar,
      tag: 'FAST FILTER',
      desc: 'Two-stage screening filter with golden-section TCA search and Foster/Alfano analytic Pc.',
    },
    {
      to: '/maneuver',
      title: 'Maneuver Planner',
      icon: Rocket,
      tag: 'SVD OPTIMIZER',
      desc: 'Clohessy-Wiltshire impulsive thruster optimization demonstrating 14× early fuel scaling.',
    },
    {
      to: '/historical',
      title: '2009 Collision Replay',
      icon: History,
      tag: 'CASE STUDY',
      desc: 'Benchmark against real Iridium 33 / Cosmos 2251 pre-collision TLEs and counterfactual avoidance.',
    },
    {
      to: '/bplane',
      title: 'B-Plane Geometry',
      tag: '2D GAUSSIAN',
      desc: 'Encounter cross-section with 1σ, 2σ, 3σ Gaussian uncertainty contours and 10m hard-body radius.',
    },
    {
      to: '/catalog',
      title: 'Satellite Catalog',
      icon: Satellite,
      tag: 'GCRS / ECI',
      desc: 'Live propagated satellite ephemeris, altitude bands, and velocity vectors from CelesTrak.',
    },
  ];

  const pipelineSteps = [
    {
      step: '01',
      title: 'TLE Ingestion & SGP4',
      desc: 'Ingests active Two-Line Element sets and propagates coordinates to GCRS/ECI frame in real-time.',
      badge: 'PROPAGATION',
    },
    {
      step: '02',
      title: 'Coarse Altitude Filter',
      desc: 'Discards non-overlapping apogee/perigee altitude bands within ±50 km margin to keep compute fast.',
      badge: 'STAGE 1',
    },
    {
      step: '03',
      title: 'TCA Search & Analytic Pc',
      desc: 'Golden-section scalar minimization pinpoints exact TCA; Foster/Alfano calculates 2D Gaussian Pc.',
      badge: 'STAGE 2',
    },
    {
      step: '04',
      title: 'CW Maneuver Optimization',
      desc: 'Calculates impulsive ΔV thruster burn via SVD of Φ_rv, establishing safe orbital clearance.',
      badge: 'AVOIDANCE',
    },
  ];

  return (
    <div className="relative flex flex-col gap-12 pb-12 font-sans">
      {/* Ambient background dot grid */}
      <DotGrid className="opacity-40" />

      {/* Hero Section */}
      <FadeIn>
        <section className="relative space-y-6 pt-4">
          <div className="space-y-4 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="font-normal text-xs bg-secondary/80 text-secondary-foreground border border-border">
                Smart India Hackathon 2026 · Problem #17
              </Badge>
              <Badge variant="outline" className="font-normal text-xs border-primary/30 text-primary">
                Foster/Alfano 2D Gaussian Pc
              </Badge>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl sm:text-5xl font-semibold tracking-tight leading-tight text-foreground">
                <BlurText 
                  text="Autonomous Orbital Conjunction Assessment & Collision Avoidance" 
                  delay={40}
                  className="inline-block"
                />
              </h1>
              <p className="text-muted-foreground text-base sm:text-lg leading-relaxed pt-1">
                Real-time orbital collision risk screening using Foster/Alfano analytic Gaussian models,
                integrated with Clohessy-Wiltshire impulsive maneuver optimization.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md">
              <Link to="/screening" onClick={() => sound.playClick()}>
                <Activity className="size-4 mr-1.5" />
                Launch Screening
                <ArrowRight className="size-4 ml-1.5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-border hover:bg-accent/60 font-medium">
              <Link to="/globe" onClick={() => sound.playClick()}>
                <Globe2 className="size-4 mr-1.5 text-primary" />
                Open 3D Radar
              </Link>
            </Button>
            <Button asChild variant="ghost" size="lg" className="text-muted-foreground hover:text-foreground font-medium">
              <Link to="/historical" onClick={() => sound.playClick()}>
                <History className="size-4 mr-1.5 text-rose-400" />
                2009 Collision Replay
              </Link>
            </Button>
          </div>

          {/* Stats strip with CountUp animation */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="rounded-xl border border-border/80 bg-card/50 backdrop-blur-md p-4 flex flex-col justify-between">
              <span className="text-xs text-muted-foreground font-medium">Catalog objects</span>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-mono mt-1">
                <CountUp to={27000} separator="," suffix="+" duration={1.5} />
              </div>
              <span className="text-[11px] text-muted-foreground/70 mt-0.5">Active LEO debris</span>
            </div>

            <div className="rounded-xl border border-border/80 bg-card/50 backdrop-blur-md p-4 flex flex-col justify-between">
              <span className="text-xs text-muted-foreground font-medium">Relative velocity</span>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-foreground font-mono mt-1">
                <CountUp to={14.1} decimals={1} suffix=" km/s" duration={1.8} />
              </div>
              <span className="text-[11px] text-muted-foreground/70 mt-0.5">Head-on closing rate</span>
            </div>

            <div className="rounded-xl border border-border/80 bg-card/50 backdrop-blur-md p-4 flex flex-col justify-between">
              <span className="text-xs text-muted-foreground font-medium">Analytic Pc latency</span>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-emerald-400 font-mono mt-1">
                &lt; 10 µs
              </div>
              <span className="text-[11px] text-muted-foreground/70 mt-0.5">Per candidate pair</span>
            </div>

            <div className="rounded-xl border border-border/80 bg-card/50 backdrop-blur-md p-4 flex flex-col justify-between">
              <span className="text-xs text-muted-foreground font-medium">Fuel efficiency</span>
              <div className="text-2xl sm:text-3xl font-semibold tracking-tight text-primary font-mono mt-1">
                <CountUp to={14} suffix="×" duration={1.4} />
              </div>
              <span className="text-[11px] text-muted-foreground/70 mt-0.5">At 24h prior burn</span>
            </div>
          </div>
        </section>
      </FadeIn>

      {/* Feature Modules Bento Grid */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-foreground">
            System Modules & Tools
          </h2>
          <p className="text-sm text-muted-foreground">
            Interactive workstations for real-time screening, orbital telemetry, and maneuver execution.
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
                className="group"
              >
                <SpotlightCard className="h-full p-5 flex flex-col justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="size-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-105 transition-transform">
                        <Icon className="size-4" />
                      </div>
                      <Badge variant="outline" className="text-[10px] font-mono border-border text-muted-foreground">
                        {f.tag}
                      </Badge>
                    </div>
                    <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                      {f.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground pt-2 border-t border-border/50 transition-colors">
                    <span>Open Module</span>
                    <ArrowRight className="size-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </SpotlightCard>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4-Stage Orbital Mechanics Pipeline */}
      <section className="rounded-2xl border border-border/80 bg-card/40 backdrop-blur-md p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-secondary flex items-center justify-center text-primary">
            <Cpu className="size-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
              Four-Stage Orbital Mechanics Architecture
            </h2>
            <p className="text-xs text-muted-foreground">
              Deterministic physics pipeline from TLE catalog ingestion to impulsive ΔV avoidance burns.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {pipelineSteps.map((s) => (
            <div key={s.step} className="rounded-xl border border-border/60 bg-secondary/30 p-4 space-y-2 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold font-mono text-primary">{s.step}</span>
                  <Badge variant="outline" className="text-[9px] font-mono border-border/80 text-muted-foreground">
                    {s.badge}
                  </Badge>
                </div>
                <h4 className="text-sm font-medium text-foreground">{s.title}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Historical Validation Banner */}
      <section className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <Badge variant="outline" className="text-rose-400 border-rose-500/30 font-medium text-[11px]">
            Historical Benchmark
          </Badge>
          <h3 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            2009 Iridium 33 / Cosmos 2251 Collision Replay
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Evaluated against real pre-collision TLEs (epoch 09041), Space-Guard flags a Critical Alert (Pc &gt; 10⁻⁴) 48h prior and demonstrates how an impulsive 0.10 m/s burn creates +4.83 km clearance.
          </p>
        </div>

        <Button asChild variant="outline" className="border-rose-500/30 hover:bg-rose-500/10 text-foreground font-medium shrink-0">
          <Link to="/historical" onClick={() => sound.playClick()}>
            <span>Launch Replay Lab</span>
            <ArrowRight className="size-4 ml-1.5" />
          </Link>
        </Button>
      </section>
    </div>
  );
}
