/**
 * Maze Generator Utility
 * Supports:
 * - Geometric/Masked Shapes: Square, Circle (Round), Heart (愛心), Diamond (菱形)
 * - Line Path Styles: Straight (直角), Rounded (圓弧形/圓潤拐角), Organic Wave (曲線/波浪風)
 * - DFS Backtracker + Prim's algorithm, braiding, BFS pathfinder, age presets
 */

export const MAZE_SHAPES = {
  SQUARE: { id: 'square', name: '經典方形', icon: 'Square', description: '標準四方迷宮' },
  CIRCLE: { id: 'circle', name: '圓形迷宮 ⚪', icon: 'Circle', description: '同心圓外框，圓弧流暢' },
  HEART: { id: 'heart', name: '愛心造型 ❤️', icon: 'Heart', description: '適合幼兒童趣、浪漫節慶' },
  DIAMOND: { id: 'diamond', name: '菱形多邊形 🔷', icon: 'Diamond', description: '傾斜動感、幾何現代' },
};

export const LINE_STYLES = {
  ROUNDED: { id: 'rounded', name: '圓弧曲線 (推薦幼兒)', description: '圓角柔和，好畫不易磕絆' },
  STRAIGHT: { id: 'straight', name: '現代直線', description: '經典俐落幾何線條' },
  ORGANIC: { id: 'organic', name: '波浪童趣', description: '手繪波浪動態曲線' },
};

export const AGE_LEVELS = {
  TODDLER: {
    id: 'toddler',
    name: '幼兒啟蒙',
    ageRange: '3-5 歲',
    description: '超大通道、圓弧平滑轉角、可愛造型與卡通動物主題，好劃不刺手',
    defaultCols: 7,
    defaultRows: 7,
    minGrid: 5,
    maxGrid: 9,
    wallWidthRatio: 0.18,
    braidRatio: 0.35, // 較多環狀通道，減少死胡同挫折
    defaultShape: 'circle',
    defaultLineStyle: 'rounded',
    themeKey: 'toddler',
    defaultIllustrationSet: 'rabbit-carrot',
  },
  KIDS: {
    id: 'kids',
    name: '兒童探險',
    ageRange: '6-8 歲',
    description: '適中難度、愛心或圓形變化造型、寶藏與冒險故事主題',
    defaultCols: 13,
    defaultRows: 13,
    minGrid: 9,
    maxGrid: 17,
    wallWidthRatio: 0.12,
    braidRatio: 0.15,
    defaultShape: 'heart',
    defaultLineStyle: 'rounded',
    themeKey: 'kids',
    defaultIllustrationSet: 'pirate-treasure',
  },
  TEENS: {
    id: 'teens',
    name: '青少年挑戰',
    ageRange: '9-12 歲',
    description: '高密度菱形或圓形幾何、炫酷賽博科技風',
    defaultCols: 21,
    defaultRows: 21,
    minGrid: 15,
    maxGrid: 27,
    wallWidthRatio: 0.08,
    braidRatio: 0.03,
    defaultShape: 'diamond',
    defaultLineStyle: 'straight',
    themeKey: 'teens',
    defaultIllustrationSet: 'cyber-chip',
  },
  ADULT: {
    id: 'adult',
    name: '成人極限',
    ageRange: '13 歲以上',
    description: '極致複雜多邊形微網格、長死路，精緻高雅黑灰極簡美學',
    defaultCols: 31,
    defaultRows: 31,
    minGrid: 25,
    maxGrid: 45,
    wallWidthRatio: 0.05,
    braidRatio: 0.0,
    defaultShape: 'circle',
    defaultLineStyle: 'straight',
    themeKey: 'adult',
    defaultIllustrationSet: 'classic-geo',
  }
};

/**
 * Shape Mask evaluator: checks whether (col, row) is inside the given shape
 */
