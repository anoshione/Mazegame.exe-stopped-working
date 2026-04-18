import { useMemo, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { generateMaze } from '../utils/maze';

interface BackgroundMazeProps {
  cellSize: number;
  difficulty: string;
  offsetX: number;
  offsetY: number;
  theme: string;
}

export function BackgroundMaze({ cellSize, difficulty, offsetX, offsetY, theme }: BackgroundMazeProps) {
  const [windowSize, setWindowSize] = useState({ w: window.innerWidth, h: window.innerHeight });

  useEffect(() => {
    let timeoutId: number;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = window.setTimeout(() => {
        setWindowSize({ w: window.innerWidth, h: window.innerHeight });
      }, 200);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  const mazeData = useMemo(() => {
    const cols = Math.ceil(windowSize.w / cellSize) + 4;
    const rows = Math.ceil(windowSize.h / cellSize) + 4;
    if (cols < 5 || rows < 5) return null;
    
    const maze = generateMaze(cols, rows);
    
    const lines: string[] = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const cell = maze[y][x];
        if (cell.walls.right) lines.push(`M ${x + 1} ${y} L ${x + 1} ${y + 1}`);
        if (cell.walls.bottom) lines.push(`M ${x} ${y + 1} L ${x + 1} ${y + 1}`);
      }
    }
    
    return {
      path: lines.join(' '),
      cols,
      rows,
      cellSize,
      difficulty
    };
  }, [difficulty, windowSize, cellSize]);

  if (!mazeData) return null;

  const startX = (offsetX % mazeData.cellSize) - mazeData.cellSize * 2;
  const startY = (offsetY % mazeData.cellSize) - mazeData.cellSize * 2;

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <AnimatePresence>
        <motion.div
          key={mazeData.difficulty}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          <svg 
            className="absolute"
            style={{ 
              left: startX, 
              top: startY,
              width: mazeData.cols * mazeData.cellSize,
              height: mazeData.rows * mazeData.cellSize,
            }}
            viewBox={`0 0 ${mazeData.cols} ${mazeData.rows}`}
            preserveAspectRatio="none"
          >
            <path 
              d={mazeData.path} 
              stroke="var(--theme-grid)" 
              strokeWidth="1" 
              fill="none" 
              vectorEffect="non-scaling-stroke"
              strokeLinecap="square"
            />
          </svg>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
