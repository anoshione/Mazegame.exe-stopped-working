export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export type Cell = {
  x: number;
  y: number;
  walls: { top: boolean; right: boolean; bottom: boolean; left: boolean };
  visited: boolean;
};

export type Position = { x: number; y: number };
