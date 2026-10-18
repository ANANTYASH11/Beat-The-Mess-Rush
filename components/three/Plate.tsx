'use client';

import React, { useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { createPlateProfile } from '@/lib/three/profiles';
import { getHammeredSteelTexture, getPlateBaseGradientTexture } from '@/lib/three/textures';

export function Plate() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () => {
      setIsDark(document.documentElement.classList.contains('dark'));
    };
    checkDark();

    const observer = new MutationObserver(checkDark);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  const latheGeometry = useMemo(() => {
    const points = createPlateProfile();
    const geom = new THREE.LatheGeometry(points, 72);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const bumpMap = useMemo(() => getHammeredSteelTexture(), []);
  const floorTexture = useMemo(() => getPlateBaseGradientTexture(), []);

  return (
    <group position={[0, 0, 0]}>
      {/* ── Solid base disc under dish as safety net ── */}
      <mesh position={[0, 0.005, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.78, 1.78, 0.04, 64]} />
        <meshStandardMaterial
          color="#1A1713"
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

      {/* ── Plate Wall & Sloped Rim in Matte Black (#121010) ── */}
      <mesh
        geometry={latheGeometry}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <meshStandardMaterial
          color="#121010"
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

      {/* ── Plate Floor Disc (#1A1713 with 2 faint concentric grooves, warm shift 4%, not grey) ── */}
      <mesh position={[0, 0.018, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.76, 64]} />
        <meshStandardMaterial
          color="#1A1713"
          map={floorTexture}
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

      {/* ── Outer Plate Lip: Thin Brass Band (#B8893A, metalness 0.8, roughness 0.4) ── */}
      {/* Flat rim brass ring - modest width (2.14 to 2.20) */}
      <mesh position={[0, 0.468, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.14, 2.20, 72]} />
        <meshStandardMaterial
          color="#B8893A"
          metalness={isDark ? 0.85 : 0.8}
          roughness={isDark ? 0.35 : 0.4}
          emissive={isDark ? '#B8893A' : '#000000'}
          emissiveIntensity={isDark ? 0.22 : 0}
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* Rolled outer brass lip torus for refined 3D catch-light */}
      <mesh position={[0, 0.435, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.18, 0.016, 16, 72]} />
        <meshStandardMaterial
          color="#B8893A"
          metalness={isDark ? 0.85 : 0.8}
          roughness={isDark ? 0.35 : 0.4}
          emissive={isDark ? '#B8893A' : '#000000'}
          emissiveIntensity={isDark ? 0.22 : 0}
          transparent={false}
          depthWrite={true}
        />
      </mesh>
    </group>
  );
}

export default Plate;
