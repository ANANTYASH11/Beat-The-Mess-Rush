'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei/core/Environment';
import * as THREE from 'three';
import { Plate } from './Plate';
import { Katori } from './Katori';
import { CenterSpread } from './Food';
import { GroundShadow } from './GroundShadow';
import { CameraRig } from './CameraRig';
import { ThaliFallbackSVG } from './ThaliFallbackSVG';

interface ThaliSceneProps {
  queueCount?: number;
  waitRange?: string;
  expectedPlates?: number;
  wasteSavedKg?: number;
  className?: string;
  isFullViewport?: boolean;
}

// Internal animated thali group with gentle +/- 1 degree idle plate rock
function AnimatedThaliGroup({
  children,
}: {
  children: React.ReactNode;
}) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.getElapsedTime();
    // Idle gentle plate rock +/-1 degree (~0.017 rad)
    groupRef.current.rotation.z = Math.sin(time * 0.7) * 0.017;
    groupRef.current.rotation.x = Math.cos(time * 0.6) * 0.010;
  });

  return <group ref={groupRef} scale={1.0}>{children}</group>;
}

// Error Boundary for WebGL failures
class WebGLErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: any) {
    console.warn('WebGL initialization failed, falling back to 2D SVG thali:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function ThaliScene({
  queueCount = 20,
  waitRange = '6-11 min',
  expectedPlates = 342,
  wasteSavedKg = 42,
  className = '',
  isFullViewport = false,
}: ThaliSceneProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);
  const [dollyTarget, setDollyTarget] = useState<[number, number, number] | null>(null);
  const [hoveredKatori, setHoveredKatori] = useState<string | null>(null);
  const [activeFocusId, setActiveFocusId] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsMobile(window.innerWidth < 768);

    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch {
      setHasWebGL(false);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNavigate = (href: string, pos: [number, number, number]) => {
    setDollyTarget(pos);
    setTimeout(() => {
      router.push(href);
    }, 700);
  };

  const fallback = (
    <ThaliFallbackSVG
      queueCount={queueCount}
      waitRange={waitRange}
      expectedPlates={expectedPlates}
      wasteSavedKg={wasteSavedKg}
    />
  );

  if (!mounted) {
    return (
      <div className={`w-full aspect-square max-w-[560px] mx-auto bg-transparent rounded-full animate-pulse flex items-center justify-center ${className}`}>
        <span className="font-mono text-xs uppercase tracking-wider text-ink-muted">
          Loading 3D Thali…
        </span>
      </div>
    );
  }

  if (prefersReducedMotion || !hasWebGL) {
    return fallback;
  }

  // Four Katoris laid out on a circle of radius R = 1.15 around the center (x = +/-0.813, z = +/-0.813)
  const katoris = [
    {
      id: 'student',
      position: [-0.813, 0.05, -0.813] as [number, number, number],
      kind: 'large' as const,
      food: 'dal' as const,
      title: 'STUDENT EXPRESS',
      devanagari: 'विद्यार्थी',
      metric: `Wait: ${waitRange}`,
      href: '/student',
    },
    {
      id: 'staff',
      position: [0.813, 0.05, -0.813] as [number, number, number],
      kind: 'small' as const,
      food: 'curd' as const,
      title: 'STAFF CONTROL DECK',
      devanagari: 'कतार',
      metric: `Queue: ${queueCount} in line`,
      href: '/staff',
    },
    {
      id: 'kitchen',
      position: [-0.813, 0.05, 0.813] as [number, number, number],
      kind: 'tall' as const,
      food: 'sabzi' as const,
      title: 'KITCHEN CHALKBOARD',
      devanagari: 'रसोई',
      metric: `${expectedPlates} plates target`,
      href: '/kitchen',
    },
    {
      id: 'impact',
      position: [0.813, 0.05, 0.813] as [number, number, number],
      kind: 'shallow' as const,
      food: 'rice' as const,
      title: 'IMPACT & SAVINGS',
      devanagari: 'असर',
      metric: `${wasteSavedKg} kg waste cut`,
      href: '/impact',
    },
  ];

  const containerClass = isFullViewport
    ? 'w-full h-full min-h-[580px]'
    : 'w-full aspect-square max-w-[560px] mx-auto';

  return (
    <WebGLErrorBoundary fallback={fallback}>
      {/* 
        Canvas wrapper has background: transparent, NO white box, NO borders that show a rectangle.
      */}
      <div
        className={`relative ${containerClass} select-none bg-transparent ${className}`}
        style={{
          background: 'transparent',
        }}
      >
        {/* ── Accessible visually-hidden navigation list mirroring 3D katoris ── */}
        <nav aria-label="Thali navigation modules" className="sr-only">
          <ul>
            <li>
              <a
                href="/student"
                onFocus={() => setActiveFocusId('student')}
                onBlur={() => setActiveFocusId(null)}
              >
                Student Express (Dal bowl) — Wait {waitRange}
              </a>
            </li>
            <li>
              <a
                href="/staff"
                onFocus={() => setActiveFocusId('staff')}
                onBlur={() => setActiveFocusId(null)}
              >
                Staff Control Deck (Curd bowl) — {queueCount} students waiting
              </a>
            </li>
            <li>
              <a
                href="/kitchen"
                onFocus={() => setActiveFocusId('kitchen')}
                onBlur={() => setActiveFocusId(null)}
              >
                Kitchen Chalkboard (Sabzi bowl) — {expectedPlates} plates target
              </a>
            </li>
            <li>
              <a
                href="/impact"
                onFocus={() => setActiveFocusId('impact')}
                onBlur={() => setActiveFocusId(null)}
              >
                Impact Model (Rice dish) — {wasteSavedKg} kg food waste cut
              </a>
            </li>
          </ul>
        </nav>

        {/* ── 3D Canvas (alpha: true, transparent background, ACESFilmic exposure 0.9) ── */}
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [0, 6.6, 5.6], fov: 35 }}
          gl={{
            alpha: true,
            antialias: true,
            powerPreference: 'high-performance',
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace,
          }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0); // Completely transparent canvas
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 0.9; // Exposure 0.9 per brief: nothing clips to pure white
          }}
          className="w-full h-full bg-transparent"
        >
          {/* Environment preset="studio", intensity 0.45 per brief */}
          <Suspense fallback={null}>
            <Environment
              preset="studio"
              background={false}
              environmentIntensity={0.45}
            />
          </Suspense>

          {/* Key Light: One warm key light top-left (intensity 2.0, soft shadows 2048) */}
          <directionalLight
            position={[-4.0, 8.5, 3.5]}
            intensity={2.0}
            color="#FFF5E8"
            castShadow
            shadow-mapSize={[isMobile ? 1024 : 2048, isMobile ? 1024 : 2048]}
            shadow-camera-left={-3.2}
            shadow-camera-right={3.2}
            shadow-camera-top={3.2}
            shadow-camera-bottom={3.2}
            shadow-bias={-0.0003}
          />

          {/* Rim Light: One weak cool rim light back-right (intensity 0.6) */}
          <directionalLight
            position={[5.0, 4.5, -3.5]}
            intensity={0.6}
            color="#B8D8E8"
          />

          {/* Low hemisphere light (intensity 0.3) */}
          <hemisphereLight
            args={['#FFEEDB', '#17140F', 0.3]}
          />

          {/* Camera Controller with FOV 35, base position [0, 6.6, 5.6], ~8% margin */}
          <CameraRig dollyTarget={dollyTarget} isMobile={isMobile} />

          {/* Ground ContactShadows (transparent ground plane) */}
          <GroundShadow isMobile={isMobile} />

          {/* ── Animated Thali Assembly with +/-1 deg idle rock ── */}
          <Suspense fallback={null}>
            <AnimatedThaliGroup>
              {/* Matte Black Enamel Plate with Brass Rim */}
              <Plate />

              {/* 4 Interactive Katoris on circle R=1.15 */}
              {katoris.map((k) => (
                <Katori
                  key={k.id}
                  {...k}
                  isHovered={hoveredKatori === k.id || activeFocusId === k.id}
                  onHover={setHoveredKatori}
                  onClick={handleNavigate}
                  isMobile={isMobile}
                />
              ))}

              {/* Center Food: 2 Rotis, Papad, Lemon, Chilli */}
              <CenterSpread />
            </AnimatedThaliGroup>
          </Suspense>
        </Canvas>
      </div>
    </WebGLErrorBoundary>
  );
}

export default ThaliScene;
