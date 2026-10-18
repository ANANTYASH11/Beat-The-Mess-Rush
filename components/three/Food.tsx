'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';
import { createSeededRandom } from '@/lib/three/seededRandom';
import { getRotiToastedTexture } from '@/lib/three/textures';

// ── 1. DAL TADKA (Glossy deep amber #D98A00, heaped cream swirl, coriander pinch, clearcoat 0.96) ──
export function DalTadka({ radius = 0.45 }: { radius?: number }) {
  const spices = useMemo(() => {
    const rng = createSeededRandom(303);
    const arr: Array<{ pos: [number, number, number]; rot: [number, number, number]; color: string; scale: number }> = [];
    // Coriander green leaf bits
    for (let i = 0; i < 20; i++) {
      const r = rng() * radius * 0.74;
      const th = rng() * Math.PI * 2;
      arr.push({
        pos: [Math.cos(th) * r, 0.22 + (rng() - 0.5) * 0.02, Math.sin(th) * r],
        rot: [rng() * 0.4, rng() * Math.PI, rng() * 0.4],
        color: '#2F7A32',
        scale: 0.028 + rng() * 0.020,
      });
    }
    // Tadka red chilli flakes & roasted cumin/mustard seeds
    for (let i = 0; i < 12; i++) {
      const r = rng() * radius * 0.82;
      const th = rng() * Math.PI * 2;
      arr.push({
        pos: [Math.cos(th) * r, 0.21 + (rng() - 0.5) * 0.015, Math.sin(th) * r],
        rot: [Math.PI / 2, rng() * Math.PI, 0],
        color: i % 2 === 0 ? '#C0281F' : '#2A180E',
        scale: 0.020 + rng() * 0.016,
      });
    }
    return arr;
  }, [radius]);

  return (
    <group position={[0, 0.46, 0]}>
      {/* Heaped deep amber dal dome rising well above the katori rim */}
      <mesh position={[0, 0.04, 0]} scale={[1, 0.48, 1]}>
        <sphereGeometry args={[radius, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshPhysicalMaterial
          color="#D98A00"
          roughness={0.12}
          metalness={0.02}
          clearcoat={0.96}
          clearcoatRoughness={0.04}
          depthWrite={true}
        />
      </mesh>

      {/* Prominent heaped rich cream swirl sitting proudly on dal apex */}
      <group position={[0, 0.205, 0]}>
        {/* Outer cream spiral ring */}
        <mesh rotation={[-Math.PI / 2, 0.20, 0.35]} position={[0.02, 0.015, 0.01]}>
          <torusGeometry args={[radius * 0.45, 0.052, 14, 36, Math.PI * 1.8]} />
          <meshStandardMaterial color="#FFFDF5" roughness={0.45} />
        </mesh>
        {/* Inner cream dollop loop */}
        <mesh rotation={[-Math.PI / 2, 0.14, 2.0]} position={[-0.02, 0.034, -0.01]}>
          <torusGeometry args={[radius * 0.25, 0.044, 14, 30, Math.PI * 1.6]} />
          <meshStandardMaterial color="#FFFDF5" roughness={0.45} />
        </mesh>
        {/* Center cream dollop peak */}
        <mesh position={[0.01, 0.055, 0.01]}>
          <sphereGeometry args={[0.062, 16, 16]} />
          <meshStandardMaterial color="#FFFDF5" roughness={0.45} />
        </mesh>
      </group>

      {/* Coriander & tadka flakes on dal surface */}
      {spices.map((s, idx) => (
        <mesh key={idx} position={[s.pos[0], s.pos[1] * 0.95 + 0.04, s.pos[2]]} rotation={s.rot}>
          <boxGeometry args={[s.scale, 0.007, s.scale * 1.4]} />
          <meshStandardMaterial color={s.color} roughness={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// ── 2. ALOO GOBI (Heaped spiced potato & cauliflower pieces, peas, red chilli bits, roughness 0.8) ──
export function AlooGobi() {
  const chunks = useMemo(() => {
    const rng = createSeededRandom(777);
    const list: Array<{
      type: 'box' | 'sphere';
      pos: [number, number, number];
      rot: [number, number, number];
      size: [number, number, number];
      color: string;
    }> = [];

    const colors = [
      '#D49B22', // Golden spiced potato
      '#E08E1B', // Warm roasted potato
      '#C68615', // Tandoori spiced potato
      '#E0620F', // Spiced carrot / gobi
      '#CC5309', // Roasted gobi floret
      '#2F7A32', // Tender green peas
      '#266829', // Leafy green bits
      '#B3261E', // Bright red chilli bit
    ];

    // 52 heaped chunks stacked high above rim
    for (let i = 0; i < 52; i++) {
      const r = Math.pow(rng(), 0.62) * 0.42;
      const angle = rng() * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      // Heaped center dome height up to +0.30 above bowl rim
      const domeH = (1 - (r / 0.47) * (r / 0.47)) * 0.28;
      const y = 0.06 + domeH + (rng() - 0.5) * 0.04;

      const pickColor = colors[i % colors.length];
      const isGreenPea = pickColor === '#2F7A32';
      const isChilli = pickColor === '#B3261E';

      if (isGreenPea) {
        list.push({
          type: 'sphere',
          pos: [x, y + 0.015, z],
          rot: [0, 0, 0],
          size: [0.055, 0.055, 0.055],
          color: pickColor,
        });
      } else if (isChilli) {
        list.push({
          type: 'box',
          pos: [x, y + 0.025, z],
          rot: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
          size: [0.065, 0.016, 0.028],
          color: pickColor,
        });
      } else {
        const s = 0.11 + rng() * 0.075;
        list.push({
          type: rng() > 0.35 ? 'box' : 'sphere',
          pos: [x, y, z],
          rot: [rng() * Math.PI, rng() * Math.PI, rng() * Math.PI],
          size: [s, s * (0.8 + rng() * 0.4), s * (0.8 + rng() * 0.4)],
          color: pickColor,
        });
      }
    }
    return list;
  }, []);

  return (
    <group position={[0, 0.46, 0]}>
      {/* Solid spiced base mound under chunks */}
      <mesh position={[0, 0.05, 0]}>
        <sphereGeometry args={[0.44, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.48]} />
        <meshStandardMaterial color="#B57A18" roughness={0.80} />
      </mesh>

      {/* Heaped chunks */}
      {chunks.map((c, i) => (
        <mesh key={i} position={c.pos} rotation={c.rot} castShadow>
          {c.type === 'box' ? (
            <boxGeometry args={c.size} />
          ) : (
            <sphereGeometry args={[c.size[0] * 0.5, 10, 10]} />
          )}
          <meshStandardMaterial color={c.color} roughness={0.80} />
        </mesh>
      ))}
    </group>
  );
}

// ── 3. RAJMA (Dark red-brown #6B2A1A kidney beans with glossy gravy, clearcoat 0.92) ──
export function Rajma() {
  const beans = useMemo(() => {
    const rng = createSeededRandom(616);
    const list: Array<{
      pos: [number, number, number];
      rot: [number, number, number];
      color: string;
    }> = [];

    const beanColors = ['#6B2A1A', '#5A2014', '#752E1C', '#531B10'];

    for (let i = 0; i < 34; i++) {
      const r = Math.pow(rng(), 0.6) * 0.41;
      const th = rng() * Math.PI * 2;
      const x = Math.cos(th) * r;
      const z = Math.sin(th) * r;
      const domeH = (1 - (r / 0.45) * (r / 0.45)) * 0.21;
      const y = 0.05 + domeH + (rng() - 0.5) * 0.025;

      list.push({
        pos: [x, y, z],
        rot: [rng() * 0.6, rng() * Math.PI, rng() * 0.6],
        color: beanColors[i % beanColors.length],
      });
    }
    return list;
  }, []);

  return (
    <group position={[0, 0.45, 0]}>
      {/* Heaped glossy rich red-brown gravy mound */}
      <mesh position={[0, 0.04, 0]} scale={[1, 0.48, 1]}>
        <sphereGeometry args={[0.44, 32, 22, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshPhysicalMaterial
          color="#6B2A1A"
          roughness={0.16}
          metalness={0.02}
          clearcoat={0.92}
          clearcoatRoughness={0.05}
          depthWrite={true}
        />
      </mesh>

      {/* Individual kidney beans floating in the glossy gravy */}
      {beans.map((b, i) => (
        <group key={i} position={b.pos} rotation={b.rot}>
          <mesh scale={[0.075, 0.044, 0.118]} castShadow>
            <sphereGeometry args={[1, 14, 12]} />
            <meshPhysicalMaterial
              color={b.color}
              roughness={0.20}
              metalness={0.02}
              clearcoat={0.90}
              clearcoatRoughness={0.05}
            />
          </mesh>
        </group>
      ))}

      {/* Fresh ginger julienne slivers & coriander garnish on top */}
      {[-0.08, 0.02, 0.09].map((gx, idx) => (
        <mesh
          key={idx}
          position={[gx, 0.265, (idx - 1) * 0.045]}
          rotation={[0.2, (idx * Math.PI) / 3, 0.1]}
        >
          <boxGeometry args={[0.10, 0.010, 0.016]} />
          <meshStandardMaterial color="#FAF0D7" roughness={0.65} />
        </mesh>
      ))}
      <mesh position={[0.01, 0.270, 0.01]}>
        <boxGeometry args={[0.050, 0.008, 0.050]} />
        <meshStandardMaterial color="#2F7A32" roughness={0.7} />
      </mesh>
    </group>
  );
}

// ── 4. CURD / RAITA (Cream #F1E8D2, red masala dusting, saffron dot, roughness 0.80) ──
export function CurdRaita({ radius = 0.44 }: { radius?: number }) {
  const masalaFlecks = useMemo(() => {
    const rng = createSeededRandom(404);
    const arr: Array<{ pos: [number, number, number]; scale: number }> = [];
    for (let i = 0; i < 38; i++) {
      const r = rng() * radius * 0.78;
      const th = rng() * Math.PI * 2;
      const domeH = (1 - (r / radius) * (r / radius)) * 0.19;
      arr.push({
        pos: [Math.cos(th) * r, 0.04 + domeH + 0.006, Math.sin(th) * r],
        scale: 0.016 + rng() * 0.018,
      });
    }
    return arr;
  }, [radius]);

  return (
    <group position={[0, 0.44, 0]}>
      {/* Heaped creamy curd dome rising well above rim */}
      <mesh position={[0, 0.04, 0]} scale={[1, 0.46, 1]}>
        <sphereGeometry args={[radius, 32, 24, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial
          color="#F1E8D2"
          roughness={0.80}
          metalness={0.0}
        />
      </mesh>

      {/* Saffron dot in the center */}
      <mesh position={[0, 0.245, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.056, 20]} />
        <meshBasicMaterial color="#F28C1B" />
      </mesh>

      {/* Red masala dusting (paprika/chilli powder flecks) */}
      {masalaFlecks.map((m, idx) => (
        <mesh key={idx} position={m.pos}>
          <circleGeometry args={[m.scale, 8]} />
          <meshBasicMaterial color={idx % 3 === 0 ? '#C0392B' : '#8B2500'} />
        </mesh>
      ))}
    </group>
  );
}

// ── 5. SWEET: GULAB JAMUN (2 deep brown #5A2A14 spheres, glossy syrup clearcoat 0.98) ──
export function GulabJamun() {
  return (
    <group position={[0, 0.38, 0]}>
      {/* Glossy sweet sugar syrup base */}
      <mesh position={[0, 0.08, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.33, 24]} />
        <meshPhysicalMaterial
          color="#8A4A1C"
          roughness={0.08}
          metalness={0.02}
          clearcoat={0.96}
          clearcoatRoughness={0.03}
        />
      </mesh>

      {/* Gulab Jamun 1 (deep brown #5A2A14, glossy with syrup, heaped above rim) */}
      <mesh position={[-0.09, 0.21, 0.01]} castShadow>
        <sphereGeometry args={[0.168, 28, 24]} />
        <meshPhysicalMaterial
          color="#5A2A14"
          roughness={0.10}
          metalness={0.02}
          clearcoat={0.98}
          clearcoatRoughness={0.03}
        />
      </mesh>

      {/* Gulab Jamun 2 (second plump sphere) */}
      <mesh position={[0.09, 0.22, -0.01]} castShadow>
        <sphereGeometry args={[0.164, 28, 24]} />
        <meshPhysicalMaterial
          color="#5A2A14"
          roughness={0.10}
          metalness={0.02}
          clearcoat={0.98}
          clearcoatRoughness={0.03}
        />
      </mesh>

      {/* Pistachio & almond sliver garnishes */}
      <mesh position={[-0.08, 0.385, 0.02]}>
        <boxGeometry args={[0.048, 0.007, 0.016]} />
        <meshStandardMaterial color="#4E8B3A" roughness={0.6} />
      </mesh>
      <mesh position={[0.10, 0.390, 0.0]}>
        <boxGeometry args={[0.048, 0.007, 0.016]} />
        <meshStandardMaterial color="#FAF0D7" roughness={0.6} />
      </mesh>
    </group>
  );
}

// ── 6. PICKLE (Dark orange-brown blob with mustard seeds & chilli oil gloss) ──
export function PickleBlob() {
  return (
    <group position={[0, 0.36, 0]}>
      {/* Dark orange-brown spicy achar mound */}
      <mesh position={[0, 0.07, 0]} scale={[1, 0.82, 1]} castShadow>
        <sphereGeometry args={[0.31, 20, 16, 0, Math.PI * 2, 0, Math.PI * 0.54]} />
        <meshPhysicalMaterial
          color="#8B3A10"
          roughness={0.22}
          metalness={0.02}
          clearcoat={0.85}
          clearcoatRoughness={0.08}
        />
      </mesh>
      {/* Whole spices & fenugreek/mustard seeds */}
      {[-0.09, 0.07, -0.03, 0.10, -0.04].map((sx, i) => (
        <mesh key={i} position={[sx, 0.19, (i - 2) * 0.06]}>
          <sphereGeometry args={[0.022, 8, 8]} />
          <meshStandardMaterial color={i % 2 === 0 ? '#1A1713' : '#D4AC0D'} roughness={0.5} />
        </mesh>
      ))}
    </group>
  );
}

// ── 7. ROTI STACK & PAPAD (3 large golden-tan #D9A55B rotis fanned + crisp papad #E6B35C) ──
export function RotiStack() {
  const rotiTex = useMemo(() => getRotiToastedTexture(), []);

  return (
    <group position={[-0.40, 0.02, 0.02]}>
      {/* Roti 1 (Bottom, golden tan #D9A55B with toasted blisters, physical depth) */}
      <mesh
        position={[-0.10, 0.030, -0.08]}
        rotation={[-Math.PI / 2, 0, 0.12]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.72, 0.72, 0.024, 40]} />
        <meshStandardMaterial
          color="#FFFFFF"
          map={rotiTex}
          roughness={0.82}
        />
      </mesh>

      {/* Roti 2 (Middle, fanned forward towards center, physical depth) */}
      <mesh
        position={[0.10, 0.065, 0.16]}
        rotation={[-Math.PI / 2, -0.03, 0.72]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.72, 0.72, 0.024, 40]} />
        <meshStandardMaterial
          color="#FFFFFF"
          map={rotiTex}
          roughness={0.82}
        />
      </mesh>

      {/* Roti 3 (Top, fanned slightly, visible blistered surface) */}
      <mesh
        position={[-0.02, 0.100, -0.02]}
        rotation={[-Math.PI / 2, 0.03, -0.28]}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[0.70, 0.70, 0.024, 40]} />
        <meshStandardMaterial
          color="#FFFFFF"
          map={rotiTex}
          roughness={0.82}
        />
      </mesh>

      {/* Papad: Crisp golden wafer (#E6B35C) leaning on the outer edge of the rotis */}
      <group position={[-0.38, 0.18, 0.0]} rotation={[-Math.PI / 2.3, 0.32, 0.48]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.58, 0.58, 0.016, 36]} />
          <meshStandardMaterial
            color="#E6B35C"
            roughness={0.76}
            metalness={0.02}
          />
        </mesh>
        {/* Subtle roasted cumin/lentil spots on papad */}
        {[
          [-0.18, 0.01, 0.12],
          [0.14, 0.01, -0.16],
          [-0.06, 0.01, -0.22],
          [0.22, 0.01, 0.18],
          [0.02, 0.01, 0.06],
        ].map((pt, i) => (
          <mesh key={i} position={pt as [number, number, number]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshStandardMaterial color="#8C5F1E" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// ── 8. SALAD CLUSTER (5-6 red onion rings, 3 cucumber slices, tomato wedge, lemon wedge, 2 chillies) ──
export function SaladCluster() {
  return (
    <group position={[-0.64, 0.02, 0.82]}>
      {/* 5-6 Red Onion Rings (purple-pink torus meshes) */}
      {[
        { pos: [-0.08, 0.035, -0.08], rot: [-Math.PI / 2, 0.10, 0.25], r: 0.17 },
        { pos: [0.12, 0.052, -0.10], rot: [-Math.PI / 2, -0.15, 0.85], r: 0.16 },
        { pos: [-0.02, 0.070, 0.08], rot: [-Math.PI / 2.1, 0.12, 1.45], r: 0.175 },
        { pos: [0.18, 0.088, 0.10], rot: [-Math.PI / 2, 0.20, 0.45], r: 0.155 },
        { pos: [-0.18, 0.058, 0.16], rot: [-Math.PI / 1.9, -0.10, -0.35], r: 0.165 },
        { pos: [0.06, 0.105, 0.04], rot: [-Math.PI / 2, 0.05, 0.95], r: 0.150 },
      ].map((ring, idx) => (
        <group key={idx} position={ring.pos as [number, number, number]} rotation={ring.rot as [number, number, number]}>
          {/* Outer purple-pink ring */}
          <mesh castShadow>
            <torusGeometry args={[ring.r, 0.028, 12, 32]} />
            <meshStandardMaterial color="#B84B7E" roughness={0.65} />
          </mesh>
          {/* Inner white-pink core ring */}
          <mesh position={[0, 0, 0]}>
            <torusGeometry args={[ring.r * 0.78, 0.016, 10, 28]} />
            <meshStandardMaterial color="#F7D8E6" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* 3 Cucumber Slices (green skin, pale interior) */}
      {[
        { pos: [0.32, 0.040, -0.09], rot: [-Math.PI / 2, 0.10, 0.20] },
        { pos: [0.38, 0.060, 0.08], rot: [-Math.PI / 2.2, -0.10, 0.65] },
        { pos: [0.34, 0.080, 0.24], rot: [-Math.PI / 2, 0.15, -0.45] },
      ].map((cuc, idx) => (
        <group key={idx} position={cuc.pos as [number, number, number]} rotation={cuc.rot as [number, number, number]}>
          {/* Dark green skin */}
          <mesh castShadow>
            <cylinderGeometry args={[0.14, 0.14, 0.035, 24]} />
            <meshStandardMaterial color="#3E7A36" roughness={0.72} />
          </mesh>
          {/* Crisp pale green flesh */}
          <mesh position={[0, 0.019, 0]}>
            <circleGeometry args={[0.125, 24]} />
            <meshStandardMaterial color="#C8E6C9" roughness={0.78} />
          </mesh>
        </group>
      ))}

      {/* 1 Tomato Wedge (vibrant red) */}
      <mesh
        position={[-0.30, 0.052, 0.08]}
        rotation={[0.4, 0.6, 0.2]}
        castShadow
      >
        <cylinderGeometry args={[0.16, 0.16, 0.088, 14, 1, false, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#D72626" roughness={0.55} />
      </mesh>

      {/* 1 Lemon Wedge (vibrant yellow #F2C230) */}
      <mesh
        position={[0.12, 0.052, 0.30]}
        rotation={[0.3, 0.8, 0.2]}
        castShadow
      >
        <cylinderGeometry args={[0.14, 0.14, 0.078, 14, 1, false, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#F2C230" roughness={0.65} />
      </mesh>

      {/* 2 Green Chillies (#2E8B3A with stalk) */}
      <group position={[-0.10, 0.052, 0.38]} rotation={[-0.1, -0.5, 0.18]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.026, 0.044, 0.44, 12]} />
          <meshStandardMaterial color="#2E8B3A" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.23, 0]}>
          <cylinderGeometry args={[0.011, 0.011, 0.08, 6]} />
          <meshStandardMaterial color="#1E4725" roughness={0.8} />
        </mesh>
      </group>

      <group position={[0.24, 0.048, 0.36]} rotation={[0.05, 0.7, -0.15]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.023, 0.040, 0.40, 12]} />
          <meshStandardMaterial color="#2E8B3A" roughness={0.65} />
        </mesh>
        <mesh position={[0, -0.21, 0]}>
          <cylinderGeometry args={[0.010, 0.010, 0.07, 6]} />
          <meshStandardMaterial color="#1E4725" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
}

// ── Backward-compatible exports for other modules if referenced ──
export { DalTadka as Dal, AlooGobi as Sabzi, CurdRaita as Curd };
