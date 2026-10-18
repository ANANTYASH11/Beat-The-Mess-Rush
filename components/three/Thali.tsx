'use client';

import React from 'react';
import { Plate } from './Plate';
import { Katori } from './Katori';
import { Rice } from './Rice';
import { RotiStack, SaladCluster } from './Food';

interface ThaliProps {
  queueCount?: number;
  waitRange?: string;
  expectedPlates?: number;
  wasteSavedKg?: number;
  onNavigate?: (href: string, pos: [number, number, number]) => void;
  activeFocusId?: string | null;
  hoveredKatori?: string | null;
  onHoverKatori?: (id: string | null) => void;
  isMobile?: boolean;
}

export function Thali({
  queueCount = 20,
  waitRange = '6-11 min',
  expectedPlates = 342,
  wasteSavedKg = 42,
  onNavigate,
  activeFocusId = null,
  hoveredKatori = null,
  onHoverKatori,
  isMobile = false,
}: ThaliProps) {
  // 4 Interactive Navigation Katoris mapped to pages:
  // Student = Dal Tadka, Staff = Aloo Gobi, Kitchen = Rajma, Impact = Curd/Raita
  const navKatoris = [
    {
      id: 'student',
      position: [-0.94, 0.02, -0.74] as [number, number, number],
      kind: 'large' as const,
      food: 'dal' as const,
      title: 'STUDENT EXPRESS',
      devanagari: 'विद्यार्थी',
      metric: `Wait: ${waitRange}`,
      href: '/student',
    },
    {
      id: 'staff',
      position: [0.0, 0.02, -1.18] as [number, number, number],
      kind: 'tall' as const,
      food: 'aloogobi' as const,
      title: 'STAFF CONTROL DECK',
      devanagari: 'कतार',
      metric: `Queue: ${queueCount} in line`,
      href: '/staff',
    },
    {
      id: 'kitchen',
      position: [0.94, 0.02, -0.74] as [number, number, number],
      kind: 'tall' as const,
      food: 'rajma' as const,
      title: 'KITCHEN CHALKBOARD',
      devanagari: 'रसोई',
      metric: `${expectedPlates} plates target`,
      href: '/kitchen',
    },
    {
      id: 'impact',
      position: [-1.10, 0.02, 0.42] as [number, number, number],
      kind: 'small' as const,
      food: 'curd' as const,
      title: 'IMPACT & SAVINGS',
      devanagari: 'असर',
      metric: `${wasteSavedKg} kg waste cut`,
      href: '/impact',
    },
  ];

  // 2 Decorative Small Katoris (completing the 6 katoris):
  // Lower-centre small katori: Sweet (2 Gulab Jamun)
  // Lower-right small katori: Spicy Pickle (Achar)
  const decorativeKatoris = [
    {
      id: 'sweet',
      position: [-0.14, 0.02, 1.32] as [number, number, number],
      kind: 'mini' as const,
      food: 'sweet' as const,
    },
    {
      id: 'pickle',
      position: [0.54, 0.02, 1.28] as [number, number, number],
      kind: 'mini' as const,
      food: 'pickle' as const,
    },
  ];

  return (
    <group position={[0, 0, 0]}>
      {/* ── 1. True Matte Black Thali Plate with Thin Brass Lip Rim ── */}
      <Plate />

      {/* ── 2. Top Row & Navigation Katoris (4 interactive: Dal, Aloo Gobi, Rajma, Curd) ── */}
      {navKatoris.map((k) => (
        <Katori
          key={k.id}
          {...k}
          isHovered={hoveredKatori === k.id || activeFocusId === k.id}
          onHover={onHoverKatori}
          onClick={(id, href, pos) => onNavigate && onNavigate(href, pos)}
          isMobile={isMobile}
          interactive={true}
        />
      ))}

      {/* ── 3. Decorative Katoris: Sweet (2 Gulab Jamun) & Pickle ── */}
      {decorativeKatoris.map((k) => (
        <Katori
          key={k.id}
          position={k.position}
          kind={k.kind}
          food={k.food}
          interactive={false}
          isMobile={isMobile}
        />
      ))}

      {/* ── 3b. Small Pickle Blob next to the sweet on the plate floor ── */}
      <group position={[0.20, 0.02, 1.34]}>
        <mesh position={[0, 0.032, 0]} scale={[1, 0.58, 1]} castShadow>
          <sphereGeometry args={[0.11, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.52]} />
          <meshPhysicalMaterial
            color="#8B3A10"
            roughness={0.22}
            metalness={0.02}
            clearcoat={0.88}
            clearcoatRoughness={0.08}
          />
        </mesh>
        {/* Mustard and fenugreek seeds in the achar blob */}
        {[[-0.035, 0.055, 0.02], [0.03, 0.058, -0.025], [0.008, 0.062, 0.035]].map((pt, i) => (
          <mesh key={i} position={pt as [number, number, number]}>
            <sphereGeometry args={[0.012, 6, 6]} />
            <meshStandardMaterial color={i % 2 === 0 ? '#1A1713' : '#D4AC0D'} roughness={0.5} />
          </mesh>
        ))}
      </group>

      {/* ── 4. Large Heaped Mound of Jeera Rice (Directly on Plate, ~1.4x Katori size, ~500 instances) ── */}
      <Rice position={[0.82, 0.02, 0.15]} />

      {/* ── 5. Stack of 3 Large Rotis & Leaning Crisp Papad (Left-Centre) ── */}
      <RotiStack />

      {/* ── 6. Salad Cluster: Onion Rings, Cucumber Slices, Tomato, Lemon & Green Chillies (Front-Left) ── */}
      <SaladCluster />
    </group>
  );
}

export default Thali;
