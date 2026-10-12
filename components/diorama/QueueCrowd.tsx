'use client';

import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei/web/Html';
import * as THREE from 'three';

interface QueueCrowdProps {
  count: number;
  speed?: number; // Service rate (e.g. 4.2 served/min)
  onSelectPerson?: (info: { role: string; arrived: string; token: number }) => void;
}

const PEGG_COLORS = ['#C86D51', '#4A6984', '#687E5A', '#B38E46', '#4C4843'];

const DEMO_STUDENTS = [
  { branch: 'Civil 3rd yr', arrived: '12m ago', token: 42 },
  { branch: 'CSE 2nd yr', arrived: '9m ago', token: 43 },
  { branch: 'Mechanical 4th yr', arrived: '8m ago', token: 44 },
  { branch: 'Electrical 1st yr', arrived: '7m ago', token: 45 },
  { branch: 'ECE 3rd yr', arrived: '5m ago', token: 46 },
  { branch: 'Chemical 2nd yr', arrived: '4m ago', token: 47 },
  { branch: 'Biotech 4th yr', arrived: '3m ago', token: 48 },
  { branch: 'Architecture 3rd yr', arrived: '2m ago', token: 49 },
  { branch: 'Aerospace 1st yr', arrived: '1m ago', token: 50 },
  { branch: 'Civil 2nd yr', arrived: 'just now', token: 51 },
];

export function QueueCrowd({ count, speed = 4.5, onSelectPerson }: QueueCrowdProps) {
  const groupRef = useRef<THREE.Group>(null);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  // Compute queue line coordinates (winding queue starting at entrance to counter)
  // Counter is at z = -1.8, x around -0.8
  const clampedCount = Math.min(Math.max(count, 1), 32);

  // Queue path definition
  const queuePath = (i: number): [number, number, number] => {
    // 0 is in front of counter
    if (i < 5) {
      // Straight line facing counter
      return [-0.8 + i * 0.42, 0, -1.2];
    } else if (i < 12) {
      // Turns down towards middle
      const turnI = i - 5;
      return [0.9 + Math.sin(turnI * 0.4) * 0.15, 0, -1.1 + turnI * 0.38];
    } else if (i < 20) {
      // Loops slightly towards right entrance
      const turnI = i - 12;
      return [0.9 + turnI * 0.28, 0, 1.5 + Math.sin(turnI * 0.5) * 0.15];
    } else {
      // Spill towards doorway
      const turnI = i - 20;
      return [3.1 + Math.sin(turnI * 0.3) * 0.1, 0, 1.5 - turnI * 0.32];
    }
  };

  const figuresRef = useRef<Array<THREE.Group | null>>([]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    // Service speed modulates bobbing rate
    const bobFreq = Math.min(speed * 1.2, 8);

    figuresRef.current.forEach((fig, i) => {
      if (!fig) return;
      // Staggered walking bob
      const bob = Math.sin(time * bobFreq + i * 0.8) * 0.025;
      fig.position.y = Math.max(0, bob);
    });
  });

  return (
    <group ref={groupRef}>
      {Array.from({ length: clampedCount }).map((_, i) => {
        const [x, y, z] = queuePath(i);
        const color = PEGG_COLORS[i % PEGG_COLORS.length];
        const student = DEMO_STUDENTS[i % DEMO_STUDENTS.length];
        // Height variation
        const heightScale = 0.94 + ((i * 37) % 15) * 0.01;

        // Facing direction
        let rotY = 0;
        if (i < 5) {
          rotY = -Math.PI / 2; // facing counter (-z)
        } else if (i < 12) {
          rotY = -Math.PI; // facing counter
        } else if (i < 20) {
          rotY = -Math.PI * 0.75;
        } else {
          rotY = Math.PI / 2;
        }

        return (
          <group
            key={i}
            position={[x, y, z]}
            rotation={[0, rotY, 0]}
            scale={[1, heightScale, 1]}
            ref={(el) => {
              figuresRef.current[i] = el;
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredIdx(i);
            }}
            onPointerOut={() => {
              setHoveredIdx(null);
            }}
            onClick={(e) => {
              e.stopPropagation();
              onSelectPerson?.({
                role: student.branch,
                arrived: student.arrived,
                token: student.token,
              });
            }}
          >
            {/* Person Capsule Body */}
            <mesh position={[0, 0.44, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.13, 0.38, 8, 16]} />
              <meshStandardMaterial
                color={color}
                roughness={0.88}
                metalness={0.05}
              />
            </mesh>

            {/* Head (Sphere in soft clay tone) */}
            <mesh position={[0, 0.82, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.12, 16, 16]} />
              <meshStandardMaterial color="#E8D5C4" roughness={0.85} />
            </mesh>

            {/* Small subtle backpack / bag on some students */}
            {i % 2 === 1 && (
              <mesh position={[0, 0.45, -0.12]} castShadow>
                <boxGeometry args={[0.16, 0.22, 0.09]} />
                <meshStandardMaterial color="#3A3835" roughness={0.9} />
              </mesh>
            )}

            {/* Interactive Tooltip on hover */}
            {hoveredIdx === i && (
              <Html position={[0, 1.15, 0]} center distanceFactor={12}>
                <div className="bg-ink text-bg px-2.5 py-1 rounded-pill text-[11px] whitespace-nowrap shadow-soft pointer-events-none flex items-center gap-1.5 border border-warm-grey-300">
                  <span className="font-semibold">{student.branch}</span>
                  <span className="opacity-60">·</span>
                  <span className="font-mono text-warm-grey-300">{student.arrived}</span>
                </div>
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}
