'use client';

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface SteamProps {
  active?: boolean;
  isIdle?: boolean;
  position?: [number, number, number];
  count?: number;
}

export function Steam({
  active = false,
  isIdle = false,
  position = [0, 0.42, 0],
  count = 20,
}: SteamProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Particles config
  const particles = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      speed: 0.7 + (i % 5) * 0.15,
      initX: ((i * 13) % 11 - 5) * 0.03,
      initZ: ((i * 17) % 11 - 5) * 0.03,
      phase: (i / count) * Math.PI * 2,
    }));
  }, [count]);

  const meshesRef = useRef<Array<THREE.Mesh | null>>([]);

  useFrame((state) => {
    if (!groupRef.current) return;
    const isShowing = active || isIdle;
    if (!isShowing) return;

    const time = state.clock.getElapsedTime();
    // Idle steam is gentler and slower
    const timeScale = isIdle && !active ? 0.6 : 1.0;

    particles.forEach((p, idx) => {
      const mesh = meshesRef.current[idx];
      if (!mesh) return;

      const cycle = ((time * p.speed * timeScale + idx * (1.8 / count)) % 1.8) / 1.8; // 0 to 1
      mesh.position.y = cycle * 0.55;
      mesh.position.x = p.initX + Math.sin(time * 2.5 + p.phase) * 0.04;
      mesh.position.z = p.initZ + Math.cos(time * 2.0 + p.phase) * 0.03;

      // Soft expansion and fade
      const scale = 0.04 + cycle * 0.11;
      mesh.scale.set(scale, scale * 1.25, scale);

      const mat = mesh.material as THREE.MeshStandardMaterial;
      if (mat) {
        const peakOpacity = isIdle && !active ? 0.18 : 0.32;
        mat.opacity = Math.sin(cycle * Math.PI) * peakOpacity;
      }
    });
  });

  const shouldRender = active || isIdle;
  if (!shouldRender) return null;

  return (
    <group ref={groupRef} position={position}>
      {particles.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshesRef.current[i] = el;
          }}
        >
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial
            color="#FFFDF7"
            roughness={0.9}
            transparent
            opacity={0}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

export default Steam;
