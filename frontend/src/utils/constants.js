// Space-Guard Constants & Helper Functions (Aerospace Defense Grade)

export const RISK_TIERS = {
  CRITICAL: {
    name: 'Critical',
    threshold: 'Pc > 1.0e-4',
    color: '#EF4444',
    bgClass: 'bg-red-500/10 text-red-400 border border-red-500/30',
    badgeClass: 'bg-red-500/20 text-red-300 border border-red-500/40 font-mono font-semibold tracking-wider uppercase',
    pillClass: 'bg-red-500/20 text-red-300 border border-red-500/40 font-mono font-semibold',
  },
  HIGH: {
    name: 'High',
    threshold: '1.0e-5 < Pc ≤ 1.0e-4',
    color: '#F97316',
    bgClass: 'bg-orange-500/10 text-orange-400 border border-orange-500/30',
    badgeClass: 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono font-semibold tracking-wider uppercase',
    pillClass: 'bg-orange-500/20 text-orange-300 border border-orange-500/40 font-mono font-semibold',
  },
  MODERATE: {
    name: 'Moderate',
    threshold: '1.0e-6 < Pc ≤ 1.0e-5',
    color: '#F59E0B',
    bgClass: 'bg-amber-500/10 text-amber-400 border border-amber-500/30',
    badgeClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-semibold tracking-wider uppercase',
    pillClass: 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono font-semibold',
  },
  LOW: {
    name: 'Low',
    threshold: 'Pc ≤ 1.0e-6',
    color: '#10B981',
    bgClass: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-semibold tracking-wider uppercase',
    pillClass: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono font-semibold',
  }
};

export const DEFAULT_ASSUMPTIONS = {
  sigma_km: 0.5,           // 500m assumed 1-sigma TLE positional uncertainty
  hbr_km: 0.010,           // 10m combined hard-body radius
  mu_earth: 398600.4418,   // Earth gravitational parameter (km^3/s^2)
  r_earth: 6378.137,       // Earth equatorial radius (km)
  algorithm_screening: 'Two-stage (±50km altitude band + Scipy scalar minimization)',
  algorithm_pc: 'Analytic 2D Gaussian B-Plane Integral (Foster/Alfano formulation)',
  algorithm_maneuver: 'Clohessy-Wiltshire STM with SVD Direction Optimization',
};

export function formatScientific(num, decimals = 2) {
  if (num === null || num === undefined) return 'N/A';
  if (num === 0) return '0.00';
  if (Math.abs(num) < 0.001 || Math.abs(num) >= 10000) {
    return Number(num).toExponential(decimals);
  }
  return Number(num).toFixed(decimals);
}

export function formatDistance(km) {
  if (km === null || km === undefined) return 'N/A';
  if (km < 1) {
    return `${(km * 1000).toFixed(1)} m`;
  }
  return `${Number(km).toFixed(3)} km`;
}

export function formatVelocity(kms) {
  if (kms === null || kms === undefined) return 'N/A';
  return `${Number(kms).toFixed(2)} km/s (${(Number(kms) * 3600).toLocaleString('en-US', { maximumFractionDigits: 0 })} km/h)`;
}

export function getTierData(tierStr, pc = 0) {
  if (!tierStr) {
    if (pc > 1e-4) return RISK_TIERS.CRITICAL;
    if (pc > 1e-5) return RISK_TIERS.HIGH;
    if (pc > 1e-6) return RISK_TIERS.MODERATE;
    return RISK_TIERS.LOW;
  }
  const upper = tierStr.toUpperCase();
  if (upper.includes('CRIT')) return RISK_TIERS.CRITICAL;
  if (upper.includes('HIGH')) return RISK_TIERS.HIGH;
  if (upper.includes('MOD')) return RISK_TIERS.MODERATE;
  return RISK_TIERS.LOW;
}
