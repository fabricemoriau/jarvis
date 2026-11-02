import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  Layers,
  Server,
  Smartphone,
  Cpu,
  Zap,
  Activity,
  Maximize2,
  RefreshCw,
  Eye,
  Sliders,
  Shield,
  Radio,
  Sparkles,
} from 'lucide-react';
import { ServerTelemetry } from '../../types';

interface HologramCenterModuleProps {
  telemetry: ServerTelemetry | null;
  onNotify: (msg: string) => void;
  onQuickAction?: (cmd: string) => void;
}

type ProjectionMode = 'server_rack' | 'network_globe' | 'arc_core' | 'ai_neural';

export const HologramCenterModule: React.FC<HologramCenterModuleProps> = ({
  telemetry,
  onNotify,
  onQuickAction,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeProjection, setActiveProjection] = useState<ProjectionMode>('server_rack');
  const [wireframeMode, setWireframeMode] = useState<boolean>(true);
  const [rotationSpeed, setRotationSpeed] = useState<number>(1);
  const [showDataNodes, setShowDataNodes] = useState<boolean>(true);
  const [scanActive, setScanActive] = useState<boolean>(true);
  const [holoColor, setHoloColor] = useState<string>('#00f2fe');

  // Diagnostic metrics
  const cpuPercent = telemetry?.liveMetrics.cpuPercent ?? 24;
  const ramPercent = telemetry?.liveMetrics.ramPercent ?? 34;
  const tempCelsius = telemetry?.liveMetrics.tempCelsius ?? 42;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Three.js Scene Setup
    const width = container.clientWidth || 800;
    const height = Math.max(container.clientHeight || 520, 500);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x040711, 0.035);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 3, 9);
    camera.lookAt(0, 0, 0);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) {
      console.warn('WebGL init fallback:', e);
      return;
    }

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Hologram Lighting
    const ambientLight = new THREE.AmbientLight(0x00f2fe, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x38bdf8, 2, 20);
    pointLight.position.set(2, 4, 3);
    scene.add(pointLight);

    const redLight = new THREE.PointLight(0xef4444, 1.2, 15);
    redLight.position.set(-3, -2, -2);
    scene.add(redLight);

    // Circular Holographic Floor Grid
    const floorGrid = new THREE.GridHelper(16, 24, 0x00f2fe, 0x0369a1);
    floorGrid.position.y = -2;
    scene.add(floorGrid);

    // Holographic Projection Rings on the floor
    const ringGeo = new THREE.RingGeometry(2.5, 2.58, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x00f2fe,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const floorRing = new THREE.Mesh(ringGeo, ringMat);
    floorRing.rotation.x = Math.PI / 2;
    floorRing.position.y = -1.99;
    scene.add(floorRing);

    const outerRingGeo = new THREE.RingGeometry(4.8, 4.88, 64);
    const outerRing = new THREE.Mesh(outerRingGeo, ringMat);
    outerRing.rotation.x = Math.PI / 2;
    outerRing.position.y = -1.99;
    scene.add(outerRing);

    // Particle Cloud around Hologram
    const particleCount = 180;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 12;
      particlePositions[i + 1] = (Math.random() - 0.5) * 8;
      particlePositions[i + 2] = (Math.random() - 0.5) * 12;
    }
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.06,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Active Model Group
    const modelGroup = new THREE.Group();
    scene.add(modelGroup);

    // Color conversion
    const baseColor = new THREE.Color(holoColor);

    // BUILD PROJECTION BASED ON SELECTION
    if (activeProjection === 'server_rack') {
      // 1. DEDICATED DEBIAN SERVER RACK (192.168.1.98)
      const chassisMat = new THREE.MeshStandardMaterial({
        color: 0x0369a1,
        wireframe: wireframeMode,
        transparent: true,
        opacity: 0.85,
        emissive: baseColor,
        emissiveIntensity: 0.25,
      });

      // Main Rack Chassis
      const chassisGeo = new THREE.BoxGeometry(3.2, 1.8, 4.2);
      const chassis = new THREE.Mesh(chassisGeo, chassisMat);
      modelGroup.add(chassis);

      // Server bay front face & drive bays
      for (let i = -1.2; i <= 1.2; i += 0.45) {
        const bayGeo = new THREE.BoxGeometry(0.35, 1.4, 0.2);
        const bayMat = new THREE.MeshBasicMaterial({
          color: 0x00f2fe,
          wireframe: wireframeMode,
        });
        const bay = new THREE.Mesh(bayGeo, bayMat);
        bay.position.set(i, 0, 2.15);
        modelGroup.add(bay);
      }

      // CPU Socket Glow center
      const cpuGeo = new THREE.CylinderGeometry(0.5, 0.5, 0.1, 16);
      const cpuMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xef4444,
        emissiveIntensity: 0.8,
        wireframe: false,
      });
      const cpu = new THREE.Mesh(cpuGeo, cpuMat);
      cpu.position.set(0, 0.95, 0);
      modelGroup.add(cpu);

      // Dual NVMe M.2 heatsinks
      const nvmeGeo = new THREE.BoxGeometry(0.2, 0.08, 1.2);
      const nvmeMat = new THREE.MeshBasicMaterial({ color: 0x10b981, wireframe: true });
      const nvme1 = new THREE.Mesh(nvmeGeo, nvmeMat);
      nvme1.position.set(0.9, 0.95, -0.4);
      const nvme2 = new THREE.Mesh(nvmeGeo, nvmeMat);
      nvme2.position.set(-0.9, 0.95, -0.4);
      modelGroup.add(nvme1);
      modelGroup.add(nvme2);

    } else if (activeProjection === 'network_globe') {
      // 2. WIREGUARD VPN & GLOBAL NETWORK TOPOLOGY
      const globeGeo = new THREE.SphereGeometry(2, 28, 28);
      const globeMat = new THREE.MeshStandardMaterial({
        color: 0x0284c7,
        wireframe: wireframeMode,
        transparent: true,
        opacity: 0.75,
        emissive: baseColor,
        emissiveIntensity: 0.3,
      });
      const globe = new THREE.Mesh(globeGeo, globeMat);
      modelGroup.add(globe);

      // Orbital Rings (WireGuard satellite orbits)
      const orbit1Geo = new THREE.TorusGeometry(2.8, 0.02, 16, 100);
      const orbitMat = new THREE.MeshBasicMaterial({ color: 0x00f2fe, transparent: true, opacity: 0.6 });
      const orbit1 = new THREE.Mesh(orbit1Geo, orbitMat);
      orbit1.rotation.x = Math.PI / 3;
      modelGroup.add(orbit1);

      const orbit2Geo = new THREE.TorusGeometry(3.3, 0.02, 16, 100);
      const orbitMat2 = new THREE.MeshBasicMaterial({ color: 0x10b981, transparent: true, opacity: 0.6 });
      const orbit2 = new THREE.Mesh(orbit2Geo, orbitMat2);
      orbit2.rotation.y = Math.PI / 4;
      modelGroup.add(orbit2);

      // Home Server Point Node (France / Local)
      const serverPinGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const serverPinMat = new THREE.MeshBasicMaterial({ color: 0x10b981 });
      const serverPin = new THREE.Mesh(serverPinGeo, serverPinMat);
      serverPin.position.set(0.8, 1.4, 1.2);
      modelGroup.add(serverPin);

      // Mobile S24 Client Point Node
      const mobilePinGeo = new THREE.SphereGeometry(0.1, 16, 16);
      const mobilePinMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
      const mobilePin = new THREE.Mesh(mobilePinGeo, mobilePinMat);
      mobilePin.position.set(-1.2, 0.6, 1.5);
      modelGroup.add(mobilePin);

    } else if (activeProjection === 'arc_core') {
      // 3. ARC REACTOR MARK 85 3D PROJECTION
      for (let r = 0; r < 5; r++) {
        const arcRingGeo = new THREE.TorusGeometry(0.7 + r * 0.45, 0.04, 16, 64);
        const arcRingMat = new THREE.MeshStandardMaterial({
          color: r % 2 === 0 ? 0x00f2fe : 0x38bdf8,
          wireframe: wireframeMode,
          emissive: baseColor,
          emissiveIntensity: 0.7,
        });
        const arcRing = new THREE.Mesh(arcRingGeo, arcRingMat);
        arcRing.rotation.x = (r * Math.PI) / 8;
        arcRing.rotation.y = (r * Math.PI) / 6;
        modelGroup.add(arcRing);
      }

      // Core plasma sphere
      const plasmaGeo = new THREE.IcosahedronGeometry(0.65, 3);
      const plasmaMat = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        emissive: 0x00f2fe,
        emissiveIntensity: 1.2,
        wireframe: wireframeMode,
      });
      const plasma = new THREE.Mesh(plasmaGeo, plasmaMat);
      modelGroup.add(plasma);

    } else if (activeProjection === 'ai_neural') {
      // 4. MULTI-AI NEURAL MESH CONSTELLATION
      const nodes: THREE.Vector3[] = [];
      const nodeCount = 32;
      for (let i = 0; i < nodeCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / nodeCount);
        const theta = Math.sqrt(nodeCount * Math.PI) * phi;
        const radius = 2.4;
        const pos = new THREE.Vector3(
          radius * Math.cos(theta) * Math.sin(phi),
          radius * Math.sin(theta) * Math.sin(phi),
          radius * Math.cos(phi)
        );
        nodes.push(pos);

        const nodeMeshGeo = new THREE.SphereGeometry(0.08, 12, 12);
        const nodeMeshMat = new THREE.MeshBasicMaterial({
          color: i % 4 === 0 ? 0xef4444 : i % 2 === 0 ? 0x10b981 : 0x00f2fe,
        });
        const nodeMesh = new THREE.Mesh(nodeMeshGeo, nodeMeshMat);
        nodeMesh.position.copy(pos);
        modelGroup.add(nodeMesh);
      }

      // Connecting synaptic beams
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (nodes[i].distanceTo(nodes[j]) < 1.7) {
            const linePoints = [nodes[i], nodes[j]];
            const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
            const lineMat = new THREE.LineBasicMaterial({
              color: 0x0284c7,
              transparent: true,
              opacity: 0.35,
            });
            const line = new THREE.Line(lineGeo, lineMat);
            modelGroup.add(line);
          }
        }
      }
    }

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Continuous subtle yaw & roll
      const speed = rotationSpeed * 0.6;
      modelGroup.rotation.y += speed * delta;
      modelGroup.rotation.x = Math.sin(time * 0.5) * 0.08;

      // Pulse floor rings
      floorRing.rotation.z += 0.01;
      outerRing.rotation.z -= 0.007;

      // Particle float
      particleSystem.rotation.y += 0.002;

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight || 500;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [activeProjection, wireframeMode, rotationSpeed, holoColor]);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl hud-glass border border-cyan-500/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/50 flex items-center justify-center text-cyan-400 shadow-lg shadow-cyan-500/20">
            <Layers className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-hud font-bold text-white tracking-wider">
                CENTRE HOLOGRAPHIQUE INTERACTIF 3D
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                PROJECTION ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              Visualisation spatiale temps réel du serveur Debian (192.168.1.98) & de l'écosystème JARVIS
            </p>
          </div>
        </div>

        {/* Projection Mode Selector Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-cyan-500/30">
          <button
            onClick={() => setActiveProjection('server_rack')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition-all ${
              activeProjection === 'server_rack'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            <span>Serveur Debian</span>
          </button>

          <button
            onClick={() => setActiveProjection('network_globe')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition-all ${
              activeProjection === 'network_globe'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>Réseau WireGuard</span>
          </button>

          <button
            onClick={() => setActiveProjection('arc_core')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition-all ${
              activeProjection === 'arc_core'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Réacteur Arc 3D</span>
          </button>

          <button
            onClick={() => setActiveProjection('ai_neural')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud transition-all ${
              activeProjection === 'ai_neural'
                ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Matrice IA</span>
          </button>
        </div>
      </div>

      {/* Main Holographic Projection Viewport */}
      <div className="relative rounded-2xl overflow-hidden border border-cyan-500/30 bg-[#02050e] shadow-2xl shadow-cyan-950/60">
        {/* Hologram Scanlines Overlay */}
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(4,7,17,0.85)_100%)] z-10" />
        
        {scanActive && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-10 opacity-30">
            <div className="w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan" />
          </div>
        )}

        {/* 3D Canvas Mount */}
        <div ref={containerRef} className="w-full h-[540px] cursor-grab active:cursor-grabbing" />

        {/* Top-Left Floating HUD telemetry overlay */}
        <div className="absolute top-4 left-4 z-20 space-y-2 pointer-events-none">
          <div className="px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-cyan-500/40 text-xs font-mono text-cyan-300 shadow-lg">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="font-bold">NŒUD DÉDIÉ : 192.168.1.98</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">
              Debian Buster i686 • Port SSH 22 • Port HTTP 3000
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              CPU : <span className="text-cyan-400 font-bold">{cpuPercent}%</span> ({tempCelsius}°C)
            </div>
            <div className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              RAM : <span className="text-blue-400 font-bold">{ramPercent}%</span>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-300">
              TUNNEL : <span className="text-emerald-400 font-bold">100.84.12.9</span>
            </div>
          </div>
        </div>

        {/* Top-Right Hologram View Controls */}
        <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
          <button
            onClick={() => setWireframeMode(!wireframeMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud border backdrop-blur-md transition-colors ${
              wireframeMode
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Activer/Désactiver le rendu fil de fer holographique"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Fil de fer</span>
          </button>

          <button
            onClick={() => setScanActive(!scanActive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud border backdrop-blur-md transition-colors ${
              scanActive
                ? 'bg-cyan-500/20 border-cyan-400 text-cyan-200'
                : 'bg-slate-950/80 border-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Activer/Désactiver le laser de scan"
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Balayage Laser</span>
          </button>

          <button
            onClick={() => setRotationSpeed(rotationSpeed === 1 ? 2 : rotationSpeed === 2 ? 0.2 : 1)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-hud bg-slate-950/80 border border-slate-800 text-slate-300 hover:text-white backdrop-blur-md transition-colors"
            title="Ajuster la vitesse de rotation"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            <span>Rotation : {rotationSpeed}x</span>
          </button>
        </div>

        {/* Bottom Floating Telemetry Bar */}
        <div className="absolute bottom-4 inset-x-4 z-20 flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/85 backdrop-blur-md border border-cyan-500/30">
          <div className="flex items-center gap-3 text-xs font-mono text-slate-300">
            <span className="text-cyan-400 font-bold">STATUS :</span>
            <span>
              {activeProjection === 'server_rack'
                ? 'CHÂSSIS SERVEUR DÉDIÉ CONNECTÉ • RAID NVME 8TB INTÈGRE • RECONNAISSANCE FACIALE ET CLUSTER PRÊTS'
                : activeProjection === 'network_globe'
                ? 'TUNNEL WIREGUARD ACTIF • SMARTPHONE DE FABRICE RELIÉ AU RÉSEAU LOCAL SÉCURISÉ'
                : activeProjection === 'arc_core'
                ? 'RÉACTEUR ARC COEUR NUMÉRIQUE • FRÉQUENCE D’ÉCOUTE VOCALE ET COMPILATION JETPACK OPTIMALES'
                : 'RÉSEAU NEURAL DISTRIBUÉ • GEMINI 3.8 FLASH CLOUD + MODÈLES LOCAUX RTX 4090'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onNotify('Diagnostic holographique complet exécuté : tous les sous-systèmes sont nominaux.');
                if (onQuickAction) onQuickAction('Rapport d’état complet du serveur dédié');
              }}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-hud font-bold shadow-md shadow-cyan-500/25 transition-all active:scale-95"
            >
              Lancer Diagnostic
            </button>
          </div>
        </div>
      </div>

      {/* Hologram Controls & Subsystems Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1: Machine info */}
        <div className="hud-glass p-4 rounded-xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-hud uppercase tracking-wider text-slate-400">Hôte Physique Local</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              EN LIGNE
            </span>
          </div>
          <div className="text-sm font-mono text-white font-bold">Debian GNU/Linux 4.19 (i686)</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Machine dédiée hébergée chez Monsieur Fabrice. Aucun abonnement tiers requis, contrôle absolu des données.
          </p>
        </div>

        {/* Card 2: Voice & Visual feedback */}
        <div className="hud-glass p-4 rounded-xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-hud uppercase tracking-wider text-slate-400">Canal Audio Majordome</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              SYNTHÈSE FR
            </span>
          </div>
          <div className="text-sm font-hud text-white font-bold">Voix J.A.R.V.I.S. Active</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ordres vocaux traités directement. Réponse instantanée au micro avec accents cybernétiques.
          </p>
        </div>

        {/* Card 3: Mobile gateway */}
        <div className="hud-glass p-4 rounded-xl border border-cyan-500/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-hud uppercase tracking-wider text-slate-400">Liaison Smartphone</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30">
              XIAOMI HYPEROS
            </span>
          </div>
          <div className="text-sm font-mono text-white font-bold">Tunnel UDP 51820</div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Synchronisation bidirectionnelle : réception des photos prises avec le mobile, alertes emails urgents et APK.
          </p>
        </div>
      </div>
    </div>
  );
};
