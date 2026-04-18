import React, { useEffect, useState } from 'react';
import { Cell, Position } from '../types';
import { soundManager } from '../utils/sounds';
import { Play, Home, X, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useWebHaptics } from 'web-haptics/react';

interface GameScreenProps {
  maze: Cell[][];
  playerPos: Position;
  goalPos: Position;
  trail: Position[];
  time: number;
  onMove: (dx: number, dy: number) => void;
  cellSize: number;
  mazeWidth: number;
  mazeHeight: number;
  offsetX: number;
  offsetY: number;
  showLevelComplete: boolean;
  isTimeTrial: boolean;
  isGameOver: boolean;
  onNextMaze: () => void;
  onRetry: () => void;
  onStartTimeTrial: () => void;
  onStartNormal: () => void;
  onBackToMenu: () => void;
  hapticsEnabled: boolean;
  isSuccessAnim: boolean;
  hintPath: Position[];
  isHintActive: boolean;
}

export function GameScreen({ 
  maze, playerPos, goalPos, trail, time, onMove, cellSize, mazeWidth, mazeHeight, 
  offsetX, offsetY, showLevelComplete, isTimeTrial, isGameOver,
  onNextMaze, onRetry, onStartTimeTrial, onStartNormal, onBackToMenu, hapticsEnabled, isSuccessAnim, hintPath, isHintActive
}: GameScreenProps) {
  const haptic = useWebHaptics();
  const [showPausePopup, setShowPausePopup] = useState(false);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showLevelComplete) return;
      switch (e.key) {
        case 'ArrowUp': e.preventDefault(); onMove(0, -1); break;
        case 'ArrowDown': e.preventDefault(); onMove(0, 1); break;
        case 'ArrowLeft': e.preventDefault(); onMove(-1, 0); break;
        case 'ArrowRight': e.preventDefault(); onMove(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMove, showLevelComplete]);

  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    if (showLevelComplete) return;
    setTouchStart({ x: e.touches[0].clientX, y: e.touches[0].clientY });
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (showLevelComplete || !touchStart) return;
    const touchEnd = { x: e.changedTouches[0].clientX, y: e.changedTouches[0].clientY };
    const dx = touchEnd.x - touchStart.x;
    const dy = touchEnd.y - touchStart.y;
    
    let swiped = false;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (Math.abs(dx) > 30) {
        onMove(dx > 0 ? 1 : -1, 0);
        swiped = true;
      }
    } else {
      if (Math.abs(dy) > 30) {
        onMove(0, dy > 0 ? 1 : -1);
        swiped = true;
      }
    }
    
    if (swiped) {
      // Handled in App.tsx slide function
    }
    setTouchStart(null);
  };

  if (!maze || maze.length === 0) return null;

  const width = maze[0].length;
  const height = maze.length;

  return (
    <div 
      className="h-full w-full relative overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Top Bar */}
      <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-20 pointer-events-none">
        <div className="pointer-events-auto flex items-center">
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => {
              if (hapticsEnabled) haptic.trigger('medium');
              soundManager.play('click');
              setShowPausePopup(true);
            }}
            className={`text-xl font-mono tracking-widest px-6 h-[42px] flex items-center justify-center bg-[var(--theme-ui-bg)] border-2 rounded-full transition-colors shadow-sm ${
              isTimeTrial && time <= 10 
                ? 'text-red-600 border-red-400 bg-red-50/30 animate-pulse' 
                : 'text-[var(--theme-player)] border-[var(--theme-player)] hover:bg-[var(--theme-ui-hover)]'
            }`}
          >
            {formatTime(time)}
          </motion.button>
        </div>
      </div>

      {/* Maze Container */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        <motion.div 
          layoutId="maze-container"
          className="absolute box-content pointer-events-auto shadow-[0_0_40px_rgba(0,0,0,0.03)]"
          style={{
            borderTop: '2px solid var(--theme-grid)',
            borderLeft: '2px solid var(--theme-grid)',
            backgroundColor: 'var(--theme-maze-bg)',
            left: offsetX,
            top: offsetY,
            width: mazeWidth,
            height: mazeHeight,
            display: 'grid',
            gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
            borderRadius: 0,
          }}
        >
          {maze.map((row: Cell[], y: number) => 
            row.map((cell: Cell, x: number) => {
              const isTrail = trail.some(p => p.x === x && p.y === y);
              const isHint = hintPath.some(p => p.x === x && p.y === y);
              const isPlayer = playerPos.x === x && playerPos.y === y;
              const isGoal = goalPos.x === x && goalPos.y === y;

              return (
                <div 
                  key={`${x}-${y}`}
                  className="relative box-border"
                  style={{
                    borderRight: cell.walls.right ? '2px solid var(--theme-grid)' : '2px solid transparent',
                    borderBottom: cell.walls.bottom ? '2px solid var(--theme-grid)' : '2px solid transparent',
                  }}
                >
                  {/* Hint Path */}
                  <AnimatePresence>
                    {isHint && (
                      <motion.div 
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.6 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-[25%] z-0 rounded-[15%]"
                        style={{ backgroundColor: 'var(--theme-trail)' }}
                      />
                    )}
                  </AnimatePresence>

                  {/* Trail */}
                  <AnimatePresence>
                    {isTrail && !isHintActive && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-[2px] sm:inset-[3px] rounded-[10%]"
                        style={{ backgroundColor: 'var(--theme-trail)' }}
                      />
                    )}
                  </AnimatePresence>
                  
                  {/* Goal */}
                  {isGoal && (
                    <motion.div 
                      className="absolute inset-[12%] rounded-md"
                      style={{ backgroundColor: 'var(--theme-goal)', boxShadow: '0 0 20px var(--theme-goal-shadow)' }}
                      animate={isSuccessAnim ? { scale: [1, 1.5, 2], opacity: [1, 0.5, 0] } : { scale: 1, opacity: 1 }}
                      transition={isSuccessAnim ? { duration: 0.6, ease: "easeOut" } : { duration: 0 }}
                    />
                  )}

                  {/* Player */}
                  {isPlayer && (
                    <motion.div 
                      layoutId="player"
                      className="absolute inset-[15%] z-10 rounded-[15%]"
                      style={{ backgroundColor: 'var(--theme-player)', boxShadow: '0 0 20px var(--theme-player-shadow)' }}
                      animate={isSuccessAnim ? { scale: [1, 0.5, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
                      transition={isSuccessAnim ? { duration: 0.5, ease: "easeIn" } : { type: "spring", stiffness: 600, damping: 40 }}
                    />
                  )}
                </div>
              );
            })
          )}
        </motion.div>
      </div>

      {/* Level Complete Popup */}
      <AnimatePresence>
        {showLevelComplete && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--theme-bg)]/70 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
              className="w-full max-w-sm bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-ui-border)] rounded-[3rem] p-8 sm:p-10 backdrop-blur-[4px] shadow-2xl flex flex-col items-center text-center"
            >
              <div className="flex flex-col items-center justify-center w-full py-2 mb-10">
                <span className="text-6xl font-mono text-[var(--theme-player)] tracking-widest">{formatTime(time)}</span>
              </div>

              <div className="flex flex-col w-full gap-4">
                <button 
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('medium');
                    soundManager.play('click');
                    onNextMaze();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full text-[var(--theme-player)] font-semibold hover:bg-[var(--theme-ui-hover)] transition-all active:scale-[0.98]"
                >
                  <Play size={20} />
                  Next Maze
                </button>
                <button 
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('medium');
                    soundManager.play('click');
                    onBackToMenu();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full text-[var(--theme-player)] font-semibold hover:bg-[var(--theme-ui-hover)] transition-all active:scale-[0.98]"
                >
                  <Home size={20} />
                  Main Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pause/Options Popup */}
      <AnimatePresence>
        {showPausePopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              if (hapticsEnabled) haptic.trigger('light');
              soundManager.play('click');
              setShowPausePopup(false);
            }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--theme-bg)]/70 p-6 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-ui-border)] rounded-[3rem] p-8 sm:p-10 backdrop-blur-[4px] shadow-2xl flex flex-col items-center text-center relative cursor-default"
            >
              <div className="flex flex-col items-center justify-center w-full py-2 mb-10">
                <span className="text-4xl font-mono text-[var(--theme-player)] tracking-widest">{formatTime(time)}</span>
              </div>

              <div className="flex flex-col w-full gap-4">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('medium');
                    soundManager.play('click');
                    onRetry();
                    setShowPausePopup(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full text-[var(--theme-player)] font-semibold hover:bg-[var(--theme-ui-hover)] transition-colors"
                >
                  Retry
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('medium');
                    soundManager.play('click');
                    onNextMaze();
                    setShowPausePopup(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full text-[var(--theme-player)] font-semibold hover:bg-[var(--theme-ui-hover)] transition-colors"
                >
                  New Maze
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('medium');
                    soundManager.play('click');
                    if (isTimeTrial) {
                      onStartNormal();
                    } else {
                      onStartTimeTrial();
                    }
                    setShowPausePopup(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full text-[var(--theme-player)] font-semibold hover:bg-[var(--theme-ui-hover)] transition-colors"
                >
                  {isTimeTrial ? 'Normal' : 'Time Trial'}
                </motion.button>
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('medium');
                    soundManager.play('click');
                    onBackToMenu();
                    setShowPausePopup(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full text-[var(--theme-player)] font-semibold hover:bg-[var(--theme-ui-hover)] transition-colors"
                >
                  Main Menu
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Failure Popup */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-red-950/70 p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-sm bg-red-50/90 dark:bg-red-950/90 border-2 border-red-200 dark:border-red-800 rounded-[3rem] p-8 sm:p-10 backdrop-blur-[4px] shadow-2xl flex flex-col items-center text-center"
            >
              <div className="flex flex-col items-center justify-center w-full py-2 mb-10">
                <span className="text-sm font-bold tracking-widest text-red-500 uppercase mb-2">Time's Up!</span>
                <span className="text-6xl font-mono text-red-800 dark:text-red-200 tracking-widest">00:00</span>
              </div>

              <div className="flex flex-col w-full gap-4">
                <button 
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('medium');
                    soundManager.play('click');
                    onRetry();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-white/20 dark:bg-black/20 border-2 border-red-200 dark:border-red-800 rounded-full text-red-900 dark:text-red-100 font-semibold hover:bg-white/40 dark:hover:bg-black/40 transition-all active:scale-[0.98]"
                >
                  Retry
                </button>
                <button 
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('medium');
                    soundManager.play('click');
                    onNextMaze();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full text-[var(--theme-player)] font-semibold hover:bg-[var(--theme-ui-hover)] transition-all active:scale-[0.98]"
                >
                  Next Maze
                </button>
                <button 
                  onClick={() => {
                    if (hapticsEnabled) haptic.trigger('medium');
                    soundManager.play('click');
                    onBackToMenu();
                  }}
                  className="flex items-center justify-center gap-2 w-full py-4 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full text-[var(--theme-player)] font-semibold hover:bg-[var(--theme-ui-hover)] transition-all active:scale-[0.98]"
                >
                  <Home size={20} />
                  Main Menu
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
