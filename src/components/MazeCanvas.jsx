import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ILLUSTRATION_SETS } from '../assets/illustrations';
import { AGE_LEVELS } from '../utils/mazeGenerator';

export default function MazeCanvas({
  maze,
  currentAgeKey,
  illustrationSetId,
  showSolution,
  onVictory,
  showDpad
}) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  // Player position state (for rendering)
  const [playerPos, setPlayerPos] = useState({ col: 0, row: 0 });
  const [visitedPath, setVisitedPath] = useState([{ col: 0, row: 0 }]);
  const [stepCount, setStepCount] = useState(0);

  // Authoritative game progress, read/written synchronously by movePlayer
  const gameRef = useRef({ pos: { col: 0, row: 0 }, steps: 0, startTime: Date.now(), completed: false });

  const ageInfo = AGE_LEVELS[currentAgeKey.toUpperCase()] || AGE_LEVELS.TODDLER;
  const currentSet = ILLUSTRATION_SETS[illustrationSetId] || ILLUSTRATION_SETS['rabbit-carrot'];

  // Reset player when maze changes
  useEffect(() => {
    gameRef.current = { pos: { col: 0, row: 0 }, steps: 0, startTime: Date.now(), completed: false };
    setPlayerPos({ col: 0, row: 0 });
    setVisitedPath([{ col: 0, row: 0 }]);
    setStepCount(0);
  }, [maze]);

  // Handle movement logic
  const movePlayer = useCallback((dir) => {
    const game = gameRef.current;
    if (game.completed || !maze) return;

    const { col, row } = game.pos;
    const cell = maze.grid[row][col];
    let newCol = col;
    let newRow = row;

    if (dir === 'up' && !cell.walls.top && row > 0) newRow--;
    if (dir === 'down' && !cell.walls.bottom && row < maze.rows - 1) newRow++;
    if (dir === 'left' && !cell.walls.left && col > 0) newCol--;
    if (dir === 'right' && !cell.walls.right && col < maze.cols - 1) newCol++;

    if (newCol === col && newRow === row) return; // blocked by a wall

    const nextPos = { col: newCol, row: newRow };
    game.pos = nextPos;
    game.steps += 1;

    setPlayerPos(nextPos);
    setVisitedPath(path => [...path, nextPos]);
    setStepCount(game.steps);

    // Check victory
    if (newCol === maze.cols - 1 && newRow === maze.rows - 1) {
      game.completed = true;
      const stats = {
        steps: game.steps,
        duration: Math.round((Date.now() - game.startTime) / 1000)
      };
      setTimeout(() => {
        if (onVictory) onVictory(stats);
      }, 150);
    }
  }, [maze, onVictory]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't hijack keys while typing in the worksheet title/prompt fields etc.
      const tag = e.target && e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (e.target && e.target.isContentEditable)) {
        return;
      }
      if (['ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        movePlayer('up');
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        movePlayer('down');
      } else if (['ArrowLeft', 'KeyA'].includes(e.code)) {
        e.preventDefault();
        movePlayer('left');
      } else if (['ArrowRight', 'KeyD'].includes(e.code)) {
        e.preventDefault();
        movePlayer('right');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [movePlayer]);

  // Touch swipe handling
  const touchStartRef = useRef(null);

  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const minDistance = 25;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > minDistance) movePlayer('right');
      else if (dx < -minDistance) movePlayer('left');
    } else {
      if (dy > minDistance) movePlayer('down');
      else if (dy < -minDistance) movePlayer('up');
    }
    touchStartRef.current = null;
  };

  // Track the available width so the canvas resizes with the window / device rotation
  const [displaySize, setDisplaySize] = useState(500);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      // 40px = container horizontal padding (1.25rem * 2)
      setDisplaySize(Math.max(200, Math.min(el.clientWidth - 40, 650)));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cellPx = maze ? displaySize / maze.cols : 40;
  // Start/end badges scale with cell size so they don't hide the player on dense mazes
  const iconSize = Math.round(Math.max(14, Math.min(56, cellPx * 0.75)));

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !maze) return;
    const ctx = canvas.getContext('2d');

    const dpr = window.devicePixelRatio || 1;
    canvas.width = displaySize * dpr;
    canvas.height = displaySize * dpr;
    canvas.style.width = `${displaySize}px`;
    canvas.style.height = `${displaySize}px`;

    ctx.scale(dpr, dpr);

    const cellSize = displaySize / maze.cols;
    const wallWidth = Math.max(2, cellSize * ageInfo.wallWidthRatio);

    // Clear background
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--maze-bg').trim() || '#FFFFFF';
    ctx.fillRect(0, 0, displaySize, displaySize);

    // Draw Solution Path if enabled
    if (showSolution && maze.solution && maze.solution.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--maze-solution').trim() || '#FF477E';
      ctx.lineWidth = Math.max(3, cellSize * 0.28);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      maze.solution.forEach((p, index) => {
        const x = p.col * cellSize + cellSize / 2;
        const y = p.row * cellSize + cellSize / 2;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Draw Player Visited Path
    if (visitedPath.length > 1) {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(77, 150, 255, 0.4)';
      ctx.lineWidth = Math.max(3, cellSize * 0.22);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      visitedPath.forEach((p, index) => {
        const x = p.col * cellSize + cellSize / 2;
        const y = p.row * cellSize + cellSize / 2;
        if (index === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    // Draw Maze Walls
    ctx.strokeStyle = getComputedStyle(document.body).getPropertyValue('--maze-wall').trim() || '#333333';
    ctx.lineWidth = wallWidth;
    ctx.lineCap = 'round';

    for (let r = 0; r < maze.rows; r++) {
      for (let c = 0; c < maze.cols; c++) {
        const cell = maze.grid[r][c];
        const x = c * cellSize;
        const y = r * cellSize;

        // Draw top wall
        if (cell.walls.top) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
          ctx.stroke();
        }
        // Draw right wall
        if (cell.walls.right) {
          ctx.beginPath();
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.stroke();
        }
        // Draw bottom wall
        if (cell.walls.bottom) {
          ctx.beginPath();
          ctx.moveTo(x, y + cellSize);
          ctx.lineTo(x + cellSize, y + cellSize);
          ctx.stroke();
        }
        // Draw left wall
        if (cell.walls.left) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cellSize);
          ctx.stroke();
        }
      }
    }

    // Draw Outer Frame
    ctx.lineWidth = wallWidth * 1.4;
    ctx.strokeRect(0, 0, displaySize, displaySize);

    // Draw Player Token
    const px = playerPos.col * cellSize + cellSize / 2;
    const py = playerPos.row * cellSize + cellSize / 2;
    const playerRadius = Math.max(5, cellSize * 0.28);

    ctx.beginPath();
    ctx.arc(px, py, playerRadius, 0, Math.PI * 2);
    ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--maze-player').trim() || '#FFD93D';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 6;
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#FFFFFF';
    ctx.stroke();

  }, [maze, ageInfo, showSolution, playerPos, visitedPath, displaySize]);

  return (
    <div
      ref={containerRef}
      className="glass-panel"
      style={{
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
    >
      {/* Maze Prompt & Top Bar */}
      <div style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.85rem'
      }}>
        <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--primary)' }}>
          {currentSet.prompt}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          已走步數: <strong>{stepCount}</strong> 步
        </div>
      </div>

      {/* Canvas Wrapper */}
      <div
        style={{
          position: 'relative',
          display: 'inline-block',
          borderRadius: 'var(--card-radius)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          touchAction: 'none'
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas ref={canvasRef} style={{ display: 'block' }} />

        {/* Goal icon, centered on the goal cell */}
        <div style={{
          position: 'absolute',
          left: `${(maze.cols - 0.5) * cellPx - iconSize / 2}px`,
          top: `${(maze.rows - 0.5) * cellPx - iconSize / 2}px`,
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          pointerEvents: 'none'
        }}>
          {currentSet.renderEnd(iconSize)}
        </div>

        {/* Start character doubles as the player marker and moves with the player */}
        <div style={{
          position: 'absolute',
          left: `${(playerPos.col + 0.5) * cellPx - iconSize / 2}px`,
          top: `${(playerPos.row + 0.5) * cellPx - iconSize / 2}px`,
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          pointerEvents: 'none',
          transition: 'left 0.12s ease-out, top 0.12s ease-out',
          filter: 'drop-shadow(0 2px 3px rgba(0,0,0,0.35))'
        }}>
          {currentSet.renderStart(iconSize)}
        </div>
      </div>

      {/* Mobile Virtual D-Pad */}
      {showDpad && (
        <div className="dpad-container">
          <button className="dpad-btn dpad-up" onClick={() => movePlayer('up')}>▲</button>
          <button className="dpad-btn dpad-left" onClick={() => movePlayer('left')}>◀</button>
          <button className="dpad-btn dpad-right" onClick={() => movePlayer('right')}>▶</button>
          <button className="dpad-btn dpad-down" onClick={() => movePlayer('down')}>▼</button>
        </div>
      )}

      <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        💡 提示：支援鍵盤方向鍵 (WASD) 或在畫布上直接滑動拖曳走迷宮！
      </div>

    </div>
  );
}
