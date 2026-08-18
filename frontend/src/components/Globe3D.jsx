import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Crosshair, Radio, ShieldAlert } from 'lucide-react';
import { sound } from '../utils/audio';

// Helper: Generate circular glow sprite texture for smooth radar blips
function createGlowSpriteTexture(colorHex = '#10B981') {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, '#FFFFFF');
  gradient.addColorStop(0.3, colorHex);
  gradient.addColorStop(0.7, 'rgba(16, 185, 129, 0.4)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

// Helper: Create a real 3D Satellite Mesh (Bus + Solar Wings)
function createSatelliteModel(bodyColorHex = 0xffd700, wingColorHex = 0x0284c7) {
  const group = new THREE.Group();

  // Central Satellite Body (Cube)
  const bodyGeom = new THREE.BoxGeometry(0.18, 0.18, 0.24);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColorHex,
    metalness: 0.8,
    roughness: 0.2,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  group.add(body);

  // Solar Panel Arrays (Left and Right Wings)
  const wingGeom = new THREE.BoxGeometry(0.45, 0.02, 0.16);
  const wingMat = new THREE.MeshStandardMaterial({
    color: wingColorHex,
    metalness: 0.6,
    roughness: 0.3,
  });

  const leftWing = new THREE.Mesh(wingGeom, wingMat);
  leftWing.position.set(-0.35, 0, 0);
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeom, wingMat);
  rightWing.position.set(0.35, 0, 0);
  group.add(rightWing);

  // Antenna Dish
  const dishGeom = new THREE.ConeGeometry(0.08, 0.1, 16);
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
  const dish = new THREE.Mesh(dishGeom, dishMat);
  dish.rotation.x = Math.PI;
  dish.position.set(0, 0.14, 0);
  group.add(dish);

  return group;
}

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
    renderer.toneMappingExposure = 1.3;
    
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 2.2);
    sunLight.position.set(20, 15, 20);
    scene.add(sunLight);

    const rimLight = new THREE.DirectionalLight(0x06b6d4, 1.2);
    rimLight.position.set(-20, -10, -20);
    scene.add(rimLight);

    // 5. Earth Group
    const earthParent = new THREE.Group();
    scene.add(earthParent);
    earthGroupRef.current = earthParent;

    const earthRadius = 6.378;

    // 5a. Realistic High-Contrast Vector Earth Texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep ocean base
    ctx.fillStyle = '#081122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Subtle coordinate graticules
    ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
    ctx.lineWidth = 1.5;
    for (let x = 0; x <= canvas.width; x += 128) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y <= canvas.height; y += 128) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }

    // Smooth Continents Drawing
    ctx.fillStyle = '#10B981';
    ctx.strokeStyle = '#059669';
    ctx.lineWidth = 2;

    const drawSmoothLandmass = (paths) => {
      paths.forEach(p => {
        ctx.beginPath();
        p.forEach((pt, i) => {
          if (i === 0) ctx.moveTo(pt[0], pt[1]);
          else ctx.lineTo(pt[0], pt[1]);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      });
    };

    // Realistic vector silhouettes for continents
    const landmasses = [
      // North America
      [[350, 180], [600, 160], [700, 260], [650, 420], [550, 480], [450, 450], [380, 320]],
      // South America
      [[580, 500], [720, 540], [780, 680], [700, 850], [620, 850], [560, 680]],
      // Europe
      [[1050, 180], [1280, 160], [1320, 320], [1150, 380], [1020, 340]],
      // Asia
      [[1280, 160], [1750, 180], [1820, 380], [1650, 500], [1400, 480], [1320, 320]],
      // Africa
      [[1020, 400], [1280, 400], [1340, 600], [1250, 820], [1100, 820], [980, 550]],
      // Australia
      [[1550, 620], [1780, 620], [1820, 780], [1600, 820], [1520, 720]],
    ];
    drawSmoothLandmass(landmasses);

    // Island clusters & coastlines
    for (let i = 0; i < 400; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      if (
        (x > 350 && x < 700 && y > 150 && y < 450) ||
        (x > 1050 && x < 1800 && y > 150 && y < 500) ||
        (x > 980 && x < 1350 && y > 400 && y < 820)
      ) {
        ctx.beginPath();
        ctx.arc(x + (Math.random() - 0.5) * 40, y + (Math.random() - 0.5) * 40, Math.random() * 4 + 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    const earthTexture = new THREE.CanvasTexture(canvas);
    earthTexture.needsUpdate = true;

    // Solid Earth Sphere
    const earthGeom = new THREE.SphereGeometry(earthRadius, 64, 64);
    const earthMat = new THREE.MeshStandardMaterial({
      map: earthTexture,
      roughness: 0.5,
      metalness: 0.1,
      emissive: new THREE.Color(0x040e1f),
      emissiveIntensity: 0.35,
    });
    const earthMesh = new THREE.Mesh(earthGeom, earthMat);
    earthParent.add(earthMesh);

    // Lat/Long Wireframe Overlay
    const wireGeom = new THREE.SphereGeometry(earthRadius * 1.003, 36, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.12,
    });
    const wireMesh = new THREE.Mesh(wireGeom, wireMat);
    earthParent.add(wireMesh);

    // Atmospheric Glow Shell
    const atmosGeom = new THREE.SphereGeometry(earthRadius * 1.035, 32, 32);
    const atmosMat = new THREE.MeshBasicMaterial({
      color: 0x00ff88,
      transparent: true,
      opacity: 0.08,
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

    // Starfield Background
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
      const time = clock.getElapsedTime();

      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.08;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

      if (earthParent) {
        earthParent.rotation.y = currentRotationRef.current.y;
        earthParent.rotation.x = currentRotationRef.current.x;
      }

      // Animate 3D satellites along their orbits
      if (satellitesGroup) {
        satellitesGroup.children.forEach(sat => {
          if (sat.userData?.orbitRadius) {
            const angle = time * sat.userData.speed + sat.userData.initialAngle;
            const r = sat.userData.orbitRadius;
            sat.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
            sat.rotation.y = -angle;
          }
        });
      }

      // Pulsate encounter nodes
      if (conjunctionGroup) {
        conjunctionGroup.children.forEach(child => {
          if (child.userData?.isBeacon) {
            const scale = 1 + 0.3 * Math.sin(time * 5);
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

  // Update 3D Satellites, Orbits, and Encounter Nodes
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

    // Render active conjunctions and realistic 3D satellites
    activeEvents.forEach((ev, idx) => {
      const isSelected = selectedEvent && selectedEvent.target_id === ev.target_id && selectedEvent.chaser_id === ev.chaser_id;
      const isCritical = (ev.risk_tier || '').toLowerCase().includes('crit') || ev.pc > 1e-4;

      const altKm = 7150 + idx * 40;
      const incA = 86.4;
      const incB = 74.0;

      if (isSelected || idx < 4) {
        // Orbit A (Target)
        const orbitA = createOrbitRing(altKm, incA, idx * 30, isCritical ? 0x10b981 : 0x06b6d4);
        orbitsGroupRef.current.add(orbitA);

        // Orbit B (Chaser)
        const orbitB = createOrbitRing(altKm, incB, idx * 30 + 45, isCritical ? 0xef4444 : 0xf59e0b);
        orbitsGroupRef.current.add(orbitB);

        // Physical 3D Target Satellite Model
        const targetSat = createSatelliteModel(0xffd700, 0x0284c7);
        targetSat.userData = { orbitRadius: altKm * scaleFactor, speed: 0.3, initialAngle: idx * 0.8 };
        targetSat.rotation.z = incA * (Math.PI / 180);
        satellitesGroupRef.current.add(targetSat);

        // Physical 3D Chaser Satellite Model
        const chaserSat = createSatelliteModel(0xef4444, 0x334155);
        chaserSat.userData = { orbitRadius: altKm * scaleFactor, speed: -0.28, initialAngle: idx * 0.8 + 1.2 };
        chaserSat.rotation.z = incB * (Math.PI / 180);
        satellitesGroupRef.current.add(chaserSat);

        // Encounter Point
        const encDist = altKm * scaleFactor;
        const encX = encDist * Math.cos(idx * 0.8);
        const encY = encDist * Math.sin(incA * Math.PI / 180) * 0.7;
        const encZ = encDist * Math.sin(idx * 0.8);

        // Glowing Encounter Sphere
        const coreGeom = new THREE.SphereGeometry(0.18, 16, 16);
        const coreMat = new THREE.MeshBasicMaterial({
          color: isCritical ? 0xef4444 : 0xf59e0b,
        });
        const coreMesh = new THREE.Mesh(coreGeom, coreMat);
        coreMesh.position.set(encX, encY, encZ);
        coreMesh.userData = { isBeacon: true, event: ev };
        conjunctionGroupRef.current.add(coreMesh);

        // Concentric Radar Rings
        const ringGeom = new THREE.RingGeometry(0.24, 0.32, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: isCritical ? 0xef4444 : 0xf59e0b,
          transparent: true,
          opacity: 0.6,
          side: THREE.DoubleSide,
        });
        const ringMesh = new THREE.Mesh(ringGeom, ringMat);
        ringMesh.position.set(encX, encY, encZ);
        ringMesh.lookAt(0, 0, 0);
        conjunctionGroupRef.current.add(ringMesh);
      }
    });

    // Background Catalog Satellites (Circular Glow Point Sprites, NOT square pixels)
    if (objects.length > 0) {
      const satPositions = [];

      objects.forEach(obj => {
        if (obj.position_km && obj.position_km.length === 3) {
          const [x, y, z] = obj.position_km;
          satPositions.push(x * scaleFactor, z * scaleFactor, -y * scaleFactor);
        }
      });

      if (satPositions.length > 0) {
        const satGeom = new THREE.BufferGeometry();
        satGeom.setAttribute('position', new THREE.Float32BufferAttribute(satPositions, 3));

        const glowTexture = createGlowSpriteTexture('#06B6D4');
        const satMat = new THREE.PointsMaterial({
          size: 1.6,
          map: glowTexture,
          transparent: true,
          opacity: 0.9,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
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
