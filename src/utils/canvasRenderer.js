/**
 * Canvas Rendering Utilities for Mazes with multiple line styles & shapes:
 * - Straight lines (經典幾何)
 * - Rounded curves (柔和圓弧角、通道圓角)
 * - Organic wavy lines (手繪波浪動態線)
 */

export function renderMazeOnCanvas(ctx, maze, options = {}) {
  const {
    displaySize = 600,
    wallColor = '#333333',
    bgColor = '#FFFFFF',
    wallWidthRatio = 0.14,
    lineStyle = 'rounded', // 'rounded' | 'straight' | 'organic'
    solutionColor = '#FF477E',
    showSolution = false,
    visitedPath = [],
    isPrint = false
  } = options;

  const cols = maze.cols;
  const rows = maze.rows;
  const cellSize = displaySize / cols;
  const wallWidth = Math.max(isPrint ? 3.5 : 2.5, cellSize * wallWidthRatio);
  const halfCell = cellSize / 2;

  // Clear background
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, displaySize, displaySize);

  // If masked shape (circle, heart, diamond), paint inactive background softly if not printing
  if (!isPrint && maze.shape && maze.shape !== 'square') {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (!maze.grid[r][c].active) {
          ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
        }
      }
    }
  }

  // Draw Solution Path
  if (showSolution && maze.solution && maze.solution.length > 0) {
    drawSmoothPath(ctx, maze.solution, cellSize, {
      color: solutionColor,
      width: Math.max(isPrint ? 8 : 4, cellSize * 0.32),
      isWave: lineStyle === 'organic'
    });
  }

  // Draw Visited Path (Interactive play)
  if (!isPrint && visitedPath && visitedPath.length > 1) {
    drawSmoothPath(ctx, visitedPath, cellSize, {
      color: 'rgba(77, 150, 255, 0.45)',
      width: Math.max(3, cellSize * 0.24),
      isWave: false
    });
  }

  // Setup wall drawing styles
  ctx.strokeStyle = wallColor;
  ctx.lineWidth = wallWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const radius = Math.min(cellSize * 0.35, 16);

  // Draw walls cell by cell
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = maze.grid[r][c];
      if (!cell.active) continue;

      const x = c * cellSize;
      const y = r * cellSize;

      if (lineStyle === 'rounded') {
        drawRoundedCellWalls(ctx, cell, x, y, cellSize, radius);
      } else if (lineStyle === 'organic') {
        drawOrganicCellWalls(ctx, cell, x, y, cellSize);
      } else {
        // Standard straight
        drawStraightCellWalls(ctx, cell, x, y, cellSize);
      }
    }
  }

  // Outer boundary / Frame styling
  if (maze.shape === 'square') {
    ctx.lineWidth = wallWidth * 1.35;
    ctx.strokeRect(wallWidth * 0.5, wallWidth * 0.5, displaySize - wallWidth, displaySize - wallWidth);
  }
}

/**
 * Draw Straight Wall segments
 */
function drawStraightCellWalls(ctx, cell, x, y, size) {
  if (cell.walls.top) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();
  }
  if (cell.walls.right) {
    ctx.beginPath();
    ctx.moveTo(x + size, y);
    ctx.lineTo(x + size, y + size);
    ctx.stroke();
  }
  if (cell.walls.bottom) {
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.stroke();
  }
  if (cell.walls.left) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size);
    ctx.stroke();
  }
}

/**
 * Draw Rounded Wall corners (圓弧形/圓潤拐角)
 * Smoothly rounds corners where walls meet perpendicular neighbors
 */
function drawRoundedCellWalls(ctx, cell, x, y, size, r) {
  // Top wall with rounded caps
  if (cell.walls.top) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + size, y);
    ctx.stroke();
  }
  if (cell.walls.right) {
    ctx.beginPath();
    ctx.moveTo(x + size, y);
    ctx.lineTo(x + size, y + size);
    ctx.stroke();
  }
  if (cell.walls.bottom) {
    ctx.beginPath();
    ctx.moveTo(x, y + size);
    ctx.lineTo(x + size, y + size);
    ctx.stroke();
  }
  if (cell.walls.left) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x, y + size);
    ctx.stroke();
  }
}

/**
 * Draw Organic Hand-Drawn Wavy Walls (童趣波浪形)
 */
function drawOrganicCellWalls(ctx, cell, x, y, size) {
  const wave = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    // Slight wavy offset
    const dx = y2 - y1;
    const dy = x1 - x2;
    const len = Math.hypot(dx, dy) || 1;
    const offset = size * 0.08;
    const cx = mx + (dx / len) * offset;
    const cy = my + (dy / len) * offset;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo(cx, cy, x2, y2);
    ctx.stroke();
  };

  if (cell.walls.top) wave(x, y, x + size, y);
  if (cell.walls.right) wave(x + size, y, x + size, y + size);
  if (cell.walls.bottom) wave(x, y + size, x + size, y + size);
  if (cell.walls.left) wave(x, y, x, y + size);
}

/**
 * Smooth Path drawing using quadratic curves or wavy style
 */
function drawSmoothPath(ctx, path, cellSize, { color, width, isWave = false }) {
  if (path.length === 0) return;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const pts = path.map(p => ({
    x: p.col * cellSize + cellSize / 2,
    y: p.row * cellSize + cellSize / 2
  }));

  if (pts.length === 1) {
    ctx.arc(pts[0].x, pts[0].y, width / 2, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  ctx.moveTo(pts[0].x, pts[0].y);

  for (let i = 1; i < pts.length; i++) {
    const p1 = pts[i - 1];
    const p2 = pts[i];
    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2;

    if (isWave) {
      const offset = (i % 2 === 0 ? 1 : -1) * (cellSize * 0.12);
      ctx.quadraticCurveTo(mx + offset, my - offset, p2.x, p2.y);
    } else {
      ctx.lineTo(p2.x, p2.y);
    }
  }

  ctx.stroke();
}
