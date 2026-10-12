'use client';

import React from 'react';

interface WallClockProps {
  position?: [number, number, number];
  timeStr?: string;
}

export function WallClock({ position = [1.8, 2.4, -2.48] }: WallClockProps) {
  return (
    <group position={position}>
      {/* Outer wooden / clay rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.05, 32]} />
        <meshStandardMaterial color="#3A3835" roughness={0.7} />
      </mesh>

      {/* Clock Face */}
      <mesh position={[0, 0, 0.027]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.23, 0.23, 0.01, 32]} />
        <meshStandardMaterial color="#FEFCF7" roughness={0.9} />
      </mesh>

      {/* Hour Hand (pointing roughly at 1:15) */}
      <mesh position={[0.03, 0.04, 0.035]} rotation={[0, 0, -Math.PI / 6]}>
        <boxGeometry args={[0.02, 0.09, 0.005]} />
        <meshStandardMaterial color="#1B1A17" roughness={0.5} />
      </mesh>

      {/* Minute Hand (pointing at 15m) */}
      <mesh position={[0.06, 0.01, 0.037]} rotation={[0, 0, -Math.PI / 2.2]}>
        <boxGeometry args={[0.014, 0.14, 0.005]} />
        <meshStandardMaterial color="#1B1A17" roughness={0.5} />
      </mesh>

      {/* Center Pin */}
      <mesh position={[0, 0, 0.04]}>
        <sphereGeometry args={[0.018, 12, 12]} />
        <meshStandardMaterial color="#E8871E" roughness={0.4} />
      </mesh>
    </group>
  );
}
