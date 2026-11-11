/* Cenas dos cards de "Nossos serviços" */
import * as THREE from 'three';
import { COLORS, addLights, smooth, clamp01 } from './palette.js';

function perspective(fov, pos, target = [0, 0, 0]) {
  const camera = new THREE.PerspectiveCamera(fov, 2, 0.1, 100);
  camera.position.set(...pos);
  camera.lookAt(...target);
  return {
    camera,
    resize: (w, h) => { camera.aspect = w / h; camera.updateProjectionMatrix(); },
  };
}

const mat = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.5, metalness: 0.1, ...extra });

/* Criação de Websites — os blocos de uma página caem e se encaixam, depois recomeça */
export function websites() {
  const scene = new THREE.Scene();
  addLights(scene);
  const { camera, resize } = perspective(30, [3.2, 5.2, 6.2], [0, 0, 0.1]);
  const page = new THREE.Group();
  scene.add(page);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(5.2, 0.12, 3.6), mat(COLORS.navyLit));
  page.add(frame);
  const blocks = [
    { size: [4.8, 0.14, 0.4], pos: [0, 0.13, -1.4], color: COLORS.sky },    // header
    { size: [2.8, 0.22, 1.2], pos: [-0.85, 0.17, -0.45], color: COLORS.accent }, // hero
    { size: [1.7, 0.3, 1.2], pos: [1.45, 0.21, -0.45], color: COLORS.white },  // imagem
    { size: [1.4, 0.18, 0.9], pos: [-1.65, 0.15, 0.85], color: COLORS.blue },  // cards
    { size: [1.4, 0.18, 0.9], pos: [0, 0.15, 0.85], color: COLORS.blue },
    { size: [1.4, 0.18, 0.9], pos: [1.65, 0.15, 0.85], color: COLORS.blue },
  ].map((b, i) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(...b.size), mat(b.color));
    page.add(mesh);
    return { mesh, rest: b.pos, delay: i * 0.28 };
  });

  const CYCLE = 5;
  return {
    scene, camera, resize,
    update(t, _dt, view) {
      const speed = 1 + view.hover * 0.6;
      const local = (t * speed) % CYCLE;
      page.rotation.y = Math.sin(t * 0.4) * 0.18 + view.hover * 0.25;
      for (const b of blocks) {
        const drop = smooth(clamp01((local - b.delay) / 0.6));      // entra
        const lift = smooth(clamp01((local - 4.1 - b.delay * 0.2) / 0.5)); // sai
        b.mesh.position.set(b.rest[0], b.rest[1] + (1 - drop) * 3 + lift * 3, b.rest[2]);
        b.mesh.scale.setScalar(Math.max(0.001, drop * (1 - lift)));
      }
    },
  };
}

/* Registro & Gestão de Domínios — globo de pontos com conexões viajando */
export function domains() {
  const scene = new THREE.Scene();
  addLights(scene, { glowIntensity: 20 });
  const { camera, resize } = perspective(30, [0, 1.2, 10.5]);
  const globe = new THREE.Group();
  scene.add(globe);

  const R = 2;
  const DOTS = 420;
  const dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 6, 6), new THREE.MeshBasicMaterial({ color: COLORS.sky }), DOTS);
  const m = new THREE.Matrix4();
  const points = [];
  for (let i = 0; i < DOTS; i++) { // distribuição de Fibonacci na esfera
    const y = 1 - (i / (DOTS - 1)) * 2, r = Math.sqrt(1 - y * y), phi = i * Math.PI * (3 - Math.sqrt(5));
    const p = new THREE.Vector3(Math.cos(phi) * r, y, Math.sin(phi) * r).multiplyScalar(R);
    points.push(p);
    dots.setMatrixAt(i, m.makeTranslation(p.x, p.y, p.z));
  }
  globe.add(dots);
  globe.add(new THREE.Mesh(new THREE.SphereGeometry(R * 0.97, 32, 16), mat(COLORS.navyLit, { transparent: true, opacity: 0.85 })));

  const arcs = [[12, 300], [80, 210], [150, 390], [260, 40]].map(([a, b]) => {
    const start = points[a], end = points[b];
    const mid = start.clone().add(end).multiplyScalar(0.5).setLength(R * 1.55);
    const curve = new THREE.QuadraticBezierCurve3(start, mid, end);
    globe.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 40, 0.018, 4), new THREE.MeshBasicMaterial({ color: COLORS.accent })));
    const spark = new THREE.Mesh(new THREE.SphereGeometry(0.09, 10, 10), new THREE.MeshBasicMaterial({ color: COLORS.white }));
    globe.add(spark);
    return { curve, spark, offset: Math.random() };
  });

  return {
    scene, camera, resize,
    update(t, dt, view) {
      globe.rotation.y += dt * (0.25 + view.hover * 0.6);
      globe.rotation.x = 0.35;
      for (const a of arcs) a.curve.getPoint((t * 0.35 + a.offset) % 1, a.spark.position);
    },
  };
}

