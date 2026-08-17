// Space-Guard Constants & Helper Functions

export const RISK_TIERS = {
  CRITICAL: {
    name: 'Critical',
    threshold: 'Pc > 1.0e-4',
    color: '#ff3b3b',
    bgClass: 'bg-red-500/10 text-red-400 border-red-500/30',
    badgeClass: 'bg-red-500 text-black font-bold shadow-[0_0_12px_rgba(255,59,59,0.5)]',
    pulseClass: 'border-red-500 shadow-[0_0_20px_rgba(255,59,59,0.3)]',
  },
  HIGH: {
    name: 'High',
    threshold: '1.0e-5 < Pc ≤ 1.0e-4',
    color: '#ff893b',
    bgClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    badgeClass: 'bg-orange-500 text-black font-bold shadow-[0_0_12px_rgba(255,137,59,0.5)]',
    pulseClass: 'border-orange-500 shadow-[0_0_15px_rgba(255,137,59,0.3)]',
  },
  MODERATE: {
    name: 'Moderate',
    threshold: '1.0e-6 < Pc ≤ 1.0e-5',
    color: '#ffb830',
    bgClass: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    badgeClass: 'bg-yellow-400 text-black font-bold shadow-[0_0_10px_rgba(255,184,48,0.4)]',
    pulseClass: 'border-yellow-400 shadow-[0_0_12px_rgba(255,184,48,0.2)]',
  },
  LOW: {
    name: 'Low',
    threshold: 'Pc ≤ 1.0e-6',
    color: '#00ff88',
    bgClass: 'bg-hud-green/10 text-hud-green border-hud-green/30',
    badgeClass: 'bg-hud-green text-black font-bold shadow-[0_0_10px_rgba(0,255,136,0.4)]',
    pulseClass: 'border-hud-green shadow-[0_0_10px_rgba(0,255,136,0.2)]',
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
