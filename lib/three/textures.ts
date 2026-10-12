import * as THREE from 'three';
import { createSeededRandom } from './seededRandom';

let cachedHammeredBump: THREE.CanvasTexture | null = null;
let cachedRotiTexture: THREE.CanvasTexture | null = null;
let cachedPlateGradientTex: THREE.CanvasTexture | null = null;

/**
 * Procedural hammered-steel texture with authentic concentric engraved lathe grooves
 * and dark-ringed dimple edges for crisp relief and metallic depth.
 */
export function getHammeredSteelTexture(): THREE.CanvasTexture {
  if (cachedHammeredBump) return cachedHammeredBump;
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture(document.createElement('canvas'));
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Neutral 50% grey base
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  const rng = createSeededRandom(101);

  // Stippled hammered hammer-strike dimples with darker ring edges for crisp relief
  for (let i = 0; i < 850; i++) {
    const x = rng() * 512;
    const y = rng() * 512;
    const radius = 3.5 + rng() * 6.5;

    // Dark ring edge for deep relief
    ctx.strokeStyle = '#505050';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.stroke();

    // Soft dimple gradient center
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, '#B0B0B0');
    grad.addColorStop(0.65, '#808080');
    grad.addColorStop(1, '#606060');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius * 0.9, 0, Math.PI * 2);
    ctx.fill();
  }

  // Concentric engraved lathe rings on the floor
  const ringRadii = [60, 105, 155, 200];
  for (const r of ringRadii) {
    ctx.strokeStyle = '#383838';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();

    // Fine subtle highlight edge right beside groove
    ctx.strokeStyle = '#AAAAAA';
    ctx.lineWidth = 1.0;
    ctx.beginPath();
    ctx.arc(256, 256, r + 1.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  cachedHammeredBump = texture;
  return texture;
}

/**
 * Procedural radial gradient map for plate:
 * Darker inner base (#6F757C) so the center looks deep, transitioning to #8E949B on the sloped wall and rim.
 */
export function getPlateBaseGradientTexture(): THREE.CanvasTexture {
  if (cachedPlateGradientTex) return cachedPlateGradientTex;
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture(document.createElement('canvas'));
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
  grad.addColorStop(0, '#6F757C');    // Darker inner base (#6F757C) per brief
  grad.addColorStop(0.68, '#787E85'); // Floor boundary
  grad.addColorStop(0.80, '#858B92'); // Sloped dish wall
  grad.addColorStop(0.92, '#8E949B'); // Wide rim (#8E949B)
  grad.addColorStop(1.0, '#B2B7BD');  // Rim rolled lip highlight

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);

  const texture = new THREE.CanvasTexture(canvas);
  cachedPlateGradientTex = texture;
  return texture;
}

/**
 * Procedural toasted roti texture: golden-tan #D9A55B with darker toasted spots #7A4A1E.
 */
export function getRotiToastedTexture(): THREE.CanvasTexture {
  if (cachedRotiTexture) return cachedRotiTexture;
  if (typeof document === 'undefined') {
    return new THREE.CanvasTexture(document.createElement('canvas'));
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Golden-tan #D9A55B base
  ctx.fillStyle = '#D9A55B';
  ctx.fillRect(0, 0, 512, 512);

  const rng = createSeededRandom(777);

  // Soft flour swirls
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = 'rgba(255, 245, 220, 0.22)';
    ctx.beginPath();
    ctx.arc(
      rng() * 512,
      rng() * 512,
      30 + rng() * 60,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Toasted charred brown spots #7A4A1E
  for (let i = 0; i < 40; i++) {
    const x = rng() * 512;
    const y = rng() * 512;
    const r = 4 + rng() * 14;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, '#42240C'); // Dark blister center
    grad.addColorStop(0.45, '#7A4A1E'); // Toasted brown #7A4A1E
    grad.addColorStop(0.8, '#B87836');
    grad.addColorStop(1, 'rgba(217, 165, 91, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  cachedRotiTexture = texture;
  return texture;
}
