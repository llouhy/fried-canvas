import { GridIns, getGrid } from "../definition/grid";
import { engineById } from "../engineFn";
import { Graphics } from "../graphOptions";
import { Boundary } from "../rewriteFn/type";
import { Shape } from "../shape/shape";
import { getDivisibleNum, graphicsToBoundary } from "../utils/math";
import { graphByEngineId, useGraph } from "./useGraph";
import { shapeById } from "./useShape";

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
  xs.add(0) && ys.add(0) 
  function createGrid(x: number, y: number, width: number, height: number, idx: number) {
    const isLeaf = idx === maxLevel - 1;
    const grid = getGrid({ minX: x, minY: y, maxX: x + width, maxY: y + height }, isLeaf);
    ctx?.$strokeRect(x, y, width, height);
    if (isLeaf) {
      xs.add(x + width) && ys.add(y + height);
      return grid;
    }
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
  const grid = createGrid(0, 0, getDivisibleNum(width, 2), getDivisibleNum(height, 2), 0);
  // console.log(grid);
  return { grid, divider: { xs: [...xs], ys: [...ys] } };
};

export const useGrid: UseGrid = (engineId: string, ctx?: any): UseGridRes => {
  const { grid, divider } = generateGrid(engineId, ctx);
  const getInfluencedGrid = (boundary: Boundary): GridIns[] => {
    const { translateX, translateY } = graphByEngineId.get(engineId);
    const bound = { left: boundary.minX + translateX, right: boundary.maxX + translateX, top: boundary.minY + translateY, bottom: boundary.maxY + translateY };
    !(window as any).ooo && (window as any).lalala && console.log(divider)
    !(window as any).ooo && (window as any).lalala && console.log('%c图形的bound', 'background:pink;padding:20px', { ...bound })
    for (const x of divider.xs) {
      if (x < boundary.minX + translateX) {
        bound.left = x;
      } else if (x >= bound.right) {
        bound.right = x;
        break;
      }
    }
    for (const y of divider.ys) {
      if (y < boundary.minY + translateY) {
        bound.top = y;
      } else if (y >= bound.bottom) {
        bound.bottom = y;
        break;
      }
    }
    !(window as any).ooo && (window as any).lalala && console.log('%c算出来清除bound', 'background:yellow;padding:20px', { ...bound })
    // console.log('bound', bound)
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
    // console.log('调用updateShapeToGrid', shape)
    const graph = graphByEngineId.get(engineId);
    const grids = getInfluencedGrid(graphicsToBoundary(graphics));
    [...shape.gridSet.values()].map(elem => elem.shapes = elem.shapes.filter(item => item !== shape));
    shape.gridSet.clear();
    for (const elem of grids) {
      (elem.shapes || (elem.shapes = [])) && elem.shapes.push(shape);
      elem.shapes = [...new Set(elem.shapes)];
      shape.gridSet.add(elem);
    }
  };
  const updateAllShapeToGrid = (pointer: Object = {}) => {
    for (const elem of shapeById.values()) {
      updateShapeToGrid(elem, elem.graphicsWithBorder);
    };
  };
  const result = { getInfluencedShape, getInfluencedGrid, updateShapeToGrid, rootGrid: grid, divider, updateAllShapeToGrid };
  gridByEngineId.set(engineId, result);
  return result;
};
