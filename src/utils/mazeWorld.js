/**
 * Shared maze-to-world frame.
 * col increases +X, row increases +Z, Y is up.
 * Camera forward at yaw 0 is -Z. One wall record feeds both mesh and collider.
 */

export const CELL = 3;
export const WALL_H = 9;
export const WALL_T = 0.42;
export const PLAYER_R = 0.3;
export const EYE_Y = 1.6;
export const MOVE_SPEED = 4.2;
export const JUMP_SPEED = 5.2;
export const GRAVITY = 16;
/** ~31°. The near wall still fills the view at the top of a jump. */
export const PITCH_MAX = 0.55;
/** Vertical field of view in degrees. */
export const FOV_Y = 60;

export function jumpApex(jumpSpeed = JUMP_SPEED, gravity = GRAVITY) {
  return (jumpSpeed * jumpSpeed) / (2 * gravity);
}

export function maxEyeY() {
  return EYE_Y + jumpApex();
}

export function corridorHalfWidth() {
  return (CELL - WALL_T) / 2;
}

/** Pitch of the top edge of the view, including the vertical field of view. */
export function frustumTopPitch(pitchMax = PITCH_MAX, fovDeg = FOV_Y) {
  return pitchMax + (fovDeg * Math.PI) / 360;
}

/**
 * True when any part of the view from eyeY can see past the wall top at distToFace.
 * The check uses the top of the picture, not only the crosshair.
 */
export function seesOverWall(eyeY, distToFace, pitchMax = PITCH_MAX, fovDeg = FOV_Y) {
  if (eyeY >= WALL_H) return true;
  if (distToFace <= 0) return false;
  return frustumTopPitch(pitchMax, fovDeg) >= Math.atan((WALL_H - eyeY) / distToFace);
}

/**
 * Camera-relative step on the ground plane.
 * forward and right are unit vectors in XZ. forwardAmount +1 is W, strafeAmount +1 is D.
 */
export function planarMove(forwardX, forwardZ, rightX, rightZ, forwardAmount, strafeAmount) {
  return {
    x: forwardX * forwardAmount + rightX * strafeAmount,
    z: forwardZ * forwardAmount + rightZ * strafeAmount,
  };
}

function neighbor(grid, col, row, cols, rows) {
  if (row < 0 || col < 0 || row >= rows || col >= cols) return null;
  return grid[row][col];
}

/**
 * Deduped wall slabs. Horizontal edges use key z:col:row (row is the northern cell row,
 * so the south edge of the maze is z:col:rows). Vertical edges use x:col:row.
 */
export function collectWallSegments(maze) {
  const cols = maze.cols;
  const rows = maze.rows;
  const grid = maze.grid;
  const segments = [];
  const seen = new Set();

  const add = (key, segment) => {
    if (seen.has(key)) return;
    seen.add(key);
    segments.push(segment);
  };

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cell = grid[row][col];
      if (!cell || !cell.active) continue;

      const cx = col * CELL + CELL / 2;
      const cz = row * CELL + CELL / 2;

      if (cell.walls.top) {
        add(`z:${col}:${row}`, {
          x: cx,
          z: row * CELL,
          w: CELL + WALL_T,
          d: WALL_T,
          axis: 'z',
          col,
          row,
          edge: 'top',
        });
      }

      if (cell.walls.left) {
        add(`x:${col}:${row}`, {
          x: col * CELL,
          z: cz,
          w: WALL_T,
          d: CELL + WALL_T,
          axis: 'x',
          col,
          row,
          edge: 'left',
        });
      }

      const south = neighbor(grid, col, row + 1, cols, rows);
      if (cell.walls.bottom && (!south || !south.active)) {
        add(`z:${col}:${row + 1}`, {
          x: cx,
          z: (row + 1) * CELL,
          w: CELL + WALL_T,
          d: WALL_T,
          axis: 'z',
          col,
          row: row + 1,
          edge: 'top',
        });
      }

      const east = neighbor(grid, col + 1, row, cols, rows);
      if (cell.walls.right && (!east || !east.active)) {
        add(`x:${col + 1}:${row}`, {
          x: (col + 1) * CELL,
          z: cz,
          w: WALL_T,
          d: CELL + WALL_T,
          axis: 'x',
          col: col + 1,
          row,
          edge: 'left',
        });
      }
    }
  }

  return segments;
}

export function segmentBoxes(segments) {
  return segments.map((segment) => ({
    minX: segment.x - segment.w / 2 - PLAYER_R,
    maxX: segment.x + segment.w / 2 + PLAYER_R,
    minZ: segment.z - segment.d / 2 - PLAYER_R,
    maxZ: segment.z + segment.d / 2 + PLAYER_R,
  }));
}

export function resolveMove(x, z, dx, dz, boxes) {
  const blocked = (px, pz) => boxes.some(
    (box) => px >= box.minX && px <= box.maxX && pz >= box.minZ && pz <= box.maxZ
  );

  let nextX = x;
  let nextZ = z;
  if (!blocked(x + dx, z)) nextX = x + dx;
  if (!blocked(nextX, z + dz)) nextZ = z + dz;
  return { x: nextX, z: nextZ };
}
