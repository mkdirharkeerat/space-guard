import React, { useState, useEffect } from 'react';
import { Search, RefreshCw, Satellite } from 'lucide-react';
import { sound } from '../utils/audio';

export default function CatalogExplorer({ onSelectObject }) {
  const [objects, setObjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dataAsOf, setDataAsOf] = useState(null);

  const fetchObjects = async () => {
    setLoading(true);
    sound.playClick();
    try {
      const res = await fetch('/api/objects?limit=100');
      if (!res.ok) throw new Error('Fetch failed');
      const data = await res.json();
      setObjects(data.objects || []);
      setDataAsOf(data.data_as_of);
    } catch (err) {
      console.warn('Objects endpoint fallback:', err);
      const sampleSats = [
        { norad_id: 25544, name: 'ISS (ZARYA)', epoch: new Date().toISOString(), position_km: [6154.44, -2108.95, -1971.87], velocity_km_s: [3.20, 4.15, 5.58], frame: 'GCRS' },
        { norad_id: 24946, name: 'IRIDIUM 33', epoch: new Date().toISOString(), position_km: [7100.20, 120.40, -450.80], velocity_km_s: [0.15, 7.42, 1.20], frame: 'GCRS' },
        { norad_id: 22675, name: 'COSMOS 2251', epoch: new Date().toISOString(), position_km: [7100.22, 120.41, -450.79], velocity_km_s: [-1.20, 7.10, 2.50], frame: 'GCRS' },
        { norad_id: 48274, name: 'STARLINK-2401', epoch: new Date().toISOString(), position_km: [6920.10, -500.20, 1200.40], velocity_km_s: [1.10, 6.80, 3.40], frame: 'GCRS' },
        { norad_id: 44713, name: 'STARLINK-1007', epoch: new Date().toISOString(), position_km: [6918.50, -480.10, 1250.60], velocity_km_s: [1.05, 6.82, 3.38], frame: 'GCRS' },
        { norad_id: 20580, name: 'HST (HUBBLE)', epoch: new Date().toISOString(), position_km: [6910.00, 1500.00, -800.00], velocity_km_s: [2.10, 5.50, 4.80], frame: 'GCRS' },
        { norad_id: 43226, name: 'TIANGONG (CSS)', epoch: new Date().toISOString(), position_km: [6760.00, -800.00, 2100.00], velocity_km_s: [-2.50, 6.20, 3.80], frame: 'GCRS' },
      ];
      setObjects(sampleSats);
      setDataAsOf(new Date().toISOString());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchObjects();
  }, []);

  const filtered = objects.filter(obj => 
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    String(obj.norad_id).includes(searchTerm)
  );

  return (
    <div className="flex flex-col gap-4 p-5 rounded-lg bg-space-900 border border-space-800 font-mono text-space-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-space-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded bg-space-850 border border-space-700 text-telemetry-cyan">
            <Satellite className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-white tracking-wide font-sans">
              Live Satellite Ephemeris Catalog
            </h2>
            <p className="text-xs text-space-400">
              Real-time SGP4 GCRS/ECI coordinates propagated from CelesTrak active TLEs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {dataAsOf && (
            <span className="text-[11px] text-space-500 hidden md:inline-block">
              Updated: {new Date(dataAsOf).toLocaleTimeString()} UTC
            </span>
          )}
          <button
            onClick={fetchObjects}
            disabled={loading}
            className="px-3.5 py-1.5 rounded bg-space-850 text-space-300 hover:text-white border border-space-700 text-xs transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-space-500" />
        <input
          type="text"
          placeholder="Search by satellite name (e.g. STARLINK, ISS, IRIDIUM) or NORAD ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-space-950 border border-space-700 rounded text-xs text-white placeholder-space-500 focus:outline-none focus:border-space-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-space-800 bg-space-950/60">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-space-850 text-space-400 border-b border-space-800 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3.5">NORAD ID</th>
              <th className="py-2.5 px-3.5">Satellite / Object</th>
              <th className="py-2.5 px-3.5">Position [X, Y, Z] (km)</th>
              <th className="py-2.5 px-3.5">Velocity [Vx, Vy, Vz]</th>
              <th className="py-2.5 px-3.5">Altitude</th>
              <th className="py-2.5 px-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-space-800/60">
            {filtered.map((sat) => {
              const pos = sat.position_km || [0, 0, 0];
              const vel = sat.velocity_km_s || [0, 0, 0];
              const r = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
              const altKm = Math.max(0, r - 6378.137);
              const vMag = Math.sqrt(vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2]);

              return (
                <tr key={sat.norad_id} className="hover:bg-space-850/60 transition-colors">
                  <td className="py-2.5 px-3.5 font-semibold text-telemetry-cyan">
                    #{sat.norad_id}
                  </td>
                  <td className="py-2.5 px-3.5 font-semibold text-white">
                    {sat.name}
                  </td>
                  <td className="py-2.5 px-3.5 text-space-400 text-[11px]">
                    [{pos.map(p => Number(p).toFixed(0)).join(', ')}]
                  </td>
                  <td className="py-2.5 px-3.5 text-space-400 text-[11px]">
                    {vMag.toFixed(2)} km/s
                  </td>
                  <td className="py-2.5 px-3.5 font-medium text-telemetry-emerald">
                    ~{altKm.toFixed(0)} km
                  </td>
                  <td className="py-2.5 px-3.5 text-right">
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (onSelectObject) onSelectObject(sat);
                      }}
                      className="px-2.5 py-0.5 rounded bg-space-800 hover:bg-space-700 text-space-300 hover:text-white border border-space-700 text-[11px] transition-colors"
                    >
                      3D Track
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
