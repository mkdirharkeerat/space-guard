import React, { useState } from 'react';
import { Target, Compass, ZoomIn, ZoomOut } from 'lucide-react';
import { formatDistance, formatScientific } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function BPlaneVisualizer({ selectedEvent }) {
  const [zoomLevel, setZoomLevel] = useState(1);

  const targetName = selectedEvent?.target_id || 'IRIDIUM 33';
  const chaserName = selectedEvent?.chaser_id || 'COSMOS 2251';
  const missKm = selectedEvent?.miss_distance_km ?? 0.003;
  const pc = selectedEvent?.pc ?? 0.0002;
  const isCritical = pc > 1e-4;

  const scale = 80 * zoomLevel;
  const chaserX = (missKm * scale * 0.7);
  const chaserY = -(missKm * scale * 0.7);

  const sigma1_radius = 0.5 * scale;
  const sigma2_radius = 1.0 * scale;
  const sigma3_radius = 1.5 * scale;
  const hbr_radius = Math.max(3, 0.010 * scale);

  return (
    <Card className="border-border/80 bg-card/60 backdrop-blur-md shadow-sm font-sans">
      <CardHeader className="pb-4 border-b border-border/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
              <Target className="size-5" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold tracking-tight text-foreground">
                B-Plane (Encounter Cross-Section) Visualizer
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                2D Isotropic Gaussian Uncertainty & Hard-Body Collision Cross-Section
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.25))}
              className="size-8 text-muted-foreground"
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <span className="text-xs font-mono text-muted-foreground px-1">{zoomLevel.toFixed(2)}x</span>
            <Button
              variant="outline"
              size="icon-sm"
              onClick={() => setZoomLevel(Math.min(3.0, zoomLevel + 0.25))}
              className="size-8 text-muted-foreground"
            >
              <ZoomIn className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-4">
        {/* SVG Canvas Area */}
        <div className="relative w-full h-[360px] bg-background/80 rounded-xl border border-border overflow-hidden flex items-center justify-center">
          <svg
            viewBox="-220 -180 440 360"
            className="w-full h-full cursor-crosshair select-none"
          >
            {/* Coordinate Axes */}
            <line x1="-200" y1="0" x2="200" y2="0" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="0" y1="-160" x2="0" y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />

            {/* Covariance Rings */}
            <circle cx="0" cy="0" r={sigma3_radius} fill="none" stroke="rgba(148, 163, 184, 0.25)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r={sigma2_radius} fill="none" stroke="rgba(6, 182, 212, 0.35)" strokeWidth="1.2" strokeDasharray="4 4" />
            <circle cx="0" cy="0" r={sigma1_radius} fill="rgba(16, 185, 129, 0.08)" stroke="rgba(16, 185, 129, 0.5)" strokeWidth="1.5" />

            {/* Labels */}
            <text x={sigma1_radius + 4} y="-6" fill="#10B981" fontSize="9" fontFamily="monospace">1σ (500m)</text>
            <text x={sigma2_radius + 4} y="-6" fill="#06B6D4" fontSize="9" fontFamily="monospace">2σ (1.0km)</text>
            <text x={sigma3_radius + 4} y="-6" fill="#64748B" fontSize="9" fontFamily="monospace">3σ (1.5km)</text>

            {/* Target Satellite at Center */}
            <circle cx="0" cy="0" r={hbr_radius} fill="#10B981" />
            <text x="8" y="14" fill="#E2E8F0" fontSize="10" fontWeight="bold" fontFamily="monospace">
              {targetName} (Target)
            </text>

            {/* Miss Vector */}
            <line
              x1="0"
              y1="0"
              x2={chaserX}
              y2={chaserY}
              stroke={isCritical ? '#EF4444' : '#F59E0B'}
              strokeWidth="1.5"
              strokeDasharray="2 2"
            />

            {/* Chaser Piercing Point */}
            <g transform={`translate(${chaserX}, ${chaserY})`}>
              <circle cx="0" cy="0" r="5" fill={isCritical ? '#EF4444' : '#F59E0B'} />
              <text x="10" y="-3" fill={isCritical ? '#F87171' : '#FBBF24'} fontSize="10" fontWeight="bold" fontFamily="monospace">
                {chaserName} (Chaser)
              </text>
              <text x="10" y="9" fill="#94A3B8" fontSize="9" fontFamily="monospace">
                Δr = {formatDistance(missKm)}
              </text>
            </g>
          </svg>

          {/* HUD Inset Box */}
          <div className="absolute bottom-3 left-3 p-3 rounded-lg bg-card/90 border border-border/80 text-xs font-mono text-muted-foreground flex flex-col gap-1 backdrop-blur-md">
            <div className="flex items-center gap-1.5 text-foreground font-medium">
              <Compass className="size-3.5 text-primary" />
              <span>B-Plane Coordinates (ξ, ζ)</span>
            </div>
            <span>Origin: Target Satellite (0,0)</span>
            <span>Collision Cross-Section: HBR = 10 m</span>
            <div className="flex items-center gap-1.5 pt-0.5">
              <span>Collision Pc:</span>
              <span className={`font-semibold ${isCritical ? 'text-rose-400' : 'text-amber-400'}`}>
                {formatScientific(pc)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-xs text-muted-foreground bg-secondary/20 p-3.5 rounded-xl border border-border/60 leading-relaxed">
          <strong className="text-foreground">Foster/Alfano Formulation:</strong> In the encounter frame perpendicular to relative velocity, the 3D collision integral reduces to a 2D Gaussian density over the hard-body circle of radius <code className="text-primary font-mono">HBR</code>. Because <code className="text-primary font-mono">HBR ≪ σ</code>, the analytic formula delivers exact match to numerical quadrature in under 10µs.
        </p>
      </CardContent>
    </Card>
  );
}
