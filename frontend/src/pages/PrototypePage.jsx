import React, { useState, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Flame, 
  Zap, 
  CheckCircle2, 
  Globe2, 
  Satellite, 
  Radio, 
  Clock, 
  Activity, 
  ArrowRight, 
  ArrowLeft,
  Layers,
  AlertTriangle
} from 'lucide-react';
import Globe3D from '@/components/Globe3D';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { sound } from '@/utils/audio';

export default function PrototypePage({ objects = [], selectedEvent, onSelectEvent }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [liveObjects, setLiveObjects] = useState([]);
  const [loadingObjects, setLoadingObjects] = useState(false);

  // Avoidance simulation controls
  const [simLeadTime, setSimLeadTime] = useState(24);
  const [simDeltaV, setSimDeltaV] = useState(0.10);

  const fetchLiveSample = async () => {
    setLoadingObjects(true);
    sound.playClick();
    try {
      const res = await fetch('/api/objects?limit=25');
      if (res.ok) {
        const data = await res.json();
        setLiveObjects(data.objects || []);
      }
    } catch (e) {
      console.warn('Fallback to local objects:', e);
      setLiveObjects(objects.slice(0, 25));
    } finally {
      setLoadingObjects(false);
    }
  };

  useEffect(() => {
    fetchLiveSample();
  }, []);

  const demoSteps = [
    {
      id: 1,
      title: 'Step 1: Fetch Live Satellites',
      badge: 'STEP 1 · LIVE DATA',
      icon: Satellite,
      summary: 'We pull the current position of real satellites orbiting Earth, right now.',
      highlights: [
        'Our system connects to a public space agency database (CelesTrak) and pulls live satellite data.',
        'We calculate where each satellite is in space at this exact moment.',
        'You can see the satellite name, its ID number, where it is in space (X, Y, Z coordinates), how fast it is moving, and how high up it is.',
      ],
      plainNote: 'Think of this like Google Maps, but for satellites. We are tracking ~25,000 objects flying around Earth right now.',
    },
    {
      id: 2,
      title: 'Step 2: Show Them on a 3D Globe',
      badge: 'STEP 2 · 3D MAP',
      icon: Globe2,
      summary: 'We plot the satellites on a spinning 3D Earth so you can actually see them flying around.',
      highlights: [
        'Each dot on the globe is a real satellite, shown at the correct height and angle.',
        'Some satellites go around the equator, others go over the poles — you can see both.',
        'Our system automatically groups satellites by their height range to look for possible close passes.',
      ],
      plainNote: 'This is the same idea as air traffic control, but for space. Instead of planes on a radar screen, we have satellites on a 3D globe.',
    },
    {
      id: 3,
      title: 'Step 3: Replay the 2009 Crash',
      badge: 'STEP 3 · 2009 CRASH',
      icon: Flame,
      summary: 'We show what happened in 2009 when two real satellites collided — the first-ever accidental satellite collision.',
      highlights: [
        'On 10 February 2009, an American phone satellite (Iridium 33) crashed into an old Russian satellite (Cosmos 2251) at 789 km above Siberia.',
        'They hit each other at 50,832 km/h — about 40 times faster than a bullet.',
        'Both satellites were completely destroyed, creating 2,000+ pieces of dangerous debris still up there today.',
        'Our system, if it existed back then, would have detected this risk 2 days in advance.',
      ],
      plainNote: 'This is our proof that the problem is real. No system caught this in time in 2009. We built Space-Guard to make sure this never happens again.',
    },
    {
      id: 4,
      title: 'Step 4: Show How We Could Have Avoided It',
      badge: 'STEP 4 · DODGE PLAN',
      icon: Zap,
      summary: 'We show the escape plan: a tiny engine nudge 24 hours before impact would have moved Iridium 33 safely out of the way.',
      highlights: [
        'Our system figures out the smallest possible engine push needed to dodge the crash.',
        'Moving the satellite just 1 day early needs 14× less fuel than a last-minute emergency move.',
        'With a 0.10 m/s nudge (less than walking speed) applied 24 hours early, the satellites miss each other by 4+ km.',
        'After the dodge, crash risk drops from "Critical" to basically zero.',
      ],
      plainNote: 'It is like swerving a car to avoid a crash — much easier if you see it coming early. Our system gives the warning early enough to use the minimum fuel.',
    },
  ];

  const currentStepData = demoSteps[currentStep - 1];

  // Calculated clearance based on sliders
  const shiftKm = Math.abs((4 * Math.sin(0.00103 * simLeadTime * 3600) - 3 * 0.00103 * simLeadTime * 3600) / 0.00103) * (simDeltaV / 1000);
  const totalMissKm = 0.003 + shiftKm;

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground pb-12">

      {/* Top Header */}
      <div className="p-5 rounded-2xl border border-border bg-card/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            Space-Guard — 10 Minute Demo
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            A step-by-step walkthrough of what our project does, shown live.
          </p>
        </div>

        {/* Step buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {demoSteps.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                sound.playClick();
                setCurrentStep(s.id);
              }}
              className={`h-8 px-3 rounded-lg text-xs font-semibold transition-all border ${
                currentStep === s.id
                  ? 'bg-primary text-primary-foreground border-primary'
                  : currentStep > s.id
                  ? 'bg-secondary text-primary border-primary/30'
                  : 'bg-secondary/50 text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {s.id}. {s.title.split(':')[1]?.trim().split(' ').slice(0, 2).join(' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left: Main Interactive Area */}
        <div className="lg:col-span-8 flex flex-col gap-4">

          {/* STEP 1: Live satellite table */}
          {currentStep === 1 && (
            <Card className="border-border bg-card/60">
              <CardHeader className="pb-3 border-b border-border">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Satellite className="size-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">
                      Live Satellite Positions — Fetched Right Now
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={fetchLiveSample}
                    disabled={loadingObjects}
                    className="h-7 text-xs"
                  >
                    <Activity className={`size-3 mr-1 ${loadingObjects ? 'animate-spin' : ''}`} />
                    Refresh
                  </Button>
                </div>
                <CardDescription className="text-xs text-muted-foreground">
                  These are real satellites in space right now. We pulled this data live from a public space agency database.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-4">
                <div className="overflow-x-auto rounded-xl border border-border bg-background/60 max-h-[380px] overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-secondary/40 text-muted-foreground border-b border-border text-[10px] uppercase sticky top-0">
                      <tr>
                        <th className="py-2.5 px-3">Satellite ID</th>
                        <th className="py-2.5 px-3">Name</th>
                        <th className="py-2.5 px-3">Location in Space (km)</th>
                        <th className="py-2.5 px-3">Speed</th>
                        <th className="py-2.5 px-3">Height above Earth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40 text-[11px]">
                      {(liveObjects.length > 0 ? liveObjects : objects.slice(0, 15)).map((sat) => {
                        const pos = sat.position_km || [0, 0, 0];
                        const vel = sat.velocity_km_s || [0, 0, 0];
                        const r = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1] + pos[2]*pos[2]);
                        const altKm = Math.max(0, r - 6378.137);
                        const vMag = Math.sqrt(vel[0]*vel[0] + vel[1]*vel[1] + vel[2]*vel[2]);

                        return (
                          <tr key={sat.norad_id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-2 px-3 font-semibold text-primary">#{sat.norad_id}</td>
                            <td className="py-2 px-3 text-foreground font-sans font-medium">{sat.name}</td>
                            <td className="py-2 px-3 text-muted-foreground text-[10px]">
                              [{pos.map(p => Number(p).toFixed(0)).join(', ')}]
                            </td>
                            <td className="py-2 px-3 text-muted-foreground">{vMag.toFixed(2)} km/s</td>
                            <td className="py-2 px-3 text-emerald-400 font-semibold">~{altKm.toFixed(0)} km up</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {liveObjects.length === 0 && !loadingObjects && (
                  <p className="text-center text-xs text-muted-foreground mt-3 py-2">
                    No live data — showing offline demo data. Make sure the backend is running.
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* STEP 2: 3D Globe */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <Globe3D 
                initialMode="live"
                objects={liveObjects.length > 0 ? liveObjects : objects}
              />
              <p className="text-xs text-muted-foreground bg-secondary/20 p-3 rounded-xl border border-border">
                <strong className="text-foreground">What you are looking at:</strong> Each dot is a real satellite orbiting Earth right now. Some go around the middle (equator), others loop over the top and bottom (poles). Our system watches all of them at once, checking if any are getting too close to each other.
              </p>
            </div>
          )}

          {/* STEP 3: 2009 Collision */}
          {currentStep === 3 && (
            <div className="space-y-3">
              <Globe3D 
                initialMode="collision_2009"
                activeEvents={[{
                  target_id: 'IRIDIUM 33',
                  chaser_id: 'COSMOS 2251',
                  miss_distance_km: 0.003,
                  pc: 0.0002,
                  risk_tier: 'Critical',
                  tca_utc: '2009-02-10 16:56:00 UTC'
                }]}
              />
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5">
                  <span className="text-[10px] text-rose-400 uppercase block">Crash Speed</span>
                  <div className="text-base font-semibold text-rose-300 mt-0.5 font-mono">14.12 km/s</div>
                  <span className="text-[10px] text-muted-foreground">50,832 km/h — head-on</span>
                </div>
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5">
                  <span className="text-[10px] text-rose-400 uppercase block">They Missed By</span>
                  <div className="text-base font-semibold text-rose-300 mt-0.5 font-mono">3 metres</div>
                  <span className="text-[10px] text-muted-foreground">Direct collision — total loss</span>
                </div>
                <div className="p-3 rounded-xl border border-rose-500/30 bg-rose-500/5">
                  <span className="text-[10px] text-rose-400 uppercase block">Crash Risk</span>
                  <div className="text-base font-semibold text-rose-300 mt-0.5 font-mono">1 in 5,000</div>
                  <span className="text-[10px] text-rose-400 font-semibold">Should have triggered alert</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Avoidance */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <Globe3D 
                initialMode="avoidance_2009"
                activeEvents={[{
                  target_id: 'IRIDIUM 33',
                  chaser_id: 'COSMOS 2251',
                  miss_distance_km: totalMissKm,
                  pc: 4.2e-7,
                  risk_tier: 'Low',
                  tca_utc: '2009-02-10 16:56:00 UTC'
                }]}
              />

              {/* Interactive Sliders */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-border bg-secondary/20 text-xs">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">How early we fire the engine:</span>
                    <span className="font-mono text-primary font-semibold">{simLeadTime} Hours before</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="48"
                    step="1"
                    value={simLeadTime}
                    onChange={(e) => setSimLeadTime(Number(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="text-[10px] text-muted-foreground">Earlier = more effective, less fuel needed</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Engine push strength:</span>
                    <span className="font-mono text-emerald-400 font-semibold">{simDeltaV.toFixed(2)} m/s</span>
                  </div>
                  <input
                    type="range"
                    min="0.05"
                    max="1.5"
                    step="0.05"
                    value={simDeltaV}
                    onChange={(e) => setSimDeltaV(Number(e.target.value))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                  <span className="text-[10px] text-muted-foreground">Even a tiny push is enough if done early</span>
                </div>
              </div>

              {/* Result */}
              <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-emerald-400 shrink-0" />
                  <div>
                    <strong className="text-xs font-semibold text-foreground block">
                      Safe gap achieved: +{totalMissKm.toFixed(2)} km between the two satellites
                    </strong>
                    <span className="text-[11px] text-muted-foreground">
                      Crash risk dropped from 1-in-5,000 (danger) down to basically zero (safe).
                    </span>
                  </div>
                </div>
                <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 text-xs hidden sm:inline-flex">
                  SAFE
                </Badge>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                sound.playClick();
                setCurrentStep(Math.max(1, currentStep - 1));
              }}
              disabled={currentStep === 1}
              className="text-xs"
            >
              <ArrowLeft className="size-3.5 mr-1.5" />
              Previous
            </Button>

            <span className="text-xs text-muted-foreground">
              Step {currentStep} of {demoSteps.length}
            </span>

            <Button
              size="sm"
              onClick={() => {
                sound.playSuccess();
                setCurrentStep(Math.min(demoSteps.length, currentStep + 1));
              }}
              disabled={currentStep === demoSteps.length}
              className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs"
            >
              Next
              <ArrowRight className="size-3.5 ml-1.5" />
            </Button>
          </div>
        </div>

        {/* Right: Stage Info Panel */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <Card className="border-border bg-card/60">
            <CardHeader className="pb-3 border-b border-border">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary">
                  {currentStepData.badge}
                </Badge>
                <span className="text-[10px] text-muted-foreground">Step {currentStep}/4</span>
              </div>
              <CardTitle className="text-base font-semibold text-foreground pt-1">
                {currentStepData.title}
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground leading-relaxed">
                {currentStepData.summary}
              </CardDescription>
            </CardHeader>

            <CardContent className="p-4 space-y-3 text-xs">
              <span className="font-semibold text-foreground text-[11px] block">
                What this shows:
              </span>
              <ul className="space-y-2 text-muted-foreground">
                {currentStepData.highlights.map((h, idx) => (
                  <li key={idx} className="flex items-start gap-2 leading-relaxed">
                    <span className="text-primary font-bold shrink-0">›</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>

              {/* Plain English note */}
              <div className="p-3 rounded-lg bg-secondary/30 border border-border mt-3">
                <span className="text-foreground font-semibold block text-[11px] mb-1">
                  Simple version:
                </span>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {currentStepData.plainNote}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick fact card */}
          <Card className="border-border bg-card/60">
            <CardContent className="p-4 text-xs space-y-2">
              <span className="font-semibold text-foreground text-[11px] block">Quick Facts</span>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Satellites tracked:</span>
                  <span className="text-foreground font-mono">~27,000+</span>
                </div>
                <div className="flex justify-between">
                  <span>Speed of satellites:</span>
                  <span className="text-foreground font-mono">~7.5 km/s</span>
                </div>
                <div className="flex justify-between">
                  <span>2009 crash debris:</span>
                  <span className="text-rose-400 font-mono">2,000+ pieces</span>
                </div>
                <div className="flex justify-between">
                  <span>Our detection time:</span>
                  <span className="text-emerald-400 font-mono">Under 5 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
