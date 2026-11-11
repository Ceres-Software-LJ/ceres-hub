/* Cenas dos cards de "Diferenciais" */
import * as THREE from 'three';
import { COLORS, addLights } from './palette.js';

function perspective(fov, pos) {
  const camera = new THREE.PerspectiveCamera(fov, 2, 0.1, 100);
  camera.position.set(...pos);
  camera.lookAt(0, 0, 0);
  return { camera, resize: (w, h) => { camera.aspect = w / h; camera.updateProjectionMatrix(); } };
}

/* Design Exclusivo — forma orgânica que se transforma o tempo todo, nunca igual */
export function uniqueDesign() {
  const scene = new THREE.Scene();
  addLights(scene, { glowIntensity: 40 });
  const { camera, resize } = perspective(30, [0, 0, 8]);
  const geometry = new THREE.IcosahedronGeometry(1.4, 12);
  const base = geometry.attributes.position.array.slice();
  const blob = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: COLORS.accent, roughness: 0.35, metalness: 0.25, flatShading: true }));
  const wire = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: COLORS.sky, wireframe: true, transparent: true, opacity: 0.18 }));
  wire.scale.setScalar(1.02);
  scene.add(blob, wire);
  const pos = geometry.attributes.position;
  const v = new THREE.Vector3();

  return {
    scene, camera, resize,
    update(t, dt, view) {
      const amp = 0.18 + view.hover * 0.14;
      for (let i = 0; i < pos.count; i++) {
        v.set(base[i * 3], base[i * 3 + 1], base[i * 3 + 2]);
        const n = Math.sin(v.x * 2.1 + t * 1.1) * Math.sin(v.y * 2.4 + t * 0.9) * Math.sin(v.z * 1.9 + t * 1.3);
        v.multiplyScalar(1 + n * amp);
        pos.setXYZ(i, v.x, v.y, v.z);
      }
      pos.needsUpdate = true;
      geometry.computeVertexNormals();
      blob.rotation.y += dt * 0.3;
      blob.rotation.x = Math.sin(t * 0.3) * 0.4;
      wire.rotation.copy(blob.rotation);
      blob.material.color.copy(COLORS.blue).lerp(COLORS.sky, (Math.sin(t * 0.7) + 1) / 2);
    },
  };
}

/* Solução Ponta a Ponta — um sinal percorre as etapas e acende cada uma */
export function endToEnd() {
  const scene = new THREE.Scene();
  addLights(scene);
  const { camera, resize } = perspective(32, [0, 3.6, 6.2]);
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3, 0, 0.6), new THREE.Vector3(-1, 0, -0.8),
    new THREE.Vector3(1, 0, 0.8), new THREE.Vector3(3, 0, -0.6),
  ]);
  scene.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 80, 0.035, 6), new THREE.MeshBasicMaterial({ color: COLORS.accent })));
  const nodes = [0, 1 / 3, 2 / 3, 1].map(u => {
    const node = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.55, 0.55), new THREE.MeshStandardMaterial({ color: COLORS.navyLit.clone(), roughness: 0.5 }));
    curve.getPoint(u, node.position);
    node.userData.u = u;
    scene.add(node);
    return node;
  });
  const spark = new THREE.Mesh(new THREE.SphereGeometry(0.16, 16, 16), new THREE.MeshBasicMaterial({ color: COLORS.white }));
  const glow = new THREE.PointLight(0x5ba0db, 12, 3, 1.5);
  spark.add(glow);
  scene.add(spark);

  const CYCLE = 4;
  return {
    scene, camera, resize,
    update(t, dt, view) {
      const u = ((t * (1 + view.hover * 0.6)) % CYCLE) / CYCLE;
      curve.getPoint(u, spark.position);
      spark.position.y = 0.35;
      for (const node of nodes) {
        const lit = u >= node.userData.u - 0.02 ? 1 : 0;
        const glowAmount = (node.userData.glow ?? 0) + (lit - (node.userData.glow ?? 0)) * 0.12;
        node.userData.glow = glowAmount;
        node.material.color.copy(COLORS.navyLit).lerp(COLORS.sky, glowAmount);
        node.position.y = glowAmount * 0.35; // sobe junto com o brilho
        node.rotation.y += dt * (0.4 + lit);
      }
      scene.rotation.y = Math.sin(t * 0.4) * 0.12;
    },
  };
}

/* Foco em Performance — linhas de velocidade passando em alta rotação */
export function speed() {
  const scene = new THREE.Scene();
  addLights(scene, { glowIntensity: 50 });
  const { camera, resize } = perspective(55, [0, 0, 6]);
  const COUNT = 140;
  const streaks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.03, 0.03, 1), new THREE.MeshBasicMaterial(), COUNT);
  const data = Array.from({ length: COUNT }, (_, i) => {
    const angle = Math.random() * Math.PI * 2, radius = 0.8 + Math.random() * 3;
    streaks.setColorAt(i, Math.random() < 0.25 ? COLORS.white : COLORS.sky);
    return { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, z: -Math.random() * 30, speed: 12 + Math.random() * 14 };
  });
  scene.add(streaks);
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.55), new THREE.MeshStandardMaterial({ color: COLORS.accent, roughness: 0.3, metalness: 0.4, flatShading: true }));
  scene.add(core);
  const dummy = new THREE.Object3D();

  return {
    scene, camera, resize,
    update(t, dt, view) {
      const boost = 1 + view.hover * 1.5;
      data.forEach((s, i) => {
        s.z += s.speed * boost * dt;
        if (s.z > 6) s.z -= 36;
        dummy.position.set(s.x, s.y, s.z);
        dummy.scale.set(1, 1, 0.6 + boost);
        dummy.updateMatrix();
        streaks.setMatrixAt(i, dummy.matrix);
      });
      streaks.instanceMatrix.needsUpdate = true;
      core.rotation.y += dt * 2.2 * boost;
      core.rotation.x = Math.sin(t) * 0.3;
      core.scale.setScalar(1 + Math.sin(t * 6) * 0.04);
    },
  };
}
