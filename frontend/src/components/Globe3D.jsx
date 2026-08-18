import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Crosshair, Radio, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

export default function Globe3D({ selectedEvent, activeEvents = [], objects = [] }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const earthGroupRef = useRef(null);
  const orbitsGroupRef = useRef(null);
  const satellitesGroupRef = useRef(null);
  const conjunctionGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  const [autoRotate, setAutoRotate] = useState(true);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.25, y: 0.8 });
  const currentRotationRef = useRef({ x: 0.25, y: 0.8 });
  const cameraDistanceRef = useRef(20);

  useEffect(() => {
    if (!containerRef.current) return;

    const getContainerSize = () => {
      const el = containerRef.current;
      if (!el) return { width: 800, height: 520 };
      const w = el.clientWidth || el.parentElement?.clientWidth || 800;
      const h = el.clientHeight || 520;
      return { width: Math.max(300, w), height: Math.max(300, h) };
    };

    const { width, height } = getContainerSize();

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x040711);
    sceneRef.current = scene;

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 4, cameraDistanceRef.current);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 2.0);
    dirLight1.position.set(20, 15, 20);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x06b6d4, 1.2);
    dirLight2.position.set(-20, -10, -20);
    scene.add(dirLight2);

    // 5. Earth Parent Group
    const earthParent = new THREE.Group();
    scene.add(earthParent);
    earthGroupRef.current = earthParent;

    const earthRadius = 6.378;

    // 5a. Procedural Vector Earth Texture (Realistic deep ocean & continent points)
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep ocean base
    ctx.fillStyle = '#0a1428';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (subtle lat/long)
    ctx.strokeStyle = '#122347';
    ctx.lineWidth = 1.5;
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

    // Continents (Emerald phosphor particles)
    ctx.fillStyle = '#10B981';
    const drawContinentCluster = (centerX, centerY, widthRadius, heightRadius, count = 300) => {
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const dist = Math.sqrt(Math.random());
        const x = centerX + Math.cos(angle) * dist * widthRadius + (Math.random() - 0.5) * 20;
        const y = centerY + Math.sin(angle) * dist * heightRadius + (Math.random() - 0.5) * 20;
        const size = Math.random() * 3 + 1.5;
        ctx.fillRect(x, y, size, size);
      }
    };

    drawContinentCluster(500, 320, 240, 180, 450);  // N. America
    drawContinentCluster(700, 680, 160, 220, 380);  // S. America
    drawContinentCluster(1250, 320, 380, 200, 700); // Eurasia
    drawContinentCluster(1180, 580, 200, 220, 450); // Africa
    drawContinentCluster(1720, 720, 160, 130, 280); // Australia

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.needsUpdate = true;

    // Solid Earth Sphere
    const earthGeom = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.1,
      emissive: new THREE.Color(0x040e1f),
      emissiveIntensity: 0.4,
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthParent.add(earthMesh);

    // Lat/Long Wireframe Overlay
    const wireGeom = new THREE.SphereGeometry(earthRadius * 1.004, 32, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.15,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    earthParent.add(wireMesh);

    // Atmospheric Shell
    const atmosGeom = new THREE.SphereGeometry(earthRadius * 1.035, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.1,
      side: THREE.BackSide,
    });
    const atmosMesh = new THREE.Mesh(atmosGeom, atmosMat);
    earthParent.add(atmosMesh);

    // Groups
    const orbitsGroup = new THREE.Group();
    earthParent.add(orbitsGroup);
    orbitsGroupRef.current = orbitsGroup;

    const satellitesGroup = new THREE.Group();
    earthParent.add(satellitesGroup);
    satellitesGroupRef.current = satellitesGroup;

    const conjunctionGroup = new THREE.Group();
    earthParent.add(conjunctionGroup);
    conjunctionGroupRef.current = conjunctionGroup;

    // Background Starfield
    const starsCount = 900;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      const r = 70 + Math.random() * 80;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);

      starColors[i] = 0.8;
      starColors[i + 1] = 0.9;
      starColors[i + 2] = 1.0;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
    const starMat = new THREE.PointsMaterial({ size: 1.2, vertexColors: true, transparent: true, opacity: 0.75 });
    const starField = new THREE.Points(starGeometry, starMat);
    scene.add(starField);

    // Resize Observer
    const updateSize = () => {
      if (!containerRef.current || !renderer || !camera) return;
      const { width: newW, height: newH } = getContainerSize();
      if (newW > 0 && newH > 0) {
        camera.aspect = newW / newH;
        camera.updateProjectionMatrix();
        renderer.setSize(newW, newH);
      }
    };

    const resizeObserver = new ResizeObserver(() => updateSize());
    resizeObserver.observe(containerRef.current);
    window.addEventListener('resize', updateSize);

    // Animation Loop
    let clock = new THREE.Clock();
    const animate = () => {
      animFrameIdRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.08;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

      if (earthParent) {
        earthParent.rotation.y = currentRotationRef.current.y;
        earthParent.rotation.x = currentRotationRef.current.x;
      }

      if (conjunctionGroup) {
        conjunctionGroup.children.forEach(child => {
          if (child.userData?.isBeacon) {
            const scale = 1 + 0.3 * Math.sin(clock.getElapsedTime() * 5);
            child.scale.set(scale, scale, scale);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Listeners
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
      targetRotationRef.current.x = Math.max(-Math.PI / 2.2, Math.min(Math.PI / 2.2, targetRotationRef.current.x));
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };
    const onWheel = (e) => {
      e.preventDefault();
      const zoom = e.deltaY * 0.015;
      cameraDistanceRef.current = Math.max(10, Math.min(38, cameraDistanceRef.current + zoom));
      if (cameraRef.current) {
        cameraRef.current.position.z = cameraDistanceRef.current;
      }
    };

    dom.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateSize);
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

  // Update Orbits and Markers
  useEffect(() => {
    if (!orbitsGroupRef.current || !conjunctionGroupRef.current || !satellitesGroupRef.current) return;

    while (orbitsGroupRef.current.children.length > 0) {
      orbitsGroupRef.current.remove(orbitsGroupRef.current.children[0]);
    }
    while (conjunctionGroupRef.current.children.length > 0) {
      conjunctionGroupRef.current.remove(conjunctionGroupRef.current.children[0]);
    }
    while (satellitesGroupRef.current.children.length > 0) {
      satellitesGroupRef.current.remove(satellitesGroupRef.current.children[0]);
    }

    const scaleFactor = 1 / 1000;

    const createOrbitRing = (radiusKm, incDeg, raanDeg, colorHex) => {
      const points = [];
      const segments = 128;
      const r = (radiusKm || 7100) * scaleFactor;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.8,
        linewidth: 2,
      });
      const line = new THREE.Line(geom, mat);
      line.rotation.z = (incDeg || 0) * (Math.PI / 180);
      line.rotation.y = (raanDeg || 0) * (Math.PI / 180);
      return line;
    };

    activeEvents.forEach((ev, idx) => {
      const isSelected = selectedEvent && selectedEvent.target_id === ev.target_id && selectedEvent.chaser_id === ev.chaser_id;
      const isCritical = (ev.risk_tier || '').toLowerCase().includes('crit') || ev.pc > 1e-4;

      const altKm = 7150 + idx * 40;
      const incA = 86.4;
      const incB = 74.0;

      if (isSelected || idx < 4) {
        const orbitA = createOrbitRing(altKm, incA, idx * 30, isCritical ? 0x10b981 : 0x06b6d4);
        orbitsGroupRef.current.add(orbitA);

        const orbitB = createOrbitRing(altKm, incB, idx * 30 + 45, isCritical ? 0xef4444 : 0xf59e0b);
        orbitsGroupRef.current.add(orbitB);

        const encDist = altKm * scaleFactor;
        const encX = encDist * Math.cos(idx * 0.8);
        const encY = encDist * Math.sin(incA * Math.PI / 180) * 0.7;
        const encZ = encDist * Math.sin(idx * 0.8);

        const beaconGeom = new THREE.SphereGeometry(0.3, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: isCritical ? 0xef4444 : 0xf59e0b,
          wireframe: true,
        });
        const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
        beaconMesh.position.set(encX, encY, encZ);
        beaconMesh.userData = { isBeacon: true, event: ev };
        conjunctionGroupRef.current.add(beaconMesh);

        const coreGeom = new THREE.SphereGeometry(0.14, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
          color: isCritical ? 0xffffff : 0xfde047,
        });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.position.set(encX, encY, encZ);
        conjunctionGroupRef.current.add(coreMesh);
      }
    });

    if (objects.length > 0) {
      const satPositions = [];
      const satColors = [];

      objects.forEach(obj => {
        if (obj.position_km && obj.position_km.length === 3) {
          const [x, y, z] = obj.position_km;
          satPositions.push(x * scaleFactor, z * scaleFactor, -y * scaleFactor);
          satColors.push(0.06, 0.72, 0.5);
        }
      });

      if (satPositions.length > 0) {
        const satGeom = new THREE.BufferGeometry();
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
    targetRotationRef.current = { x: 0.25, y: 0.8 };
    cameraDistanceRef.current = 20;
    if (cameraRef.current) {
      cameraRef.current.position.set(0, 4, 20);
      cameraRef.current.lookAt(0, 0, 0);
    }
  };

  const handleToggleRotate = () => {
    sound.playClick();
    setAutoRotate(!autoRotate);
  };

  return (
    <div className="relative w-full h-[500px] lg:h-[580px] rounded-lg overflow-hidden border border-space-800 bg-[#040711] shadow-2xl select-none">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left HUD Telemetry Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 p-3 rounded bg-space-950/90 border border-space-800 text-xs font-mono backdrop-blur-md">
        <div className="flex items-center gap-2 text-white font-medium uppercase text-xs">
          <div className="w-2 h-2 rounded-full bg-telemetry-emerald animate-pulse" />
          <span>3D ORBITAL RADAR</span>
        </div>
        <div className="text-space-400 text-[11px] flex items-center justify-between gap-4">
          <span>FRAME:</span>
          <span className="text-telemetry-cyan font-semibold">GCRS / ECI</span>
        </div>
        <div className="text-space-400 text-[11px] flex items-center justify-between gap-4">
          <span>RADIUS:</span>
          <span className="text-space-300">6,378.14 km</span>
        </div>
        {selectedEvent && (
          <div className="mt-1 pt-1.5 border-t border-space-800 flex flex-col gap-0.5">
            <span className="text-red-400 font-semibold text-[11px] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" />
              LOCK: {selectedEvent.target_id} × {selectedEvent.chaser_id}
            </span>
            <span className="text-space-300 text-[11px]">Miss: {(selectedEvent.miss_distance_km).toFixed(3)} km</span>
          </div>
        )}
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleToggleRotate}
          title={autoRotate ? 'Pause Rotation' : 'Resume Auto Rotation'}
          className={`px-3 py-1.5 rounded border text-xs font-mono transition-all flex items-center gap-1.5 backdrop-blur-md ${
            autoRotate
              ? 'bg-space-850 text-telemetry-emerald border-space-700 hover:bg-space-800'
              : 'bg-space-950 text-space-400 border-space-850 hover:text-white'
          }`}
        >
          <RotateCcw className={`w-3.5 h-3.5 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{autoRotate ? 'ROTATING' : 'PAUSED'}</span>
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset View"
          className="p-1.5 rounded border border-space-800 bg-space-950/90 text-space-300 hover:text-white hover:border-space-700 transition-all backdrop-blur-md"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Center Indicator Badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded bg-space-950/85 border border-space-800 text-[11px] text-space-400 font-mono flex items-center gap-3 backdrop-blur-md">
        <span>Drag to Rotate</span>
        <span className="text-space-700">|</span>
        <span>Scroll to Zoom</span>
        <span className="text-space-700">|</span>
        <span className="text-telemetry-cyan font-medium">
          {activeEvents.length} Conjunctions Tracked
        </span>
      </div>
    </div>
  );
}
