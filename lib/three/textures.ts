import * as THREE from 'three';
import { createSeededRandom } from './seededRandom';

let cachedHammeredBump: THREE.CanvasTexture | null = null;
let cachedRotiTexture: THREE.CanvasTexture | null = null;
let cachedPlateGradientTex: THREE.CanvasTexture | null = null;

/**
 * Procedural very subtle hammered-bump texture for matte black cast-iron/enamel finish.
 * Soft dimples without harsh white highlights so the plate remains deep matte black without silver glare.
 */
export function getHammeredSteelTexture(): THREE.CanvasTexture {
  if (cachedHammeredBump) return cachedHammeredBump;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return new THREE.Texture() as unknown as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Neutral 50% grey base
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 512, 512);

  const rng = createSeededRandom(101);

  // Soft subtle dimples with very gentle contrast
  for (let i = 0; i < 900; i++) {
    const x = rng() * 512;
    const y = rng() * 512;
    const radius = 3.0 + rng() * 6.0;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, '#8E8E8E');
    grad.addColorStop(0.65, '#808080');
    grad.addColorStop(1, '#747474');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  cachedHammeredBump = texture;
  return texture;
}

/**
 * Procedural texture for matte black plate floor:
 * Floor color #1A1713 with 2 faint concentric grooves with ~4% warm colour shift (#14110E, not grey).
 */
export function getPlateBaseGradientTexture(): THREE.CanvasTexture {
  if (cachedPlateGradientTex) return cachedPlateGradientTex;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return new THREE.Texture() as unknown as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Plate floor base colour #1A1713
  ctx.fillStyle = '#1A1713';
  ctx.fillRect(0, 0, 512, 512);

  // 2 faint concentric grooves on the floor (colour shift of ~4%: #14110E, warm black, not grey)
  const grooves = [125, 205];
  for (const r of grooves) {
    // Soft outer depression
    ctx.strokeStyle = '#14110E';
    ctx.lineWidth = 3.0;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();

    // Subtle fine groove core
    ctx.strokeStyle = '#110E0C';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(256, 256, r, 0, Math.PI * 2);
    ctx.stroke();

    // Very faint warm highlight edge (~4% brighter warm tone #201D18)
    ctx.strokeStyle = '#201D18';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.arc(256, 256, r + 1.2, 0, Math.PI * 2);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  cachedPlateGradientTex = texture;
  return texture;
}

/**
 * Procedural toasted roti texture: golden-tan #D9A55B with charred blister spots.
 */
export function getRotiToastedTexture(): THREE.CanvasTexture {
  if (cachedRotiTexture) return cachedRotiTexture;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return new THREE.Texture() as unknown as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Golden-tan #D9A55B base
  ctx.fillStyle = '#D9A55B';
  ctx.fillRect(0, 0, 512, 512);

  const rng = createSeededRandom(777);

  // Soft subtle flour dusting swirls
  for (let i = 0; i < 24; i++) {
    ctx.fillStyle = 'rgba(255, 246, 224, 0.18)';
    ctx.beginPath();
    ctx.arc(
      rng() * 512,
      rng() * 512,
      25 + rng() * 70,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Toasted charred brown spots with authentic blister rings
  for (let i = 0; i < 55; i++) {
    const x = rng() * 512;
    const y = rng() * 512;
    const r = 3 + rng() * 16;

    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, '#361806'); // Deep dark charred center
    grad.addColorStop(0.35, '#683612'); // Rich roasted brown
    grad.addColorStop(0.70, '#A86524'); // Toasted amber ring
    grad.addColorStop(1, 'rgba(217, 165, 91, 0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Fine dark speckled pepper/atta flecks
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = rng() > 0.5 ? '#4A230B' : '#733E16';
    ctx.beginPath();
    ctx.arc(rng() * 512, rng() * 512, 1.2 + rng() * 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  const texture = new THREE.CanvasTexture(canvas);
  cachedRotiTexture = texture;
  return texture;
}
