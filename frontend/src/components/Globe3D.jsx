import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RotateCcw, Crosshair, Radio, ShieldAlert, Play, Pause, Zap, Flame, CheckCircle2, Shield, FastForward } from 'lucide-react';
import { sound } from '../utils/audio';
import { formatDistance, formatScientific, getTierData } from '../utils/constants';

// Helper: Circular radial glow sprite texture
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

// Helper: Physical 3D Satellite Mesh (Bus + Solar Arrays)
function createSatelliteModel(bodyColorHex = 0xffd700, wingColorHex = 0x0284c7) {
  const group = new THREE.Group();

  // Central Satellite Body
  const bodyGeom = new THREE.BoxGeometry(0.2, 0.2, 0.26);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColorHex,
    metalness: 0.8,
    roughness: 0.2,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  group.add(body);

  // Solar Wings
  const wingGeom = new THREE.BoxGeometry(0.5, 0.02, 0.18);
  const wingMat = new THREE.MeshStandardMaterial({
    color: wingColorHex,
    metalness: 0.6,
    roughness: 0.3,
  });

  const leftWing = new THREE.Mesh(wingGeom, wingMat);
  leftWing.position.set(-0.38, 0, 0);
  group.add(leftWing);

  const rightWing = new THREE.Mesh(wingGeom, wingMat);
  rightWing.position.set(0.38, 0, 0);
  group.add(rightWing);

  // Antenna Dish
  const dishGeom = new THREE.ConeGeometry(0.09, 0.12, 16);
  const dishMat = new THREE.MeshStandardMaterial({ color: 0xffffff, metalness: 0.9, roughness: 0.1 });
  const dish = new THREE.Mesh(dishGeom, dishMat);
  dish.rotation.x = Math.PI;
  dish.position.set(0, 0.16, 0);
  group.add(dish);

  return group;
}

