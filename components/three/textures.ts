import * as THREE from 'three';

let cachedHammeredTex: THREE.CanvasTexture | null = null;
let cachedRotiTex: THREE.CanvasTexture | null = null;

export function getHammeredSteelTexture(): THREE.CanvasTexture {
  if (cachedHammeredTex) return cachedHammeredTex;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return new THREE.Texture() as unknown as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Neutral grey base for bump map
  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, 256, 256);

  // Stippled dimples of hammered metal
  for (let i = 0; i < 600; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 2.5 + Math.random() * 4.5;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, '#A8A8A8');
    grad.addColorStop(0.7, '#888888');
    grad.addColorStop(1, '#808080');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(5, 5);
  cachedHammeredTex = tex;
  return tex;
}

export function getRotiTexture(): THREE.CanvasTexture {
  if (cachedRotiTex) return cachedRotiTex;
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return new THREE.Texture() as unknown as THREE.CanvasTexture;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Warm wheat dough base
  ctx.fillStyle = '#E3C188';
  ctx.fillRect(0, 0, 256, 256);

  // Soft flour swirls
  for (let i = 0; i < 15; i++) {
    ctx.fillStyle = 'rgba(255, 248, 230, 0.15)';
    ctx.beginPath();
    ctx.arc(
      Math.random() * 256,
      Math.random() * 256,
      20 + Math.random() * 40,
      0,
      Math.PI * 2
    );
    ctx.fill();
  }

  // Toasted charred brown spots (tawa marks)
  for (let i = 0; i < 28; i++) {
    const x = Math.random() * 256;
    const y = Math.random() * 256;
    const r = 3 + Math.random() * 8;
    const grad = ctx.createRadialGradient(x, y, 0, x, y, r);
    grad.addColorStop(0, '#5C381E');
    grad.addColorStop(0.5, '#8C562A');
    grad.addColorStop(1, 'rgba(140, 86, 42, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  const tex = new THREE.CanvasTexture(canvas);
  cachedRotiTex = tex;
  return tex;
}
