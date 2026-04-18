import React, { useState, useEffect, useCallback } from 'react';
import { generateMaze } from './utils/maze';
import { soundManager } from './utils/sounds';
import { Cell, Difficulty, Position } from './types';
import { MenuScreen } from './components/MenuScreen';
import { GameScreen } from './components/GameScreen';
import { BackgroundMaze } from './components/BackgroundMaze';
import { motion, AnimatePresence } from 'motion/react';
import { useWebHaptics } from 'web-haptics/react';
import { X, Lightbulb, Menu, RefreshCw } from 'lucide-react';
import { ThemeSelector } from './components/ThemeSelector';
import { solveMaze } from './utils/maze';
import { ThemeId, getThemeColors } from './utils/themes';

const DIFFICULTY_MAP: Record<Difficulty, { w: number; h: number; limit: number }> = {
  Easy: { w: 10, h: 15, limit: 20 },
  Medium: { w: 15, h: 22, limit: 45 },
  Hard: { w: 20, h: 30, limit: 90 },
  Expert: { w: 25, h: 37, limit: 180 },
};

export default function App() {
  const haptic = useWebHaptics();
  const [screen, setScreen] = useState<'menu' | 'playing'>('menu');
  const [difficulty, setDifficulty] = useState<Difficulty>('Easy');
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Position>({ x: 0, y: 0 });
  const [goalPos, setGoalPos] = useState<Position>({ x: 0, y: 0 });
  const [trail, setTrail] = useState<Position[]>([]);
  const [time, setTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTimeTrial, setIsTimeTrial] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasSavedGame, setHasSavedGame] = useState(false);
  const [showLevelComplete, setShowLevelComplete] = useState(false);
  const [theme, setTheme] = useState<ThemeId>('slate');
  const [isDark, setIsDark] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [hapticsEnabled, setHapticsEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [isSuccessAnim, setIsSuccessAnim] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [helpPage, setHelpPage] = useState(0);
  const [helpTouchStart, setHelpTouchStart] = useState<number | null>(null);
  const [hintPath, setHintPath] = useState<Position[]>([]);
  const [isHintActive, setIsHintActive] = useState(false);

  useEffect(() => {
    soundManager.muted = !soundEnabled;
  }, [soundEnabled]);

  const [windowSize, setWindowSize] = useState({ 
    w: typeof window !== 'undefined' ? window.innerWidth : 800, 
    h: typeof window !== 'undefined' ? window.innerHeight : 600 
  });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (showHelp) {
      window.history.pushState({ help: true }, '');
    }

    const handlePopState = (e: PopStateEvent) => {
      if (showHelp) {
        setShowHelp(false);
      } else {
        setScreen('menu');
        setIsPlaying(false);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [showHelp]);

  const closeHelp = () => {
    if (showHelp) {
      setShowHelp(false);
      if (window.history.state?.help) {
        window.history.back();
      }
    }
  };

  const { w, h } = DIFFICULTY_MAP[difficulty];
  const maxCellWidth = windowSize.w / (w + 2);
  const maxCellHeight = windowSize.h / (h + 10); // Extra padding for header/footer
  const cellSize = Math.max(10, Math.floor(Math.min(maxCellWidth, maxCellHeight)));

  const mazeWidth = w * cellSize;
  const mazeHeight = h * cellSize;

  const offsetX = Math.floor((windowSize.w - mazeWidth) / 2);
  const offsetY = Math.floor((windowSize.h - mazeHeight) / 2);

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setHasSavedGame(false);
  };

  const startNewGame = () => {
    const { w, h } = DIFFICULTY_MAP[difficulty];
    const newMaze = generateMaze(w, h);
    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    setGoalPos({ x: w - 1, y: h - 1 });
    setTrail([{ x: 0, y: 0 }]);
    setTime(0);
    setIsTimeTrial(false);
    setIsGameOver(false);
    setIsPlaying(true);
    setHasSavedGame(true);
    setShowLevelComplete(false);
    setIsSuccessAnim(false);
    setHintPath([]);
    setIsHintActive(false);
    setScreen('playing');
    window.history.pushState({ screen: 'playing' }, '');
  };

  const nextMaze = () => {
    const { w, h, limit } = DIFFICULTY_MAP[difficulty];
    const newMaze = generateMaze(w, h);
    setMaze(newMaze);
    setPlayerPos({ x: 0, y: 0 });
    setGoalPos({ x: w - 1, y: h - 1 });
    setTrail([{ x: 0, y: 0 }]);
    if (isTimeTrial) {
      setTime(limit);
    } else {
      setTime(0);
    }
    setIsGameOver(false);
    setIsPlaying(true);
    setHasSavedGame(true);
    setShowLevelComplete(false);
    setIsSuccessAnim(false);
    setHintPath([]);
    setIsHintActive(false);
  };

  const resumeGame = () => {
    setIsPlaying(true);
    setScreen('playing');
    window.history.pushState({ screen: 'playing' }, '');
  };

  const retryMaze = () => {
    setPlayerPos({ x: 0, y: 0 });
    setTrail([{ x: 0, y: 0 }]);
    if (isTimeTrial) {
      setTime(DIFFICULTY_MAP[difficulty].limit);
    } else {
      setTime(0);
    }
    setIsGameOver(false);
    setIsPlaying(true);
    setShowLevelComplete(false);
    setIsSuccessAnim(false);
  };

  const startTimeTrial = () => {
    setIsTimeTrial(true);
    setTime(DIFFICULTY_MAP[difficulty].limit);
    setPlayerPos({ x: 0, y: 0 });
    setTrail([{ x: 0, y: 0 }]);
    setIsGameOver(false);
    setIsPlaying(true);
    setShowLevelComplete(false);
    setIsSuccessAnim(false);
  };

  const startNormalGame = () => {
    setIsTimeTrial(false);
    setTime(0);
    setPlayerPos({ x: 0, y: 0 });
    setTrail([{ x: 0, y: 0 }]);
    setIsGameOver(false);
    setIsPlaying(true);
    setShowLevelComplete(false);
    setIsSuccessAnim(false);
  };

  const handleHelpOrHint = () => {
    if (screen === 'menu') {
      if (hapticsEnabled) haptic.trigger('light');
      soundManager.play('click');
      setHelpPage(0);
      setShowHelp(true);
    } else {
      if (showLevelComplete || isHintActive) return;
      if (hapticsEnabled) haptic.trigger('medium');
      soundManager.play('click');
      
      setIsHintActive(true);
      
      setTimeout(() => {
        const fullPath = solveMaze(maze, playerPos, goalPos);
        setHintPath(fullPath.slice(0, 15));
      }, 300);
      
      setTimeout(() => {
        setHintPath([]);
        setTimeout(() => {
          setIsHintActive(false);
        }, 300);
      }, 4000);
    }
  };

  const slide = useCallback((dx: number, dy: number) => {
    if (!isPlaying) return;

    let currentX = playerPos.x;
    let currentY = playerPos.y;
    let path: Position[] = [];

    while (true) {
      const currentCell = maze[currentY][currentX];
      
      if (dx === 1 && currentCell.walls.right) break;
      if (dx === -1 && currentCell.walls.left) break;
      if (dy === 1 && currentCell.walls.bottom) break;
      if (dy === -1 && currentCell.walls.top) break;

      currentX += dx;
      currentY += dy;
      path.push({ x: currentX, y: currentY });

      if (currentX === goalPos.x && currentY === goalPos.y) break;

      const nextCell = maze[currentY][currentX];
      
      // Stop if we can turn
      if (dx !== 0) {
        if (!nextCell.walls.top || !nextCell.walls.bottom) break;
      } else {
        if (!nextCell.walls.left || !nextCell.walls.right) break;
      }
    }

    if (path.length === 0) return;

    soundManager.play('swipe');
    if (hapticsEnabled) haptic.trigger('light');

    const newPos = path[path.length - 1];

    setPlayerPos(newPos);
    setHintPath([]);
    setIsHintActive(false);

    setTrail(prevTrail => {
      let newTrail = [...prevTrail];
      for (const p of path) {
        if (newTrail.length > 1) {
          const lastButOne = newTrail[newTrail.length - 2];
          if (lastButOne.x === p.x && lastButOne.y === p.y) {
            newTrail.pop();
            continue;
          }
        }
        newTrail.push(p);
      }
      return newTrail;
    });

    if (newPos.x === goalPos.x && newPos.y === goalPos.y) {
      if (hapticsEnabled) haptic.trigger('success');
      soundManager.play('success');
      setIsPlaying(false);
      setHasSavedGame(false);
      setIsSuccessAnim(true);
      setTimeout(() => {
        setShowLevelComplete(true);
      }, 700);
    }
  }, [isPlaying, maze, goalPos, playerPos, haptic]);

  useEffect(() => {
    let interval: any;
    if (isPlaying && screen === 'playing') {
      interval = setInterval(() => {
        setTime(t => {
          if (isTimeTrial) {
            if (t <= 1) {
              clearInterval(interval);
              setIsPlaying(false);
              setIsGameOver(true);
              soundManager.play('failure');
              return 0;
            }
            return t - 1;
          }
          return t + 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, screen, isTimeTrial]);

  const themeColors = getThemeColors(theme, isDark);

  const cssVars = {
    '--theme-bg': themeColors.bg,
    '--theme-maze-bg': themeColors.mazeBg,
    '--theme-grid': themeColors.grid,
    '--theme-text-main': themeColors.textMain,
    '--theme-text-muted': themeColors.textMuted,
    '--theme-player': themeColors.player,
    '--theme-player-shadow': themeColors.playerShadow,
    '--theme-trail': themeColors.trail,
    '--theme-goal': themeColors.goal,
    '--theme-goal-shadow': themeColors.goalShadow,
    '--theme-ui-bg': themeColors.uiBg,
    '--theme-ui-border': themeColors.uiBorder,
    '--theme-ui-hover': themeColors.uiHover,
  } as React.CSSProperties;

  return (
    <div className="w-full h-[100dvh] font-sans overflow-hidden relative transition-colors duration-500" style={{ ...cssVars, backgroundColor: 'var(--theme-bg)', color: 'var(--theme-text-main)' }}>
      <BackgroundMaze 
        cellSize={cellSize} 
        difficulty={difficulty} 
        offsetX={offsetX} 
        offsetY={offsetY} 
        theme={theme}
      />

      {/* Static UI Elements */}
      <div className="absolute top-4 left-4 sm:top-8 sm:left-8 z-30 flex items-center">
        <ThemeSelector currentTheme={theme} onSelectTheme={setTheme} isDark={isDark} onToggleDark={() => setIsDark(!isDark)} hapticsEnabled={hapticsEnabled} />
      </div>

      <div className="absolute bottom-10 sm:bottom-16 flex items-center justify-center w-full z-30 pointer-events-none pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center gap-2 px-4 py-1.5 bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-player)] rounded-full shadow-sm pointer-events-auto" style={{ backdropFilter: 'blur(4px)' }}>
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={handleHelpOrHint}
            className="p-2 text-[var(--theme-player)] hover:opacity-80 transition-colors"
          >
            <Lightbulb size={22} />
          </motion.button>
          <div className="w-px h-6 bg-[var(--theme-player)] opacity-30 mx-1" />
          <motion.button 
            whileTap={{ scale: 0.9 }}
            onClick={() => { if (hapticsEnabled) haptic.trigger('light'); soundManager.play('click'); setShowSettings(true); }}
            className="p-2 text-[var(--theme-player)] hover:opacity-80 transition-colors"
          >
            <Menu size={22} />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {screen === 'menu' ? (
          <motion.div 
            key="menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <MenuScreen 
              difficulty={difficulty}
              setDifficulty={handleDifficultyChange}
              onNewGame={startNewGame}
              onResume={resumeGame}
              hasSavedGame={hasSavedGame}
              hapticsEnabled={hapticsEnabled}
            />
          </motion.div>
        ) : (
          <motion.div 
            key="game"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0 z-10"
          >
            <GameScreen 
              maze={maze}
              playerPos={playerPos}
              goalPos={goalPos}
              trail={trail}
              time={time}
              onMove={slide}
              cellSize={cellSize}
              mazeWidth={mazeWidth}
              mazeHeight={mazeHeight}
              offsetX={offsetX}
              offsetY={offsetY}
              showLevelComplete={showLevelComplete}
              isTimeTrial={isTimeTrial}
              isGameOver={isGameOver}
              onNextMaze={nextMaze}
              onRetry={retryMaze}
              onStartTimeTrial={startTimeTrial}
              onStartNormal={startNormalGame}
              onBackToMenu={() => {
                setScreen('menu');
                setIsPlaying(false);
                setIsSuccessAnim(false);
                if (window.history.state?.screen === 'playing') {
                  window.history.replaceState({ screen: 'menu' }, '');
                }
              }}
              hapticsEnabled={hapticsEnabled}
              isSuccessAnim={isSuccessAnim}
              hintPath={hintPath}
              isHintActive={isHintActive}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help Popup */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeHelp}
            className="absolute inset-0 z-50 flex items-center justify-center bg-[var(--theme-bg)]/70 p-6 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm bg-[var(--theme-ui-bg)] border-2 border-[var(--theme-ui-border)] rounded-[3rem] p-6 sm:p-8 backdrop-blur-[4px] shadow-2xl flex flex-col items-center text-center relative cursor-default overflow-hidden"
            >
              <motion.div
                className="flex w-full"
                onTouchStart={(e) => setHelpTouchStart(e.touches[0].clientX)}
                onTouchEnd={(e) => {
                  if (helpTouchStart === null) return;
                  const dx = e.changedTouches[0].clientX - helpTouchStart;
                  if (dx < -50 && helpPage === 0) setHelpPage(1);
                  if (dx > 50 && helpPage === 1) setHelpPage(0);
                  setHelpTouchStart(null);
                }}
                animate={{ x: `-${helpPage * 100}%` }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Page 1: Menu Hint */}
                <div className="min-w-full flex-shrink-0 flex flex-col items-center px-4">
                  <div className="relative w-32 h-32 bg-[var(--theme-maze-bg)] rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                    <div className="w-16 h-16 border-2 border-[var(--theme-grid)] rounded-xl grid grid-cols-3 grid-rows-3 gap-0.5 p-1">
                       {[...Array(9)].map((_, i) => <div key={i} className="bg-[var(--theme-grid)] opacity-30 rounded-sm" />)}
                    </div>
                    <motion.div
                      animate={{ scale: [1, 0.8, 1, 1], opacity: [0, 1, 1, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute w-8 h-8 bg-[var(--theme-player)] rounded-full opacity-50 blur-sm"
                    />
                  </div>
                  <p className="text-xl font-medium text-[var(--theme-text-main)] mb-2">Start Game</p>
                  <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed h-10">
                    Choose the difficulty then<br/>tap the maze to start.
                  </p>
                </div>

                {/* Page 2: Game Hint */}
                <div className="min-w-full flex-shrink-0 flex flex-col items-center px-4">
                  <div className="relative w-32 h-32 bg-[var(--theme-maze-bg)] rounded-2xl mb-6 flex items-center justify-center overflow-hidden">
                    <motion.div 
                      animate={{ x: [0, 40, 40, -40, -40, 0], y: [0, 0, 40, 40, 0, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="w-8 h-8 rounded-lg shadow-lg"
                      style={{ backgroundColor: 'var(--theme-player)' }}
                    />
                    <motion.div 
                      animate={{ x: [-20, 60, 60, -60, -60, -20], y: [20, 20, 60, 60, 20, 20], opacity: [0, 1, 0, 1, 0, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute w-6 h-6 border-2 rounded-full"
                      style={{ borderColor: 'var(--theme-text-muted)' }}
                    />
                  </div>
                  <p className="text-xl font-medium text-[var(--theme-text-main)] mb-2">Swipe to Control</p>
                  <p className="text-sm text-[var(--theme-text-muted)] leading-relaxed h-10">
                    Swipe in any direction to<br/>move the block through the maze.
                  </p>
                </div>
              </motion.div>

              {/* Pagination Dots */}
              <div className="flex items-center justify-center w-full mt-8 px-4">
                <div className="flex gap-2">
                  <button onClick={() => setHelpPage(0)} className={`w-2 h-2 rounded-full transition-colors ${helpPage === 0 ? 'bg-[var(--theme-player)]' : 'bg-[var(--theme-text-muted)] opacity-30'}`} />
                  <button onClick={() => setHelpPage(1)} className={`w-2 h-2 rounded-full transition-colors ${helpPage === 1 ? 'bg-[var(--theme-player)]' : 'bg-[var(--theme-text-muted)] opacity-30'}`} />
                </div>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Settings Popup */}
      <AnimatePresence>
        {showSettings && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => {
              if (hapticsEnabled) haptic.trigger('light');
              soundManager.play('click');
              setShowSettings(false);
            }}
            className="absolute inset-0 z-[60] flex items-center justify-center bg-white/70 p-6 cursor-pointer"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 20, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm border-2 rounded-[3rem] p-8 sm:p-10 backdrop-blur-[4px] shadow-2xl flex flex-col items-center relative bg-[var(--theme-ui-bg)] border-[var(--theme-ui-border)] cursor-default"
            >
              <h2 className="text-2xl font-bold mb-8 text-[var(--theme-text-main)]">Options</h2>

              <div className="flex flex-col items-center w-full gap-6 mt-4">
                <div className="flex items-center justify-between w-48">
                  <span className="text-lg font-medium text-[var(--theme-player)]">Sound</span>
                  <button 
                    onClick={() => {
                      if (hapticsEnabled) haptic.trigger('light');
                      setSoundEnabled(!soundEnabled);
                      if (!soundEnabled) {
                        setTimeout(() => soundManager.play('click'), 10);
                      }
                    }}
                    className="w-14 h-8 flex items-center rounded-full p-1 transition-all border-2 bg-[var(--theme-ui-bg)] border-[var(--theme-player)] hover:bg-[var(--theme-ui-hover)]"
                  >
                    <motion.div 
                      layout
                      className="w-5 h-5 rounded-full shadow-sm"
                      style={{ backgroundColor: soundEnabled ? 'var(--theme-player)' : 'var(--theme-text-muted)' }}
                      animate={{ x: soundEnabled ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between w-48">
                  <span className="text-lg font-medium text-[var(--theme-player)]">Haptics</span>
                  <button 
                    onClick={() => {
                      const next = !hapticsEnabled;
                      setHapticsEnabled(next);
                      if (next) haptic.trigger('light');
                      soundManager.play('click');
                    }}
                    className="w-14 h-8 flex items-center rounded-full p-1 transition-all border-2 bg-[var(--theme-ui-bg)] border-[var(--theme-player)] hover:bg-[var(--theme-ui-hover)]"
                  >
                    <motion.div 
                      layout
                      className="w-5 h-5 rounded-full shadow-sm"
                      style={{ backgroundColor: hapticsEnabled ? 'var(--theme-player)' : 'var(--theme-text-muted)' }}
                      animate={{ x: hapticsEnabled ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
