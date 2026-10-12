'use client';

import React from 'react';
import { ContactShadows } from '@react-three/drei/core/ContactShadows';

interface GroundShadowProps {
  isMobile?: boolean;
}

export function GroundShadow({ isMobile = false }: GroundShadowProps) {
  return (
    <group position={[0, -0.002, 0]}>
      {/* 
        NO large opaque ground plane mesh per user instructions (Fix A)
        ContactShadows is completely transparent outside the shadow,
        so the thali sits naturally on whatever background colour is behind it.
      */}
      <ContactShadows
        position={[0, 0, 0]}
        opacity={0.5}
        scale={5.8}
        blur={2.4}
        far={3.0}
        resolution={isMobile ? 1024 : 2048}
        color="#14110F"
      />
    </group>
  );
}

export default GroundShadow;
