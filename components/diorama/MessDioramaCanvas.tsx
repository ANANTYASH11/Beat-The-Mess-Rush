'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei/core/OrbitControls';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';
import { MessHall } from './MessHall';
import { Counter } from './Counter';
import { QueueCrowd } from './QueueCrowd';
import { DiningStudents } from './DiningStudents';
import { FallbackIsometricSvg } from './FallbackIsometricSvg';

interface MessDioramaProps {
  queueCount?: number;
  serviceRate?: number;
  crowdLevel?: 'low' | 'moderate' | 'high';
  waitTime?: string;
  className?: string;
  isInteractive?: boolean;
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
    console.warn('WebGL initialization failed, falling back to 2.5D SVG illustration:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export function MessDioramaCanvas({
  queueCount = 18,
  serviceRate = 4.2,
  crowdLevel = 'moderate',
  waitTime = '6-11 min',
  className = '',
  isInteractive = true,
}: MessDioramaProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    setMounted(true);
    // Check reduced motion
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    // Check WebGL support
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) setHasWebGL(false);
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  const fallback = (
    <FallbackIsometricSvg
      queueCount={queueCount}
      crowdLevel={crowdLevel}
      waitTime={waitTime}
    />
  );

  if (!mounted) {
    return (
      <div className={`w-full h-full min-h-[420px] bg-warm-grey-100 rounded-panel animate-pulse flex items-center justify-center border border-warm-grey-200 ${className}`}>
        <span className="text-xs font-mono text-ink-muted">Loading 3D Mess Hall…</span>
      </div>
    );
  }

  if (prefersReducedMotion || !hasWebGL) {
    return fallback;
  }

  // Calculate table occupancy factor based on queue length
  const occupancyFactor = Math.min(1.0, Math.max(0.2, (queueCount || 10) / 25));

  return (
    <WebGLErrorBoundary fallback={fallback}>
      <div
        className={`relative w-full h-full min-h-[420px] rounded-panel overflow-hidden select-none bg-gradient-to-b from-[#FAF7F0] to-[#EFE9DC] dark:from-[#1D1B18] dark:to-[#171513] border border-warm-grey-200 shadow-soft ${className}`}
        aria-hidden="true"
      >
        <Canvas
          shadows
          dpr={[1, 1.5]}
          camera={{ position: [5.8, 5.2, 6.2], fov: 36 }}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        >
          {/* Subtle scene fog to blend edges */}
          <fog attach="fog" args={['#FAF7F0', 14, 30]} />

          {/* Lighting: Warm Key Light + Soft Hemisphere Fill */}
          <ambientLight intensity={0.5} />
          <hemisphereLight
            args={['#FFFDF8', '#DDD6C8', 0.85]}
          />
          <directionalLight
            position={[7, 9, 5]}
            intensity={1.6}
            castShadow
            shadow-mapSize={[1024, 1024]}
            shadow-camera-left={-6}
            shadow-camera-right={6}
            shadow-camera-top={6}
            shadow-camera-bottom={-6}
            shadow-bias={-0.0005}
          />

          <Suspense fallback={null}>
            {/* The Structural Room Base */}
            <MessHall />

            {/* Serving Counter with Warm Trays & Steam */}
            <Counter crowdLevel={crowdLevel} isServing={true} />

            {/* Live Queue Crowd (Students in line) */}
            <QueueCrowd count={queueCount} speed={serviceRate} />

            {/* Seated Students eating at tables */}
            <DiningStudents occupancyFactor={occupancyFactor} />

            {/* Ground Contact Shadows */}
            <ContactShadows
              position={[0, -0.01, 0]}
              opacity={0.45}
              scale={10}
              blur={2.2}
              far={4}
            />
          </Suspense>

          {/* Damped, clamped orbit controls so user can gently explore without getting lost */}
          {isInteractive && (
            <OrbitControls
              enablePan={false}
              enableZoom={true}
              minDistance={5.5}
              maxDistance={11.0}
              minPolarAngle={Math.PI / 4}
              maxPolarAngle={Math.PI / 2.35}
              minAzimuthAngle={-Math.PI / 6}
              maxAzimuthAngle={Math.PI / 2.2}
              dampingFactor={0.05}
            />
          )}
        </Canvas>

        {/* Quiet Live Caption Overlay per brief */}
        <div className="absolute bottom-3 left-3 bg-bg-raised/90 backdrop-blur-md px-3.5 py-1.5 rounded-pill border border-warm-grey-200 text-xs text-ink flex items-center gap-2 shadow-soft">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{
              backgroundColor:
                crowdLevel === 'low'
                  ? '#3F7D58'
                  : crowdLevel === 'high'
                  ? '#C8443A'
                  : '#E8871E',
            }}
          />
          <span className="font-medium">North Hostel Mess</span>
          <span className="text-warm-grey-300">·</span>
          <span className="font-mono font-medium">{queueCount} in line</span>
          <span className="text-warm-grey-300">·</span>
          <span className="font-mono text-ink-muted">about {waitTime} wait</span>
        </div>

        {/* Small Orbit Hint in top right */}
        <div className="absolute top-3 right-3 text-[10px] font-mono text-ink-muted/80 bg-bg-raised/80 backdrop-blur-sm px-2.5 py-1 rounded-pill border border-warm-grey-200/60 pointer-events-none">
          Drag to orbit
        </div>
      </div>
    </WebGLErrorBoundary>
  );
}

export default MessDioramaCanvas;
