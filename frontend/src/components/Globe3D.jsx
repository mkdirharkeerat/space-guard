import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Eye, RotateCcw, Crosshair, Radio, Layers, Maximize2, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Globe3D({ selectedEvent, activeEvents = [], objects = [] }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const earthRef = useRef(null);
  const orbitsGroupRef = useRef(null);
  const satellitesGroupRef = useRef(null);
  const conjunctionGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [viewMode, setViewMode] = useState('tactical'); // 'tactical' | 'night' | 'wireframe'
  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraDistance, setCameraDistance] = useState(22);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.3, y: 0.8 });
  const currentRotationRef = useRef({ x: 0.3, y: 0.8 });

  useEffect(() => {
    if (!containerRef.current) return;
    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    // 1. Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = cameraDistance;
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0x00ff88, 0.25);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(15, 10, 15);
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x00a3ff, 0.8);
    blueRimLight.position.set(-15, -10, -10);
    scene.add(blueRimLight);

    // 5. Earth Sphere Creation (Procedural High-Tech Canvas Texture)
    const earthRadius = 6.378; // Normalized Earth radius
    const earthGeom = new THREE.SphereGeometry(earthRadius, 64, 64);

    // Generate procedural glowing cyber grid Earth texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Background void
    ctx.fillStyle = '#070f1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (lat / long)
    ctx.strokeStyle = 'rgba(0, 255, 136, 0.15)';
    ctx.lineWidth = 1;
    for (let x = 0; x <= canvas.width; x += 64) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 64) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Continents silhouette approximation dots
    ctx.fillStyle = 'rgba(0, 255, 136, 0.4)';
    for (let i = 0; i < 4000; i++) {
      const u = Math.random();
      const v = Math.random();
      // Grouping clusters for landmasses
      const x = u * canvas.width;
      const y = v * canvas.height;
      if (
        (x > 200 && x < 800 && y > 150 && y < 550) || // Americas
        (x > 1000 && x < 1500 && y > 150 && y < 500) || // Eurasia
        (x > 1100 && x < 1400 && y > 500 && y < 800) || // Africa
        (x > 1600 && x < 1850 && y > 600 && y < 850) // Australia
      ) {
        ctx.beginPath();
        ctx.arc(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, Math.random() * 2 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.7,
      metalness: 0.3,
      emissive: new THREE.Color(0x002414),
      emissiveIntensity: 0.4,
    });

    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    scene.add(earthMesh);
    earthRef.current = earthMesh;

    // Atmospheric Glow Layer
    const atmosGeom = new THREE.SphereGeometry(earthRadius * 1.035, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    });
    const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
    scene.add(atmosMesh);

    // Groups for orbits, satellites, conjunctions
    const orbitsGroup = new THREE.Group();
    scene.add(orbitsGroup);
    orbitsGroupRef.current = orbitsGroup;

    const satellitesGroup = new THREE.Group();
    scene.add(satellitesGroup);
    satellitesGroupRef.current = satellitesGroup;

    const conjunctionGroup = new THREE.Group();
    scene.add(conjunctionGroup);
    conjunctionGroupRef.current = conjunctionGroup;

    // 6. Starfield Background
    const starsCount = 1200;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      const r = 80 + Math.random() * 120;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);

      const isGreen = Math.random() > 0.7;
      starColors[i] = isGreen ? 0.2 : 0.8;
      starColors[i + 1] = isGreen ? 1.0 : 0.8;
      starColors[i + 2] = isGreen ? 0.6 : 1.0;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.75,
    });
    const starField = new THREE.Points(starGeometry, starMaterial);
    scene.add(starField);

    // Resize Handler
    const handleResize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth rotation interpolation
      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.08;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

      if (earthMesh) {
        earthMesh.rotation.y = currentRotationRef.current.y;
        earthMesh.rotation.x = currentRotationRef.current.x;
      }
      if (orbitsGroup) {
        orbitsGroup.rotation.y = currentRotationRef.current.y;
        orbitsGroup.rotation.x = currentRotationRef.current.x;
      }
      if (satellitesGroup) {
        satellitesGroup.rotation.y = currentRotationRef.current.y;
        satellitesGroup.rotation.x = currentRotationRef.current.x;
      }
      if (conjunctionGroup) {
        conjunctionGroup.rotation.y = currentRotationRef.current.y;
        conjunctionGroup.rotation.x = currentRotationRef.current.x;
        // Pulsate conjunction beacons
        conjunctionGroup.children.forEach(child => {
          if (child.userData.isBeacon) {
            const scale = 1 + 0.3 * Math.sin(clock.getElapsedTime() * 4);
            child.scale.set(scale, scale, scale);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Drag Listeners
    const dom = renderer.domElement;
    const onMouseDown = (e) => {
      isDraggingRef.current = true;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - prevMousePosRef.current.x;
      const deltaY = e.clientY - prevMousePosRef.current.y;
      prevMousePosRef.current = { x: e.clientX, y: e.clientY };

      targetRotationRef.current.y += deltaX * 0.005;
      targetRotationRef.current.x += deltaY * 0.005;
      // Clamp vertical pitch to prevent flipping
      targetRotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationRef.current.x));
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };
    const onWheel = (e) => {
      e.preventDefault();
      const zoom = e.deltaY * 0.015;
      const newDist = Math.max(10, Math.min(45, camera.position.z + zoom));
      camera.position.z = newDist;
      setCameraDistance(newDist);
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', handleResize);
      dom.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dom.removeEventListener('wheel', onWheel);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (renderer.domElement && containerRef.current) {
        containerRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Orbits and Markers when selectedEvent or objects change
  useEffect(() => {
    if (!orbitsGroupRef.current || !conjunctionGroupRef.current || !satellitesGroupRef.current) return;

    // Clear existing
    while (orbitsGroupRef.current.children.length > 0) {
      orbitsGroupRef.current.remove(orbitsGroupRef.current.children[0]);
    }
    while (conjunctionGroupRef.current.children.length > 0) {
      conjunctionGroupRef.current.remove(conjunctionGroupRef.current.children[0]);
    }
    while (satellitesGroupRef.current.children.length > 0) {
      satellitesGroupRef.current.remove(satellitesGroupRef.current.children[0]);
    }

    const scaleFactor = 1 / 1000; // 1 Three unit = 1000 km

    // Helper: Create an orbital ellipse/ring in 3D
    const createOrbitRing = (radiusKm, incDeg, raanDeg, colorHex) => {
      const points = [];
      const segments = 128;
      const r = (radiusKm || 7000) * scaleFactor;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.65,
        linewidth: 2,
      });
      const line = new THREE.Line(geom, mat);
      line.rotation.z = (incDeg || 0) * (Math.PI / 180);
      line.rotation.y = (raanDeg || 0) * (Math.PI / 180);
      return line;
    };

    // Render active conjunctions
    activeEvents.forEach((ev, idx) => {
      const isSelected = selectedEvent && selectedEvent.target_id === ev.target_id && selectedEvent.chaser_id === ev.chaser_id;
      const isCritical = (ev.risk_tier || '').toLowerCase().includes('crit') || ev.pc > 1e-4;

      // Approximate orbital radius ~7100 km (LEO)
      const altKm = 7150 + idx * 40;
      const incA = 86.4; // Target inclination (e.g. Iridium)
      const incB = 74.0; // Chaser inclination (e.g. Cosmos)

      if (isSelected || idx < 3) {
        // Orbit A (Cyan / Green)
        const orbitA = createOrbitRing(altKm, incA, idx * 30, isCritical ? 0x00ff88 : 0x00e5ff);
        orbitsGroupRef.current.add(orbitA);

        // Orbit B (Orange / Red)
        const orbitB = createOrbitRing(altKm, incB, idx * 30 + 45, isCritical ? 0xff3b3b : 0xffa330);
        orbitsGroupRef.current.add(orbitB);

        // Conjunction encounter intersection point
        const encDist = altKm * scaleFactor;
        // Intersection point in spherical space
        const encX = encDist * Math.cos(idx * 0.8);
        const encY = encDist * Math.sin(incA * Math.PI / 180) * 0.7;
        const encZ = encDist * Math.sin(idx * 0.8);

        // Pulsing Marker
        const beaconGeom = new THREE.SphereGeometry(0.3, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: isCritical ? 0xff3b3b : 0xffb830,
          wireframe: true,
        });
        const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
        beaconMesh.position.set(encX, encY, encZ);
        beaconMesh.userData = { isBeacon: true, event: ev };
        conjunctionGroupRef.current.add(beaconMesh);

        // Inner solid core
        const coreGeom = new THREE.SphereGeometry(0.12, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
          color: isCritical ? 0xffffff : 0xffe600,
        });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.position.set(encX, encY, encZ);
        conjunctionGroupRef.current.add(coreMesh);
      }
    });

    // Render populated background satellites from objects list
    if (objects.length > 0) {
      const satGeom = new THREE.BufferGeometry();
      const satPositions = [];
      const satColors = [];

      objects.forEach(obj => {
        if (obj.position_km && obj.position_km.length === 3) {
          const [x, y, z] = obj.position_km;
          satPositions.push(x * scaleFactor, z * scaleFactor, -y * scaleFactor);
          satColors.push(0.0, 0.9, 0.5);
        }
      });

      if (satPositions.length > 0) {
        satGeom.setAttribute('position', new THREE.Float32BufferAttribute(satPositions, 3));
        satGeom.setAttribute('color', new THREE.Float32BufferAttribute(satColors, 3));
        const satMat = new THREE.PointsMaterial({
          size: 2.2,
          vertexColors: true,
          transparent: true,
          opacity: 0.85,
        });
        const satPoints = new THREE.Points(satGeom, satMat);
        satellitesGroupRef.current.add(satPoints);
      }
    }
  }, [selectedEvent, activeEvents, objects]);

  const handleResetCamera = () => {
    sound.playClick();
    targetRotationRef.current = { x: 0.3, y: 0.8 };
    if (cameraRef.current) {
      cameraRef.current.position.z = 22;
      setCameraDistance(22);
    }
  };

  const handleToggleRotate = () => {
    sound.playClick();
    setAutoRotate(!autoRotate);
  };

  return (
    <div 
      className="relative w-full h-[520px] lg:h-[620px] rounded-xl overflow-hidden border border-hud-border bg-void/90 tactical-grid"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Sci-Fi CRT Scanline Overlay */}
      <div className="absolute inset-0 scanlines opacity-60 pointer-events-none" />

      {/* Top Left HUD Telemetry Readout */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1 p-3 rounded-lg glass-panel text-xs">
        <div className="flex items-center gap-2 text-hud-green font-display uppercase tracking-widest text-[11px]">
          <Radio className="w-3.5 h-3.5 animate-pulse text-hud-green" />
          <span>3D Orbital Telemetry HUD</span>
        </div>
        <div className="text-slate-400 font-mono flex items-center gap-2">
          <span>COORDINATES:</span>
          <span className="text-hud-cyan font-semibold">GCRS / ECI FRAME</span>
        </div>
        <div className="text-slate-400 font-mono flex items-center gap-2">
          <span>EARTH RADIUS:</span>
          <span className="text-slate-200">6,378.14 km</span>
        </div>
        <div className="text-slate-400 font-mono flex items-center gap-2">
          <span>SCALE RATIO:</span>
          <span className="text-slate-200">1:1,000 km</span>
        </div>
        {selectedEvent && (
          <div className="mt-2 pt-2 border-t border-hud-borderFaint flex flex-col gap-0.5">
            <span className="text-red-400 font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              LOCK: {selectedEvent.target_id} × {selectedEvent.chaser_id}
            </span>
            <span className="text-slate-300">Miss: {(selectedEvent.miss_distance_km).toFixed(3)} km</span>
          </div>
        )}
      </div>

      {/* Top Right Controls Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleToggleRotate}
          title={autoRotate ? 'Pause Rotation' : 'Resume Auto Rotation'}
          className={`p-2 rounded-lg border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
            autoRotate
              ? 'bg-hud-green/15 text-hud-green border-hud-green/40 shadow-[0_0_10px_rgba(0,255,136,0.2)]'
              : 'bg-deep/80 text-slate-400 border-hud-border hover:text-white'
          }`}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{autoRotate ? 'ORBIT ACTIVE' : 'PAUSED'}</span>
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset Camera View"
          className="p-2 rounded-lg border border-hud-border bg-deep/80 text-slate-300 hover:text-hud-green hover:border-hud-green/40 transition-all"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Center Interaction Hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none px-4 py-1.5 rounded-full bg-deep/90 border border-hud-borderFaint text-[11px] text-slate-400 flex items-center gap-3 shadow-lg backdrop-blur-md font-mono">
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-hud-green"></span>
          Drag to Rotate
        </span>
        <span className="text-slate-600">|</span>
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-hud-cyan"></span>
          Scroll to Zoom
        </span>
        <span className="text-slate-600">|</span>
        <span className="text-hud-amber font-semibold">
          {activeEvents.length} Conjunction Beacons Active
        </span>
      </div>
    </div>
  );
}
