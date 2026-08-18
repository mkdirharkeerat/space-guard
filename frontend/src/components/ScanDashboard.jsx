import React, { useState } from 'react';
import { 
  Radar, 
  ShieldAlert, 
  Clock, 
  Activity, 
  Filter, 
  Download, 
  Radio, 
  Zap,
  ArrowRight,
  Shield,
  Search,
  CheckCircle2
} from 'lucide-react';
import { sound } from '@/utils/audio';
import { RISK_TIERS, formatScientific, formatDistance, formatVelocity, getTierData } from '@/utils/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CountUp from '@/components/react-bits/CountUp';

export default function ScanDashboard({ 
  scanData, 
  onTriggerScan, 
  isScanning, 
  selectedEvent, 
  onSelectEvent,
  onOpenManeuver,
  onOpenBPlane
}) {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const events = scanData?.events || [];

  const filteredEvents = events.filter(ev => {
    const tier = (ev.risk_tier || '').toUpperCase();
    const matchesFilter = 
      activeFilter === 'ALL' ? true :
      activeFilter === 'CRITICAL' ? tier.includes('CRIT') :
      activeFilter === 'HIGH' ? tier.includes('HIGH') :
      activeFilter === 'MODERATE' ? tier.includes('MOD') :
      tier.includes('LOW');

    const matchesSearch = 
      ev.target_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ev.chaser_id.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const criticalCount = events.filter(e => (e.risk_tier || '').toLowerCase().includes('crit') || e.pc > 1e-4).length;
  const highCount = events.filter(e => (e.risk_tier || '').toLowerCase().includes('high')).length;

  const handleExportReport = () => {
    sound.playClick();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `space-guard-conjunction-report-${new Date().toISOString().slice(0,10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getBadgeVariant = (tierStr, pc) => {
    const tier = (tierStr || '').toUpperCase();
    if (tier.includes('CRIT') || pc > 1e-4) return 'destructive';
    if (tier.includes('HIGH')) return 'secondary';
    if (tier.includes('MOD')) return 'outline';
    return 'default';
  };

  return (
    <div className="flex flex-col gap-6 font-sans text-foreground">
      {/* Top Banner / Initiate Scan Bar */}
      <div className="p-6 rounded-2xl border border-border/80 bg-card/60 backdrop-blur-md flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
            <Radar className={`size-5 ${isScanning ? 'animate-spin' : ''}`} />
          </div>
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                Conjunction Screening & Triage Center
              </h1>
              <Badge variant="outline" className="font-mono text-[10px] border-primary/30 text-primary">
                SGP4 + Foster/Alfano Pc
              </Badge>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Two-stage filter: Altitude band overlap (±50km) → Golden-section TCA search → 2D Gaussian integral
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            onClick={onTriggerScan}
            disabled={isScanning}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm transition-all"
          >
            <Activity className={`size-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Scanning 24h Window...' : 'Run Conjunction Scan'}</span>
          </Button>

          {events.length > 0 && (
            <Button
              variant="outline"
              onClick={handleExportReport}
              className="border-border hover:bg-accent/60 text-xs"
            >
              <Download className="size-3.5 mr-1.5 text-primary" />
              <span>Export JSON</span>
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="bg-card/50 backdrop-blur-md border-border/80">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium">Catalog Satellites</span>
            <div className="text-2xl font-semibold tracking-tight text-foreground font-mono mt-1">
              <CountUp to={scanData?.object_count ?? 40} duration={1.2} />
            </div>
            <span className="text-[11px] text-muted-foreground/70 mt-0.5">Active LEO Objects</span>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border/80">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium">Candidate Pairs (Stage 1)</span>
            <div className="text-2xl font-semibold tracking-tight text-primary font-mono mt-1">
              <CountUp to={scanData?.candidate_pairs ?? 12} duration={1.2} />
            </div>
            <span className="text-[11px] text-muted-foreground/70 mt-0.5">±50km Altitude Overlap</span>
          </CardContent>
        </Card>

        <Card className="bg-card/50 backdrop-blur-md border-border/80">
          <CardContent className="p-4 flex flex-col justify-between">
            <span className="text-xs text-muted-foreground font-medium">Conjunctions Surfaced</span>
            <div className="text-2xl font-semibold tracking-tight text-foreground font-mono mt-1">
              <CountUp to={events.length} duration={1.2} />
            </div>
            <span className="text-[11px] text-muted-foreground/70 mt-0.5">TCA within 24 Hours</span>
          </CardContent>
        </Card>

        <Card className={`backdrop-blur-md transition-colors ${
          criticalCount > 0 
            ? 'bg-destructive/10 border-destructive/30' 
            : 'bg-card/50 border-border/80'
        }`}>
          <CardContent className="p-4 flex flex-col justify-between">
            <span className={`text-xs font-medium ${criticalCount > 0 ? 'text-destructive font-semibold' : 'text-muted-foreground'}`}>
              Critical Threats
            </span>
            <div className={`text-2xl font-semibold tracking-tight font-mono mt-1 ${criticalCount > 0 ? 'text-destructive' : 'text-emerald-400'}`}>
              {criticalCount > 0 ? `${criticalCount} Threat${criticalCount > 1 ? 's' : ''}` : 'All Clear'}
            </div>
            <span className="text-[11px] text-muted-foreground/70 mt-0.5">Pc &gt; 1.0 × 10⁻⁴ Threshold</span>
          </CardContent>
        </Card>
      </div>

      {/* Main Conjunctions List & Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Filterable Event List (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-3">
          {/* Search and Filters */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-border/80 bg-card/40 backdrop-blur-md text-xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <span className="text-muted-foreground text-[11px] uppercase mr-1 flex items-center gap-1">
                <Filter className="size-3" /> Filter:
              </span>
              {['ALL', 'CRITICAL', 'HIGH', 'MODERATE', 'LOW'].map((tier) => (
                <Button
                  key={tier}
                  variant={activeFilter === tier ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    sound.playClick();
                    setActiveFilter(tier);
                  }}
                  className={`h-7 px-2.5 text-xs font-mono transition-colors ${
                    activeFilter === tier ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}
                >
                  {tier}
                </Button>
              ))}
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search satellite..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8 pr-3 bg-secondary/50 border border-border rounded-md text-xs text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Event Cards List */}
          <div className="flex flex-col gap-2.5">
            {filteredEvents.length === 0 ? (
              <div className="p-8 text-center rounded-xl border border-dashed border-border text-muted-foreground text-xs">
                No conjunction events match the current filter.
              </div>
            ) : (
              filteredEvents.map((ev, idx) => {
                const isSelected = selectedEvent && selectedEvent.target_id === ev.target_id && selectedEvent.chaser_id === ev.chaser_id;
                const isCrit = (ev.risk_tier || '').toLowerCase().includes('crit') || ev.pc > 1e-4;

                return (
                  <div
                    key={`${ev.target_id}-${ev.chaser_id}-${idx}`}
                    onClick={() => {
                      sound.playClick();
                      onSelectEvent(ev);
                    }}
                    className={`p-4 rounded-xl cursor-pointer border transition-all ${
                      isSelected
                        ? 'bg-card border-primary/50 shadow-md ring-1 ring-primary/30'
                        : isCrit
                        ? 'bg-rose-500/5 border-rose-500/20 hover:border-rose-500/40'
                        : 'bg-card/40 border-border/70 hover:border-border hover:bg-card/80'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      {/* Satellite Pair */}
                      <div className="flex items-center gap-3.5">
                        <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isCrit ? 'bg-destructive/15 text-destructive' : 'bg-primary/10 text-primary'
                        }`}>
                          <ShieldAlert className="size-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-foreground">
                              {ev.target_id}
                            </span>
                            <span className="text-muted-foreground text-xs">×</span>
                            <span className="font-medium text-sm text-muted-foreground">
                              {ev.chaser_id}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono mt-0.5">
                            <Clock className="size-3 text-primary" />
                            <span>TCA: {ev.tca_utc}</span>
                          </div>
                        </div>
                      </div>

                      {/* Physics Metrics */}
                      <div className="flex flex-wrap items-center gap-4 text-right">
                        <div className="flex flex-col">
                          <span className="text-[10px] text-muted-foreground uppercase font-mono">Miss Distance</span>
                          <span className="font-semibold text-foreground text-xs font-mono">
                            {formatDistance(ev.miss_distance_km)}
                          </span>
                        </div>

                        {ev.relative_velocity_km_s && (
                          <div className="flex flex-col hidden sm:flex">
                            <span className="text-[10px] text-muted-foreground uppercase font-mono">Rel Velocity</span>
                            <span className="font-semibold text-foreground text-xs font-mono">
                              {Number(ev.relative_velocity_km_s).toFixed(1)} km/s
                            </span>
                          </div>
                        )}

                        <div className="flex flex-col items-end">
                          <span className="text-[10px] text-muted-foreground uppercase font-mono mb-0.5">Collision Pc</span>
                          <Badge variant={getBadgeVariant(ev.risk_tier, ev.pc)} className="font-mono text-[11px]">
                            {formatScientific(ev.pc)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Conjunction Inspector Drawer (4 cols) */}
        <div className="lg:col-span-4">
          {selectedEvent ? (
            <Card className="border-border/80 bg-card/60 backdrop-blur-md sticky top-20">
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="size-4 text-primary" />
                    <CardTitle className="text-sm font-semibold">Encounter Inspector</CardTitle>
                  </div>
                  <Badge variant={getBadgeVariant(selectedEvent.risk_tier, selectedEvent.pc)} className="font-mono text-[10px]">
                    {selectedEvent.risk_tier || 'CRITICAL'}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="p-4 space-y-4">
                {/* Pair Details */}
                <div className="space-y-1.5 p-3 rounded-lg bg-secondary/30 border border-border/50 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target:</span>
                    <span className="font-medium text-foreground">{selectedEvent.target_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chaser:</span>
                    <span className="font-medium text-foreground">{selectedEvent.chaser_id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">TCA (UTC):</span>
                    <span className="font-mono text-primary font-medium">{selectedEvent.tca_utc}</span>
                  </div>
                </div>

                {/* Physics Values */}
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">Miss Distance</span>
                    <strong className="text-sm text-foreground mt-0.5 font-semibold">
                      {formatDistance(selectedEvent.miss_distance_km)}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase">Rel Velocity</span>
                    <strong className="text-sm text-foreground mt-0.5 font-semibold">
                      {selectedEvent.relative_velocity_km_s ? `${Number(selectedEvent.relative_velocity_km_s).toFixed(2)} km/s` : '14.12 km/s'}
                    </strong>
                  </div>
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex flex-col col-span-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground uppercase">Analytic Pc (Foster/Alfano)</span>
                      <strong className="text-emerald-400 text-sm font-semibold">
                        {formatScientific(selectedEvent.pc)}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    onClick={() => {
                      sound.playClick();
                      onOpenManeuver(selectedEvent);
                    }}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs shadow-sm"
                  >
                    <Zap className="size-3.5 mr-1.5" />
                    <span>Simulate CW Avoidance Burn</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => {
                      sound.playClick();
                      onOpenBPlane(selectedEvent);
                    }}
                    className="w-full border-border hover:bg-accent/60 text-xs"
                  >
                    <span>View Encounter B-Plane</span>
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed text-center">
                  Assumes isotropic uncertainty σ = 500m & HBR = 10m combined cross-section.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/60 bg-card/40 p-8 text-center text-muted-foreground text-xs">
              Select any conjunction from the list to inspect encounter telemetry.
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
