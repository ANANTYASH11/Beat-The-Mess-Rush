'use client';

import React, { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html';
import * as THREE from 'three';
import { createKatoriProfile, KatoriKind } from '@/lib/three/profiles';
import { getHammeredSteelTexture } from '@/lib/three/textures';
import { Dal, Sabzi, Rice, Curd } from './Food';
import { Steam } from './Steam';

export type FoodKind = 'dal' | 'curd' | 'sabzi' | 'rice';

interface KatoriProps {
  id: string;
  position: [number, number, number];
  kind: KatoriKind;
  food: FoodKind;
  title: string;
  devanagari: string;
  metric: string;
  href: string;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string, href: string, pos: [number, number, number]) => void;
  isMobile?: boolean;
}

export function Katori({
  id,
  position,
  kind,
  food,
  title,
  devanagari,
  metric,
  href,
  isHovered,
  onHover,
  onClick,
  isMobile = false,
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

  // Spring physics for lift (+0.25 on hover)
  const currentY = useRef(0);
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    const targetY = isHovered ? 0.25 : 0;
    currentY.current = THREE.MathUtils.damp(currentY.current, targetY, 14, delta);
    groupRef.current.position.y = position[1] + currentY.current;
  });

  // Tap-to-lift on touch, second tap to navigate
  const [touchLifted, setTouchLifted] = useState(false);

  const handleClick = (e: any) => {
    e.stopPropagation();
    if (isMobile) {
      if (!touchLifted) {
        setTouchLifted(true);
        onHover(id);
        return;
      }
    }
    onClick(id, href, position);
  };

  const rimY = kind === 'tall' ? 0.62 : kind === 'large' ? 0.54 : kind === 'small' ? 0.50 : 0.46;
  const innerY = kind === 'tall' ? 0.48 : kind === 'large' ? 0.40 : kind === 'small' ? 0.38 : 0.34;
  const rimRadiusInner = kind === 'small' ? 0.435 : kind === 'large' ? 0.475 : 0.465;
  const rimRadiusOuter = kind === 'small' ? 0.475 : kind === 'large' ? 0.52 : 0.505;

  return (
    <group
      ref={groupRef}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
          document.body.style.cursor = "url('/spoon-cursor.svg') 2 2, pointer";
        } else {
          document.body.style.cursor = 'pointer';
        }
        onHover(id);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        onHover(null);
        setTouchLifted(false);
      }}
      onClick={handleClick}
    >
      {/* ── Base contact shadow ring on plate floor ── */}
      <mesh position={[0, -0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.24, 0.38, 36]} />
        <meshBasicMaterial color="#14110F" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* ── Matte Black Cast-Iron / Enamel Katori Bowl (#17140F, metalness 0.35, roughness 0.55) ── */}
      <mesh geometry={latheGeometry} castShadow receiveShadow>
        <meshPhysicalMaterial
          color={isHovered ? '#201B15' : '#17140F'}
          metalness={0.35}
          roughness={0.55}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
          bumpMap={bumpMap}
          bumpScale={0.003}
          envMapIntensity={0.45}
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* ── Deep Inner Wall Shadow Ring (#0D0B08, darker than plate so food looks sunk in) ── */}
      <mesh
        position={[0, innerY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[
            kind === 'small' ? 0.35 : 0.38,
            kind === 'small' ? 0.44 : 0.48,
            48,
          ]}
        />
        <meshStandardMaterial
          color="#0D0B08"
          roughness={0.7}
          metalness={0.2}
          side={THREE.DoubleSide}
          transparent={false}
          depthWrite={true}
        />
      </mesh>

      {/* ── Thin Brushed-Brass Ring on Katori Rim (color #B8893A, metalness 0.85, roughness 0.35) ── */}
      <mesh
        position={[0, rimY + 0.002, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry
          args={[rimRadiusInner, rimRadiusOuter, 48]}
        />
        <meshStandardMaterial
          color="#B8893A"
          metalness={0.85}
          roughness={0.35}
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* ── Sunk Food Contents ── */}
      {food === 'dal' && <Dal radius={kind === 'large' ? 0.45 : 0.41} />}
      {food === 'sabzi' && <Sabzi />}
      {food === 'rice' && <Rice />}
      {food === 'curd' && <Curd />}

      {/* ── Steam System (20 quads desktop / 8 mobile; idle loop on Dal) ── */}
      <Steam
        active={isHovered}
        isIdle={food === 'dal'}
        count={isMobile ? 8 : 20}
        position={[0, kind === 'tall' ? 0.62 : 0.50, 0]}
      />

      {/* ── Hand-lettered Paper Tag (drei <Html>) ── */}
      {isHovered && (
        <Html
          position={[0, kind === 'tall' ? 1.05 : 0.92, 0]}
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
              <span className="font-accent text-xs font-semibold text-[#F28C1B]">
                {devanagari}
              </span>
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
