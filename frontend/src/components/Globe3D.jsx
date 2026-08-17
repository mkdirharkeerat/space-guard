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

  const [autoRotate, setAutoRotate] = useState(true);
  const [cameraDistance, setCameraDistance] = useState(22);

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
    const ambientLight = new THREE.AmbientLight(0x00ff88, 0.35);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
    sunLight.position.set(15, 10, 15);
    scene.add(sunLight);

    const blueRimLight = new THREE.DirectionalLight(0x00e5ff, 1.2);
    blueRimLight.position.set(-15, -10, -10);
    scene.add(blueRimLight);

    // 5. Earth Sphere Creation (Procedural High-Contrast Vector Grid)
    const earthRadius = 6.378;
    const earthGeom = new THREE.SphereGeometry(earthRadius, 64, 64);

    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');
    
    // Bold deep navy void background for maximum contrast
    ctx.fillStyle = '#080d1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Grid lines (lat / long)
    ctx.strokeStyle = '#00FF66';
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

    // Landmass approximation
    ctx.fillStyle = '#FFE600';
    for (let i = 0; i < 4500; i++) {
      const u = Math.random();
      const v = Math.random();
      const x = u * canvas.width;
      const y = v * canvas.height;
      if (
        (x > 200 && x < 800 && y > 150 && y < 550) || // Americas
        (x > 1000 && x < 1500 && y > 150 && y < 500) || // Eurasia
        (x > 1100 && x < 1400 && y > 500 && y < 800) || // Africa
        (x > 1600 && x < 1850 && y > 600 && y < 850) // Australia
      ) {
        ctx.beginPath();
        ctx.arc(x + (Math.random() - 0.5) * 35, y + (Math.random() - 0.5) * 35, Math.random() * 2.2 + 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.wrapS = THREE.RepeatWrapping;
    earthTexture.wrapT = THREE.ClampToEdgeWrapping;

    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.6,
      metalness: 0.2,
      emissive: new THREE.Color(0x0a1f14),
      emissiveIntensity: 0.5,
    });

    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    scene.add(earthMesh);
    earthRef.current = earthMesh;

    // Atmospheric Glow Layer
    const atmosGeom = new THREE.SphereGeometry(earthRadius * 1.04, 48, 48);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00ff66,
      transparent: true,
      opacity: 0.15,
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

    // Starfield Background
    const starsCount = 1000;
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = new Float32Array(starsCount * 3);
    const starColors = new Float32Array(starsCount * 3);

    for (let i = 0; i < starsCount * 3; i += 3) {
      const r = 70 + Math.random() * 100;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      starPositions[i] = r * Math.sin(phi) * Math.cos(theta);
      starPositions[i + 1] = r * Math.sin(phi) * Math.sin(theta);
      starPositions[i + 2] = r * Math.cos(phi);

      starColors[i] = 1.0;
      starColors[i + 1] = 0.9;
      starColors[i + 2] = 0.0;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({
      size: 1.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
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

      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.09;
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
        conjunctionGroup.children.forEach(child => {
          if (child.userData.isBeacon) {
            const scale = 1 + 0.4 * Math.sin(clock.getElapsedTime() * 5);
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
      const r = (radiusKm || 7000) * scaleFactor;
      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        points.push(new THREE.Vector3(r * Math.cos(theta), 0, r * Math.sin(theta)));
      }
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.8,
        linewidth: 3,
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

      if (isSelected || idx < 3) {
        const orbitA = createOrbitRing(altKm, incA, idx * 30, isCritical ? 0x00ff66 : 0x00e5ff);
        orbitsGroupRef.current.add(orbitA);

        const orbitB = createOrbitRing(altKm, incB, idx * 30 + 45, isCritical ? 0xff3333 : 0xffaa00);
        orbitsGroupRef.current.add(orbitB);

        const encDist = altKm * scaleFactor;
        const encX = encDist * Math.cos(idx * 0.8);
        const encY = encDist * Math.sin(incA * Math.PI / 180) * 0.7;
        const encZ = encDist * Math.sin(idx * 0.8);

        const beaconGeom = new THREE.SphereGeometry(0.35, 16, 16);
        const beaconMat = new THREE.MeshBasicMaterial({
          color: isCritical ? 0xff3333 : 0xffe600,
          wireframe: true,
        });
        const beaconMesh = new THREE.Mesh(beaconGeom, beaconMat);
        beaconMesh.position.set(encX, encY, encZ);
        beaconMesh.userData = { isBeacon: true, event: ev };
        conjunctionGroupRef.current.add(beaconMesh);

        const coreGeom = new THREE.SphereGeometry(0.15, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
          color: isCritical ? 0xffffff : 0xffe600,
        });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.position.set(encX, encY, encZ);
        conjunctionGroupRef.current.add(coreMesh);
      }
    });

    if (objects.length > 0) {
      const satGeom = new THREE.BufferGeometry();
      const satPositions = [];
      const satColors = [];

      objects.forEach(obj => {
        if (obj.position_km && obj.position_km.length === 3) {
          const [x, y, z] = obj.position_km;
          satPositions.push(x * scaleFactor, z * scaleFactor, -y * scaleFactor);
          satColors.push(0.0, 1.0, 0.4);
        }
      });

      if (satPositions.length > 0) {
        satGeom.setAttribute('position', new THREE.Float32BufferAttribute(satPositions, 3));
        satGeom.setAttribute('color', new THREE.Float32BufferAttribute(satColors, 3));
        const satMat = new THREE.PointsMaterial({
          size: 2.5,
          vertexColors: true,
          transparent: true,
          opacity: 0.9,
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
    <div className="relative w-full h-[520px] lg:h-[620px] rounded-2xl overflow-hidden border-4 border-black bg-black shadow-neo-lg">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left Neo-Brutalist HUD Badge */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 p-3.5 rounded-xl bg-white border-3 border-black shadow-neo text-xs font-mono">
        <div className="flex items-center gap-2 text-black font-black uppercase text-xs">
          <div className="w-3 h-3 rounded-full bg-neo-green border-2 border-black animate-pulse" />
          <span>3D ORBITAL RADAR HUD</span>
        </div>
        <div className="text-black font-bold flex items-center justify-between gap-4">
          <span>FRAME:</span>
          <span className="px-1.5 py-0.5 bg-neo-yellow border border-black rounded text-[10px]">GCRS / ECI</span>
        </div>
        <div className="text-black font-bold flex items-center justify-between gap-4">
          <span>ALTITUDE BAND:</span>
          <span>LEO (~789 km)</span>
        </div>
        {selectedEvent && (
          <div className="mt-1 pt-2 border-t-2 border-black flex flex-col gap-1">
            <span className="text-neo-red font-black flex items-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              LOCK: {selectedEvent.target_id} × {selectedEvent.chaser_id}
            </span>
            <span className="text-black font-bold">Miss: {(selectedEvent.miss_distance_km).toFixed(3)} km</span>
          </div>
        )}
      </div>

      {/* Top Right Neo Action Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleToggleRotate}
          title={autoRotate ? 'Pause Rotation' : 'Resume Auto Rotation'}
          className={`px-3.5 py-2 rounded-xl border-3 border-black text-xs font-mono font-black transition-all flex items-center gap-2 shadow-neo ${
            autoRotate
              ? 'bg-neo-yellow text-black hover:bg-yellow-300'
              : 'bg-white text-black hover:bg-slate-100'
          }`}
        >
          <RotateCcw className={`w-4 h-4 ${autoRotate ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
          <span>{autoRotate ? 'ROTATING' : 'PAUSED'}</span>
        </button>

        <button
          onClick={handleResetCamera}
          title="Reset Camera View"
          className="p-2 rounded-xl border-3 border-black bg-neo-cyan text-black hover:bg-cyan-300 transition-all shadow-neo"
        >
          <Crosshair className="w-5 h-5" />
        </button>
      </div>

      {/* Bottom Center Indicator Badge */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 px-5 py-2 rounded-xl bg-neo-green border-3 border-black text-xs text-black font-black flex items-center gap-3 shadow-neo">
        <span>DRAG TO ROTATE</span>
        <span className="text-black">/</span>
        <span>SCROLL TO ZOOM</span>
        <span className="text-black">/</span>
        <span className="bg-black text-white px-2 py-0.5 rounded text-[10px]">
          {activeEvents.length} CONJUNCTIONS ACTIVE
        </span>
      </div>
    </div>
  );
}
