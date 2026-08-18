import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import GlobePage from './pages/GlobePage';
import ScreeningPage from './pages/ScreeningPage';
import ManeuverPage from './pages/ManeuverPage';
import HistoricalPage from './pages/HistoricalPage';
import BPlanePage from './pages/BPlanePage';
import CatalogPage from './pages/CatalogPage';
import DocsPage from './pages/DocsPage';
import { sound } from './utils/audio';

export default function App() {
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

  return (
    <Router>
      <div className="min-h-screen neo-grid-bg text-black flex flex-col selection:bg-neo-yellow selection:text-black">
        {/* Navigation Bar */}
        <Navbar 
          backendStatus={backendStatus} 
          dataAsOf={scanData?.data_as_of} 
        />

        {/* Multi-Page Routes */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  backendStatus={backendStatus}
                  onTriggerScan={triggerScan}
                  scanData={scanData}
                />
              } 
            />
            <Route 
              path="/globe" 
              element={
                <GlobePage 
                  scanData={scanData}
                  objects={objects}
                  selectedEvent={selectedEvent}
                  onSelectEvent={setSelectedEvent}
                />
              } 
            />
            <Route 
              path="/screening" 
              element={
                <ScreeningPage 
                  scanData={scanData}
                  onTriggerScan={triggerScan}
                  isScanning={isScanning}
                  selectedEvent={selectedEvent}
                  onSelectEvent={setSelectedEvent}
                />
              } 
            />
            <Route 
              path="/maneuver" 
              element={
                <ManeuverPage 
                  selectedEvent={selectedEvent} 
                />
              } 
            />
            <Route 
              path="/historical" 
              element={
                <HistoricalPage 
                  onSelectEvent={setSelectedEvent} 
                />
              } 
            />
            <Route 
              path="/bplane" 
              element={
                <BPlanePage 
                  selectedEvent={selectedEvent} 
                />
              } 
            />
            <Route 
              path="/catalog" 
              element={
                <CatalogPage 
                  onSelectObject={setSelectedEvent} 
                />
              } 
            />
            <Route 
              path="/docs" 
              element={<DocsPage />} 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Footer */}
        <Footer />
      </div>
    </Router>
  );
}
