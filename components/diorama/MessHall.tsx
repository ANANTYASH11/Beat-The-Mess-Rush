'use client';

import React from 'react';
import { WallClock } from './WallClock';

export function MessHall() {
  return (
    <group>
      {/* ── Floor Slab (Clay / Linoleum Mess Hall Floor) ── */}
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <boxGeometry args={[8.4, 0.12, 6.2]} />
        <meshStandardMaterial color="#DDD6C8" roughness={0.92} />
      </mesh>

      {/* Floor Tile Grid Inset (Subtle matte lines) */}
      <mesh position={[0, 0.002, 0]} receiveShadow>
        <planeGeometry args={[8.3, 6.1]} />
        <meshStandardMaterial
          color="#D6CEBF"
          roughness={0.95}
          polygonOffset
          polygonOffsetFactor={-1}
        />
      </mesh>

      {/* ── Back Wall (behind serving counter) ── */}
      <mesh position={[0, 1.3, -3.0]} receiveShadow>
        <boxGeometry args={[8.4, 2.6, 0.18]} />
        <meshStandardMaterial color="#E7E1D4" roughness={0.95} />
      </mesh>

      {/* Wall trim baseboard */}
      <mesh position={[0, 0.08, -2.9]}>
        <boxGeometry args={[8.4, 0.16, 0.04]} />
        <meshStandardMaterial color="#3A3835" roughness={0.8} />
      </mesh>

      {/* ── Wall Clock ── */}
      <WallClock position={[1.8, 2.1, -2.9]} />

      {/* ── Chalk / Board Menu above counter ── */}
      <group position={[-1.2, 2.1, -2.89]}>
        {/* Frame */}
        <mesh>
          <boxGeometry args={[1.6, 0.7, 0.03]} />
          <meshStandardMaterial color="#3A3835" roughness={0.8} />
        </mesh>
        {/* Slate blackboard */}
        <mesh position={[0, 0, 0.018]}>
          <boxGeometry args={[1.48, 0.58, 0.01]} />
          <meshStandardMaterial color="#2B2D2F" roughness={0.9} />
        </mesh>
      </group>

      {/* ── Left Wall (Return Hatch & Water Cooler) ── */}
      <mesh position={[-4.11, 1.3, 0]} receiveShadow>
        <boxGeometry args={[0.18, 2.6, 6.2]} />
        <meshStandardMaterial color="#DFD9CB" roughness={0.95} />
      </mesh>

      {/* Return Hatch Opening */}
      <group position={[-4.01, 1.0, -1.2]}>
        {/* Hatch Cutout Trim */}
        <mesh>
          <boxGeometry args={[0.04, 0.9, 1.4]} />
          <meshStandardMaterial color="#4A453E" roughness={0.7} />
        </mesh>
        {/* Hatch Counter Shelf */}
        <mesh position={[0.2, -0.4, 0]}>
          <boxGeometry args={[0.42, 0.06, 1.45]} />
          <meshStandardMaterial color="#B0A896" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* Returned Plate Stack */}
        <mesh position={[0.2, -0.28, -0.3]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.14, 0.14, 0.18, 16]} />
          <meshStandardMaterial color="#C5BDAB" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* Waste Plate Weighing Scale Indicator */}
        <mesh position={[0.2, -0.32, 0.3]}>
          <boxGeometry args={[0.16, 0.08, 0.16]} />
          <meshStandardMaterial color="#FEFCF7" roughness={0.5} />
        </mesh>
      </group>

      {/* Water Cooler Dispenser on left */}
      <group position={[-3.6, 0, 1.6]}>
        {/* Stainless Steel Tank */}
        <mesh position={[0, 0.65, 0]} castShadow>
          <cylinderGeometry args={[0.28, 0.28, 1.3, 20]} />
          <meshStandardMaterial color="#C2B9A7" metalness={0.35} roughness={0.4} />
        </mesh>
        {/* Faucet taps */}
        <mesh position={[0.24, 0.72, 0]}>
          <boxGeometry args={[0.08, 0.06, 0.18]} />
          <meshStandardMaterial color="#2B2D2F" roughness={0.6} />
        </mesh>
      </group>

      {/* ── Entrance Doorway Arch (Right side) ── */}
      <group position={[4.11, 1.2, 1.5]}>
        {/* Door Frame Posts */}
        <mesh position={[0, 0, -0.7]}>
          <boxGeometry args={[0.12, 2.4, 0.1]} />
          <meshStandardMaterial color="#4A453E" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0.7]}>
          <boxGeometry args={[0.12, 2.4, 0.1]} />
          <meshStandardMaterial color="#4A453E" roughness={0.8} />
        </mesh>
        <mesh position={[0, 1.15, 0]}>
          <boxGeometry args={[0.12, 0.1, 1.5]} />
          <meshStandardMaterial color="#4A453E" roughness={0.8} />
        </mesh>
      </group>

      {/* ── 4 Long Dining Tables with low benches ── */}
      {[
        { x: -1.5, z: -0.2 },
        { x: -1.5, z: 1.3 },
        { x: -2.8, z: -0.2 },
        { x: -2.8, z: 1.3 },
      ].map((tbl, i) => (
        <group key={i} position={[tbl.x, 0, tbl.z]}>
          {/* Table Top (Stainless / Matte Clay finish) */}
          <mesh position={[0, 0.48, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.9, 0.04, 0.55]} />
            <meshStandardMaterial color="#C8C0AF" metalness={0.2} roughness={0.5} />
          </mesh>
          {/* Table Legs */}
          {[-0.38, 0.38].map((lx, li) =>
            [-0.22, 0.22].map((lz, lzi) => (
              <mesh key={`${li}-${lzi}`} position={[lx, 0.23, lz]}>
                <cylinderGeometry args={[0.018, 0.018, 0.46, 8]} />
                <meshStandardMaterial color="#554E44" roughness={0.7} />
              </mesh>
            ))
          )}

          {/* Low Benches on both sides */}
          {/* Top bench */}
          <mesh position={[0, 0.28, -0.38]} castShadow>
            <boxGeometry args={[0.9, 0.03, 0.16]} />
            <meshStandardMaterial color="#BDB4A1" roughness={0.8} />
          </mesh>
          {/* Bottom bench */}
          <mesh position={[0, 0.28, 0.38]} castShadow>
            <boxGeometry args={[0.9, 0.03, 0.16]} />
            <meshStandardMaterial color="#BDB4A1" roughness={0.8} />
          </mesh>
          {/* Bench Legs */}
          {[-0.36, 0.36].map((bx, bi) => (
            <React.Fragment key={bi}>
              <mesh position={[bx, 0.14, -0.38]}>
                <cylinderGeometry args={[0.015, 0.015, 0.26, 6]} />
                <meshStandardMaterial color="#554E44" roughness={0.7} />
              </mesh>
              <mesh position={[bx, 0.14, 0.38]}>
                <cylinderGeometry args={[0.015, 0.015, 0.26, 6]} />
                <meshStandardMaterial color="#554E44" roughness={0.7} />
              </mesh>
            </React.Fragment>
          ))}
        </group>
      ))}
    </group>
  );
}
