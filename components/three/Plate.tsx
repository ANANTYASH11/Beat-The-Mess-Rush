'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createPlateProfile } from '@/lib/three/profiles';
import { getHammeredSteelTexture, getPlateBaseGradientTexture } from '@/lib/three/textures';

export function Plate() {
  const latheGeometry = useMemo(() => {
    const points = createPlateProfile();
    const geom = new THREE.LatheGeometry(points, 72);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const bumpMap = useMemo(() => getHammeredSteelTexture(), []);
  const gradientMap = useMemo(() => getPlateBaseGradientTexture(), []);

  return (
    <group position={[0, 0, 0]}>
      {/* ── Solid base disc (CylinderGeometry, radius = 1.55, height 0.05) under dish as safety net ── */}
      <mesh position={[0, 0.005, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[1.55, 1.55, 0.05, 64]} />
        <meshPhysicalMaterial
          color="#221E18"
          metalness={0.35}
          roughness={0.55}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
          bumpMap={bumpMap}
          bumpScale={0.004}
          envMapIntensity={0.45}
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1}
          alphaTest={0}
          depthWrite={true}
        />
      </mesh>

      {/* ── Main Matte Black Cast-Iron / Enamel Plate (#17140F, floor #221E18) ── */}
      <mesh
        geometry={latheGeometry}
        castShadow
        receiveShadow
        position={[0, 0, 0]}
      >
        <meshPhysicalMaterial
          color="#17140F"
          map={gradientMap}
          metalness={0.35}
          roughness={0.55}
          clearcoat={0.25}
          clearcoatRoughness={0.4}
          bumpMap={bumpMap}
          bumpScale={0.005}
          envMapIntensity={0.45}
          side={THREE.DoubleSide}
          transparent={false}
          opacity={1}
          alphaTest={0}
          depthWrite={true}
        />
      </mesh>

      {/* ── Rolled Rim: Thin Brushed-Brass Band on Outer Lip (color #B8893A, metalness 0.85, roughness 0.35) ── */}
      {/* Top flat rim ring */}
      <mesh position={[0, 0.468, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[2.12, 2.22, 72]} />
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

      {/* Rolled outer brass lip torus for refined 3D catch-light */}
      <mesh position={[0, 0.435, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.18, 0.022, 16, 72]} />
        <meshStandardMaterial
          color="#B8893A"
          metalness={0.85}
          roughness={0.35}
          transparent={false}
          depthWrite={true}
        />
      </mesh>
    </group>
  );
}

export default Plate;
