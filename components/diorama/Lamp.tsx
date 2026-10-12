'use client';

import React, { useRef } from 'react';
import * as THREE from 'three';

interface LampProps {
  level?: 'low' | 'moderate' | 'high';
  position?: [number, number, number];
}

export function Lamp({ level = 'moderate', position = [0, 2.6, -1.8] }: LampProps) {
  const lightRef = useRef<THREE.PointLight>(null);

  const colors = {
    low: '#3F7D58',
    moderate: '#E8871E',
    high: '#C8443A',
  };

  const currentColor = colors[level] || colors.moderate;

  return (
    <group position={position}>
      {/* Hanging wire */}
      <mesh position={[0, 0.45, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.9, 8]} />
        <meshStandardMaterial color="#4A453E" roughness={0.7} />
      </mesh>

      {/* Lamp Shade (Clay / Matte Metal) */}
      <mesh position={[0, 0, 0]}>
        <coneGeometry args={[0.32, 0.22, 16, 1, true]} />
        <meshStandardMaterial
          color="#3A3835"
          roughness={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glowing bulb / indicator dome */}
      <mesh position={[0, -0.04, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial
          color={currentColor}
          emissive={currentColor}
          emissiveIntensity={1.4}
          roughness={0.3}
        />
      </mesh>

      {/* Downward localized spot/point light */}
      <pointLight
        ref={lightRef}
        color={currentColor}
        intensity={2.2}
        distance={3.8}
        decay={2}
        position={[0, -0.15, 0]}
      />
    </group>
  );
}
