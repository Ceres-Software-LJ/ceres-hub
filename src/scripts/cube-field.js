/* ════════════════════════════════════════
   CUBE FIELD — grade 3D de blocos animados (Three.js)
   Uso: <div class="cube-field" data-cube-field="hero|footer"></div>
   Ondula sozinha, levanta perto do cursor e dispara uma onda no clique.
════════════════════════════════════════ */
import * as THREE from 'three';

const NAVY  = new THREE.Color(0x1d3450);
const SKY   = new THREE.Color(0x5ba0db);
const WHITE = new THREE.Color(0xe8f0fa);

/* Presets por local: o rodapé é mais discreto e não reage a clique */
const PRESETS = {
  hero:   { cols: 52, rows: 30, mobileCols: 26, mobileRows: 22, camY: 12, camZ: 17, fov: 38, accent: 0.04, interactive: true },
  footer: { cols: 44, rows: 14, mobileCols: 22, mobileRows: 12, camY: 9,  camZ: 13, fov: 42, accent: 0.02, interactive: false },
};

const CELL = 1.05;
const MAX_RIPPLES = 4;
const RIPPLE_LIFE = 3.5;   // segundos
const RIPPLE_SPEED = 13;   // unidades/segundo
const MOBILE_BREAKPOINT = 700;

function buildGrid(cols, rows) {
  const cells = [];
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      cells.push({ x: (i - cols / 2 + 0.5) * CELL, z: (j - rows / 2 + 0.5) * CELL });
    }
  }
  return cells;
}

function createField(host, preset) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return; // sem WebGL: fica só o fundo em CSS
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.className = 'cube-field__canvas';
  host.appendChild(renderer.domElement);
  host.classList.add('cube-field--ready');

  const isMobile = host.clientWidth < MOBILE_BREAKPOINT;
  const cells = buildGrid(isMobile ? preset.mobileCols : preset.cols, isMobile ? preset.mobileRows : preset.rows);
  const accent = cells.map(() => (Math.random() < preset.accent ? 1 : 0));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x16283d, preset.camZ + 2, preset.camZ + 26);
  const camera = new THREE.PerspectiveCamera(preset.fov, 1, 0.1, 100);
  camera.position.set(0, preset.camY, preset.camZ);
  camera.lookAt(0, 0, 0);

  scene.add(new THREE.HemisphereLight(0xe8f0fa, 0x0b1624, 0.8));
  const sun = new THREE.DirectionalLight(0xffffff, 1.4);
  sun.position.set(-6, 14, 8);
  scene.add(sun);
  const glow = new THREE.PointLight(0x5ba0db, 70, 12, 1.4);
  scene.add(glow);

  const mesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(0.88, 1, 0.88),
    new THREE.MeshStandardMaterial({ roughness: 0.55, metalness: 0.15 }),
    cells.length,
  );
  scene.add(mesh);

  const dummy = new THREE.Object3D();
  const color = new THREE.Color();
  const pointer = { x: 100, z: 100, tx: 100, tz: 100 };
  const raycaster = new THREE.Raycaster();
  const floor = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const hit = new THREE.Vector3();
  const ndc = new THREE.Vector2();
  const timer = new THREE.Timer();
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let ripples = [];
  let visible = false;

  function project(e) {
    const b = host.getBoundingClientRect();
    if (e.clientX < b.left || e.clientX > b.right || e.clientY < b.top || e.clientY > b.bottom) return null;
    ndc.set(((e.clientX - b.left) / b.width) * 2 - 1, -((e.clientY - b.top) / b.height) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    return raycaster.ray.intersectPlane(floor, hit);
  }

  function ripple(x, z) {
    ripples = [...ripples, { x, z, t: timer.getElapsed() }].slice(-MAX_RIPPLES);
  }

  function frame() {
    timer.update();
    const t = timer.getElapsed();
    const wave = reduceMotion ? 0 : t;
    pointer.x += (pointer.tx - pointer.x) * 0.08;
    pointer.z += (pointer.tz - pointer.z) * 0.08;
    glow.position.set(pointer.x, 3, pointer.z);
    ripples = ripples.filter(r => t - r.t < RIPPLE_LIFE);

    for (let k = 0; k < cells.length; k++) {
      const { x, z } = cells[k];
      const base = Math.sin(x * 0.26 + wave * 0.9) * Math.cos(z * 0.3 + wave * 0.7) * 0.4;
      const dx = x - pointer.x, dz = z - pointer.z;
      const hover = Math.exp(-(dx * dx + dz * dz) / 5) * 1.5;
      let rip = 0;
      for (const r of ripples) {
        const age = t - r.t;
        const front = Math.hypot(x - r.x, z - r.z) - age * RIPPLE_SPEED;
        rip += Math.exp(-(front * front) / 2.5) * 2 * (1 - age / RIPPLE_LIFE);
      }
      dummy.position.set(x, base + hover + rip, z);
      dummy.updateMatrix();
      mesh.setMatrixAt(k, dummy.matrix);

      color.copy(NAVY).lerp(SKY, Math.min(1, accent[k] + hover * 0.45 + rip * 0.5));
      if (rip > 1.4) color.lerp(WHITE, Math.min(1, rip - 1.4));
      mesh.setColorAt(k, color);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
    renderer.render(scene, camera);
  }

  const resize = new ResizeObserver(() => {
    const w = host.clientWidth, h = host.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.fov = w < MOBILE_BREAKPOINT ? preset.fov + 17 : preset.fov;
    camera.updateProjectionMatrix();
    if (!visible) frame();
  });
  resize.observe(host);

  /* Só anima enquanto está na tela; com movimento reduzido, desenha um quadro estático */
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && !reduceMotion;
    renderer.setAnimationLoop(visible ? frame : null);
  }).observe(host);

  if (!preset.interactive) return;
  window.addEventListener('pointermove', e => {
    const p = project(e);
    if (p) { pointer.tx = p.x; pointer.tz = p.z; }
  }, { passive: true });
  host.closest('section, footer')?.addEventListener('pointerdown', e => {
    if (e.target.closest('a, button')) return;
    const p = project(e);
    if (p) ripple(p.x, p.z);
  });
  if (!reduceMotion) setTimeout(() => ripple(0, 0), 400);
}

document.querySelectorAll('[data-cube-field]').forEach(host => {
  createField(host, PRESETS[host.dataset.cubeField] ?? PRESETS.hero);
});
