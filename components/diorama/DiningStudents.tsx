'use client';

import React from 'react';

interface DiningStudentsProps {
  occupancyFactor?: number; // 0 to 1 (table fullness)
}

const PEGG_COLORS = ['#C86D51', '#4A6984', '#687E5A', '#B38E46', '#4C4843'];

export function DiningStudents({ occupancyFactor = 0.6 }: DiningStudentsProps) {
  // Pre-configured chair seats at the 4 tables
  // Table 1: x = -1.5, z = -0.2
  // Table 2: x = -1.5, z = 1.3
  // Table 3: x = -2.8, z = -0.2
  // Table 4: x = -2.8, z = 1.3
  const seats = [
    // Table 1 seats
    { pos: [-1.8, 0.35, -0.55], rotY: 0, table: 1 },
    { pos: [-1.2, 0.35, -0.55], rotY: 0, table: 1 },
    { pos: [-1.8, 0.35, 0.15], rotY: Math.PI, table: 1 },
    { pos: [-1.2, 0.35, 0.15], rotY: Math.PI, table: 1 },

    // Table 2 seats
    { pos: [-1.8, 0.35, 0.95], rotY: 0, table: 2 },
    { pos: [-1.2, 0.35, 0.95], rotY: 0, table: 2 },
    { pos: [-1.8, 0.35, 1.65], rotY: Math.PI, table: 2 },
    { pos: [-1.2, 0.35, 1.65], rotY: Math.PI, table: 2 },

    // Table 3 seats
    { pos: [-3.1, 0.35, -0.55], rotY: 0, table: 3 },
    { pos: [-2.5, 0.35, -0.55], rotY: 0, table: 3 },
    { pos: [-3.1, 0.35, 0.15], rotY: Math.PI, table: 3 },

    // Table 4 seats
    { pos: [-3.1, 0.35, 0.95], rotY: 0, table: 4 },
    { pos: [-2.5, 0.35, 0.95], rotY: 0, table: 4 },
    { pos: [-3.1, 0.35, 1.65], rotY: Math.PI, table: 4 },
  ];

  // How many seats occupied
  const totalOccupied = Math.max(2, Math.round(seats.length * occupancyFactor));
  const activeSeats = seats.slice(0, totalOccupied);

  return (
    <group>
      {activeSeats.map((seat, i) => {
        const color = PEGG_COLORS[i % PEGG_COLORS.length];
        const [x, y, z] = seat.pos;

        return (
          <group key={i} position={[x, y, z]} rotation={[0, seat.rotY, 0]}>
            {/* Seated Capsule Body (shorter because seated) */}
            <mesh position={[0, 0.22, 0]} castShadow receiveShadow>
              <capsuleGeometry args={[0.11, 0.22, 6, 12]} />
              <meshStandardMaterial color={color} roughness={0.88} />
            </mesh>

            {/* Head */}
            <mesh position={[0, 0.52, 0]} castShadow receiveShadow>
              <sphereGeometry args={[0.11, 14, 14]} />
              <meshStandardMaterial color="#E8D5C4" roughness={0.85} />
            </mesh>

            {/* Thali on table in front of student */}
            <mesh
              position={[0, 0.26, seat.rotY === 0 ? 0.35 : -0.35]}
              rotation={[Math.PI / 2, 0, 0]}
              castShadow
            >
              <cylinderGeometry args={[0.14, 0.14, 0.01, 16]} />
              <meshStandardMaterial color="#B0A896" metalness={0.4} roughness={0.5} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
