'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface TraySteamProps {
  position?: [number, number, number];
  active?: boolean;
}

export function TraySteam({ position = [0, 1.1, -1.8], active = true }: TraySteamProps) {
  const groupRef = useRef<THREE.Group>(null);
  const count = 8;
  const particles = useRef<
    { ref: THREE.Mesh | null; speed: number; phase: number; initX: number; initZ: number }[]
  >(
    Array.from({ length: count }, (_, i) => ({
      ref: null,
      speed: 0.8 + Math.random() * 0.5,
      phase: (i / count) * Math.PI * 2,
      initX: (Math.random() - 0.5) * 1.2,
      initZ: (Math.random() - 0.5) * 0.3,
    }))
  );

  useFrame((state, delta) => {
    if (!groupRef.current || !active) return;
    const time = state.clock.getElapsedTime();

    particles.current.forEach((p, idx) => {
      if (!p.ref) return;
      const progress = ((time * p.speed + idx * 0.4) % 2) / 2; // 0 to 1
      p.ref.position.y = progress * 0.7;
      p.ref.position.x = p.initX + Math.sin(time * 2 + p.phase) * 0.08;
      p.ref.position.z = p.initZ + Math.cos(time * 1.5 + p.phase) * 0.05;

      // Scale up and fade out
      const scale = 0.04 + progress * 0.09;
      p.ref.scale.set(scale, scale * 1.2, scale);

      // Opacity envelope
      const mat = p.ref.material as THREE.MeshStandardMaterial;
      if (mat) {
        const opacity = Math.sin(progress * Math.PI) * 0.25;
        mat.opacity = opacity;
      }
    });
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={position}>
      {particles.current.map((p, i) => (
        <mesh
          key={i}
          ref={(el) => {
            p.ref = el;
          }}
          castShadow={false}
          receiveShadow={false}
        >
          <sphereGeometry args={[1, 8, 8]} />
          <meshStandardMaterial
            color="#FEFAF0"
            roughness={0.9}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}