export function isInsideShape(c, r, cols, rows, shape = 'square') {
  if (shape === 'square') return true;

  // Normalized coordinates: -1 to 1 centered at 0
  const cx = (cols - 1) / 2;
  const cy = (rows - 1) / 2;
  const nx = (c - cx) / (cx || 1);
  const ny = (r - cy) / (cy || 1);

  if (shape === 'circle') {
    // Circle with radius 1
    return (nx * nx + ny * ny) <= 0.98;
  }

  if (shape === 'diamond') {
    // Manhattan distance <= 1
    return (Math.abs(nx) + Math.abs(ny)) <= 1.05;
  }

  if (shape === 'heart') {
    // Mathematical heart curve: (x^2 + y^2 - 1)^3 - x^2 * y^3 <= 0
    // Adapt to grid coordinates (y inverted, scale appropriately)
    const hx = nx * 1.15;
    const hy = -ny * 1.15 + 0.25; // Flip Y so heart apex points down
    const a = hx * hx + hy * hy - 0.9;
    return (a * a * a - hx * hx * hy * hy * hy) <= 0.05;
  }

  return true;
}

/**
 * Generates a shape-aware maze with DFS backtracker and braiding.
 */
export function generateMaze(cols, rows, braidRatio = 0, shape = 'square', lineStyle = 'rounded') {
  // Ensure odd dimensions for symmetrical shapes if needed
  const effectiveCols = cols % 2 === 0 ? cols + 1 : cols;
  const effectiveRows = rows % 2 === 0 ? rows + 1 : rows;

  const grid = [];
  const validCells = [];

  for (let r = 0; r < effectiveRows; r++) {
    const row = [];
    for (let c = 0; c < effectiveCols; c++) {
      const active = isInsideShape(c, r, effectiveCols, effectiveRows, shape);
      const cell = {
        col: c,
        row: r,
        active,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: !active // Treat inactive cells as already visited/blocked
      };
      row.push(cell);
      if (active) validCells.push(cell);
    }
    grid.push(row);
  }

  // Safety fallback if shape is too strict
  if (validCells.length < 4) {
    return generateMaze(cols, rows, braidRatio, 'square', lineStyle);
  }

  // Pick start cell (closest to top-left among active cells)
  let startCell = validCells[0];
  let minStartDist = Infinity;
  for (const cell of validCells) {
    const dist = cell.col * cell.col + cell.row * cell.row;
    if (dist < minStartDist) {
      minStartDist = dist;
      startCell = cell;
    }
  }

  // Pick end cell (closest to bottom-right among active cells)
  let endCell = validCells[validCells.length - 1];
  let minEndDist = Infinity;
  for (const cell of validCells) {
    const dx = (effectiveCols - 1) - cell.col;
    const dy = (effectiveRows - 1) - cell.row;
    const dist = dx * dx + dy * dy;
    if (dist < minEndDist && (cell.col !== startCell.col || cell.row !== startCell.row)) {
      minEndDist = dist;
      endCell = cell;
    }
  }

  // DFS Maze Generation
  const stack = [];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(grid, current, effectiveCols, effectiveRows);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, next);
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // Braid dead-ends if ratio > 0
  if (braidRatio > 0) {
    braidMaze(grid, validCells, startCell, endCell, braidRatio);
  }

  // Solve path
  const solution = findSolution(grid, startCell, endCell);

  return {
    cols: effectiveCols,
    rows: effectiveRows,
    grid,
    shape,
    lineStyle,
    start: { col: startCell.col, row: startCell.row },
    end: { col: endCell.col, row: endCell.row },
    solution
  };
}

function getUnvisitedNeighbors(grid, cell, cols, rows) {
  const { col, row } = cell;
  const neighbors = [];

  if (row > 0 && grid[row - 1][col].active && !grid[row - 1][col].visited) {
    neighbors.push(grid[row - 1][col]);
  }
  if (col < cols - 1 && grid[row][col + 1].active && !grid[row][col + 1].visited) {
    neighbors.push(grid[row][col + 1]);
  }
  if (row < rows - 1 && grid[row + 1][col].active && !grid[row + 1][col].visited) {
    neighbors.push(grid[row + 1][col]);
  }
  if (col > 0 && grid[row][col - 1].active && !grid[row][col - 1].visited) {
    neighbors.push(grid[row][col - 1]);
  }

  return neighbors;
}

