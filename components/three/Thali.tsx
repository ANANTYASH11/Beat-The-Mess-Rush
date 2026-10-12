'use client';

import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { Plate } from './Plate';
import { Katori } from './Katori';
import { getRotiTexture } from './textures';

interface ThaliProps {
  queueCount: number;
  waitRange: string;
  expectedPlates: number;
  wasteSavedKg?: number;
  onNavigate: (href: string, pos: [number, number, number]) => void;
  activeFocusId?: string | null;
}

export function Thali({
  queueCount = 20,
  waitRange = '6-11 min',
  expectedPlates = 342,
  wasteSavedKg = 42,
  onNavigate,
  activeFocusId = null,
}: ThaliProps) {
  const [hoveredKatori, setHoveredKatori] = useState<string | null>(null);

  const rotiTexture = useMemo(() => getRotiTexture(), []);

  // Four Katoris configuration matching the 4 primary app modules
  const katoris = [
    {
      id: 'student',
      position: [-1.22, 0.05, -1.15] as [number, number, number],
      type: 'large' as const,
      food: 'dal' as const,
      title: 'STUDENT EXPRESS',
      devanagari: 'विद्यार्थी',
      metric: `Wait: ${waitRange}`,
      href: '/student',
    },
    {
      id: 'staff',
      position: [1.25, 0.05, -1.1] as [number, number, number],
      type: 'small' as const,
      food: 'curd' as const,
      title: 'STAFF CONTROL DECK',
      devanagari: 'कतार',
      metric: `Queue: ${queueCount} in line`,
      href: '/staff',
    },
    {
      id: 'kitchen',
      position: [-1.45, 0.05, 0.55] as [number, number, number],
      type: 'tall' as const,
      food: 'sabzi' as const,
      title: 'KITCHEN CHALKBOARD',
      devanagari: 'रसोई',
      metric: `${expectedPlates} plates target`,
      href: '/kitchen',
    },
    {
      id: 'impact',
      position: [1.32, 0.05, 0.65] as [number, number, number],
      type: 'shallow' as const,
      food: 'rice' as const,
      title: 'IMPACT & SAVINGS',
      devanagari: 'असर',
      metric: `${wasteSavedKg} kg waste cut`,
      href: '/impact',
    },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* ── Base Stainless Steel Thali Plate ── */}
      <Plate />

      {/* ── 4 Interactive Katoris ── */}
      {katoris.map((k) => (
        <Katori
          key={k.id}
          {...k}
          isHovered={hoveredKatori === k.id || activeFocusId === k.id}
          onHover={setHoveredKatori}
          onClick={(id, href, pos) => onNavigate(href, pos)}
        />
      ))}

      {/* ── Middle of Plate: 2 Rotis, Papad, Lemon Wedge, Green Chilli ── */}
      {/* Roti 1 (Bottom tawa roti) */}
      <mesh
        position={[-0.1, 0.08, -0.05]}
        rotation={[-Math.PI / 2, 0, 0.2]}
        castShadow
        receiveShadow
      >
        <circleGeometry args={[0.76, 32]} />
        <meshStandardMaterial
          color="#D9B47D"
          map={rotiTexture}
          roughness={0.92}
        />
      </mesh>

      {/* Roti 2 (Slightly folded / offset top roti) */}
      <mesh
        position={[-0.22, 0.11, 0.18]}
        rotation={[-Math.PI / 2, -0.05, 0.8]}
        castShadow
        receiveShadow
      >
        <circleGeometry args={[0.72, 32]} />
        <meshStandardMaterial
          color="#E0BC85"
          map={rotiTexture}
          roughness={0.92}
        />
      </mesh>

      {/* Papad (Thin, crispy, slightly wavy golden disc) */}
      <mesh
        position={[0.5, 0.16, -0.05]}
        rotation={[-Math.PI / 2.3, 0.25, -0.4]}
        castShadow
      >
        <circleGeometry args={[0.58, 24]} />
        <meshStandardMaterial
          color="#E8CE90"
          roughness={0.7}
          metalness={0.05}
        />
      </mesh>

      {/* Lemon Wedge (Curved yellow quarter segment) */}
      <mesh
        position={[-0.25, 0.14, 0.78]}
        rotation={[0.3, 0.5, 0.2]}
        castShadow
      >
        <cylinderGeometry args={[0.14, 0.14, 0.08, 12, 1, false, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#EAB308" roughness={0.4} />
      </mesh>

      {/* Green Chilli (Curved slender tapered cylinder) */}
      <group position={[0.35, 0.12, 0.72]} rotation={[-0.1, -0.6, 0.2]}>
        {/* Chilli body */}
        <mesh castShadow>
          <cylinderGeometry args={[0.025, 0.045, 0.5, 12]} />
          <meshStandardMaterial color="#2F6B3A" roughness={0.35} />
        </mesh>
        {/* Chilli stalk stem */}
        <mesh position={[0, -0.27, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 6]} />
          <meshStandardMaterial color="#1E4725" roughness={0.7} />
        </mesh>
      </group>
    </group>
  );
}
