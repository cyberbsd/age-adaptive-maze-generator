import * as THREE from 'three';
import { WALL_H, CELL } from './mazeWorld.js';
import { WORLD_TOPICS } from './worldTopics.js';

const UP_QUAT = new THREE.Quaternion();

function stoneTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#8d8478';
  ctx.fillRect(0, 0, 128, 128);
  for (let i = 0; i < 1800; i++) {
    const shade = 90 + Math.floor(Math.random() * 80);
    ctx.fillStyle = `rgb(${shade},${shade - 6},${shade - 12})`;
    ctx.fillRect(Math.random() * 128, Math.random() * 128, 2, 2);
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

function paint(mesh, segments, scaleOf, yOf) {
  const matrix = new THREE.Matrix4();
  const position = new THREE.Vector3();
  const scale = new THREE.Vector3();
  segments.forEach((segment, index) => {
    const [sx, sy, sz] = scaleOf(segment);
    position.set(segment.x, yOf(segment, sy), segment.z);
    scale.set(sx, sy, sz);
    matrix.compose(position, UP_QUAT, scale);
    mesh.setMatrixAt(index, matrix);
  });
  mesh.instanceMatrix.needsUpdate = true;
  mesh.computeBoundingSphere();
}

function addInstanced(scene, geometry, material, segments, scaleOf, yOf, disposables) {
  if (segments.length === 0) return null;
  const mesh = new THREE.InstancedMesh(geometry, material, segments.length);
  mesh.material.side = THREE.DoubleSide;
  paint(mesh, segments, scaleOf, yOf);
  scene.add(mesh);
  disposables.push(mesh);
  return mesh;
}

/**
 * Builds opaque full-height walls, floor, and dressing for one topic.
 * Dressing sits on or inside the wall slab and is not a collider.
 */
export function buildTopic(scene, segments, topicId, cols, rows) {
  const topic = WORLD_TOPICS[topicId] || WORLD_TOPICS.stone;
  const disposables = [];

  scene.background = new THREE.Color(topic.sky);
  scene.fog = new THREE.FogExp2(topic.sky, topic.fog);

  const ambient = new THREE.AmbientLight(0xffffff, topic.id === 'spaceship' ? 0.28 : 0.62);
  const hemi = new THREE.HemisphereLight(topic.sky, topic.floor, topic.id === 'spaceship' ? 0.35 : 0.55);
  scene.add(ambient, hemi);
  disposables.push(ambient, hemi);

  const floorGeo = new THREE.PlaneGeometry(cols * CELL, rows * CELL);
  const floorMat = new THREE.MeshStandardMaterial({
    color: topic.floor,
    roughness: topic.id === 'spaceship' ? 0.45 : 0.95,
    metalness: topic.id === 'spaceship' ? 0.55 : 0,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.set((cols * CELL) / 2, 0, (rows * CELL) / 2);
  scene.add(floor);
  disposables.push(floor);

  const wallMat = new THREE.MeshStandardMaterial({
    color: topic.wall,
    roughness: topic.roughness,
    metalness: topic.metalness,
    side: THREE.DoubleSide,
  });
  if (topic.id === 'stone') {
    wallMat.map = stoneTexture();
  }
  const wallGeo = new THREE.BoxGeometry(1, 1, 1);
  addInstanced(
    scene,
    wallGeo,
    wallMat,
    segments,
    (segment) => [segment.w, WALL_H, segment.d],
    (_segment, sy) => sy / 2,
    disposables
  );

  if (topic.id === 'plants') {
    const coneGeo = new THREE.ConeGeometry(0.34, 0.9, 6);
    const coneMat = new THREE.MeshStandardMaterial({ color: 0x3d8f4a, roughness: 1, side: THREE.DoubleSide });
    addInstanced(
      scene,
      coneGeo,
      coneMat,
      segments,
      () => [1, 1, 1],
      () => WALL_H + 0.35,
      disposables
    );
  }

  if (topic.id === 'stone') {
    const tops = segments.filter((_, index) => index % 2 === 0);
    const capGeo = new THREE.BoxGeometry(1, 1, 1);
    const capMat = new THREE.MeshStandardMaterial({ color: 0x6e675e, roughness: 0.95, side: THREE.DoubleSide });
    addInstanced(
      scene,
      capGeo,
      capMat,
      tops,
      (segment) => [Math.min(segment.w, segment.d) * 0.7, 0.45, Math.min(segment.w, segment.d) * 0.7],
      (_segment, sy) => WALL_H + sy / 2,
      disposables
    );
  }

  if (topic.id === 'spaceship') {
    const stripGeo = new THREE.BoxGeometry(1, 1, 1);
    const stripMat = new THREE.MeshStandardMaterial({
      color: 0x083040,
      emissive: topic.emissive,
      emissiveIntensity: 0.85,
      roughness: 0.2,
      metalness: 0.4,
      side: THREE.DoubleSide,
    });
    const stripScale = (segment) => (
      segment.axis === 'z'
        ? [segment.w * 0.92, 0.08, segment.d + 0.04]
        : [segment.w + 0.04, 0.08, segment.d * 0.92]
    );
    addInstanced(scene, stripGeo, stripMat, segments, stripScale, () => 1.7, disposables);
    const upper = stripMat.clone();
    upper.emissiveIntensity = 0.45;
    addInstanced(scene, stripGeo, upper, segments, stripScale, () => 5.15, disposables);

    const moonGeo = new THREE.SphereGeometry(4, 24, 16);
    const moonMat = new THREE.MeshBasicMaterial({ color: 0xc5d4e8 });
    const moon = new THREE.Mesh(moonGeo, moonMat);
    moon.position.set(cols * CELL * 0.2, 28, -18);
    scene.add(moon);
    disposables.push(moon);
  }

  return {
    topic,
    dispose() {
      const seenGeo = new Set();
      const seenMat = new Set();
      for (const object of disposables) {
        scene.remove(object);
        if (object.geometry && !seenGeo.has(object.geometry)) {
          seenGeo.add(object.geometry);
          object.geometry.dispose();
        }
        const materials = object.material
          ? (Array.isArray(object.material) ? object.material : [object.material])
          : [];
        for (const material of materials) {
          if (seenMat.has(material)) continue;
          seenMat.add(material);
          if (material.map) material.map.dispose();
          material.dispose();
        }
      }
      disposables.length = 0;
    },
  };
}
