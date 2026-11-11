/* ════════════════════════════════════════
   STAGE — um único WebGLRenderer desenha várias mini-cenas.
   Cada cena renderiza num recorte do canvas WebGL e é copiada para o
   <canvas> 2D do seu elemento. Só cenas visíveis são desenhadas.
════════════════════════════════════════ */
import * as THREE from 'three';

const STATIC_FRAME_TIME = 2.6; // segundos — quadro mostrado com movimento reduzido

export function createStage() {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  } catch {
    return null;
  }
  renderer.setPixelRatio(1); // o tamanho em pixels físicos é calculado aqui mesmo
  renderer.setClearColor(0x000000, 0);
  renderer.setScissorTest(true);

  const dpr = Math.min(window.devicePixelRatio, 2);
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const timer = new THREE.Timer();
  const views = [];
  const visible = new Set();
  let bufferW = 0, bufferH = 0;

  function ensureBuffer(w, h) {
    if (w <= bufferW && h <= bufferH) return;
    bufferW = Math.max(bufferW, w);
    bufferH = Math.max(bufferH, h);
    renderer.setSize(bufferW, bufferH, false);
  }

  function draw(view, t, dt) {
    const w = view.canvas.width, h = view.canvas.height;
    if (!w || !h) return;
    view.instance.update(t, dt, view);
    ensureBuffer(w, h);
    renderer.setViewport(0, 0, w, h);
    renderer.setScissor(0, 0, w, h);
    renderer.clear();
    renderer.render(view.instance.scene, view.instance.camera);
    view.ctx.clearRect(0, 0, w, h);
    view.ctx.drawImage(renderer.domElement, 0, bufferH - h, w, h, 0, 0, w, h);
  }

  function loop() {
    timer.update();
    const t = timer.getElapsed(), dt = Math.min(timer.getDelta(), 0.1);
    for (const view of visible) draw(view, t, dt);
  }

  function refreshLoop() {
    renderer.setAnimationLoop(visible.size && !reduceMotion ? loop : null);
  }

  function resize(view) {
    const w = view.host.clientWidth, h = view.host.clientHeight;
    view.width = w; view.height = h;
    view.canvas.width = Math.round(w * dpr);
    view.canvas.height = Math.round(h * dpr);
    view.instance.resize?.(w, h, view);
    if (reduceMotion || !visible.has(view)) draw(view, STATIC_FRAME_TIME, 0);
  }

  const io = new IntersectionObserver(entries => {
    for (const entry of entries) {
      const view = views.find(v => v.host === entry.target);
      if (!view) continue;
      if (entry.isIntersecting) visible.add(view); else visible.delete(view);
    }
    refreshLoop();
  }, { rootMargin: '80px 0px' });

  const ro = new ResizeObserver(entries => {
    for (const entry of entries) {
      const view = views.find(v => v.host === entry.target);
      if (view) resize(view);
    }
  });

  return {
    reduceMotion,
    /** Liga uma cena a um elemento. A animação não reage a hover: segue sempre no mesmo ritmo. */
    mount(host, instance) {
      const canvas = document.createElement('canvas');
      canvas.className = 'scene-canvas';
      canvas.setAttribute('aria-hidden', 'true');
      host.appendChild(canvas);
      const view = { host, canvas, ctx: canvas.getContext('2d'), instance, width: 0, height: 0 };
      views.push(view);
      ro.observe(host);
      io.observe(host);
      host.classList.add('has-scene');
      return view;
    },
  };
}
