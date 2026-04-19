import React, { useMemo } from 'react';
import { Difficulty } from '../types';
import { generateMaze } from '../utils/maze';
import { soundManager } from '../utils/sounds';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { vibrate } from '../utils/vibrate';

interface MenuScreenProps {
  difficulty: Difficulty;
  setDifficulty: (d: Difficulty) => void;
  onNewGame: () => void;
  onResume: () => void;
  hasSavedGame: boolean;
  hapticsEnabled: boolean;
}

export function MenuScreen({ difficulty, setDifficulty, onNewGame, onResume, hasSavedGame, hapticsEnabled }: MenuScreenProps) {
  const difficulties: Difficulty[] = ['Easy', 'Medium', 'Hard', 'Expert'];
  
  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = difficulties.indexOf(difficulty);
    if (idx > 0) {
      if (hapticsEnabled) vibrate('medium');
      soundManager.play('swipe');
      setDifficulty(difficulties[idx - 1]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    const idx = difficulties.indexOf(difficulty);
    if (idx < difficulties.length - 1) {
      if (hapticsEnabled) vibrate('medium');
      soundManager.play('swipe');
      setDifficulty(difficulties[idx + 1]);
    }
  };

  const handleNewGame = () => {
    if (hapticsEnabled) vibrate('heavy');
    soundManager.play('swipe');
    onNewGame();
  };

  const handleResume = () => {
    if (hapticsEnabled) vibrate('heavy');
    soundManager.play('swipe');
    onResume();
  };

  const gridSize = difficulty === 'Easy' ? 6 : difficulty === 'Medium' ? 12 : difficulty === 'Hard' ? 20 : 30;

  const thumbMazeData = useMemo(() => {
    const maze = generateMaze(gridSize, gridSize);
    const lines: string[] = [];
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const cell = maze[y][x];
        if (cell.walls.right) lines.push(`M ${x + 1} ${y} L ${x + 1} ${y + 1}`);
        if (cell.walls.bottom) lines.push(`M ${x} ${y + 1} L ${x + 1} ${y + 1}`);
      }
    }
    return lines.join(' ');
  }, [gridSize]);

  return (
    <div className="flex flex-col items-center justify-center h-full w-full relative overflow-hidden pb-20 pt-24">
      <div className="z-10 flex flex-col items-center w-full max-w-xs px-4">
        <motion.h1 
          animate={{ marginBottom: hasSavedGame ? 24 : 48 }}
          className="text-6xl sm:text-7xl font-black tracking-widest text-[var(--theme-text-main)]"
        >
          ESCAPE
        </motion.h1>

        {/* Decorative Grid Icon */}
        <motion.div 
          layoutId="maze-container"
          onClick={handleNewGame}
          whileTap={{ scale: 0.95 }}
          animate={{ marginBottom: hasSavedGame ? 24 : 48 }}
          className="w-48 h-48 sm:w-56 sm:h-56 relative block cursor-pointer"
          style={{ borderRadius: '1.5rem' }}
        >
           <div className="absolute inset-0 rounded-3xl border-2 border-[var(--theme-ui-border)] overflow-hidden bg-[var(--theme-ui-bg)]">
              <AnimatePresence>
                <motion.svg
                  key={gridSize}
                  initial={{ opacity: 0, scale: 1.2 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                  className="absolute inset-0 w-full h-full"
                  viewBox={`0 0 ${gridSize} ${gridSize}`}
                >
                  <path 
                    d={thumbMazeData} 
                    stroke="var(--theme-grid)" 
                    strokeWidth="1" 
                    fill="none" 
                    vectorEffect="non-scaling-stroke"
                    strokeLinecap="square"
                  />
                </motion.svg>
              </AnimatePresence>
           </div>
        </motion.div>

        {/* Difficulty Selector */}
        <motion.div 
          animate={{ marginBottom: hasSavedGame ? 16 : 32 }}
          className="flex items-center justify-between w-full px-4"
        >
          <div className="w-10 flex justify-center">
            {difficulties.indexOf(difficulty) > 0 && (
              <motion.button 
                whileTap={{ scale: 0.8, x: -4 }}
                onClick={handlePrev} 
                className="p-2 text-[var(--theme-player)] hover:opacity-80 transition-colors"
              >
                <ChevronLeft size={20} />
              </motion.button>
            )}
          </div>
          <span className="text-lg font-medium text-[var(--theme-player)]">{difficulty}</span>
          <div className="w-10 flex justify-center">
            {difficulties.indexOf(difficulty) < difficulties.length - 1 && (
              <motion.button 
                whileTap={{ scale: 0.8, x: 4 }}
                onClick={handleNext} 
                className="p-2 text-[var(--theme-player)] hover:opacity-80 transition-colors"
              >
                <ChevronRight size={20} />
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Buttons */}
        <div className="flex flex-col justify-center w-full">
          <AnimatePresence initial={false}>
            {hasSavedGame && (
              <motion.div 
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ 
                  opacity: { duration: 0.25 },
                  height: { delay: 0.25, type: "tween", ease: "easeInOut", duration: 0.3 },
                  marginTop: { delay: 0.25, type: "tween", ease: "easeInOut", duration: 0.3 }
                }}
                style={{ overflow: 'hidden' }}
              >
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleResume}
                  className="w-full py-4 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full text-[var(--theme-player)] font-semibold hover:bg-[var(--theme-ui-hover)] transition-colors"
                >
                  Resume
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
