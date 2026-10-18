'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { createSeededRandom } from '@/lib/three/seededRandom';

/**
 * Large heaped mound of jeera rice (ivory #EDE3C8 with dark cumin seeds),
 * sitting directly on the plate floor (1.4x the size of a katori, ~500 instances).
 */
export function Rice({ position = [0.70, 0.02, 0.25] as [number, number, number] }: { position?: [number, number, number] }) {
  const grainCount = 500;
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const { matrices, colors, cuminSeeds } = useMemo(() => {
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const seeds: Array<{ pos: [number, number, number]; rot: [number, number, number] }> = [];
    const dummy = new THREE.Object3D();
    const rng = createSeededRandom(909);

    // Warm cooked basmati ivory palette #EDE3C8 per brief
    const ivoryBase = new THREE.Color('#EDE3C8');
    const ivoryDeep = new THREE.Color('#DFD2B0');
    const ivoryHighlight = new THREE.Color('#F6EDD7');

    const moundRadius = 0.84; // ~1.8x katori size: large heaped mound filling right plate

    for (let i = 0; i < grainCount; i++) {
      // Natural dense surface distribution covering the entire mound
      const r = Math.pow(rng(), 0.54) * moundRadius;
      const theta = rng() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      // Heaped natural dome height profile
      const domeH = (1 - (r / (moundRadius * 1.04)) * (r / (moundRadius * 1.04))) * 0.34;
      const y = Math.max(0.02, domeH + (rng() - 0.35) * 0.035);

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        rng() * Math.PI,
        rng() * Math.PI,
        rng() * Math.PI
      );
      dummy.scale.set(1.0, 1.0, 1.0);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());

      const pick = rng();
      if (pick < 0.60) cols.push(ivoryBase);
      else if (pick < 0.85) cols.push(ivoryDeep);
      else cols.push(ivoryHighlight);
    }

    // ~52 dark roasted jeera / cumin seeds scattered over the mound
    for (let i = 0; i < 52; i++) {
      const r = Math.pow(rng(), 0.58) * (moundRadius * 0.90);
      const theta = rng() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const y = (1 - (r / moundRadius) * (r / moundRadius)) * 0.34 + 0.038;
      seeds.push({
        pos: [x, y, z],
        rot: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
      });
    }

    return { matrices: mats, colors: cols, cuminSeeds: seeds };
  }, []);

  useEffect(() => {
    if (!instancedMeshRef.current) return;
    matrices.forEach((mat, i) => {
      instancedMeshRef.current!.setMatrixAt(i, mat);
      instancedMeshRef.current!.setColorAt(i, colors[i]);
    });
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
    if (instancedMeshRef.current.instanceColor) {
      instancedMeshRef.current.instanceColor.needsUpdate = true;
    }
  }, [matrices, colors]);

  return (
    <group position={position}>
      {/* Base contact shadow on plate floor */}
      <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.88, 36]} />
        <meshBasicMaterial color="#0E0C0A" transparent opacity={0.35} depthWrite={false} />
      </mesh>

      {/* Flattened base dome matching dome height so grains form the visible textured surface */}
      <mesh position={[0, 0.015, 0]} scale={[1, 0.44, 1]}>
        <sphereGeometry args={[0.82, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#E5D8B8" roughness={0.88} />
      </mesh>

      {/* ~500 Instanced individual basmati rice grains */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, grainCount]}
        castShadow
        receiveShadow
      >
        <capsuleGeometry args={[0.024, 0.068, 4, 8]} />
        <meshStandardMaterial color="#EDE3C8" roughness={0.80} />
      </instancedMesh>

      {/* Scattered dark cumin / jeera seeds */}
      {cuminSeeds.map((seed, i) => (
        <mesh key={i} position={seed.pos} rotation={seed.rot}>
          <cylinderGeometry args={[0.009, 0.009, 0.052, 6]} />
          <meshStandardMaterial color="#26160A" roughness={0.72} />
        </mesh>
      ))}
    </group>
  );
}

export default Rice;
