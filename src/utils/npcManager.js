import * as THREE from 'three';
import { CELL } from './mazeWorld.js';

/**
 * Creates lightweight procedural 3D NPCs & Avatars for the maze.
 * Features:
 * - Cute Bunny (for Toddlers / Plants)
 * - Adventure Puppy (for Kids / Stone)
 * - Hover Drone (for Teens / Spaceship)
 * - Goal Mascot (Giant Carrot, Treasure Chest, or Energy Cube)
 * - Floating Greeting Billboard Bubbles
 */

// Shared reusable materials
const materials = {
  whiteFur: new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 }),
  pinkFur: new THREE.MeshStandardMaterial({ color: 0xffb7c5, roughness: 0.6 }),
  brownFur: new THREE.MeshStandardMaterial({ color: 0xc68b59, roughness: 0.7 }),
  dogCream: new THREE.MeshStandardMaterial({ color: 0xf3dbbb, roughness: 0.7 }),
  droneBody: new THREE.MeshStandardMaterial({ color: 0x38bdf8, metalness: 0.8, roughness: 0.2 }),
  droneGlow: new THREE.MeshBasicMaterial({ color: 0x22d3ee }),
  goldChest: new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.6, roughness: 0.3 }),
  carrotOrange: new THREE.MeshStandardMaterial({ color: 0xff7b00, roughness: 0.5 }),
  leafGreen: new THREE.MeshStandardMaterial({ color: 0x22c55e, roughness: 0.6 }),
  eyeBlack: new THREE.MeshBasicMaterial({ color: 0x111111 }),
};

/**
 * Procedural 3D Bunny Model
 */
export function createBunnyNPC() {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.SphereGeometry(0.38, 16, 16);
  const body = new THREE.Mesh(bodyGeo, materials.whiteFur);
  body.position.y = 0.42;
  group.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.28, 16, 16);
  const head = new THREE.Mesh(headGeo, materials.whiteFur);
  head.position.set(0, 0.75, 0.12);
  group.add(head);

  // Ears
  const earGeo = new THREE.CylinderGeometry(0.04, 0.08, 0.36, 12);
  const leftEar = new THREE.Mesh(earGeo, materials.pinkFur);
  leftEar.position.set(-0.12, 1.08, 0.1);
  leftEar.rotation.z = 0.18;
  group.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, materials.pinkFur);
  rightEar.position.set(0.12, 1.08, 0.1);
  rightEar.rotation.z = -0.18;
  group.add(rightEar);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const leftEye = new THREE.Mesh(eyeGeo, materials.eyeBlack);
  leftEye.position.set(-0.1, 0.8, 0.36);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, materials.eyeBlack);
  rightEye.position.set(0.1, 0.8, 0.36);
  group.add(rightEye);

  // Cheeks
  const cheekGeo = new THREE.SphereGeometry(0.045, 8, 8);
  const leftCheek = new THREE.Mesh(cheekGeo, materials.pinkFur);
  leftCheek.position.set(-0.14, 0.73, 0.33);
  group.add(leftCheek);

  const rightCheek = new THREE.Mesh(cheekGeo, materials.pinkFur);
  rightCheek.position.set(0.14, 0.73, 0.33);
  group.add(rightCheek);

  group.userData = {
    type: 'bunny',
    greeting: '🐰 加油！快找到出口囉！',
    baseY: 0,
    bobSpeed: 3.2,
    bobHeight: 0.08
  };

  return group;
}

/**
 * Procedural 3D Puppy Model
 */