function removeWalls(cell1, cell2) {
  const dx = cell1.col - cell2.col;
  const dy = cell1.row - cell2.row;

  if (dx === 1) {
    cell1.walls.left = false;
    cell2.walls.right = false;
  } else if (dx === -1) {
    cell1.walls.right = false;
    cell2.walls.left = false;
  }

  if (dy === 1) {
    cell1.walls.top = false;
    cell2.walls.bottom = false;
  } else if (dy === -1) {
    cell1.walls.bottom = false;
    cell2.walls.top = false;
  }
}

function braidMaze(grid, validCells, startCell, endCell, braidRatio) {
  const deadEnds = [];
  for (const cell of validCells) {
    if ((cell.col === startCell.col && cell.row === startCell.row) ||
        (cell.col === endCell.col && cell.row === endCell.row)) continue;

    let wallCount = 0;
    if (cell.walls.top) wallCount++;
    if (cell.walls.right) wallCount++;
    if (cell.walls.bottom) wallCount++;
    if (cell.walls.left) wallCount++;

    if (wallCount === 3) {
      deadEnds.push(cell);
    }
  }

  const removeCount = Math.floor(deadEnds.length * braidRatio);
  for (let i = 0; i < removeCount; i++) {
    const deadEndIndex = Math.floor(Math.random() * deadEnds.length);
    const cell = deadEnds.splice(deadEndIndex, 1)[0];
    if (!cell) continue;

    const candidates = [];
    if (cell.row > 0 && grid[cell.row - 1][cell.col].active && cell.walls.top) {
      candidates.push(grid[cell.row - 1][cell.col]);
    }
    if (cell.col < grid[0].length - 1 && grid[cell.row][cell.col + 1].active && cell.walls.right) {
      candidates.push(grid[cell.row][cell.col + 1]);
    }
    if (cell.row < grid.length - 1 && grid[cell.row + 1][cell.col].active && cell.walls.bottom) {
      candidates.push(grid[cell.row + 1][cell.col]);
    }
    if (cell.col > 0 && grid[cell.row][cell.col - 1].active && cell.walls.left) {
      candidates.push(grid[cell.row][cell.col - 1]);
    }

    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      removeWalls(cell, target);
    }
  }
}

function findSolution(grid, startCell, endCell) {
  const startKey = `${startCell.col},${startCell.row}`;
  const endKey = `${endCell.col},${endCell.row}`;

  const queue = [{ col: startCell.col, row: startCell.row, path: [{ col: startCell.col, row: startCell.row }] }];
  const visited = new Set([startKey]);

  while (queue.length > 0) {
    const { col, row, path } = queue.shift();

    if (col === endCell.col && row === endCell.row) {
      return path;
    }

    const cell = grid[row][col];

    if (!cell.walls.top && row > 0 && grid[row - 1][col].active) {
      const neighborKey = `${col},${row - 1}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push({ col, row: row - 1, path: [...path, { col, row: row - 1 }] });
      }
    }
    if (!cell.walls.right && col < grid[0].length - 1 && grid[row][col + 1].active) {
      const neighborKey = `${col + 1},${row}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push({ col: col + 1, row, path: [...path, { col: col + 1, row }] });
      }
    }
    if (!cell.walls.bottom && row < grid.length - 1 && grid[row + 1][col].active) {
      const neighborKey = `${col},${row + 1}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push({ col, row: row + 1, path: [...path, { col, row: row + 1 }] });
      }
    }
    if (!cell.walls.left && col > 0 && grid[row][col - 1].active) {
      const neighborKey = `${col - 1},${row}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push({ col: col - 1, row, path: [...path, { col: col - 1, row }] });
      }
    }
  }

  return [];
}
