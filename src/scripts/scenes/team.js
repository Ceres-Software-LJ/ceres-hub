/* Equipe — moldura de cubinhos em volta da foto, com cores percorrendo a borda */
import * as THREE from 'three';
import { COLORS, addLights } from './palette.js';

const CUBE = 14;   // px — tamanho de cada bloco
const GAP = 4;     // px — espaço entre blocos

export function teamFrame(seed = 0) {
  const scene = new THREE.Scene();
  addLights(scene, { glowIntensity: 0 });
  const camera = new THREE.OrthographicCamera(0, 1, 1, 0, -100, 100);
  camera.position.z = 50;
  const material = new THREE.MeshStandardMaterial({ roughness: 0.4, metalness: 0.15 });
  const geometry = new THREE.BoxGeometry(CUBE, CUBE, CUBE);
  let mesh = null, cells = [];
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  /* Monta a lista de posições ao longo do perímetro, em pixels CSS */
  function layout(w, h) {
    const step = CUBE + GAP;
    const half = CUBE / 2 + 6;
    const cols = Math.floor((w - half * 2) / step), rows = Math.floor((h - half * 2) / step);
    const pts = [];
    for (let i = 0; i <= cols; i++) pts.push([half + i * ((w - half * 2) / cols), h - half]);   // topo
    for (let j = 1; j <= rows; j++) pts.push([w - half, h - half - j * ((h - half * 2) / rows)]); // direita
    for (let i = cols - 1; i >= 0; i--) pts.push([half + i * ((w - half * 2) / cols), half]);   // base
    for (let j = rows - 1; j >= 1; j--) pts.push([half, h - half - j * ((h - half * 2) / rows)]); // esquerda
    cells = pts.map(([x, y], k) => ({ x, y, u: k / pts.length, spark: Math.random() }));
    if (mesh) { scene.remove(mesh); mesh.dispose(); }
    mesh = new THREE.InstancedMesh(geometry, material, cells.length);
    scene.add(mesh);
  }

  const distAlong = (a, b) => { const d = Math.abs(a - b) % 1; return Math.min(d, 1 - d); };

  return {
    scene, camera,
    resize(w, h) {
      Object.assign(camera, { left: 0, right: w, top: h, bottom: 0 });
      camera.updateProjectionMatrix();
      layout(w, h);
    },
    update(t, _dt, view) {
      if (!mesh) return;
      const speed = 0.09 + view.hover * 0.12;
      const heads = [(t * speed + seed) % 1, (t * speed + seed + 0.5) % 1];
      for (let k = 0; k < cells.length; k++) {
        const c = cells[k];
        let glow = 0;
        for (const head of heads) glow = Math.max(glow, Math.exp(-(distAlong(c.u, head) ** 2) / 0.0025));
        const twinkle = Math.max(0, Math.sin(t * 1.7 + c.spark * 40)) ** 12 * 0.8;
        const lit = Math.min(1, glow + twinkle + view.hover * 0.15);
        const s = 0.08 + lit * 0.92; // apagado ≈ invisível; só as faixas de cor aparecem
        dummy.position.set(c.x, c.y, 0);
        dummy.rotation.set(0.6 + lit * 0.6, 0.7 + t * 0.4 * lit, 0);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        mesh.setMatrixAt(k, dummy.matrix);
        color.copy(COLORS.navyLit).lerp(COLORS.sky, lit).lerp(COLORS.white, Math.max(0, lit - 0.7));
        mesh.setColorAt(k, color);
      }
      mesh.instanceMatrix.needsUpdate = true;
      mesh.instanceColor.needsUpdate = true;
    },
  };
}
