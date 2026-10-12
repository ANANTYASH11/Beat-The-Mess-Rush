'use client';

import React, { useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { createSeededRandom } from '@/lib/three/seededRandom';
import { getRotiToastedTexture } from '@/lib/three/textures';

// ── 1. DAL (Deep amber-gold #D98A00 with darker #A85F00 ring & glossy clearcoat) ──
export function Dal({ radius = 0.46 }: { radius?: number }) {
  return (
    <group position={[0, 0.36, 0]}>
      {/* Inner shadow ring underneath rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[radius * 0.85, radius * 1.02, 36]} />
        <meshBasicMaterial color="#14110F" transparent opacity={0.35} />
      </mesh>

      {/* Deep amber-gold liquid base #D98A00 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[radius, 40]} />
        <meshPhysicalMaterial
          color="#D98A00"
          roughness={0.12}
          metalness={0.05}
          clearcoat={0.95}
          clearcoatRoughness={0.06}
          transparent={false}
          opacity={1}
          depthWrite={true}
        />
      </mesh>

      {/* Darker amber outer ring #A85F00 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.003, 0]}>
        <ringGeometry args={[radius * 0.65, radius * 0.98, 36]} />
        <meshBasicMaterial
          color="#A85F00"
          transparent
          opacity={0.65}
        />
      </mesh>

      {/* Small cream swirl ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0.5]} position={[0, 0.006, 0]}>
        <ringGeometry args={[radius * 0.32, radius * 0.52, 32]} />
        <meshBasicMaterial
          color="#FAF4DE"
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Tadka spices: red chilli flakes #B3261E & mustard seeds */}
      {[-0.1, 0.08, -0.03, 0.12].map((tx, idx) => (
        <mesh
          key={idx}
          position={[tx, 0.012, (idx - 1.5) * 0.08]}
          rotation={[Math.PI / 2, 0, (idx * Math.PI) / 3]}
        >
          <cylinderGeometry args={[0.009, 0.009, 0.024, 6]} />
          <meshStandardMaterial
            color={idx % 2 === 0 ? '#B3261E' : '#14110F'}
            roughness={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── 2. SABZI (Deep green #2F7A32 & rich orange #E0620F pieces + red #B3261E chilli bits) ──
export function Sabzi() {
  const pieces = useMemo(() => {
    const rng = createSeededRandom(555);
    const result: Array<{
      type: 'box' | 'sphere';
      pos: [number, number, number];
      rot: [number, number, number];
      scale: number;
      color: string;
    }> = [];

    const colors = [
      '#2F7A32', // Deep green
      '#266829', // Dark leafy green
      '#E0620F', // Rich orange carrot
      '#CC5309', // Roasted carrot
      '#D49B22', // Spiced potato
      '#B3261E', // Red chilli bit
    ];

    for (let i = 0; i < 25; i++) {
      const r = Math.pow(rng(), 0.58) * 0.36;
      const angle = rng() * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      // Sunk comfortably inside tall bowl
      const y = 0.10 + rng() * 0.28 - (r * r) * 0.35;

      const type = i % 2 === 0 ? 'box' : 'sphere';
      const scale = 0.065 + rng() * 0.055;
      const color = colors[i % colors.length];

      result.push({
        type,
        pos: [x, y, z],
        rot: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
        scale,
        color,
      });
    }

    return result;
  }, []);

  return (
    <group position={[0, 0.16, 0]}>
      {/* Inner shadow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.34, 0.44, 32]} />
        <meshBasicMaterial color="#14110F" transparent opacity={0.35} />
      </mesh>

      {pieces.map((p, idx) => (
        <mesh
          key={idx}
          position={p.pos}
          rotation={p.rot}
          castShadow
        >
          {p.type === 'box' ? (
            <boxGeometry args={[p.scale, p.scale, p.scale]} />
          ) : (
            <sphereGeometry args={[p.scale * 0.75, 10, 10]} />
          )}
          <meshStandardMaterial
            color={p.color}
            roughness={0.82}
          />
        </mesh>
      ))}
    </group>
  );
}

// ── 3. RICE (~400 Instanced capsules in warm ivory #EDE3C8 with grain shading) ──
export function Rice() {
  const grainCount = 380;
  const instancedMeshRef = useRef<THREE.InstancedMesh>(null);

  const { matrices, colors } = useMemo(() => {
    const mats: THREE.Matrix4[] = [];
    const cols: THREE.Color[] = [];
    const dummy = new THREE.Object3D();
    const rng = createSeededRandom(999);

    // Warm ivory palette #EDE3C8 with grain shading
    const ivoryBase = new THREE.Color('#EDE3C8');
    const ivoryDeep = new THREE.Color('#DFD4B5');
    const ivoryHighlight = new THREE.Color('#F6EED8');

    for (let i = 0; i < grainCount; i++) {
      const r = Math.pow(rng(), 0.58) * 0.44;
      const theta = rng() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      const y = Math.max(0.02, (1 - (r / 0.48) * (r / 0.48)) * 0.22 + (rng() - 0.5) * 0.03);

      dummy.position.set(x, y, z);
      dummy.rotation.set(
        rng() * Math.PI,
        rng() * Math.PI,
        rng() * Math.PI
      );
      dummy.scale.set(0.015, 0.035, 0.015);
      dummy.updateMatrix();
      mats.push(dummy.matrix.clone());

      const pick = rng();
      if (pick < 0.6) cols.push(ivoryBase);
      else if (pick < 0.85) cols.push(ivoryDeep);
      else cols.push(ivoryHighlight);
    }

    return { matrices: mats, colors: cols };
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
    <group position={[0, 0.08, 0]}>
      {/* Inner shadow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[0.38, 0.48, 32]} />
        <meshBasicMaterial color="#14110F" transparent opacity={0.3} />
      </mesh>

      {/* Interior dome volume in warm ivory */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#DFD4B5" roughness={0.88} />
      </mesh>

      {/* ~400 Instanced grains */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, grainCount]}
        castShadow
      >
        <capsuleGeometry args={[0.65, 1.3, 4, 8]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>

      {/* Scattered dark cumin / jeera seeds */}
      {[-0.1, 0.08, -0.02, 0.12].map((jx, i) => (
        <mesh
          key={i}
          position={[jx, 0.22 + (i % 2) * 0.02, (i - 1.5) * 0.08]}
          rotation={[Math.PI / 3, (i * Math.PI) / 4, 0]}
        >
          <cylinderGeometry args={[0.006, 0.006, 0.035, 6]} />
          <meshStandardMaterial color="#3A2412" roughness={0.75} />
        </mesh>
      ))}
    </group>
  );
}

// ── 4. CURD (Creamy #F1E8D2 dome with tiny saffron dot & slight shade) ──
export function Curd() {
  return (
    <group position={[0, 0.15, 0]}>
      {/* Inner shadow ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.32, 0.42, 32]} />
        <meshBasicMaterial color="#14110F" transparent opacity={0.35} />
      </mesh>

      {/* Creamy #F1E8D2 dome with slight shade */}
      <mesh position={[0, 0.06, 0]}>
        <sphereGeometry args={[0.42, 28, 20, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
        <meshStandardMaterial
          color="#F1E8D2"
          roughness={0.78}
          metalness={0.0}
        />
      </mesh>

      {/* Tiny saffron dot in the center */}
      <mesh position={[0, 0.20, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.032, 16]} />
        <meshBasicMaterial color="#F28C1B" />
      </mesh>
    </group>
  );
}

// ── 5. CENTER SPREAD (2 Rotis #D9A55B, Papad #E6B35C, Lemon #F2C230, Chilli #2E8B3A) ──
export function CenterSpread() {
  const rotiTex = useMemo(() => getRotiToastedTexture(), []);

  return (
    <group position={[0, 0, 0]}>
      {/* Roti 1: Bottom roti (golden-tan #D9A55B with #7A4A1E toasted blisters) */}
      <mesh
        position={[-0.14, 0.045, -0.06]}
        rotation={[-Math.PI / 2, 0, 0.25]}
        castShadow
        receiveShadow
      >
        <circleGeometry args={[0.56, 36]} />
        <meshStandardMaterial
          color="#D9A55B"
          map={rotiTex}
          roughness={0.85}
        />
      </mesh>

      {/* Roti 2: Slightly overlapping top roti */}
      <mesh
        position={[0.12, 0.075, -0.02]}
        rotation={[-Math.PI / 2, -0.05, -0.45]}
        castShadow
        receiveShadow
      >
        <circleGeometry args={[0.54, 36]} />
        <meshStandardMaterial
          color="#D9A55B"
          map={rotiTex}
          roughness={0.85}
        />
      </mesh>

      {/* Papad: Thin crisp disc leaning on the rotis */}
      <mesh
        position={[-0.04, 0.12, 0.14]}
        rotation={[-Math.PI / 2.4, 0.18, 0.35]}
        castShadow
      >
        <circleGeometry args={[0.46, 32]} />
        <meshStandardMaterial
          color="#E6B35C"
          roughness={0.78}
          metalness={0.02}
        />
      </mesh>

      {/* Lemon Wedge: Vibrant yellow #F2C230 */}
      <mesh
        position={[0.34, 0.07, 0.28]}
        rotation={[0.3, 0.5, 0.2]}
        castShadow
      >
        <cylinderGeometry args={[0.10, 0.10, 0.06, 14, 1, false, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color="#F2C230"
          roughness={0.7}
        />
      </mesh>

      {/* Green Chilli: Rich deep green #2E8B3A */}
      <group position={[-0.26, 0.055, 0.32]} rotation={[-0.1, -0.65, 0.2]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.020, 0.035, 0.38, 12]} />
          <meshStandardMaterial color="#2E8B3A" roughness={0.7} />
        </mesh>
        <mesh position={[0, -0.21, 0]}>
          <cylinderGeometry args={[0.009, 0.009, 0.06, 6]} />
          <meshStandardMaterial color="#1B5E26" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}
