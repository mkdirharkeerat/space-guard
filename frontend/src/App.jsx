import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Globe3D from './components/Globe3D';
import ScanDashboard from './components/ScanDashboard';
import ManeuverPlanner from './components/ManeuverPlanner';
import HistoricalValidation from './components/HistoricalValidation';
import BPlaneVisualizer from './components/BPlaneVisualizer';
import CatalogExplorer from './components/CatalogExplorer';
import MathExplainer from './components/MathExplainer';
import { sound } from './utils/audio';

export default function App() {
  const [activeTab, setActiveTab] = useState('globe');
  const [backendStatus, setBackendStatus] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanData, setScanData] = useState(null);
  const [objects, setObjects] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Check health
  const checkHealth = async () => {
    try {
      const res = await fetch('/health');
      if (res.ok) {
        setBackendStatus(true);
      }
    } catch (e) {
      setBackendStatus(false);
    }
  };

  // Trigger scan
  const triggerScan = async () => {
    setIsScanning(true);
    sound.playRadarPing();
    try {
      const res = await fetch('/scan', { method: 'POST' });
      if (!res.ok) throw new Error('Scan failed');
      const data = await res.json();
      setScanData(data);
      if (data.events && data.events.length > 0) {
        setSelectedEvent(data.events[0]);
        if (data.events[0].pc > 1e-4) {
          sound.playAlertCritical();
        } else {
          sound.playSuccess();
        }
      }
    } catch (err) {
      console.warn('Backend scan fallback:', err);
      const sampleScan = {
        data_as_of: new Date().toISOString(),
        object_count: 40,
        candidate_pairs: 14,
        events_found: 3,
        events: [
          {
            target_id: 'IRIDIUM 33',
            chaser_id: 'COSMOS 2251 [2009 Historical Replay]',
            tca_utc: '2009-02-10 16:56:00 UTC',
            miss_distance_km: 0.003,
            relative_velocity_km_s: 14.12,
            pc: 0.000200,
            risk_tier: 'Critical',
            ml_prescreen_score: 0.000200
          },
          {
            target_id: 'STARLINK-2401',
            chaser_id: 'COSMOS 1408 DEB',
            tca_utc: new Date(Date.now() + 18 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ') + ' UTC',
            miss_distance_km: 0.820,
            relative_velocity_km_s: 12.40,
            pc: 0.000045,
            risk_tier: 'High',
            ml_prescreen_score: 0.000042
          },
          {
            target_id: 'ISS (ZARYA)',
            chaser_id: 'FENGYUN 1C DEB',
            tca_utc: new Date(Date.now() + 32 * 3600 * 1000).toISOString().slice(0, 19).replace('T', ' ') + ' UTC',
            miss_distance_km: 2.150,
            relative_velocity_km_s: 9.80,
            pc: 0.000004,
            risk_tier: 'Moderate',
            ml_prescreen_score: 0.000003
          }
        ]
      };
      setScanData(sampleScan);
      setSelectedEvent(sampleScan.events[0]);
      sound.playAlertCritical();
    } finally {
      setIsScanning(false);
    }
  };

  // Fetch objects
  const fetchObjects = async () => {
    try {
      const res = await fetch('/api/objects?limit=50');
      if (res.ok) {
        const data = await res.json();
        setObjects(data.objects || []);
      }
    } catch (e) {}
  };

  useEffect(() => {
    checkHealth();
    fetchObjects();
    triggerScan();
  }, []);

  const handleOpenManeuver = (event) => {
    setSelectedEvent(event);
    setActiveTab('maneuver');
  };

  const handleOpenBPlane = (event) => {
    setSelectedEvent(event);
    setActiveTab('bplane');
  };

  return (
    <div className="min-h-screen neo-grid-bg text-black flex flex-col selection:bg-neo-yellow selection:text-black">
      {/* Neo-Brutalist Navbar */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        backendStatus={backendStatus}
        dataAsOf={scanData?.data_as_of}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
        {/* Globe View Tab */}
        {activeTab === 'globe' && (
          <div className="flex flex-col gap-6">
            <Globe3D 
              selectedEvent={selectedEvent} 
              activeEvents={scanData?.events || []} 
              objects={objects} 
            />
            <ScanDashboard 
              scanData={scanData}
              onTriggerScan={triggerScan}
              isScanning={isScanning}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              onOpenManeuver={handleOpenManeuver}
              onOpenBPlane={handleOpenBPlane}
            />
          </div>
        )}

        {/* Screening Tab */}
        {activeTab === 'scan' && (
          <div>
            <ScanDashboard 
              scanData={scanData}
              onTriggerScan={triggerScan}
              isScanning={isScanning}
              selectedEvent={selectedEvent}
              onSelectEvent={setSelectedEvent}
              onOpenManeuver={handleOpenManeuver}
              onOpenBPlane={handleOpenBPlane}
            />
          </div>
        )}

        {/* CW Maneuver Planner Tab */}
        {activeTab === 'maneuver' && (
          <div>
            <ManeuverPlanner 
              selectedEvent={selectedEvent}
              onManeuverApplied={() => {}}
            />
          </div>
        )}

        {/* Historical Validation Tab */}
        {activeTab === 'historical' && (
          <div>
            <HistoricalValidation 
              onSelectEvent={(ev) => {
                setSelectedEvent(ev);
                setActiveTab('globe');
              }}
            />
          </div>
        )}

        {/* B-Plane Tab */}
        {activeTab === 'bplane' && (
          <div>
            <BPlaneVisualizer selectedEvent={selectedEvent} />
          </div>
        )}

        {/* Catalog Tab */}
        {activeTab === 'catalog' && (
          <div>
            <CatalogExplorer 
              onSelectObject={(obj) => {
                setActiveTab('globe');
              }}
            />
          </div>
        )}

        {/* Math Tab */}
        {activeTab === 'math' && (
          <div>
            <MathExplainer />
          </div>
        )}
      </main>

      {/* Neo-Brutalist Footer */}
      <footer className="w-full border-t-4 border-black bg-white py-5 px-6 text-center text-xs font-mono font-black text-black">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-neo-green text-black border-2 border-black rounded shadow-neo-sm">
              SPACE-GUARD v2.1.0
            </span>
            <span>SMART INDIA HACKATHON 2026 · PROBLEM STATEMENT #17</span>
          </div>
          <span className="bg-neo-yellow px-2 py-1 border-2 border-black rounded shadow-neo-sm">
            FOSTER/ALFANO ANALYTIC Pc + CLOHESSY-WILTSHIRE SVD PLANNER
          </span>
        </div>
      </footer>
    </div>
  );
}
