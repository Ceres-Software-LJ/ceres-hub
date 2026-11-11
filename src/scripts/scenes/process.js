/* "Como trabalhamos" — fileira de cubos com uma onda que vai da etapa 01 à 04,
   acendendo cada número quando passa por ele */
import * as THREE from 'three';
import { COLORS, addLights } from './palette.js';

const WIDTH = 30;        // largura do mundo, de -15 a 15
const COUNT = 46;
const CYCLE = 6;         // segundos para a onda atravessar
const STEP_POINTS = [0, 1 / 3, 2 / 3, 1];
const PALE = new THREE.Color(0xc4dbf0); // azul claro, para o fundo --surface

export function processTrack(steps) {
  const scene = new THREE.Scene();
  addLights(scene, { glowIntensity: 0 });
  const camera = new THREE.OrthographicCamera(-WIDTH / 2, WIDTH / 2, 1, -1, 0.1, 100);
  camera.position.set(0, 7, 18);
  camera.lookAt(0, 0, 0);

  const size = (WIDTH / COUNT) * 0.72;
  const cubes = new THREE.InstancedMesh(
    new THREE.BoxGeometry(size, size, size),
    new THREE.MeshStandardMaterial({ roughness: 0.45, metalness: 0.1 }),
    COUNT,
  );
  scene.add(cubes);
  const dummy = new THREE.Object3D();
  const color = new THREE.Color();

  return {
    scene, camera,
    resize(w, h) {
      const halfH = (WIDTH / w) * h / 2; // mantém 1 unidade = mesma escala nos dois eixos
      camera.top = halfH; camera.bottom = -halfH;
      camera.updateProjectionMatrix();
    },
    update(t, _dt, view) {
      const head = ((t * (1 + view.hover * 0.5)) % CYCLE) / CYCLE * 1.15 - 0.05;
      for (let i = 0; i < COUNT; i++) {
        const u = i / (COUNT - 1);
        const d = u - head;
        const wave = Math.exp(-(d * d) / 0.004);
        const trail = d < 0 ? Math.exp(d * 6) * 0.35 : 0; // rastro atrás da onda
        const lift = wave * 1.1 + Math.sin(u * 18 + t * 2) * 0.06;
        dummy.position.set(-WIDTH / 2 + u * WIDTH, lift, 0);
        dummy.rotation.set(wave * 0.8, wave * 0.8 + u, 0);
        dummy.scale.setScalar(0.75 + wave * 0.5);
        dummy.updateMatrix();
        cubes.setMatrixAt(i, dummy.matrix);
        color.copy(PALE).lerp(COLORS.sky, Math.min(1, trail + wave)).lerp(COLORS.accent, wave * 0.8);
        cubes.setColorAt(i, color);
      }
      cubes.instanceMatrix.needsUpdate = true;
      cubes.instanceColor.needsUpdate = true;
      STEP_POINTS.forEach((p, i) => steps[i]?.classList.toggle('is-active', head >= p - 0.02));
    },
  };
}
