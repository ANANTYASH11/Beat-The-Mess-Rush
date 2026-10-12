import * as THREE from 'three';

/**
 * Procedural Lathe cross-section profiles for Indian stainless-steel dining thali and katoris.
 */

// 1. Thali Plate Profile: Deeper dish, steeper wall, wide rim (~0.28 units wide) with rolled lip
export function createPlateProfile(): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];
  // Center point (x=0) to flat dished base
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.5, 0.003));
  points.push(new THREE.Vector2(1.0, 0.008));
  points.push(new THREE.Vector2(1.48, 0.016));
  
  // Steeper dish wall
  points.push(new THREE.Vector2(1.62, 0.065));
  points.push(new THREE.Vector2(1.74, 0.20));
  points.push(new THREE.Vector2(1.85, 0.42));
  
  // Wide rim (~0.28 units wide from x=1.86 to x=2.14)
  points.push(new THREE.Vector2(1.88, 0.455));
  points.push(new THREE.Vector2(2.02, 0.462));
  points.push(new THREE.Vector2(2.14, 0.465));
  
  // Clear rolled steel outer lip
  points.push(new THREE.Vector2(2.18, 0.44));
  points.push(new THREE.Vector2(2.20, 0.39));
  points.push(new THREE.Vector2(2.17, 0.34));
  points.push(new THREE.Vector2(2.11, 0.32));
  points.push(new THREE.Vector2(2.05, 0.33));

  return points;
}

// 2. Katori Profiles: Enlarged by ~35% with deeper walls and rolled rim
export type KatoriKind = 'large' | 'small' | 'tall' | 'shallow';

export function createKatoriProfile(kind: KatoriKind): THREE.Vector2[] {
  const points: THREE.Vector2[] = [];

  let rFoot = 0.28;
  let rMax = 0.47;
  let h = 0.54;

  if (kind === 'large') {
    // Student (Dal)
    rFoot = 0.30;
    rMax = 0.49;
    h = 0.54;
  } else if (kind === 'small') {
    // Staff (Curd)
    rFoot = 0.26;
    rMax = 0.45;
    h = 0.50;
  } else if (kind === 'tall') {
    // Kitchen (Sabzi) - Deeper bowl
    rFoot = 0.28;
    rMax = 0.48;
    h = 0.62;
  } else if (kind === 'shallow') {
    // Impact (Rice)
    rFoot = 0.32;
    rMax = 0.51;
    h = 0.46;
  }

  // Base center
  points.push(new THREE.Vector2(0, 0.025));
  points.push(new THREE.Vector2(rFoot * 0.85, 0.025));
  // Foot ring
  points.push(new THREE.Vector2(rFoot, 0.0));
  points.push(new THREE.Vector2(rFoot + 0.03, 0.0));
  points.push(new THREE.Vector2(rFoot + 0.04, 0.04));
  // Steeper, deeper rounded bowl wall
  points.push(new THREE.Vector2(rMax * 0.74, h * 0.35));
  points.push(new THREE.Vector2(rMax * 0.92, h * 0.72));
  // Rolled rim lip
  points.push(new THREE.Vector2(rMax, h));
  points.push(new THREE.Vector2(rMax + 0.035, h - 0.018));
  points.push(new THREE.Vector2(rMax + 0.025, h - 0.045));

  return points;
}
