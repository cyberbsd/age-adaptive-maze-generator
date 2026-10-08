/**
 * Maze Generator Utility
 * Implements DFS (Recursive Backtracker) and Prim's algorithm,
 * BFS pathfinding for solution keys, and age-level presets.
 */

export const AGE_LEVELS = {
  TODDLER: {
    id: 'toddler',
    name: '幼兒啟蒙',
    ageRange: '3-5 歲',
    description: '超大路徑、厚牆面、可愛幾何與卡通動物主題，好劃不易出界',
    defaultCols: 6,
    defaultRows: 6,
    minGrid: 4,
    maxGrid: 8,
    wallWidthRatio: 0.18, // Extra thick walls relative to cell size
    braidRatio: 0.25, // Convert 25% dead ends into loops for easier play
    themeKey: 'toddler',
    defaultIllustrationSet: 'rabbit-carrot',
  },
  KIDS: {
    id: 'kids',
    name: '兒童探險',
    ageRange: '6-8 歲',
    description: '適中難度、繽紛冒險色彩，寶藏與騎士冒險故事主題',
    defaultCols: 12,
    defaultRows: 12,
    minGrid: 9,
    maxGrid: 15,
    wallWidthRatio: 0.12,
    braidRatio: 0.10,
    themeKey: 'kids',
    defaultIllustrationSet: 'pirate-treasure',
  },
  TEENS: {
    id: 'teens',
    name: '青少年挑戰',
    ageRange: '9-12 歲',
    description: '高密度分支與轉角死路，炫酷賽博與深藍科技風配色',
    defaultCols: 20,
    defaultRows: 20,
    minGrid: 16,
    maxGrid: 26,
    wallWidthRatio: 0.08,
    braidRatio: 0.02,
    themeKey: 'teens',
    defaultIllustrationSet: 'cyber-chip',
  },
  ADULT: {
    id: 'adult',
    name: '成人極限',
    ageRange: '13 歲以上',
    description: '複雜微型網格、長死路，精緻高雅黑灰與石墨極簡風格',
    defaultCols: 30,
    defaultRows: 30,
    minGrid: 25,
    maxGrid: 45,
    wallWidthRatio: 0.05,
    braidRatio: 0.0,
    themeKey: 'adult',
    defaultIllustrationSet: 'classic-geo',
  }
};

/**
 * Generates a maze structure using DFS Recursive Backtracker algorithm.
 */
export function generateMaze(cols, rows, braidRatio = 0) {
  // Initialize grid
  const grid = [];
  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        col: c,
        row: r,
        walls: { top: true, right: true, bottom: true, left: true },
        visited: false
      });
    }
    grid.push(row);
  }

  const stack = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  stack.push(startCell);

  while (stack.length > 0) {
    const current = stack[stack.length - 1];
    const neighbors = getUnvisitedNeighbors(grid, current, cols, rows);

    if (neighbors.length > 0) {
      // Pick random neighbor
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, next);
      next.visited = true;
      stack.push(next);
    } else {
      stack.pop();
    }
  }

  // Braid maze (remove some dead ends) if requested
  if (braidRatio > 0) {
    braidMaze(grid, cols, rows, braidRatio);
  }

  // Find solution path using BFS
  const solution = findSolution(grid, cols, rows);

  return {
    cols,
    rows,
    grid,
    start: { col: 0, row: 0 },
    end: { col: cols - 1, row: rows - 1 },
    solution
  };
}

function getUnvisitedNeighbors(grid, cell, cols, rows) {
  const { col, row } = cell;
  const neighbors = [];

  // Top
  if (row > 0 && !grid[row - 1][col].visited) {
    neighbors.push(grid[row - 1][col]);
  }
  // Right
  if (col < cols - 1 && !grid[row][col + 1].visited) {
    neighbors.push(grid[row][col + 1]);
  }
  // Bottom
  if (row < rows - 1 && !grid[row + 1][col].visited) {
    neighbors.push(grid[row + 1][col]);
  }
  // Left
  if (col > 0 && !grid[row][col - 1].visited) {
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

/**
 * Removes dead-ends to create loops (Braiding).
 * Helps younger kids not get stuck in frustrating dead-ends.
 */
function braidMaze(grid, cols, rows, braidRatio) {
  const deadEnds = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      // Skip start and end cells
      if ((r === 0 && c === 0) || (r === rows - 1 && c === cols - 1)) continue;

      let wallCount = 0;
      if (cell.walls.top) wallCount++;
      if (cell.walls.right) wallCount++;
      if (cell.walls.bottom) wallCount++;
      if (cell.walls.left) wallCount++;

      if (wallCount === 3) {
        deadEnds.push(cell);
      }
    }
  }

  const removeCount = Math.floor(deadEnds.length * braidRatio);
  for (let i = 0; i < removeCount; i++) {
    const deadEndIndex = Math.floor(Math.random() * deadEnds.length);
    const cell = deadEnds.splice(deadEndIndex, 1)[0];
    if (!cell) continue;

    // Find neighboring cells that have a wall with current
    const candidates = [];
    if (cell.row > 0 && cell.walls.top) candidates.push(grid[cell.row - 1][cell.col]);
    if (cell.col < cols - 1 && cell.walls.right) candidates.push(grid[cell.row][cell.col + 1]);
    if (cell.row < rows - 1 && cell.walls.bottom) candidates.push(grid[cell.row + 1][cell.col]);
    if (cell.col > 0 && cell.walls.left) candidates.push(grid[cell.row][cell.col - 1]);

    if (candidates.length > 0) {
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      removeWalls(cell, target);
    }
  }
}

/**
 * BFS algorithm to find shortest solution path from start to end.
 */
function findSolution(grid, cols, rows) {
  const startKey = '0,0';
  const endKey = `${cols - 1},${rows - 1}`;

  const queue = [{ col: 0, row: 0, path: [{ col: 0, row: 0 }] }];
  const visited = new Set([startKey]);

  while (queue.length > 0) {
    const { col, row, path } = queue.shift();

    if (col === cols - 1 && row === rows - 1) {
      return path;
    }

    const cell = grid[row][col];

    // Check accessible directions (where wall is false)
    // Top
    if (!cell.walls.top && row > 0) {
      const neighborKey = `${col},${row - 1}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push({ col, row: row - 1, path: [...path, { col, row: row - 1 }] });
      }
    }
    // Right
    if (!cell.walls.right && col < cols - 1) {
      const neighborKey = `${col + 1},${row}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push({ col: col + 1, row, path: [...path, { col: col + 1, row }] });
      }
    }
    // Bottom
    if (!cell.walls.bottom && row < rows - 1) {
      const neighborKey = `${col},${row + 1}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push({ col, row: row + 1, path: [...path, { col, row: row + 1 }] });
      }
    }
    // Left
    if (!cell.walls.left && col > 0) {
      const neighborKey = `${col - 1},${row}`;
      if (!visited.has(neighborKey)) {
        visited.add(neighborKey);
        queue.push({ col: col - 1, row, path: [...path, { col: col - 1, row }] });
      }
    }
  }

  return [];
}
