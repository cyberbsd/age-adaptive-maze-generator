import React, { useRef, useEffect, useState, useCallback } from 'react';
import { ILLUSTRATION_SETS } from '../assets/illustrations';
import { AGE_LEVELS } from '../utils/mazeGenerator';
import { renderMazeOnCanvas } from '../utils/canvasRenderer';

function cellOf(point, fallback) {
  if (point && Number.isInteger(point.col) && Number.isInteger(point.row)) {
    return { col: point.col, row: point.row };
  }
  return fallback;
}

function spawnOf(maze) {
  return cellOf(maze?.start, { col: 0, row: 0 });
}

function goalOf(maze) {
  return cellOf(maze?.end, maze ? { col: maze.cols - 1, row: maze.rows - 1 } : { col: 0, row: 0 });
}

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

  // Player position state (for rendering). Shaped mazes do not start at (0, 0).
  const [playerPos, setPlayerPos] = useState(() => spawnOf(maze));
  const [visitedPath, setVisitedPath] = useState(() => [spawnOf(maze)]);
  const [stepCount, setStepCount] = useState(0);
  const [coarsePointer] = useState(() => window.matchMedia('(pointer: coarse)').matches);

  // Authoritative game progress, read/written synchronously by movePlayer
  const gameRef = useRef({ pos: spawnOf(maze), steps: 0, startTime: Date.now(), completed: false });
  const moveRef = useRef(null);
  const holdTimer = useRef(null);
  const holdId = useRef(null);
  const swipeRef = useRef(null);

  const ageInfo = AGE_LEVELS[currentAgeKey.toUpperCase()] || AGE_LEVELS.TODDLER;
  const currentSet = ILLUSTRATION_SETS[illustrationSetId] || ILLUSTRATION_SETS['rabbit-carrot'];

  const clearHold = () => {
    if (holdTimer.current) {
      clearTimeout(holdTimer.current);
      holdTimer.current = null;
    }
    holdId.current = null;
  };

  // Reset player when maze changes
  useEffect(() => {
    const start = spawnOf(maze);
    clearHold();
    gameRef.current = { pos: start, steps: 0, startTime: Date.now(), completed: false };
    setPlayerPos(start);
    setVisitedPath([start]);
    setStepCount(0);
    return clearHold;
  }, [maze]);

  useEffect(() => {
    if (window.innerWidth >= 1024) return undefined;
    const id = window.setTimeout(() => {
      containerRef.current?.scrollIntoView({ block: 'start' });
    }, 60);
    return () => window.clearTimeout(id);
  }, []);

  // Handle movement logic
  const movePlayer = useCallback((dir) => {
    const game = gameRef.current;
    if (game.completed || !maze) return;

    const { col, row } = game.pos;
    const cell = maze.grid[row]?.[col];
    if (!cell?.active) return;
    let newCol = col;
    let newRow = row;

    if (dir === 'up' && !cell.walls.top && row > 0) newRow--;
    if (dir === 'down' && !cell.walls.bottom && row < maze.rows - 1) newRow++;
    if (dir === 'left' && !cell.walls.left && col > 0) newCol--;
    if (dir === 'right' && !cell.walls.right && col < maze.cols - 1) newCol++;

    if (newCol === col && newRow === row) return; // blocked by a wall
    if (!maze.grid[newRow]?.[newCol]?.active) return;

    const nextPos = { col: newCol, row: newRow };
    game.pos = nextPos;
    game.steps += 1;

    setPlayerPos(nextPos);
    setVisitedPath(path => [...path, nextPos]);
    setStepCount(game.steps);

    const goal = goalOf(maze);
    if (newCol === goal.col && newRow === goal.row) {
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

  moveRef.current = movePlayer;

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

  // One step per swipe. Pointer events cover touch, pen, and mouse drag.
  const onSwipeDown = (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    swipeRef.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
  };

  const onSwipeUp = (event) => {
    const start = swipeRef.current;
    if (!start || start.id !== event.pointerId) return;
    swipeRef.current = null;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const minDistance = 25;
    if (Math.abs(dx) < minDistance && Math.abs(dy) < minDistance) return;
    if (Math.abs(dx) > Math.abs(dy)) moveRef.current(dx > 0 ? 'right' : 'left');
    else moveRef.current(dy > 0 ? 'down' : 'up');
  };

  const onSwipeCancel = (event) => {
    if (swipeRef.current?.id === event.pointerId) swipeRef.current = null;
  };

  // Hold a direction button to keep stepping. Release only on up/cancel.
  const pressDir = (dir) => (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.preventDefault();
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* pointer already gone */ }
    clearHold();
    holdId.current = event.pointerId;
    moveRef.current(dir);
    const arm = (delay) => {
      holdTimer.current = setTimeout(() => {
        if (holdId.current !== event.pointerId) return;
        moveRef.current(dir);
        arm(180);
      }, delay);
    };
    arm(280);
  };

  const releaseDir = (event) => {
    if (holdId.current !== null && event.pointerId !== holdId.current) return;
    clearHold();
  };

  const padButton = (dir, className, label) => (
    <button
      type="button"
      className={`dpad-btn ${className}`}
      aria-label={label}
      onPointerDown={pressDir(dir)}
      onPointerUp={releaseDir}
      onPointerCancel={releaseDir}
      onContextMenu={(event) => event.preventDefault()}
    >
      {label}
    </button>
  );

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

    const wallColor = getComputedStyle(document.body).getPropertyValue('--maze-wall').trim() || '#333333';
    const bgColor = getComputedStyle(document.body).getPropertyValue('--maze-bg').trim() || '#FFFFFF';
    const solutionColor = getComputedStyle(document.body).getPropertyValue('--maze-solution').trim() || '#FF477E';

    // Render Walls, Paths, and Background with chosen lineStyle (rounded, organic, or straight)
    renderMazeOnCanvas(ctx, maze, {
      displaySize,
      wallColor,
      bgColor,
      wallWidthRatio: ageInfo.wallWidthRatio,
      lineStyle: maze.lineStyle || ageInfo.defaultLineStyle || 'rounded',
      solutionColor,
      showSolution,
      visitedPath,
      isPrint: false
    });

    // Draw Player Token
    const cellSize = displaySize / maze.cols;
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
        className="maze-play-surface"
        style={{
          position: 'relative',
          display: 'inline-block',
          borderRadius: 'var(--card-radius)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm)',
          touchAction: 'none'
        }}
        onPointerDown={onSwipeDown}
        onPointerUp={onSwipeUp}
        onPointerCancel={onSwipeCancel}
      >
        <canvas ref={canvasRef} style={{ display: 'block', touchAction: 'none' }} />

        {/* Goal icon, centered on the real exit */}
        <div className="maze-goal-token" style={{
          position: 'absolute',
          left: `${(goalOf(maze).col + 0.5) * cellPx - iconSize / 2}px`,
          top: `${(goalOf(maze).row + 0.5) * cellPx - iconSize / 2}px`,
          width: `${iconSize}px`,
          height: `${iconSize}px`,
          pointerEvents: 'none'
        }}>
          {currentSet.renderEnd(iconSize)}
        </div>

        {/* Start character doubles as the player marker and moves with the player */}
        <div className="maze-player-token" style={{
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

      {/* Virtual D-Pad. Stays under the canvas so it never covers the exit. */}
      {showDpad && (
        <div className="dpad-container">
          {padButton('up', 'dpad-up', '▲')}
          {padButton('left', 'dpad-left', '◀')}
          {padButton('right', 'dpad-right', '▶')}
          {padButton('down', 'dpad-down', '▼')}
        </div>
      )}

      <div style={{ marginTop: '0.85rem', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
        {coarsePointer
          ? '💡 提示：在迷宮上滑動一步，或按住方向鍵連續行走。'
          : '💡 提示：支援鍵盤方向鍵 (WASD) 或在畫布上直接滑動拖曳走迷宮！'}
      </div>

    </div>
  );
}
