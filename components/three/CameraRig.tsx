'use client';

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface CameraRigProps {
  dollyTarget: [number, number, number] | null;
  isMobile?: boolean;
}

export function CameraRig({ dollyTarget, isMobile = false }: CameraRigProps) {
  const { camera, pointer } = useThree();

  // Camera about [0, 6.2, 5.2], FOV 35 per specification
  const basePos = useRef(new THREE.Vector3(0, 6.2, 5.2));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state, delta) => {
    if (dollyTarget) {
      // 700ms smooth camera dolly into clicked katori
      const targetPos = new THREE.Vector3(
        dollyTarget[0] * 0.65,
        dollyTarget[1] + 1.55,
        dollyTarget[2] * 0.65 + 1.75
      );
      const lookTarget = new THREE.Vector3(
        dollyTarget[0],
        dollyTarget[1] + 0.15,
        dollyTarget[2]
      );

      camera.position.lerp(targetPos, delta * 4.8);
      currentLookAt.current.lerp(lookTarget, delta * 5.2);
      camera.lookAt(currentLookAt.current);
    } else {
      // Gentle subtle mouse parallax tilt (clamped to max +/- 4 degrees = ~0.07 rad)
      const mouseFactorX = isMobile ? 0 : pointer.x * 0.22;
      const mouseFactorY = isMobile ? 0 : pointer.y * 0.15;

      const targetX = basePos.current.x + mouseFactorX;
      const targetY = basePos.current.y - mouseFactorY;
      const targetZ = basePos.current.z;

      camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 4.0, delta);
      camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 4.0, delta);
      camera.position.z = THREE.MathUtils.damp(camera.position.z, targetZ, 4.0, delta);

      currentLookAt.current.lerp(new THREE.Vector3(0, 0, 0), delta * 4);
      camera.lookAt(currentLookAt.current);
    }
  });

  return null;
}

export default CameraRig;