export function createPuppyNPC() {
  const group = new THREE.Group();

  // Body
  const bodyGeo = new THREE.BoxGeometry(0.5, 0.4, 0.6);
  const body = new THREE.Mesh(bodyGeo, materials.dogCream);
  body.position.y = 0.38;
  group.add(body);

  // Head
  const headGeo = new THREE.SphereGeometry(0.26, 16, 16);
  const head = new THREE.Mesh(headGeo, materials.brownFur);
  head.position.set(0, 0.68, 0.3);
  group.add(head);

  // Snout
  const snoutGeo = new THREE.BoxGeometry(0.18, 0.14, 0.18);
  const snout = new THREE.Mesh(snoutGeo, materials.whiteFur);
  snout.position.set(0, 0.62, 0.52);
  group.add(snout);

  // Nose
  const noseGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const nose = new THREE.Mesh(noseGeo, materials.eyeBlack);
  nose.position.set(0, 0.68, 0.61);
  group.add(nose);

  // Floppy Ears
  const earGeo = new THREE.BoxGeometry(0.08, 0.28, 0.16);
  const leftEar = new THREE.Mesh(earGeo, materials.brownFur);
  leftEar.position.set(-0.25, 0.65, 0.26);
  leftEar.rotation.z = -0.25;
  group.add(leftEar);

  const rightEar = new THREE.Mesh(earGeo, materials.brownFur);
  rightEar.position.set(0.25, 0.65, 0.26);
  rightEar.rotation.z = 0.25;
  group.add(rightEar);

  // Eyes
  const eyeGeo = new THREE.SphereGeometry(0.04, 8, 8);
  const leftEye = new THREE.Mesh(eyeGeo, materials.eyeBlack);
  leftEye.position.set(-0.1, 0.74, 0.5);
  group.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, materials.eyeBlack);
  rightEye.position.set(0.1, 0.74, 0.5);
  group.add(rightEye);

  group.userData = {
    type: 'puppy',
    greeting: '🐶 汪汪！出口就在前方！',
    baseY: 0,
    bobSpeed: 2.8,
    bobHeight: 0.05
  };

  return group;
}

/**
 * Procedural 3D Sci-Fi Drone Model (for Teens / Spaceship)
 */
export function createDroneNPC() {
  const group = new THREE.Group();

  // Core Sphere
  const coreGeo = new THREE.SphereGeometry(0.32, 16, 16);
  const core = new THREE.Mesh(coreGeo, materials.droneBody);
  core.position.y = 1.1;
  group.add(core);

  // Glowing Visor Ring
  const ringGeo = new THREE.TorusGeometry(0.34, 0.05, 8, 24);
  const ring = new THREE.Mesh(ringGeo, materials.droneGlow);
  ring.position.y = 1.1;
  ring.rotation.x = Math.PI / 2;
  group.add(ring);

  // Sensor Eye
  const eyeGeo = new THREE.SphereGeometry(0.1, 12, 12);
  const eye = new THREE.Mesh(eyeGeo, materials.droneGlow);
  eye.position.set(0, 1.1, 0.28);
  group.add(eye);

  // Thruster light underneath
  const thruster = new THREE.PointLight(0x22d3ee, 0.8, 4);
  thruster.position.set(0, 0.8, 0);
  group.add(thruster);

  group.userData = {
    type: 'drone',
    greeting: '🤖 導航信號已鎖定，前進！',
    baseY: 1.1,
    bobSpeed: 2.2,
    bobHeight: 0.12
  };

  return group;
}

/**
 * Creates 3D Goal Mascot Model (Carrot / Treasure Chest / Energy Core)
 */
