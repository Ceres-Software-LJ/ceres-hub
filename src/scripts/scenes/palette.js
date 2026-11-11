/* Cores da marca (espelham os tokens de main.css) e luzes padrão das cenas */
import * as THREE from 'three';

export const COLORS = {
  navy:    new THREE.Color(0x16283d),
  navyLit: new THREE.Color(0x24405f),
  blue:    new THREE.Color(0x285c99),
  accent:  new THREE.Color(0x377ab9),
  sky:     new THREE.Color(0x5ba0db),
  white:   new THREE.Color(0xe8f0fa),
};

export function addLights(scene, { glow = 0x5ba0db, glowIntensity = 30 } = {}) {
  scene.add(new THREE.HemisphereLight(0xe8f0fa, 0x0b1624, 1.1));
  const sun = new THREE.DirectionalLight(0xffffff, 1.6);
  sun.position.set(-4, 8, 6);
  scene.add(sun);
  const point = new THREE.PointLight(glow, glowIntensity, 14, 1.5);
  point.position.set(2, 3, 4);
  scene.add(point);
  return point;
}

export const smooth = (x) => x * x * (3 - 2 * x);
export const clamp01 = (x) => Math.min(1, Math.max(0, x));
