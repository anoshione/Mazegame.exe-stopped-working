import { Cell } from '../types';

export function generateMaze(width: number, height: number): Cell[][] {
  const grid: Cell[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({ x, y, walls: { top: true, right: true, bottom: true, left: true }, visited: false });
    }
    grid.push(row);
  }

  const active: Cell[] = [];
  const startCell = grid[0][0];
  startCell.visited = true;
  active.push(startCell);

  while (active.length > 0) {
    // Growing Tree algorithm: 70% chance to pick newest (DFS - long corridors), 30% chance to pick random (Prim's - branching)
    const useNewest = Math.random() < 0.7;
    const index = useNewest ? active.length - 1 : Math.floor(Math.random() * active.length);
    const current = active[index];

    const neighbors = getUnvisitedNeighbors(current, grid, width, height);

    if (neighbors.length > 0) {
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      removeWalls(current, next);
      next.visited = true;
      active.push(next);
    } else {
      active.splice(index, 1);
    }
  }

  // Add complexity: Braid the maze slightly (remove some dead ends)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const cell = grid[y][x];
      
      let wallCount = 0;
      if (cell.walls.top) wallCount++;
      if (cell.walls.right) wallCount++;
      if (cell.walls.bottom) wallCount++;
      if (cell.walls.left) wallCount++;

      // Remove dead ends (braid factor: 0.15 - creates a few loops but keeps it mostly a labyrinth)
      if (wallCount === 3 && Math.random() < 0.15) {
        if ((x === 0 && y === 0) || (x === width - 1 && y === height - 1)) continue;
        
        const removable: ('top' | 'right' | 'bottom' | 'left')[] = [];
        if (cell.walls.top && y > 0) removable.push('top');
        if (cell.walls.right && x < width - 1) removable.push('right');
        if (cell.walls.bottom && y < height - 1) removable.push('bottom');
        if (cell.walls.left && x > 0) removable.push('left');

        if (removable.length > 0) {
          const toRemove = removable[Math.floor(Math.random() * removable.length)];
          if (toRemove === 'top') { cell.walls.top = false; grid[y-1][x].walls.bottom = false; }
          if (toRemove === 'right') { cell.walls.right = false; grid[y][x+1].walls.left = false; }
          if (toRemove === 'bottom') { cell.walls.bottom = false; grid[y+1][x].walls.top = false; }
          if (toRemove === 'left') { cell.walls.left = false; grid[y][x-1].walls.right = false; }
        }
      }
    }
  }

  return grid;
}

export function solveMaze(maze: Cell[][], start: {x: number, y: number}, goal: {x: number, y: number}): {x: number, y: number}[] {
  const queue: {x: number, y: number, path: {x: number, y: number}[]}[] = [{ ...start, path: [] }];
  const visited = new Set<string>();
  visited.add(`${start.x},${start.y}`);

  while (queue.length > 0) {
    const { x, y, path } = queue.shift()!;

    if (x === goal.x && y === goal.y) {
      return path;
    }

    const cell = maze[y][x];
    const neighbors = [
      { x, y: y - 1, wall: cell.walls.top },
      { x: x + 1, y, wall: cell.walls.right },
      { x, y: y + 1, wall: cell.walls.bottom },
      { x: x - 1, y, wall: cell.walls.left },
    ];

    for (const neighbor of neighbors) {
      if (!neighbor.wall && neighbor.y >= 0 && neighbor.y < maze.length && neighbor.x >= 0 && neighbor.x < maze[0].length) {
        const key = `${neighbor.x},${neighbor.y}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ x: neighbor.x, y: neighbor.y, path: [...path, { x: neighbor.x, y: neighbor.y }] });
        }
      }
    }
  }

  return [];
}

function getUnvisitedNeighbors(cell: Cell, grid: Cell[][], width: number, height: number) {
  const neighbors: Cell[] = [];
  const { x, y } = cell;

  if (y > 0 && !grid[y - 1][x].visited) neighbors.push(grid[y - 1][x]);
  if (x < width - 1 && !grid[y][x + 1].visited) neighbors.push(grid[y][x + 1]);
  if (y < height - 1 && !grid[y + 1][x].visited) neighbors.push(grid[y + 1][x]);
  if (x > 0 && !grid[y][x - 1].visited) neighbors.push(grid[y][x - 1]);

  return neighbors;
}

function removeWalls(a: Cell, b: Cell) {
  const dx = a.x - b.x;
  if (dx === 1) {
    a.walls.left = false;
    b.walls.right = false;
  } else if (dx === -1) {
    a.walls.right = false;
    b.walls.left = false;
  }

  const dy = a.y - b.y;
  if (dy === 1) {
    a.walls.top = false;
    b.walls.bottom = false;
  } else if (dy === -1) {
    a.walls.bottom = false;
    b.walls.top = false;
  }
}
