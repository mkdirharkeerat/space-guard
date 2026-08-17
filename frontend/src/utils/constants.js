// Space-Guard Constants & Helper Functions (Neo-Brutalist Theme)

export const RISK_TIERS = {
  CRITICAL: {
    name: 'Critical',
    threshold: 'Pc > 1.0e-4',
    color: '#FF3333',
    bgClass: 'bg-neo-red text-white border-2 border-black',
    badgeClass: 'bg-neo-red text-white font-black border-2 border-black shadow-neo-sm uppercase',
    boxClass: 'neo-box-red',
    pillClass: 'bg-[#FF3333] text-white border-2 border-black font-black shadow-neo-sm',
  },
  HIGH: {
    name: 'High',
    threshold: '1.0e-5 < Pc ≤ 1.0e-4',
    color: '#FF6B00',
    bgClass: 'bg-neo-orange text-white border-2 border-black',
    badgeClass: 'bg-neo-orange text-white font-black border-2 border-black shadow-neo-sm uppercase',
    boxClass: 'bg-neo-orange text-white border-3 border-black shadow-neo',
    pillClass: 'bg-[#FF6B00] text-white border-2 border-black font-black shadow-neo-sm',
  },
  MODERATE: {
    name: 'Moderate',
    threshold: '1.0e-6 < Pc ≤ 1.0e-5',
    color: '#FFE600',
    bgClass: 'bg-neo-yellow text-black border-2 border-black',
    badgeClass: 'bg-neo-yellow text-black font-black border-2 border-black shadow-neo-sm uppercase',
    boxClass: 'neo-box-yellow',
    pillClass: 'bg-[#FFE600] text-black border-2 border-black font-black shadow-neo-sm',
  },
  LOW: {
    name: 'Low',
    threshold: 'Pc ≤ 1.0e-6',
    color: '#00FF66',
    bgClass: 'bg-neo-green text-black border-2 border-black',
    badgeClass: 'bg-neo-green text-black font-black border-2 border-black shadow-neo-sm uppercase',
    boxClass: 'neo-box-green',
    pillClass: 'bg-[#00FF66] text-black border-2 border-black font-black shadow-neo-sm',
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
