import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import {
  collectWallSegments,
  resolveMove,
  planarMove,
  seesOverWall,
  corridorHalfWidth,
  CELL,
  PLAYER_R,
  WALL_H,
  jumpApex,
  maxEyeY,
} from './mazeWorld.js';
import { defaultTopicForAge, WORLD_TOPICS } from './worldTopics.js';
import { publicTextureUrl } from './worldBuilder.js';

function cell(col, row, walls, active = true) {
  return {
    col,
    row,
    active,
    walls: { top: true, right: true, bottom: true, left: true, ...walls },
  };
}

test('a shared closed edge is one segment', () => {
  const grid = [
    [cell(0, 0, { bottom: true }), cell(1, 0, { left: false })],
    [cell(0, 1, { top: true, left: false }), cell(1, 1, { left: false, top: false })],
  ];
  grid[0][0].walls.bottom = true;
  grid[1][0].walls.top = true;
  const maze = { cols: 2, rows: 2, grid };
  const segs = collectWallSegments(maze);
  const shared = segs.filter((s) => s.axis === 'z' && s.col === 0 && s.row === 1);
  assert.equal(shared.length, 1);
});

test('an open passage has no segment through the opening', () => {
  const grid = [[cell(0, 0, { right: false }), cell(1, 0, { left: false })]];
  const segs = collectWallSegments({ cols: 2, rows: 1, grid });
  const blocking = segs.filter((s) => s.axis === 'x' && s.col === 1 && s.row === 0);
  assert.equal(blocking.length, 0);
});

test('player radius fits the passage', () => {
  assert.ok(CELL - 0.42 > PLAYER_R * 2);
});

test('a jump cannot clear the wall', () => {
  assert.ok(jumpApex() < 1);
  assert.ok(maxEyeY() < WALL_H);
});

test('looking straight cannot see over the wall beside you', () => {
  assert.equal(seesOverWall(1.6, corridorHalfWidth(), 0), false);
});

test('three camera yaw 0 looks down -Z and its right is +X', () => {
  const camera = new THREE.PerspectiveCamera();
  camera.rotation.order = 'YXZ';
  camera.rotation.set(0, 0, 0);
  camera.updateMatrixWorld(true);
  const fwd = new THREE.Vector3();
  camera.getWorldDirection(fwd);
  fwd.y = 0;
  fwd.normalize();
  const right = new THREE.Vector3().crossVectors(fwd, new THREE.Vector3(0, 1, 0));
  assert.ok(fwd.z < -0.9);
  assert.ok(Math.abs(fwd.x) < 0.01);
  assert.ok(right.x > 0.9);
  assert.ok(Math.abs(right.z) < 0.01);
});

test('W moves toward -Z and D moves toward +X when the camera looks -Z', () => {
  const forward = planarMove(0, -1, 1, 0, 1, 0);
  const strafe = planarMove(0, -1, 1, 0, 0, 1);
  assert.ok(forward.z < 0);
  assert.equal(forward.x, 0);
  assert.ok(strafe.x > 0);
  assert.equal(strafe.z, 0);
});

test('slide stops on a wall and keeps the free axis', () => {
  const box = { minX: 1, maxX: 2, minZ: -1, maxZ: 1 };
  const moved = resolveMove(0, 0, 1.5, 0.4, [box]);
  assert.equal(moved.x, 0);
  assert.equal(moved.z, 0.4);
});

test('topic defaults cover the four ages', () => {
  assert.equal(defaultTopicForAge('toddler'), 'plants');
  assert.equal(defaultTopicForAge('kids'), 'plants');
  assert.equal(defaultTopicForAge('teens'), 'spaceship');
  assert.equal(defaultTopicForAge('adult'), 'stone');
  assert.equal(Object.keys(WORLD_TOPICS).join(','), 'stone,plants,spaceship');
  assert.equal(WORLD_TOPICS.spaceship.name, '未來飛船');
});

test('wall textures follow the site path instead of the domain root', () => {
  const page = 'https://cyberbsd.github.io/age-adaptive-maze-generator/';
  assert.equal(
    publicTextureUrl('hedge.jpg', './', page),
    'https://cyberbsd.github.io/age-adaptive-maze-generator/textures/hedge.jpg'
  );
  assert.equal(
    publicTextureUrl('stone.jpg', './', 'http://127.0.0.1:5173/'),
    'http://127.0.0.1:5173/textures/stone.jpg'
  );
});
