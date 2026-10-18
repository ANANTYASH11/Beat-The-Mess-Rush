'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html';
import * as THREE from 'three';
import { createKatoriProfile, KatoriKind } from '@/lib/three/profiles';
import { getHammeredSteelTexture } from '@/lib/three/textures';
import { DalTadka, AlooGobi, Rajma, CurdRaita, GulabJamun, PickleBlob } from './Food';
import { Steam } from './Steam';

export type FoodKind = 'dal' | 'aloogobi' | 'rajma' | 'curd' | 'sweet' | 'pickle';

interface KatoriProps {
  id?: string;
  position: [number, number, number];
  kind: KatoriKind;
  food: FoodKind;
  title?: string;
  devanagari?: string;
  metric?: string;
  href?: string;
  isHovered?: boolean;
  onHover?: (id: string | null) => void;
  onClick?: (id: string, href: string, pos: [number, number, number]) => void;
  isMobile?: boolean;
  interactive?: boolean;
}

export function Katori({
  id = 'katori',
  position,
  kind,
  food,
  title,
  devanagari,
  metric,
  href,
  isHovered = false,
  onHover,
  onClick,
  isMobile = false,
  interactive = Boolean(href),
}: KatoriProps) {
  const groupRef = useRef<THREE.Group>(null);
  const bumpMap = useMemo(() => getHammeredSteelTexture(), []);

  // LatheGeometry with small foot ring, rounded wall, and rolled rim
  const latheGeometry = useMemo(() => {
    const points = createKatoriProfile(kind);
    const geom = new THREE.LatheGeometry(points, 56);
    geom.computeVertexNormals();
    return geom;
  }, [kind]);

  // Spring physics for lift (+0.22 on hover for interactive katoris)
  const currentY = useRef(0);
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = interactive && isHovered ? 0.22 : 0;
    currentY.current = THREE.MathUtils.damp(currentY.current, targetY, 14, delta);
    groupRef.current.position.y = position[1] + currentY.current;
  });

  // Tap-to-lift on touch, second tap to navigate
  const [touchLifted, setTouchLifted] = useState(false);

  const handleClick = (e: any) => {
    if (!interactive || !onClick || !href) return;
    e.stopPropagation();
    if (isMobile) {
      if (!touchLifted) {
        setTouchLifted(true);
        if (onHover) onHover(id);
        return;
      }
    }
    onClick(id, href, position);
  };

  const rimY = kind === 'tall' ? 0.54 : kind === 'large' ? 0.54 : kind === 'small' ? 0.50 : kind === 'mini' ? 0.42 : 0.48;
  const innerY = kind === 'tall' ? 0.44 : kind === 'large' ? 0.44 : kind === 'small' ? 0.40 : kind === 'mini' ? 0.34 : 0.38;
  const rimRadiusInner = kind === 'small' ? 0.41 : kind === 'large' ? 0.45 : kind === 'tall' ? 0.43 : kind === 'mini' ? 0.31 : 0.45;
  const rimRadiusOuter = kind === 'small' ? 0.45 : kind === 'large' ? 0.49 : kind === 'tall' ? 0.47 : kind === 'mini' ? 0.35 : 0.49;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        if (!interactive) return;
        e.stopPropagation();
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          document.body.style.cursor = "url('/spoon-cursor.svg') 2 2, pointer";
        } else {
          document.body.style.cursor = 'pointer';
        }
        if (onHover) onHover(id);
      }}
      onPointerOut={() => {
        if (!interactive) return;
        document.body.style.cursor = 'auto';
        if (onHover) onHover(null);
        setTouchLifted(false);
      }}
      onClick={interactive ? handleClick : undefined}
    >
      {/* ── Base contact shadow ring on plate floor ── */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[kind === 'mini' ? 0.16 : 0.22, kind === 'mini' ? 0.30 : 0.38, 36]} />
        <meshBasicMaterial color="#0E0C0A" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* ── Matte Black Katori Bowl (#15120E, metalness 0.08, roughness 0.72, envMapIntensity 0.15) ── */}
      <mesh geometry={latheGeometry} castShadow receiveShadow>
        <meshStandardMaterial
          color={interactive && isHovered ? '#1E1A15' : '#15120E'}
          metalness={0.08}
          roughness={0.72}
          envMapIntensity={0.15}
          bumpMap={bumpMap}
          bumpScale={0.002}
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* ── Katori Inner Wall (#0E0C0A) ── */}
      <mesh
        position={[0, innerY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[
            kind === 'mini' ? 0.24 : kind === 'small' ? 0.34 : 0.37,
            rimRadiusInner,
            48,
          ]}
        />
        <meshStandardMaterial
          color="#0E0C0A"
          roughness={0.72}
          metalness={0.08}
          side={THREE.DoubleSide}
          transparent={false}
          depthWrite={true}
        />
      </mesh>

      {/* ── Thin Brushed-Brass Ring on Katori Rim (#B8893A, metalness 0.8, roughness 0.4) ── */}
      {/* Modest width so the black dominates */}
      <mesh
        position={[0, rimY + 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[rimRadiusInner, rimRadiusOuter, 48]}
        />
        <meshStandardMaterial
          color="#B8893A"
          metalness={0.8}
          roughness={0.4}
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* ── Food Contents (Heaped above the rim like a real serving) ── */}
      {food === 'dal' && <DalTadka radius={kind === 'large' ? 0.45 : 0.41} />}
      {food === 'aloogobi' && <AlooGobi />}
      {food === 'rajma' && <Rajma />}
      {food === 'curd' && <CurdRaita radius={kind === 'small' ? 0.41 : 0.44} />}
      {food === 'sweet' && <GulabJamun />}
      {food === 'pickle' && <PickleBlob />}

      {/* ── Steam System (only for interactive katoris: idle loop on Dal, active on hover) ── */}
      {interactive && (
        <Steam
          active={isHovered}
          isIdle={food === 'dal'}
          count={isMobile ? 8 : 20}
          position={[0, rimY + 0.05, 0]}
        />
      )}

      {/* ── Hand-lettered Paper Tag (drei <Html>) for interactive katoris ── */}
      {interactive && isHovered && title && (
        <Html
          position={[0, rimY + 0.50, 0]}
          center
          distanceFactor={7}
          className="pointer-events-none select-none z-50"
        >
          <div className="bg-[#FAF5E9] text-[#14110F] px-3.5 py-1.5 border-2 border-[#14110F] shadow-[3px_3px_0px_#14110F] rounded-none text-left whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
            {/* Header: Title + Devanagari */}
            <div className="flex items-center justify-between gap-3 border-b border-[#14110F]/20 pb-0.5">
              <span className="font-condensed text-base tracking-wider uppercase font-bold text-[#14110F]">
                {title}
              </span>
              {devanagari && (
                <span className="font-accent text-xs font-semibold text-[#F28C1B]">
                  {devanagari}
                </span>
              )}
            </div>
            {/* Live metric + CTA */}
            <div className="mt-1 flex items-center justify-between gap-3 text-xs font-mono">
              <span className="font-bold text-[#2F6B3A]">{metric}</span>
              <span className="text-[10px] text-[#5A534C] uppercase tracking-wider font-bold">
                Tap to enter →
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}

export default Katori;
