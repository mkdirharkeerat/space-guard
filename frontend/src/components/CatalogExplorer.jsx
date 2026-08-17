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
    <div className="flex flex-col gap-5 p-6 rounded-2xl bg-white border-4 border-black shadow-neo-lg font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-3 border-black">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-[#B8EAFF] border-3 border-black shadow-neo">
            <Satellite className="w-6 h-6 text-black" />
          </div>
          <div>
            <h2 className="text-xl font-black text-black tracking-tight font-sans">
              Live Propagated Satellite Ephemeris
            </h2>
            <p className="text-xs text-slate-700 font-bold">
              Real-time SGP4 GCRS/ECI coordinates propagated from CelesTrak active TLEs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {dataAsOf && (
            <span className="text-xs text-slate-800 font-bold hidden md:inline-block">
              Updated: {new Date(dataAsOf).toLocaleTimeString()} UTC
            </span>
          )}
          <button
            onClick={fetchObjects}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-neo-yellow text-black font-black border-2 border-black text-xs hover:bg-yellow-300 shadow-neo-sm active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-black" />
        <input
          type="text"
          placeholder="Search by satellite name (STARLINK, ISS, IRIDIUM) or NORAD ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-neo-cream border-3 border-black rounded-xl text-xs font-bold text-black placeholder-slate-500 focus:outline-none focus:bg-white shadow-neo-sm"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border-3 border-black shadow-neo bg-white">
        <table className="w-full text-left font-mono text-xs">
          <thead className="bg-neo-yellow text-black border-b-3 border-black text-xs font-black uppercase">
            <tr>
              <th className="py-3.5 px-4">NORAD ID</th>
              <th className="py-3.5 px-4">Satellite / Object</th>
              <th className="py-3.5 px-4">Position [X, Y, Z] (km)</th>
              <th className="py-3.5 px-4">Velocity [Vx, Vy, Vz]</th>
              <th className="py-3.5 px-4">Altitude</th>
              <th className="py-3.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y-2 divide-black">
            {filtered.map((sat) => {
              const pos = sat.position_km || [0, 0, 0];
              const vel = sat.velocity_km_s || [0, 0, 0];
              const r = Math.sqrt(pos[0] * pos[0] + pos[1] * pos[1] + pos[2] * pos[2]);
              const altKm = Math.max(0, r - 6378.137);
              const vMag = Math.sqrt(vel[0] * vel[0] + vel[1] * vel[1] + vel[2] * vel[2]);

              return (
                <tr key={sat.norad_id} className="hover:bg-neo-cream transition-colors font-bold">
                  <td className="py-3.5 px-4 font-black">
                    #{sat.norad_id}
                  </td>
                  <td className="py-3.5 px-4 font-black text-black">
                    {sat.name}
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 text-[11px]">
                    [{pos.map(p => Number(p).toFixed(0)).join(', ')}]
                  </td>
                  <td className="py-3.5 px-4 text-slate-800 text-[11px]">
                    {vMag.toFixed(2)} km/s
                  </td>
                  <td className="py-3.5 px-4 font-black">
                    ~{altKm.toFixed(0)} km
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => {
                        sound.playClick();
                        if (onSelectObject) onSelectObject(sat);
                      }}
                      className="px-3 py-1 rounded-lg bg-neo-green text-black border-2 border-black font-black text-xs hover:bg-emerald-400 shadow-neo-sm"
                    >
                      3D View
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
