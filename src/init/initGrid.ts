import { Grid } from "../definition/grid";
import { engineById } from "../engineFn";
import { Boundary } from "../rewriteFn/type";
import { Shape } from "../shape/shape";
import { getDivisibleNum } from "../utils/common";

const gridByEngineId = new Map<string, { getInfluencedShape: (boundary: Boundary) => Shape[] }>();

const getGridShapes = (grid: Grid): Shape[] => {
  const deep = (grid: Grid, res: Shape[]) => {
    if (!grid.isLeaf) {
      for (const elem of grid.children) {
        deep(elem, res);
      }
    } else {
      res.push(...grid.shapes);
    }
  }
  const result: Shape[] = [];
  deep(grid, result);
  return [...new Set(result)];
};

const generateGrid = (engineId: string) => {
  if (gridByEngineId.get(engineId)) return gridByEngineId.get(engineId);
  const { engine: { width, height } } = engineById.get(engineId);
  const maxLevel = 4;
  function createGrid(x: number, y: number, width: number, height: number, idx: number) {
    const isLeaf = idx === maxLevel - 1;
    const grid = new Grid({ minX: x, minY: y, maxX: x + width, maxY: y + height }, isLeaf);
    if (idx < maxLevel) {
      const subWidth = width / 2;
      const subHeight = height / 2;
      grid.children.push(createGrid(x, y, subWidth, subHeight, idx + 1));
      grid.children.push(createGrid(x + subWidth, y, subWidth, subHeight, idx + 1));
      grid.children.push(createGrid(x, y + subHeight, subWidth, subHeight, idx + 1));
      grid.children.push(createGrid(x + subWidth, y + subHeight, subWidth, subHeight, idx + 1));
    }
    return grid;
  }
  createGrid(0, 0, getDivisibleNum(width, 2), getDivisibleNum(height, 2), 0);
};

export const useGrid = (engineId: string): { getInfluencedShape: (boundary: Boundary) => Shape[] } => {
  const grid = generateGrid(engineId);
  console.log('生成网格', grid);
  const getInfluencedGrid = (boundary: Boundary): Grid[] => {
    const result: Grid[] = [];
    return result;
  };
  const getInfluencedShape = (boundary: Boundary): Shape[] => {
    const grids = getInfluencedGrid(boundary);
    const shapes = grids.reduce((pre, cur) => {
      return [...pre, ...(getGridShapes(cur))];
    }, []);
    return shapes;
  };
  const result = { getInfluencedShape };
  gridByEngineId.set(engineId, result);
  return result;
};
