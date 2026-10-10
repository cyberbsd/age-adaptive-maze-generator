import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Footprints } from 'lucide-react';
import {
  CELL,
  EYE_Y,
  GRAVITY,
  JUMP_SPEED,
  MOVE_SPEED,
  FOV_Y,
  PITCH_MAX,
  collectWallSegments,
  jumpApex,
  maxEyeY,
  resolveMove,
  segmentBoxes,
} from '../utils/mazeWorld.js';
import { buildTopic } from '../utils/worldBuilder.js';
import { WORLD_TOPICS } from '../utils/worldTopics.js';

const APEX = jumpApex();
const EYE_LIMIT = maxEyeY();

// Yaw 0 looks toward -Z (decreasing row). Face the first open side of the start cell.
function openingYaw(maze) {
  const cell = maze.grid?.[maze.start.row]?.[maze.start.col];
  if (!cell) return 0;
  if (!cell.walls.top) return 0;
  if (!cell.walls.right) return -Math.PI / 2;
  if (!cell.walls.bottom) return Math.PI;
  if (!cell.walls.left) return Math.PI / 2;
  return 0;
}

export default function Maze3DView({
  maze,
  topicId,
  onVictory,
  onExit3D,
}) {
  const mountRef = useRef(null);
  const onVictoryRef = useRef(onVictory);
  onVictoryRef.current = onVictory;

  const keysRef = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    jump: false,
    turnLeft: false,
    turnRight: false,
  });
  const yawNudgeRef = useRef(0);
  // Stick up is +forward (same as W). Stick right is +strafe (same as D).
  const stickRef = useRef({ x: 0, y: 0 });
  const stickPtr = useRef(null);
  const stickOrigin = useRef({ x: 0, y: 0 });
  const knobRef = useRef(null);

  const frameRef = useRef(null);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [stepCount, setStepCount] = useState(0);
  const [locked, setLocked] = useState(false);
  const [coarsePointer] = useState(() => (
    typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches
  ));

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeElapsed((value) => value + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [maze]);

  useEffect(() => {
    if (!maze || !mountRef.current) return undefined;

    const mount = mountRef.current;
    const topic = WORLD_TOPICS[topicId] || WORLD_TOPICS.stone;
    const width = mount.clientWidth || 640;
    const height = mount.clientHeight || 480;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(FOV_Y, width / height, 0.08, 240);
    camera.rotation.order = 'YXZ';

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount.replaceChildren(renderer.domElement);

    const segments = collectWallSegments(maze);
    const boxes = segmentBoxes(segments);
    const world = buildTopic(scene, segments, topic.id, maze.cols, maze.rows);

    const playerLight = new THREE.PointLight(topic.light, topic.id === 'spaceship' ? 0.8 : 1.3, topic.id === 'spaceship' ? 28 : 16);
    scene.add(playerLight);

    const goalGeo = new THREE.TorusGeometry(0.7, 0.16, 12, 28);
    const goalMat = new THREE.MeshBasicMaterial({ color: topic.goal });
    const goal = new THREE.Mesh(goalGeo, goalMat);
    const goalX = (maze.end.col + 0.5) * CELL;
    const goalZ = (maze.end.row + 0.5) * CELL;
    goal.position.set(goalX, 1.35, goalZ);
    scene.add(goal);

    const startX = (maze.start.col + 0.5) * CELL;
    const startZ = (maze.start.row + 0.5) * CELL;
    camera.position.set(startX, EYE_Y, startZ);
    camera.rotation.y = openingYaw(maze);
    camera.rotation.x = 0;

    const motion = {
      x: startX,
      z: startZ,
      height: 0,
      vy: 0,
      jumpHeld: false,
      steps: 0,
      prevCol: maze.start.col,
      prevRow: maze.start.row,
      won: false,
    };

    const fwd = new THREE.Vector3();
    const right = new THREE.Vector3();
    const up = new THREE.Vector3(0, 1, 0);
    let frameId = 0;
    let winTimer = 0;
    const startedAt = performance.now();
    let last = startedAt;

    const animate = (now) => {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const keys = keysRef.current;

      if (keys.turnLeft) camera.rotation.y += 1.6 * dt;
      if (keys.turnRight) camera.rotation.y -= 1.6 * dt;
      if (yawNudgeRef.current !== 0) {
        camera.rotation.y += yawNudgeRef.current;
        yawNudgeRef.current = 0;
      }
      camera.rotation.x = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, camera.rotation.x));

      camera.getWorldDirection(fwd);
      fwd.y = 0;
      if (fwd.lengthSq() > 0) fwd.normalize();
      right.crossVectors(fwd, up);

      let forwardAmount = 0;
      let strafeAmount = 0;
      if (keys.forward) forwardAmount += 1;
      if (keys.backward) forwardAmount -= 1;
      if (keys.right) strafeAmount += 1;
      if (keys.left) strafeAmount -= 1;
      forwardAmount += stickRef.current.y;
      strafeAmount += stickRef.current.x;

      const distance = MOVE_SPEED * dt;
      const dx = fwd.x * forwardAmount * distance + right.x * strafeAmount * distance;
      const dz = fwd.z * forwardAmount * distance + right.z * strafeAmount * distance;
      if (dx !== 0 || dz !== 0) {
        const next = resolveMove(motion.x, motion.z, dx, dz, boxes);
        motion.x = next.x;
        motion.z = next.z;
        const col = Math.floor(motion.x / CELL);
        const row = Math.floor(motion.z / CELL);
        if (col !== motion.prevCol || row !== motion.prevRow) {
          motion.prevCol = col;
          motion.prevRow = row;
          motion.steps += 1;
          setStepCount(motion.steps);
        }
      }

      const grounded = motion.vy === 0 && motion.height <= 0;
      if (keys.jump && !motion.jumpHeld && grounded) {
        motion.vy = JUMP_SPEED;
      }
      motion.jumpHeld = keys.jump;

      motion.vy -= GRAVITY * dt;
      motion.height += motion.vy * dt;
      if (motion.height > APEX) {
        motion.height = APEX;
        if (motion.vy > 0) motion.vy = 0;
      }
      if (motion.height <= 0) {
        motion.height = 0;
        motion.vy = 0;
      }

      const eyeY = Math.min(EYE_Y + motion.height, EYE_LIMIT);
      camera.position.set(motion.x, eyeY, motion.z);
      playerLight.position.set(motion.x, eyeY, motion.z);

      goal.rotation.y += dt * 1.4;
      goal.rotation.x += dt * 0.6;

      const dist = Math.hypot(motion.x - goalX, motion.z - goalZ);
      if (dist < 1.1 && !motion.won) {
        motion.won = true;
        if (document.pointerLockElement) document.exitPointerLock();
        const duration = Math.max(1, Math.round((performance.now() - startedAt) / 1000));
        const steps = motion.steps;
        winTimer = window.setTimeout(() => {
          onVictoryRef.current?.({ steps, duration });
        }, 200);
      }

      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    frameId = requestAnimationFrame(animate);

    const onResize = () => {
      const w = mount.clientWidth || 640;
      const h = mount.clientHeight || 480;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);

    const canvas = renderer.domElement;
    canvas.style.touchAction = 'none';
    stickRef.current.x = 0;
    stickRef.current.y = 0;
    const canLock = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    let lookId = null;
    let lastX = 0;
    let lastY = 0;
    const clampPitch = () => {
      camera.rotation.x = Math.max(-PITCH_MAX, Math.min(PITCH_MAX, camera.rotation.x));
    };
    const applyLook = (dx, dy, sensitivity) => {
      camera.rotation.y -= dx * sensitivity;
      camera.rotation.x -= dy * sensitivity;
      clampPitch();
    };
    const onPointerDown = (event) => {
      if (event.pointerType === 'mouse' && canLock && canvas.requestPointerLock) {
        const lock = canvas.requestPointerLock();
        if (lock && typeof lock.catch === 'function') lock.catch(() => {});
        return;
      }
      if (lookId !== null) return;
      lookId = event.pointerId;
      lastX = event.clientX;
      lastY = event.clientY;
      try { canvas.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
    };
    const onPointerMove = (event) => {
      if (event.pointerId !== lookId) return;
      applyLook(event.clientX - lastX, event.clientY - lastY, 0.0065);
      lastX = event.clientX;
      lastY = event.clientY;
    };
    const onMouseMove = (event) => {
      if (document.pointerLockElement !== canvas) return;
      applyLook(event.movementX, event.movementY, 0.002);
    };
    const endLook = (event) => {
      if (event.pointerId !== lookId) return;
      lookId = null;
    };
    const blockTouchScroll = (event) => {
      if (!event.target?.closest?.('.maze-3d-frame')) return;
      if (event.cancelable) event.preventDefault();
    };
    const onLock = () => setLocked(document.pointerLockElement === canvas);
    canvas.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', endLook);
    window.addEventListener('pointercancel', endLook);
    window.addEventListener('mousemove', onMouseMove);
    frameRef.current?.addEventListener('touchmove', blockTouchScroll, { passive: false });
    document.addEventListener('pointerlockchange', onLock);
    const resizeId = requestAnimationFrame(onResize);

    return () => {
      cancelAnimationFrame(frameId);
      cancelAnimationFrame(resizeId);
      window.clearTimeout(winTimer);
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', endLook);
      window.removeEventListener('pointercancel', endLook);
      window.removeEventListener('mousemove', onMouseMove);
      frameRef.current?.removeEventListener('touchmove', blockTouchScroll);
      document.removeEventListener('pointerlockchange', onLock);
      stickRef.current.x = 0;
      stickRef.current.y = 0;
      if (document.pointerLockElement) document.exitPointerLock();
      world.dispose();
      goalGeo.dispose();
      goalMat.dispose();
      playerLight.dispose?.();
      scene.remove(goal);
      scene.remove(playerLight);
      renderer.dispose();
    };
  }, [maze, topicId]);

  useEffect(() => {
    const keys = keysRef.current;
    const setKey = (code, down) => {
      if (code === 'KeyW' || code === 'ArrowUp') keys.forward = down;
      if (code === 'KeyS' || code === 'ArrowDown') keys.backward = down;
      if (code === 'KeyA' || code === 'ArrowLeft') keys.left = down;
      if (code === 'KeyD' || code === 'ArrowRight') keys.right = down;
      if (code === 'Space') keys.jump = down;
    };
    const typing = (event) => {
      const tag = event.target?.tagName;
      return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';
    };
    const onDown = (event) => {
      if (typing(event)) return;
      if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(event.code)) {
        event.preventDefault();
      }
      setKey(event.code, true);
    };
    const onUp = (event) => setKey(event.code, false);
    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup', onUp);
    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup', onUp);
      keys.forward = false;
      keys.backward = false;
      keys.left = false;
      keys.right = false;
      keys.jump = false;
    };
  }, []);

  const hold = (name, active) => {
    keysRef.current[name] = active;
  };

  const press = (name) => (event) => {
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
    hold(name, true);
  };
  const release = (name) => () => hold(name, false);

  useEffect(() => {
    if (window.innerWidth >= 1024) return undefined;
    const id = window.setTimeout(() => {
      frameRef.current?.scrollIntoView({ block: 'start' });
    }, 60);
    return () => window.clearTimeout(id);
  }, []);

  const control = (name) => ({
    onPointerDown: press(name),
    onPointerUp: release(name),
    onPointerCancel: release(name),
    onContextMenu: (event) => event.preventDefault(),
  });

  const STICK_RADIUS = 46;
  const placeKnob = (x, y) => {
    if (knobRef.current) knobRef.current.style.transform = `translate(${x}px, ${y}px)`;
  };
  const applyStick = (clientX, clientY) => {
    const dx = clientX - stickOrigin.current.x;
    const dy = clientY - stickOrigin.current.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 1) {
      stickRef.current.x = 0;
      stickRef.current.y = 0;
      placeKnob(0, 0);
      return;
    }
    const clamped = Math.min(STICK_RADIUS, dist);
    placeKnob((dx / dist) * clamped, (dy / dist) * clamped);
    const mag = clamped / STICK_RADIUS;
    if (mag < 0.18) {
      stickRef.current.x = 0;
      stickRef.current.y = 0;
      return;
    }
    // Up on screen is +forward. Right on screen is +strafe.
    stickRef.current.x = (dx / dist) * mag;
    stickRef.current.y = (-dy / dist) * mag;
  };
  const onStickDown = (event) => {
    event.stopPropagation();
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
    stickPtr.current = event.pointerId;
    const rect = event.currentTarget.getBoundingClientRect();
    stickOrigin.current = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    applyStick(event.clientX, event.clientY);
  };
  const onStickMove = (event) => {
    if (event.pointerId !== stickPtr.current) return;
    applyStick(event.clientX, event.clientY);
  };
  const onStickUp = (event) => {
    if (stickPtr.current !== null && event.pointerId !== stickPtr.current) return;
    stickPtr.current = null;
    stickRef.current.x = 0;
    stickRef.current.y = 0;
    placeKnob(0, 0);
  };

  return (
    <div ref={frameRef} className="glass-panel maze-3d-panel" style={{ padding: '1.25rem', position: 'relative' }}>
      <div className="maze-3d-bar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.85rem',
        flexWrap: 'wrap',
        gap: '0.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span className="badge"><Footprints size={14} /> 第一人稱漫步</span>
          <span className="maze-3d-hud-text" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {coarsePointer
              ? '左搖桿行走，拖曳畫面環顧'
              : (locked ? '滑鼠環顧，WASD 移動，空白鍵跳躍' : '點擊畫面鎖定滑鼠')}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.85rem' }}>
          <span>時間: <strong>{timeElapsed}s</strong></span>
          <span>步數: <strong>{stepCount}</strong></span>
          <button type="button" className="btn btn-outline btn-sm" onClick={onExit3D}>
            返回 2D 平面
          </button>
        </div>
      </div>

      <div className="maze-3d-frame">
        <div className="maze-3d-view">
          <div ref={mountRef} className="maze-3d-stage" />
          <div className="maze-3d-crosshair" />
          <div className="maze-3d-lookhint">拖曳此處環顧</div>
        </div>

        <div className="maze-3d-touch">
          <div
            className="maze-3d-stick"
            aria-label="移動搖桿"
            onPointerDown={onStickDown}
            onPointerMove={onStickMove}
            onPointerUp={onStickUp}
            onPointerCancel={onStickUp}
            onContextMenu={(event) => event.preventDefault()}
          >
            <div ref={knobRef} className="maze-3d-stick-knob" />
          </div>

          <div className="maze-3d-turn">
            <button type="button" className="btn btn-secondary maze-3d-round" {...control('turnLeft')}>↺</button>
            <button type="button" className="btn btn-secondary maze-3d-round" {...control('turnRight')}>↻</button>
          </div>

          <div className="maze-3d-note">
            滑鼠環顧 · WASD 行走 · 空白鍵跳躍。牆高過任何跳躍。
          </div>

          <div className="maze-3d-move">
            <div className="maze-3d-fb">
              <button type="button" className="btn btn-primary maze-3d-wide" {...control('forward')}>▲</button>
              <button type="button" className="btn btn-secondary maze-3d-wide" {...control('backward')}>▼</button>
            </div>
            <button type="button" className="btn btn-primary maze-3d-round" {...control('jump')}>跳</button>
          </div>
        </div>
      </div>
    </div>
  );
}