export default function Globe3D({ 
  selectedEvent, 
  activeEvents = [], 
  objects = [], 
  initialMode = 'live',
  onModeChange 
}) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const earthGroupRef = useRef(null);
  const orbitsGroupRef = useRef(null);
  const satellitesGroupRef = useRef(null);
  const conjunctionGroupRef = useRef(null);
  const debrisGroupRef = useRef(null);
  const animFrameIdRef = useRef(null);

  // Mode: 'live' | 'collision_2009' | 'avoidance_2009'
  const [simMode, setSimMode] = useState(initialMode);
  const [isPlaying, setIsPlaying] = useState(true);
  const [simProgress, setSimProgress] = useState(0); // 0 (T-24h) to 1.0 (T+2h)
  const [simSpeed, setSimSpeed] = useState(1); // 1x, 5x, 15x
  const [autoRotate, setAutoRotate] = useState(true);

  // Mouse interaction state
  const isDraggingRef = useRef(false);
  const prevMousePosRef = useRef({ x: 0, y: 0 });
  const targetRotationRef = useRef({ x: 0.25, y: 0.8 });
  const currentRotationRef = useRef({ x: 0.25, y: 0.8 });
  const cameraDistanceRef = useRef(20);

  const simProgressRef = useRef(0);
  const isPlayingRef = useRef(true);
  const simSpeedRef = useRef(1);
  const simModeRef = useRef(initialMode);

  useEffect(() => {
    simModeRef.current = simMode;
    if (onModeChange) onModeChange(simMode);
  }, [simMode, onModeChange]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    simSpeedRef.current = simSpeed;
  }, [simSpeed]);

  useEffect(() => {
    simProgressRef.current = simProgress;
  }, [simProgress]);

  // Main Three.js Setup
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

    // 4. Lights
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

    // 5a. Procedural Vector Earth Texture
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    // Deep ocean base
    ctx.fillStyle = '#081122';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Coordinate graticules
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

    const landmasses = [
      [[350, 180], [600, 160], [700, 260], [650, 420], [550, 480], [450, 450], [380, 320]],
      [[580, 500], [720, 540], [780, 680], [700, 850], [620, 850], [560, 680]],
      [[1050, 180], [1280, 160], [1320, 320], [1150, 380], [1020, 340]],
      [[1280, 160], [1750, 180], [1820, 380], [1650, 500], [1400, 480], [1320, 320]],
      [[1020, 400], [1280, 400], [1340, 600], [1250, 820], [1100, 820], [980, 550]],
      [[1550, 620], [1780, 620], [1820, 780], [1600, 820], [1520, 720]],
    ];
    landmasses.forEach(p => {
      ctx.beginPath();
      p.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt[0], pt[1]);
        else ctx.lineTo(pt[0], pt[1]);
      });
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });

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

    const debrisGroup = new THREE.Group();
    earthParent.add(debrisGroup);
    debrisGroupRef.current = debrisGroup;

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

      // Update simulation progress if playing
      if (isPlayingRef.current && simModeRef.current !== 'live') {
        let nextP = simProgressRef.current + delta * 0.04 * simSpeedRef.current;
        if (nextP > 1.0) nextP = 0; // loop
        simProgressRef.current = nextP;
        setSimProgress(nextP);
      }

      if (autoRotate && !isDraggingRef.current) {
        targetRotationRef.current.y += delta * 0.06;
      }

      currentRotationRef.current.x += (targetRotationRef.current.x - currentRotationRef.current.x) * 0.1;
      currentRotationRef.current.y += (targetRotationRef.current.y - currentRotationRef.current.y) * 0.1;

      if (earthParent) {
        earthParent.rotation.y = currentRotationRef.current.y;
        earthParent.rotation.x = currentRotationRef.current.x;
      }

      // Animate Satellites depending on mode
      const currentMode = simModeRef.current;
      const p = simProgressRef.current; // 0 to 1.0 (TCA at p = 0.8)
      const tcaFraction = 0.8;

      if (satellitesGroup) {
        satellitesGroup.children.forEach(sat => {
          if (currentMode === 'live') {
            if (sat.userData?.orbitRadius) {
              const angle = time * sat.userData.speed + sat.userData.initialAngle;
              const r = sat.userData.orbitRadius;
              sat.position.set(r * Math.cos(angle), 0, r * Math.sin(angle));
              sat.rotation.y = -angle;
            }
          } else {
            // Replay mode: position is driven strictly by progress p
            if (sat.userData?.isTarget2009) {
              // Iridium 33 approach angle -> reaches encounter at p = tcaFraction
              const startAngle = -Math.PI * 0.8;
              const encAngle = 0; // encounter at angle 0
              const currentAngle = startAngle + (encAngle - startAngle) * (p / tcaFraction);
              const r = sat.userData.orbitRadius;
              
              if (currentMode === 'avoidance_2009') {
                // Post-burn offset expanding
                const offsetR = r + (p > 0.2 ? 0.00483 * 80 : 0); // exaggerated slightly for 3D visibility
                sat.position.set(offsetR * Math.cos(currentAngle), (p > 0.2 ? 0.4 : 0), offsetR * Math.sin(currentAngle));
              } else {
                // Collision mode
                if (p < tcaFraction) {
                  sat.position.set(r * Math.cos(currentAngle), 0, r * Math.sin(currentAngle));
                  sat.visible = true;
                } else {
                  // Satellite destroyed at TCA!
                  sat.visible = false;
                }
              }
            } else if (sat.userData?.isChaser2009) {
              // Cosmos 2251 approach angle
              const startAngle = Math.PI * 0.8;
              const encAngle = 0;
              const currentAngle = startAngle + (encAngle - startAngle) * (p / tcaFraction);
              const r = sat.userData.orbitRadius;

              if (currentMode === 'collision_2009' && p >= tcaFraction) {
                sat.visible = false; // Destroyed in collision
              } else {
                sat.visible = true;
                sat.position.set(r * Math.cos(currentAngle), 0, r * Math.sin(currentAngle));
              }
            }
          }
        });
      }

      // Animate Debris Cloud in 2009 Collision Mode
      if (debrisGroup) {
        if (currentMode === 'collision_2009' && p >= tcaFraction) {
          debrisGroup.visible = true;
          const debrisExpansion = (p - tcaFraction) * 12;
          debrisGroup.children.forEach(fragment => {
            if (fragment.userData?.dir) {
              fragment.position.x = fragment.userData.origin.x + fragment.userData.dir.x * debrisExpansion;
              fragment.position.y = fragment.userData.origin.y + fragment.userData.dir.y * debrisExpansion;
              fragment.position.z = fragment.userData.origin.z + fragment.userData.dir.z * debrisExpansion;
            }
          });
        } else {
          debrisGroup.visible = false;
        }
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

  // Update Geometry whenever Mode / Events change
  useEffect(() => {
    if (!orbitsGroupRef.current || !conjunctionGroupRef.current || !satellitesGroupRef.current || !debrisGroupRef.current) return;

    while (orbitsGroupRef.current.children.length > 0) {
      orbitsGroupRef.current.remove(orbitsGroupRef.current.children[0]);
    }
    while (conjunctionGroupRef.current.children.length > 0) {
      conjunctionGroupRef.current.remove(conjunctionGroupRef.current.children[0]);
    }
    while (satellitesGroupRef.current.children.length > 0) {
      satellitesGroupRef.current.remove(satellitesGroupRef.current.children[0]);
    }
    while (debrisGroupRef.current.children.length > 0) {
      debrisGroupRef.current.remove(debrisGroupRef.current.children[0]);
    }

    const scaleFactor = 1 / 1000;

    const createOrbitRing = (radiusKm, incDeg, raanDeg, colorHex, isDashed = false) => {
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
        opacity: isDashed ? 0.4 : 0.85,
        linewidth: 2,
      });
      const line = new THREE.Line(geom, mat);
      line.rotation.z = (incDeg || 0) * (Math.PI / 180);
      line.rotation.y = (raanDeg || 0) * (Math.PI / 180);
      return line;
    };

    if (simMode === 'live') {
      // Live Tracking Mode
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

          const targetSat = createSatelliteModel(0xffd700, 0x0284c7);
          targetSat.userData = { orbitRadius: altKm * scaleFactor, speed: 0.3, initialAngle: idx * 0.8 };
          targetSat.rotation.z = incA * (Math.PI / 180);
          satellitesGroupRef.current.add(targetSat);

          const chaserSat = createSatelliteModel(0xef4444, 0x334155);
          chaserSat.userData = { orbitRadius: altKm * scaleFactor, speed: -0.28, initialAngle: idx * 0.8 + 1.2 };
          chaserSat.rotation.z = incB * (Math.PI / 180);
          satellitesGroupRef.current.add(chaserSat);

          const encDist = altKm * scaleFactor;
          const encX = encDist * Math.cos(idx * 0.8);
          const encY = encDist * Math.sin(incA * Math.PI / 180) * 0.7;
          const encZ = encDist * Math.sin(idx * 0.8);

          const coreGeom = new THREE.SphereGeometry(0.18, 16, 16);
          const coreMat = new THREE.MeshBasicMaterial({ color: isCritical ? 0xef4444 : 0xf59e0b });
          const coreMesh = new THREE.Mesh(coreGeom, coreMat);
          coreMesh.position.set(encX, encY, encZ);
          coreMesh.userData = { isBeacon: true, event: ev };
          conjunctionGroupRef.current.add(coreMesh);
        }
      });

      // Background Catalog Satellites
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
    } else {
      // 2009 Collision or Avoidance Mode
      const altKm = 7167; // 789 km altitude (R_earth + 789 = 7167 km)
      const incIridium = 86.4;
      const incCosmos = 74.0;

      // 1. Orbits
      if (simMode === 'collision_2009') {
        // Red / Amber collision tracks
        const orbitIridium = createOrbitRing(altKm, incIridium, 0, 0xef4444);
        const orbitCosmos = createOrbitRing(altKm, incCosmos, 45, 0xf59e0b);
        orbitsGroupRef.current.add(orbitIridium);
        orbitsGroupRef.current.add(orbitCosmos);
      } else {
        // Avoidance mode: Shows original collision track (dashed) + Green modified avoidance track
        const orbitOriginal = createOrbitRing(altKm, incIridium, 0, 0xef4444, true);
        const orbitAvoidance = createOrbitRing(altKm + 4.83, incIridium, 0, 0x10b981);
        const orbitCosmos = createOrbitRing(altKm, incCosmos, 45, 0xf59e0b);
        orbitsGroupRef.current.add(orbitOriginal);
        orbitsGroupRef.current.add(orbitAvoidance);
        orbitsGroupRef.current.add(orbitCosmos);
      }

      // 2. 3D Satellite Models
      const iridiumSat = createSatelliteModel(0xffd700, 0x0284c7);
      iridiumSat.userData = { orbitRadius: altKm * scaleFactor, isTarget2009: true };
      iridiumSat.rotation.z = incIridium * (Math.PI / 180);
      satellitesGroupRef.current.add(iridiumSat);

      const cosmosSat = createSatelliteModel(0x94a3b8, 0x334155);
      cosmosSat.userData = { orbitRadius: altKm * scaleFactor, isChaser2009: true };
      cosmosSat.rotation.z = incCosmos * (Math.PI / 180);
      cosmosSat.rotation.y = 45 * (Math.PI / 180);
      satellitesGroupRef.current.add(cosmosSat);

      // 3. Encounter Node
      const encDist = altKm * scaleFactor;
      const encX = encDist;
      const encY = 0;
      const encZ = 0;

      const encounterNode = new THREE.Mesh(
        new THREE.SphereGeometry(0.2, 16, 16),
        new THREE.MeshBasicMaterial({ color: simMode === 'collision_2009' ? 0xef4444 : 0x10b981 })
      );
      encounterNode.position.set(encX, encY, encZ);
      encounterNode.userData = { isBeacon: true };
      conjunctionGroupRef.current.add(encounterNode);

      // 4. Generate 200 Debris Fragments for Collision Shockwave
      if (simMode === 'collision_2009') {
        const debrisCount = 180;
        for (let i = 0; i < debrisCount; i++) {
          const fragment = new THREE.Mesh(
            new THREE.BoxGeometry(0.04, 0.04, 0.04),
            new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0xff4444 : 0xffaa00 })
          );
          const theta = Math.random() * Math.PI * 2;
          const phi = Math.acos(2 * Math.random() - 1);
          const speed = Math.random() * 0.4 + 0.1;
          fragment.userData = {
            origin: new THREE.Vector3(encX, encY, encZ),
            dir: new THREE.Vector3(
              Math.sin(phi) * Math.cos(theta) * speed,
              Math.sin(phi) * Math.sin(theta) * speed,
              Math.cos(phi) * speed
            ),
          };
          fragment.position.set(encX, encY, encZ);
          debrisGroupRef.current.add(fragment);
        }
      }
    }
  }, [simMode, selectedEvent, activeEvents, objects]);

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
    <div className="relative w-full h-[520px] lg:h-[600px] rounded-lg overflow-hidden border border-space-800 bg-[#040711] shadow-2xl select-none font-mono">
      {/* Three.js Canvas Container */}
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Center Simulation Mode Switcher Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 p-1 bg-space-950/90 border border-space-800 rounded-lg shadow-xl backdrop-blur-md text-xs">
        <button
          onClick={() => {
            sound.playClick();
            setSimMode('live');
          }}
          className={`px-3 py-1.5 rounded text-[11px] font-semibold uppercase transition-all flex items-center gap-1.5 ${
            simMode === 'live'
              ? 'bg-telemetry-emerald text-black shadow-sm'
              : 'text-space-400 hover:text-white hover:bg-space-900'
          }`}
        >
          <Radio className="w-3.5 h-3.5" />
          <span>Live Radar</span>
        </button>

        <button
          onClick={() => {
            sound.playClick();
            setSimMode('collision_2009');
            setSimProgress(0);
            setIsPlaying(true);
          }}
          className={`px-3 py-1.5 rounded text-[11px] font-semibold uppercase transition-all flex items-center gap-1.5 ${
            simMode === 'collision_2009'
              ? 'bg-red-500 text-white shadow-sm'
              : 'text-space-400 hover:text-white hover:bg-space-900'
          }`}
        >
          <Flame className="w-3.5 h-3.5" />
          <span>1. Simulate 2009 Collision</span>
        </button>

        <button
          onClick={() => {
            sound.playSuccess();
            setSimMode('avoidance_2009');
            setSimProgress(0);
            setIsPlaying(true);
          }}
          className={`px-3 py-1.5 rounded text-[11px] font-semibold uppercase transition-all flex items-center gap-1.5 ${
            simMode === 'avoidance_2009'
              ? 'bg-telemetry-cyan text-black shadow-sm'
              : 'text-space-400 hover:text-white hover:bg-space-900'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>2. Simulate Escape Maneuver</span>
        </button>
      </div>

      {/* Top Left HUD Telemetry Readout */}
      <div className="absolute top-16 left-4 z-10 flex flex-col gap-1.5 p-3 rounded bg-space-950/90 border border-space-800 text-xs backdrop-blur-md">
        <div className="flex items-center gap-2 text-white font-medium uppercase text-xs">
          <div className={`w-2 h-2 rounded-full animate-pulse ${
            simMode === 'collision_2009' ? 'bg-red-500' : simMode === 'avoidance_2009' ? 'bg-telemetry-cyan' : 'bg-telemetry-emerald'
          }`} />
          <span>
            {simMode === 'live' ? 'LIVE RADAR TRACKING' : simMode === 'collision_2009' ? '2009 COLLISION REENACTMENT' : 'CW AVOIDANCE SIMULATION'}
          </span>
        </div>
        
        {simMode === 'live' ? (
          <>
            <div className="text-space-400 text-[11px] flex justify-between gap-4">
              <span>FRAME:</span>
              <span className="text-telemetry-cyan font-semibold">GCRS / ECI</span>
            </div>
            <div className="text-space-400 text-[11px] flex justify-between gap-4">
              <span>ALTITUDE:</span>
              <span className="text-space-300">LEO (789 km)</span>
            </div>
          </>
        ) : simMode === 'collision_2009' ? (
          <div className="flex flex-col gap-0.5 text-[11px]">
            <span className="text-red-400 font-semibold">Iridium 33 × Cosmos 2251</span>
            <span className="text-space-300">Rel Speed: 14.12 km/s (Head-On)</span>
            <span className="text-red-400 font-medium">Impact: 10 Feb 2009 16:56 UTC</span>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5 text-[11px]">
            <span className="text-telemetry-cyan font-semibold">Iridium 33 Escape Burn</span>
            <span className="text-space-300">ΔV = 0.10 m/s at T - 24h</span>
            <span className="text-telemetry-emerald font-semibold">Clearance: +4.83 km (Safe)</span>
          </div>
        )}
      </div>

      {/* Top Right Controls */}
      <div className="absolute top-16 right-4 z-10 flex items-center gap-2">
        <button
          onClick={handleToggleRotate}
          title={autoRotate ? 'Pause Rotation' : 'Resume Rotation'}
          className={`px-3 py-1.5 rounded border text-xs transition-all flex items-center gap-1.5 backdrop-blur-md ${
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
          title="Reset Camera"
          className="p-1.5 rounded border border-space-800 bg-space-950/90 text-space-300 hover:text-white hover:border-space-700 transition-all backdrop-blur-md"
        >
          <Crosshair className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Timeline Control Bar (Active in 2009 Collision & Avoidance modes) */}
      {simMode !== 'live' ? (
        <div className="absolute bottom-4 left-4 right-4 z-20 p-3 bg-space-950/95 border border-space-800 rounded-lg shadow-2xl backdrop-blur-md flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  sound.playClick();
                  setIsPlaying(!isPlaying);
                }}
                className="p-1.5 rounded bg-space-800 hover:bg-space-700 text-white border border-space-700"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setSimProgress(0);
                }}
                title="Restart Simulation"
                className="p-1.5 rounded bg-space-850 hover:bg-space-800 text-space-300 hover:text-white border border-space-700"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 text-xs text-space-300 font-mono">
                <span className="text-space-500">Timeline:</span>
                <strong className={simProgress >= 0.8 ? (simMode === 'collision_2009' ? 'text-red-400' : 'text-telemetry-emerald') : 'text-white'}>
                  {simProgress < 0.8 
                    ? `T - ${((0.8 - simProgress) * 30).toFixed(1)}h`
                    : simProgress === 0.8
                    ? 'TCA (16:56:00 UTC)'
                    : `T + ${((simProgress - 0.8) * 10).toFixed(1)}h`}
                </strong>
              </div>
            </div>

            {/* Status Message Banner */}
            <div className="hidden sm:flex items-center gap-2 text-xs">
              {simMode === 'collision_2009' ? (
                simProgress >= 0.8 ? (
                  <span className="px-2.5 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40 font-semibold flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    CATASTROPHIC IMPACT · DEBRIS SCATTERING
                  </span>
                ) : (
                  <span className="text-red-400">Head-on closing rate: 14.1 km/s (Pc: 2.0e-4)</span>
                )
              ) : (
                simProgress >= 0.8 ? (
                  <span className="px-2.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-telemetry-emerald" />
                    SAFE CLEARANCE: +4.83 KM · NO COLLISION
                  </span>
                ) : (
                  <span className="text-telemetry-cyan">Avoidance burn applied at T-24h (ΔV: 0.10 m/s)</span>
                )
              )}
            </div>

            {/* Speed Multipliers */}
            <div className="flex items-center gap-1">
              {[1, 5, 15].map(spd => (
                <button
                  key={spd}
                  onClick={() => {
                    sound.playClick();
                    setSimSpeed(spd);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono border transition-colors ${
                    simSpeed === spd
                      ? 'bg-space-700 text-white border-space-500 font-semibold'
                      : 'bg-space-900 text-space-400 border-space-800 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Scrub Bar */}
          <input
            type="range"
            min="0"
            max="1"
            step="0.005"
            value={simProgress}
            onChange={(e) => {
              const val = Number(e.target.value);
              setSimProgress(val);
            }}
            className="w-full h-1.5 bg-space-800 rounded appearance-none cursor-pointer accent-telemetry-emerald"
          />
        </div>
      ) : (
        /* Live Mode Status Indicator */
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 px-4 py-1 rounded bg-space-950/85 border border-space-800 text-[11px] text-space-400 font-mono flex items-center gap-3 backdrop-blur-md">
          <span>Drag to Rotate</span>
          <span className="text-space-700">|</span>
          <span>Scroll to Zoom</span>
          <span className="text-space-700">|</span>
          <span className="text-telemetry-cyan font-medium">
            {activeEvents.length} Conjunctions Tracked
          </span>
        </div>
      )}
    </div>
  );
}
