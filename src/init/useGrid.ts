import { GridIns, getGrid } from "../definition/grid";
import { engineById } from "../engineFn";
import { Graphics } from "../graphOptions";
import { Boundary } from "../rewriteFn/type";
import { Shape } from "../shape/shape";
import { getDivisibleNum, graphicsToBoundary } from "../utils/common";
import { graphByEngineId, useGraph } from "./useGraph";
import { idToShape } from "./useShape";

export type UseGridRes = {
  getInfluencedShape: (boundary: Boundary, influenceGrids?: GridIns[]) => Shape[];
  getInfluencedGrid: (boundary: Boundary) => GridIns[];
  updateShapeToGrid: (shape: Shape, graphics: Graphics) => void;
}
export type UseGrid = (engineId: string, ctx?: any) => UseGridRes;

const gridByEngineId = new Map<string, { getInfluencedShape: (b: Boundary, g?: GridIns[]) => Shape[]; getInfluencedGrid: (b: Boundary) => GridIns[]; rootGrid: GridIns; divider: { xs: number[]; ys: number[] } }>();

const getGridShapes = (grid: GridIns): Shape[] => {
  const deep = (grid: GridIns, res: Shape[]) => {
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

const generateGrid = (engineId: string, ctx: any, drawGrid?: boolean): { grid: GridIns; divider: { xs: number[]; ys: number[] } } => {
  if (gridByEngineId.get(engineId)) return { grid: gridByEngineId.get(engineId).rootGrid, divider: gridByEngineId.get(engineId).divider };
  const { engine: { width, height } } = engineById.get(engineId);
  const maxLevel = 6;
  const xs: Set<number> = new Set();
  const ys: Set<number> = new Set();
  function createGrid(x: number, y: number, width: number, height: number, idx: number) {
    const isLeaf = idx === maxLevel - 1;
    const grid = getGrid({ minX: x, minY: y, maxX: x + width, maxY: y + height }, isLeaf);
    ctx?.$strokeRect(x, y, width, height);
    isLeaf && xs.add(x) && ys.add(y);
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
  return { grid: createGrid(0, 0, getDivisibleNum(width * 2, 2), getDivisibleNum(height * 2, 2), 0), divider: { xs: [...xs], ys: [...ys] } };
};

export const useGrid: UseGrid = (engineId: string, ctx?: any): UseGridRes => {
  const { grid, divider } = generateGrid(engineId, ctx);
  const getInfluencedGrid = (boundary: Boundary): GridIns[] => {
    const bound = { left: boundary.minX, right: boundary.maxX, top: boundary.minY, bottom: boundary.maxY };
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
    const isDeepValid = (bound: { left: number; right: number; top: number; bottom: number; }, gridBoundary: Boundary): boolean => {
      return !(gridBoundary.minX > bound.right
        || gridBoundary.maxX < bound.left
        || gridBoundary.minY > bound.bottom
        || gridBoundary.maxY < bound.top);
    };
    const isGridInBound = (bound: { left: number; right: number; top: number; bottom: number; }, grid: GridIns): boolean => {
      return grid.boundary.minX >= bound.left
        && grid.boundary.maxX <= bound.right
        && grid.boundary.minY >= bound.top
        && grid.boundary.maxY <= bound.bottom;
    };
    // const isGridInScreen = (bound) => {};
    const deep = (grids: GridIns[], result: GridIns[]) => {
      for (const elem of grids) {
        if (elem.isLeaf) {
          isGridInBound(bound, elem) && result.push(elem);
        } else {
          isDeepValid(bound, elem.boundary) && deep(elem.children, result);
        }
      }
    }
    const result: GridIns[] = [];
    deep([grid], result);
    return result;
  };
  const getInfluencedShape = (boundary: Boundary, influenceGrids?: GridIns[]): Shape[] => {
    const grids = influenceGrids || getInfluencedGrid(boundary);
    const shapes = grids.reduce((pre, cur) => {
      return [...pre, ...(getGridShapes(cur))];
    }, []);
    return [...new Set(shapes)];
  };
  const updateShapeToGrid = (shape: Shape, graphics: Graphics) => {
    const graph = graphByEngineId.get(engineId);
    const grids = getInfluencedGrid(graphicsToBoundary(graphics, graph));
    for (const elem of grids) {
      (elem.shapes || (elem.shapes = [])) && elem.shapes.push(shape);
      elem.shapes = [...new Set(elem.shapes)];
    }
  };
  const updateAllShapeToGrid = (pointer: Object) => {
    for (const elem of idToShape.values()) {
      updateShapeToGrid(elem, elem.graphicsWithBorder);
    };
  };
  const result = { getInfluencedShape, getInfluencedGrid, updateShapeToGrid, rootGrid: grid, divider, updateAllShapeToGrid };
  gridByEngineId.set(engineId, result);
  return result;
};
