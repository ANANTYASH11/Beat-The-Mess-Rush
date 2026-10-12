'use client';

import React from 'react';
import { TraySteam } from './TraySteam';
import { Lamp } from './Lamp';

interface CounterProps {
  crowdLevel?: 'low' | 'moderate' | 'high';
  isServing?: boolean;
}

export function Counter({ crowdLevel = 'moderate', isServing = true }: CounterProps) {
  return (
    <group position={[0, 0, -1.8]}>
      {/* Lamp hanging directly above */}
      <Lamp level={crowdLevel} position={[0, 2.5, 0]} />

      {/* Main Counter Base (clay/stone) */}
      <mesh position={[0, 0.42, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 0.84, 0.7]} />
        <meshStandardMaterial color="#D6CEBE" roughness={0.88} />
      </mesh>

      {/* Counter Top Slab (Stainless steel style / brushed clay) */}
      <mesh position={[0, 0.86, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.3, 0.05, 0.76]} />
        <meshStandardMaterial color="#C4BCAB" metalness={0.25} roughness={0.55} />
      </mesh>

      {/* Food Warmer Trays (Gastronorm pans) */}
      {/* Dal Tadka Tray */}
      <mesh position={[-1.2, 0.89, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.04, 0.45]} />
        <meshStandardMaterial color="#BDB5A4" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[-1.2, 0.91, 0]}>
        <boxGeometry args={[0.64, 0.02, 0.39]} />
        <meshStandardMaterial color="#D9822B" roughness={0.7} /> {/* Dal color */}
      </mesh>

      {/* Rice Tub (Cylindrical stainless steel pot) */}
      <mesh position={[-0.3, 1.05, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.26, 0.24, 0.38, 20]} />
        <meshStandardMaterial color="#C5BDAC" metalness={0.4} roughness={0.45} />
      </mesh>
      {/* Rice Fill */}
      <mesh position={[-0.3, 1.22, 0]}>
        <cylinderGeometry args={[0.24, 0.24, 0.03, 18]} />
        <meshStandardMaterial color="#FEFCF7" roughness={0.9} />
      </mesh>

      {/* Sabzi Tray (Aloo Gobi) */}
      <mesh position={[0.6, 0.89, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.04, 0.45]} />
        <meshStandardMaterial color="#BDB5A4" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0.6, 0.91, 0]}>
        <boxGeometry args={[0.64, 0.02, 0.39]} />
        <meshStandardMaterial color="#BF5828" roughness={0.75} /> {/* Sabzi color */}
      </mesh>

      {/* Cutlery / Thali Stack */}
      <group position={[1.5, 0.88, 0]}>
        {Array.from({ length: 6 }).map((_, i) => (
          <mesh
            key={i}
            position={[0, i * 0.018, 0]}
            rotation={[Math.PI / 2, 0, 0]}
            castShadow
          >
            <cylinderGeometry args={[0.22, 0.22, 0.012, 24]} />
            <meshStandardMaterial color="#B0A896" metalness={0.5} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* Sneeze Guard Acrylic Bar */}
      <mesh position={[0, 1.25, 0.28]}>
        <boxGeometry args={[4.0, 0.3, 0.02]} />
        <meshStandardMaterial
          color="#FEFCF7"
          transparent
          opacity={0.3}
          roughness={0.1}
        />
      </mesh>
      {/* Sneeze Guard Support Posts */}
      {[-1.9, 0, 1.9].map((x, i) => (
        <mesh key={i} position={[x, 1.15, 0.28]}>
          <cylinderGeometry args={[0.015, 0.015, 0.55, 8]} />
          <meshStandardMaterial color="#7A7264" roughness={0.6} />
        </mesh>
      ))}

      {/* Steam rising from warm food trays */}
      <TraySteam position={[-1.2, 0.95, 0]} active={isServing} />
      <TraySteam position={[-0.3, 1.25, 0]} active={isServing} />
      <TraySteam position={[0.6, 0.95, 0]} active={isServing} />
    </group>
  );
}
