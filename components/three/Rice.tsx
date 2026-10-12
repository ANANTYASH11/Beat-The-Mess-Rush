'use client';

import React, { useMemo } from 'react';
import * as THREE from 'three';

export function Rice() {
  const grainCount = 140;

  // Generate randomized positions in a dome mound shape
  const transforms = useMemo(() => {
    const matrices: THREE.Matrix4[] = [];
    const dummy = new THREE.Object3D();

    for (let i = 0; i < grainCount; i++) {
      // Cylindrical coordinates clustered towards center dome
      const r = Math.pow(Math.random(), 0.6) * 0.45;
      const theta = Math.random() * Math.PI * 2;
      const x = Math.cos(theta) * r;
      const z = Math.sin(theta) * r;
      // Dome height profile
      const y = Math.max(0.04, (1 - (r / 0.5) * (r / 0.5)) * 0.28 + (Math.random() - 0.5) * 0.04);

      dummy.position.set(x, y, z);
      // Random grain orientation
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      dummy.scale.set(0.022, 0.045, 0.022);
      dummy.updateMatrix();
      matrices.push(dummy.matrix.clone());
    }
    return matrices;
  }, []);

  const instancedMeshRef = React.useRef<THREE.InstancedMesh>(null);

  React.useEffect(() => {
    if (!instancedMeshRef.current) return;
    transforms.forEach((mat, i) => {
      instancedMeshRef.current!.setMatrixAt(i, mat);
    });
    instancedMeshRef.current.instanceMatrix.needsUpdate = true;
  }, [transforms]);

  return (
    <group position={[0, 0, 0]}>
      {/* Base mound to fill gaps */}
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
        <meshStandardMaterial color="#FEFCF6" roughness={0.9} />
      </mesh>

      {/* Instanced individual rice grains */}
      <instancedMesh
        ref={instancedMeshRef}
        args={[undefined, undefined, grainCount]}
        castShadow
      >
        <capsuleGeometry args={[0.7, 1.4, 4, 8]} />
        <meshStandardMaterial color="#FFFDF7" roughness={0.85} />
      </instancedMesh>

      {/* A few dark jeera / cumin seeds scattered on top */}
      {[-0.12, 0.08, -0.04, 0.15].map((jx, i) => (
        <mesh
          key={i}
          position={[jx, 0.26 + (i % 2) * 0.02, (i - 1.5) * 0.1]}
          rotation={[Math.PI / 3, (i * Math.PI) / 4, 0]}
        >
          <cylinderGeometry args={[0.007, 0.007, 0.04, 6]} />
          <meshStandardMaterial color="#3A2718" roughness={0.8} />
        </mesh>
      ))}
    </group>
  );
}