export function createGoalMascot(topicId, illustrationSetId) {
  const group = new THREE.Group();

  if (illustrationSetId === 'rabbit-carrot' || topicId === 'plants') {
    // Big Glorious 3D Carrot
    const carrotGeo = new THREE.ConeGeometry(0.42, 1.4, 16);
    const carrot = new THREE.Mesh(carrotGeo, materials.carrotOrange);
    carrot.rotation.x = Math.PI; // Point down
    carrot.position.y = 1.1;
    group.add(carrot);

    // Leaves
    const leafGeo = new THREE.ConeGeometry(0.18, 0.6, 8);
    for (let i = 0; i < 3; i++) {
      const leaf = new THREE.Mesh(leafGeo, materials.leafGreen);
      leaf.position.set(Math.sin((i * Math.PI * 2) / 3) * 0.15, 1.9, Math.cos((i * Math.PI * 2) / 3) * 0.15);
      leaf.rotation.z = 0.3 * (i === 1 ? -1 : 1);
      group.add(leaf);
    }
  } else if (topicId === 'spaceship') {
    // Sci-Fi Floating Energy Core
    const coreGeo = new THREE.OctahedronGeometry(0.65, 0);
    const core = new THREE.Mesh(coreGeo, materials.droneGlow);
    core.position.y = 1.35;
    group.add(core);

    const orbitRing = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.05, 8, 32), materials.droneBody);
    orbitRing.position.y = 1.35;
    orbitRing.rotation.x = 0.8;
    group.add(orbitRing);
  } else {
    // Golden Treasure Chest
    const boxGeo = new THREE.BoxGeometry(0.8, 0.5, 0.6);
    const box = new THREE.Mesh(boxGeo, materials.goldChest);
    box.position.y = 0.5;
    group.add(box);

    const lidGeo = new THREE.CylinderGeometry(0.32, 0.32, 0.8, 12, 1, false, 0, Math.PI);
    const lid = new THREE.Mesh(lidGeo, materials.goldChest);
    lid.position.set(0, 0.75, 0);
    lid.rotation.z = Math.PI / 2;
    group.add(lid);
  }

  // Aura Light
  const aura = new THREE.PointLight(0xffd700, 1.2, 8);
  aura.position.y = 1.2;
  group.add(aura);

  return group;
}

/**
 * Creates floating 2D speech bubble billboard above NPC
 */
export function createSpeechBubble(text) {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 80;
  const ctx = canvas.getContext('2d');

  // Bubble background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  ctx.beginPath();
  ctx.roundRect(8, 8, 240, 60, 16);
  ctx.fill();

  // Border
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  // Text
  ctx.fillStyle = '#1e293b';
  ctx.font = 'bold 20px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 128, 38);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;

  const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.8, 0.6, 1);
  sprite.position.y = 1.6;

  return sprite;
}

/**
 * Spawns friendly guide NPCs in the maze
 */
export function spawnMazeNPCs(scene, maze, topicId, illustrationSetId) {
  const npcs = [];
  if (!maze || !maze.grid) return npcs;

  // Find candidate corridor cells (excluding start & end)
  const candidates = [];
  for (let r = 0; r < maze.rows; r++) {
    for (let c = 0; c < maze.cols; c++) {
      if ((c === maze.start.col && r === maze.start.row) ||
          (c === maze.end.col && r === maze.end.row)) {
        continue;
      }
      const cell = maze.grid[r][c];
      if (cell && cell.active) {
        // Count open passages
        let openPassages = 0;
        if (!cell.walls.top) openPassages++;
        if (!cell.walls.bottom) openPassages++;
        if (!cell.walls.left) openPassages++;
        if (!cell.walls.right) openPassages++;

        // Ideal candidates: dead ends (1 passage) or turns (2 passages)
        if (openPassages >= 1) {
          candidates.push({ col: c, row: r });
        }
      }
    }
  }

  // Shuffle candidates and pick 2-4 locations
  candidates.sort(() => Math.random() - 0.5);
  const count = Math.min(candidates.length, Math.max(2, Math.floor(maze.cols * 0.35)));
  const chosen = candidates.slice(0, count);

  chosen.forEach((loc, index) => {
    let npcMesh;
    if (topicId === 'spaceship') {
      npcMesh = createDroneNPC();
    } else if (index % 2 === 0) {
      npcMesh = createBunnyNPC();
    } else {
      npcMesh = createPuppyNPC();
    }

    const worldX = (loc.col + 0.5) * CELL;
    const worldZ = (loc.row + 0.5) * CELL;
    npcMesh.position.set(worldX, 0, worldZ);

    // Attach speech bubble
    const bubble = createSpeechBubble(npcMesh.userData.greeting);
    bubble.visible = false; // Show when player approaches
    npcMesh.add(bubble);
    npcMesh.userData.bubble = bubble;

    scene.add(npcMesh);
    npcs.push(npcMesh);
  });

  return npcs;
}
