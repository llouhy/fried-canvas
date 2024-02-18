import { GridIns, getGrid } from "../definition/grid";
import { LayerIns } from "../definition/layer";
import { InitEngineResult, engineById } from "../engineFn";
import { Graphics } from "../graphOptions";
import { Boundary, Point } from "../rewriteFn/type";
import { Shape } from "../shape/shape";
import { getDivisibleNum, graphicsToBoundary } from "../utils/math";
import { graphByEngineId } from "./useGraph";
import { shapeById } from "./useShape";

export type Divider = { xs: number[]; ys: number[]; };
export type GetGridShapes = (grid: GridIns) => Shape[];
export type GenerateGrid = (engineId: string, ctx: any, drawGrid?: boolean) => { grid: GridIns; divider: Divider };
export type UseGridRes = {
  divider: Divider;
  rootGrid: GridIns;
  updateAllShapeToGrid: () => void;
  getPointInGrid: (point: Point) => GridIns;
  getInfluencedGrid: (boundary: Boundary) => GridIns[];
  updateShapeToGrid: (shape: Shape, graphics: Graphics) => void;
  getInfluencedShape: (boundary: Boundary, o: { influenceGrids?: GridIns[]; layerSet?: Set<LayerIns> }) => Shape[];
  mergeGridBoundary: (grids: GridIns[]) => Boundary;
}
export type UseGrid = (engineId: string, ctx?: any) => UseGridRes;

export const gridCoreByEngineId = new WeakMap<InitEngineResult, UseGridRes>();

const getGridShapes: GetGridShapes = (grid) => {
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

const generateGrid: GenerateGrid = (engineId, ctx, drawGrid) => {
  const engineInstance = engineById.get(engineId);
  if (gridCoreByEngineId.get(engineInstance)) return { grid: gridCoreByEngineId.get(engineInstance).rootGrid, divider: gridCoreByEngineId.get(engineInstance).divider };
  const { engine: { width, height } } = engineInstance;
  const maxLevel = 6, xs: Set<number> = new Set(), ys: Set<number> = new Set();
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
  return { grid, divider: { xs: [...xs], ys: [...ys] } };
};

export const useGrid: UseGrid = (engineId, ctx) => {
  const engineInstance = engineById.get(engineId);
  if (gridCoreByEngineId.get(engineInstance)) return gridCoreByEngineId.get(engineInstance);
  const { grid, divider } = generateGrid(engineId, ctx);
  const getInfluencedGrid = (boundary: Boundary): GridIns[] => {
    const { translateX, translateY } = graphByEngineId.get(engineId);
    const bound = { left: boundary.minX + translateX, right: boundary.maxX + translateX, top: boundary.minY + translateY, bottom: boundary.maxY + translateY };
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
    // !(window as any).ooo && (window as any).lalala && console.log('%c算出来清除bound', 'background:yellow;padding:20px', { ...bound })
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
  const getInfluencedShape = (boundary: Boundary, options: { influenceGrids?: GridIns[]; layerSet?: Set<LayerIns>; } = {}): Shape[] => {
    const { influenceGrids, layerSet } = options;
    const grids = influenceGrids || getInfluencedGrid(boundary);
    const shapes: Shape[] = grids.reduce((pre, cur) => {
      return [...pre, ...(getGridShapes(cur))];
  }, []);
    if (!layerSet) return [...new Set(shapes)];
    return [...new Set(shapes)].filter(elem => layerSet.has(elem.layer));
  };
  const updateShapeToGrid = (shape: Shape, graphics: Graphics) => {
    const grids = getInfluencedGrid(graphicsToBoundary(graphics));
    [...shape.gridSet.values()].map(elem => elem.shapes = elem.shapes.filter(item => item !== shape));
    shape.gridSet.clear();
    for (const elem of grids) {
      (elem.shapes || (elem.shapes = [])) && elem.shapes.push(shape);
      elem.shapes = [...new Set(elem.shapes)];
      shape.gridSet.add(elem);
    }
  };
  const updateAllShapeToGrid = () => {
    for (const elem of shapeById.values()) {
      updateShapeToGrid(elem, elem.graphicsWithBorder);
    };
  };
  const mergeGridBoundary = (grids: GridIns[]): Boundary => {
    return grids.reduce((pre, cur) => {
      return {
        minX: Math.min(pre.minX, cur.boundary.minX),
        minY: Math.min(pre.minY, cur.boundary.minY),
        maxX: Math.max(pre.maxX, cur.boundary.maxX),
        maxY: Math.max(pre.maxY, cur.boundary.maxY)
      }
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
  }
  const getPointInGrid = (point: Point): GridIns => {
    const isPointInGrid = (point: Point, grid: GridIns): boolean => {
      const { boundary: { minX, minY, maxX, maxY }, isLeaf } = grid;
      return !(point.x < minX || point.x > maxX || point.y < minY || point.y > maxY);
    }
    const deep = (point: Point, grids: GridIns[]): GridIns => {
      for (const elem of grids) {
        if (isPointInGrid(point, elem)) {
          if (elem.isLeaf) {
            return elem;
          } else {
            return deep(point, elem.children);
          }
        }
      }
    }
    return deep(point, [grid]);
  };
  return gridCoreByEngineId.set(engineInstance, {
    divider,
    rootGrid: grid,
    getPointInGrid,
    getInfluencedShape,
    getInfluencedGrid,
    updateShapeToGrid,
    mergeGridBoundary,
    updateAllShapeToGrid,
  }).get(engineInstance);
};