/* Otimização & SEO — barras 3D crescendo em escada até o topo */
export function seo() {
  const scene = new THREE.Scene();
  addLights(scene);
  const { camera, resize } = perspective(30, [6, 5, 9], [0, 1, 0]);
  const BARS = 6;
  const bars = Array.from({ length: BARS }, (_, i) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.6, 1, 0.6), mat(COLORS.blue.clone()));
    mesh.position.x = (i - (BARS - 1) / 2) * 0.85;
    scene.add(mesh);
    return mesh;
  });
  const base = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.08, 1.4), mat(COLORS.navyLit));
  base.position.y = -0.04;
  scene.add(base);

  const CYCLE = 4.5;
  return {
    scene, camera, resize,
    update(t, _dt, view) {
      const local = (t * (1 + view.hover * 0.5)) % CYCLE;
      const fade = 1 - smooth(clamp01((local - 3.8) / 0.6));
      bars.forEach((bar, i) => {
        const grow = smooth(clamp01((local - i * 0.25) / 0.7)) * fade;
        const h = 0.15 + grow * (0.5 + i * 0.55);
        bar.scale.y = h;
        bar.position.y = h / 2;
        bar.material.color.copy(COLORS.blue).lerp(i === BARS - 1 ? COLORS.white : COLORS.sky, grow * (i / BARS));
      });
      scene.rotation.y = Math.sin(t * 0.5) * 0.15;
    },
  };
}

function gearShape(teeth, outer, inner, hole) {
  const shape = new THREE.Shape();
  const steps = teeth * 4;
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const r = (i % 4 < 2) ? outer : inner;
    if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
  }
  const holePath = new THREE.Path();
  holePath.absarc(0, 0, hole, 0, Math.PI * 2, true);
  shape.holes.push(holePath);
  return shape;
}

/* Suporte & Manutenção — engrenagens em movimento e pulso de monitoramento 24/7 */
export function support() {
  const scene = new THREE.Scene();
  addLights(scene);
  const { camera, resize } = perspective(30, [0, 0, 10]);
  const extrude = { depth: 0.35, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.04, bevelSegments: 2 };
  const big = new THREE.Mesh(new THREE.ExtrudeGeometry(gearShape(12, 1.5, 1.22, 0.45), extrude), mat(COLORS.accent));
  const small = new THREE.Mesh(new THREE.ExtrudeGeometry(gearShape(8, 0.95, 0.72, 0.28), extrude), mat(COLORS.sky));
  big.position.set(-0.9, -0.1, 0);
  small.position.set(1.42, 0.62, 0);
  const gears = new THREE.Group();
  gears.add(big, small);
  gears.rotation.x = -0.35;
  scene.add(gears);

  const rings = [0, 1, 2].map(i => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 48), new THREE.MeshBasicMaterial({ color: COLORS.sky, transparent: true }));
    ring.position.copy(big.position);
    ring.userData.offset = i / 3;
    gears.add(ring);
    return ring;
  });

  return {
    scene, camera, resize,
    update(t, dt, view) {
      const speed = 0.6 + view.hover * 1.4;
      big.rotation.z += dt * speed;
      small.rotation.z -= dt * speed * (12 / 8); // relação de dentes
      gears.rotation.y = Math.sin(t * 0.6) * 0.25;
      for (const ring of rings) {
        const p = (t * 0.45 + ring.userData.offset) % 1;
        ring.scale.setScalar(1 + p * 2.2);
        ring.material.opacity = (1 - p) * 0.6;
      }
    },
  };
}
