import { Grid } from "../definition/grid";
import { engineById } from "../engineFn";
import { Graphics } from "../graphOptions";
import { Boundary } from "../rewriteFn/type";
import { Shape } from "../shape/shape";
import { getDivisibleNum, graphicsToBoundary } from "../utils/common";

const gridByEngineId = new Map<string, { getInfluencedShape: (b: Boundary, g?: Grid[]) => Shape[]; getInfluencedGrid: (b: Boundary) => Grid[]; rootGrid: Grid; divider: { xs: number[]; ys: number[] } }>();

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

const generateGrid = (engineId: string): { grid: Grid; divider: { xs: number[]; ys: number[] } } => {
  if (gridByEngineId.get(engineId)) return { grid: gridByEngineId.get(engineId).rootGrid, divider: gridByEngineId.get(engineId).divider };
  const { engine: { width, height } } = engineById.get(engineId);
  const maxLevel = 4;
  const xs: number[] = [];
  const ys: number[] = [];
  function createGrid(x: number, y: number, width: number, height: number, idx: number) {
    const isLeaf = idx === maxLevel - 1;
    const grid = new Grid({ minX: x, minY: y, maxX: x + width, maxY: y + height }, isLeaf);
    xs.push(x) && ys.push(y);
    if (idx < maxLevel) {
      grid.children = [];
      const subWidth = width / 2;
      const subHeight = height / 2;
      grid.children.push(createGrid(x, y, subWidth, subHeight, idx + 1));
      grid.children.push(createGrid(x + subWidth, y, subWidth, subHeight, idx + 1));
      grid.children.push(createGrid(x, y + subHeight, subWidth, subHeight, idx + 1));
      grid.children.push(createGrid(x + subWidth, y + subHeight, subWidth, subHeight, idx + 1));
    }
    return grid;
  }
  return { grid: createGrid(0, 0, getDivisibleNum(width, 2), getDivisibleNum(height, 2), 0), divider: { xs: [...new Set(xs)], ys: [...new Set(ys)] } };
};

export const useGrid = (engineId: string): {
  getInfluencedShape: (boundary: Boundary, influenceGrids?: Grid[]) => Shape[];
  getInfluencedGrid: (boundary: Boundary) => Grid[];
  updateShapeToGrid: (shape: Shape, graphics: Graphics) => void;
} => {
  const { grid, divider } = generateGrid(engineId);
  console.log(divider)
  const getInfluencedGrid = (boundary: Boundary): Grid[] => {

    const bound = { left: boundary.maxX, right: boundary.minX, top: boundary.maxY, bottom: boundary.minY };
    for (const x of divider.xs) {
      if (x < boundary.minX) {
        bound.left = x;
      } else if (x > boundary.maxX) {
        bound.right = x;
        break;
      }
    }
    for (const y of divider.ys) {
      if (y < boundary.minY) {
        bound.top = y;
      } else if (y > boundary.maxY) {
        bound.bottom = y;
        break;
      }
    }
    console.log('bound', bound)
    const isDeepValid = (bound: { left: number; right: number; top: number; bottom: number; }, gridBoundary: Boundary): boolean => {
      return !(gridBoundary.minX > bound.right
        || gridBoundary.maxX < bound.left
        || gridBoundary.minY > bound.bottom
        || gridBoundary.maxY < bound.top);
    };
    const isGridInBound = (bound: { left: number; right: number; top: number; bottom: number; }, grid: Grid): boolean => {
      // console.log(grid.boundary)
      grid.boundary.minX === 0 && grid.boundary.maxY === 562.5 && console.log({
        bound,
        gb: grid.boundary,
        yes: (grid.boundary.minX >= bound.left
        && grid.boundary.maxX <= bound.right
        && grid.boundary.minY >= bound.top
        && grid.boundary.maxY <= bound.bottom)
      })
      return grid.boundary.minX >= bound.left
        && grid.boundary.maxX <= bound.right
        && grid.boundary.minY >= bound.top
        && grid.boundary.maxY <= bound.bottom;
    };
    const deep = (grids: Grid[], result: Grid[]) => {
      for (const elem of grids) {
        if (elem.isLeaf) {
          isGridInBound(bound, elem) && result.push(elem);
        } else {
          isDeepValid(bound, elem.boundary) && deep(elem.children, result);
        }
      }
    }
    const result: Grid[] = [];
    deep([grid], result);
    return result;
  };
  const getInfluencedShape = (boundary: Boundary, influenceGrids?: Grid[]): Shape[] => {
    const grids = influenceGrids || getInfluencedGrid(boundary);
    const shapes = grids.reduce((pre, cur) => {
      return [...pre, ...(getGridShapes(cur))];
    }, []);
    return [...new Set(shapes)];
  };
  const updateShapeToGrid = (shape: Shape, graphics: Graphics) => {
    const boundary = graphicsToBoundary(graphics);
    const grids = getInfluencedGrid(boundary);
    for (const elem of grids) {
      (elem.shapes || (elem.shapes = [])) && elem.shapes.push(shape);
      elem.shapes = [...new Set(elem.shapes)];
      // console.log('elem', elem)
    }
  };
  const result = { getInfluencedShape, getInfluencedGrid, updateShapeToGrid, rootGrid: grid, divider };
  gridByEngineId.set(engineId, result);
  return result;
};
