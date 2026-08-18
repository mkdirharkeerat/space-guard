import React from 'react';
import MathExplainer from '@/components/MathExplainer';
import GuideBox from '@/components/GuideBox';
import { BookOpen, Shield, Server, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DocsPage() {
  const guideSteps = [
    {
      title: 'Intellectual Honesty (§12)',
      description: 'TLEs lack covariance data, exact satellite mass, and physical dimensions. We explicitly state all assumed σ = 500m & HBR = 10m parameters.',
    },
    {
      title: 'Foster/Alfano Derivation',
      description: 'The encounter probability is calculated via an analytic 2D Gaussian integral rather than an opaque or fabricated "AI score".',
    },
    {
      title: 'Clohessy-Wiltshire STM SVD',
      description: 'The optimal impulsive avoidance burn direction is determined via SVD of Φ_rv, maximizing separation gain per m/s of ΔV.',
    },
  ];

  const apiEndpoints = [
    { method: 'GET', path: '/health', desc: 'Health check, service version, and ML triage pre-training status.' },
    { method: 'POST', path: '/scan', desc: 'Executes full two-stage screening (±50km altitude filter + Scipy TCA search + Foster/Alfano Pc).' },
    { method: 'GET', path: '/api/objects?limit=100', desc: 'Propagates catalog satellites to current UTC second in GCRS/ECI frame via SGP4.' },
    { method: 'POST', path: '/api/maneuver', desc: 'Computes optimal impulsive burn using Clohessy-Wiltshire STM SVD decomposition.' },
    { method: 'GET', path: '/api/validation/iridium-cosmos', desc: 'Replays the 2009 Iridium 33 / Cosmos 2251 collision benchmark from historical TLEs.' },
  ];

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      {/* GuideBox */}
      <GuideBox
        title="Orbital Mechanics Reference & Documentation · Evaluator Guide"
        badge="SIH 2026 SPECS"
        steps={guideSteps}
        note="Space-Guard strictly isolates physics from ML: ML acts as an acceleration surrogate, never a replacement for physical Pc."
      />

      {/* Math Explainer Section */}
      <MathExplainer />

      {/* Engineering Assumptions & Transparency */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Shield className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                Engineering Assumptions & Compliance (§12)
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Full statement of operational assumptions and parameters for evaluation judges
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-xl border border-border/70 bg-secondary/20 space-y-1.5">
              <span className="font-semibold text-foreground text-xs uppercase font-mono">Positional Uncertainty (σ)</span>
              <p className="text-muted-foreground leading-relaxed">
                Assumed isotropic Gaussian standard deviation of <strong className="text-foreground">σ = 500 m</strong> (0.5 km) representing standard SGP4 TLE precision limits.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-secondary/20 space-y-1.5">
              <span className="font-semibold text-foreground text-xs uppercase font-mono">Hard-Body Radius (HBR)</span>
              <p className="text-muted-foreground leading-relaxed">
                Combined collision cross-section of <strong className="text-foreground">HBR = 10 m</strong> (0.010 km) for typical LEO communications satellites.
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border/70 bg-secondary/20 space-y-1.5">
              <span className="font-semibold text-foreground text-xs uppercase font-mono">Impulsive Thruster Burn</span>
              <p className="text-muted-foreground leading-relaxed">
                Instantaneous velocity change modeled via Clohessy-Wiltshire relative motion in representative circular LEO orbit (r ≈ 6,787 km).
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* REST API Reference */}
      <Card className="border-border/80 bg-card/60 backdrop-blur-md shadow-sm">
        <CardHeader className="pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Server className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                FastAPI REST Backend Endpoints
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Live REST API specifications running on port 8000
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="overflow-x-auto rounded-xl border border-border/80 bg-background/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-secondary/30 text-muted-foreground border-b border-border/80 text-[11px] uppercase font-mono tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-24">Method</th>
                  <th className="py-3 px-4 w-64">Endpoint</th>
                  <th className="py-3 px-4">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 font-mono">
                {apiEndpoints.map((ep, idx) => (
                  <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                    <td className="py-3 px-4">
                      <Badge variant={ep.method === 'GET' ? 'secondary' : 'default'} className="font-mono text-[10px]">
                        {ep.method}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">{ep.path}</td>
                    <td className="py-3 px-4 text-muted-foreground font-sans">{ep.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
