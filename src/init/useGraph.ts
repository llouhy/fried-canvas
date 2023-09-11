import { gridCoreByEngineId, useGrid } from "./useGrid";
import { Shape } from "../shape/shape";
import { isNumber } from "../utils/is";
import { shapeById } from "./useShape";
import { InitEngineResult, engineById } from "../engineFn";
import { Graphics } from "../graphOptions";
import { setCanvasSize } from "../utils/common";
import { setIdentify } from "../utils/setIdentify";
import { angleToRadian, graphicsToBoundary } from "../utils/math";
import { Boundary, EngineCtx } from "../rewriteFn/type";

export type Graph = {
  translateX: number;
  translateY: number;
  left: number;
  right: number;
  top: number;
  bottom: number;
  zoom: number;
};
export type UseGraphRes = {
  translate: (x: number, y: number, cachePointer: Object) => void;
  resizeCanvas: (width: number, height: number) => void;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  repaintInfluencedShape: (graphics: Graphics, excludesSet: Set<Shape>) => void;
}
export type UseGraph = (engineId: string) => UseGraphRes;
export const graphByEngineId = new Map<string, Graph>();
export const graphCoreByEngineId = new WeakMap<InitEngineResult, UseGraphRes>();
export type UseClipPath = (ctx: EngineCtx) => [
  (x: number, y: number, width: number, height: number) => void,
  () => void
];
const useCache = <T>(fn: (...args: any[]) => any) => {
  const cacheDataByPointer = new WeakMap<Object, any>();
  return (pointer: Object, ...params: any[]): T => cacheDataByPointer.get(pointer) || cacheDataByPointer.set(pointer, fn(...params)).get(pointer);;
}
const getBoundary = (): Boundary => {
  const imageBoundary = {
    minX: 0,
    maxX: 0,
    minY: 0,
    maxY: 0
  };
  for (const elem of shapeById.values()) {
    const { minX, minY, maxX, maxY } = imageBoundary;
    imageBoundary.minX = Math.min(elem.boundary.minX, minX);
    imageBoundary.maxX = Math.max(elem.boundary.maxX, maxX);
    imageBoundary.minY = Math.min(elem.boundary.minY, minY);
    imageBoundary.maxY = Math.max(elem.boundary.maxY, maxY);
  };
  return imageBoundary;
};
const getImageData = (imageBoundary: Boundary, ctx: EngineCtx) => {
  const data: ImageData = ctx.getImageData(
    imageBoundary.minX,
    imageBoundary.minY,
    imageBoundary.maxX - imageBoundary.minX,
    imageBoundary.maxY - imageBoundary.minY);
  return data;
};
const isShapeInScreen = (shape: Shape, graph: Graph): boolean => {
  const { minX, minY, maxX, maxY } = shape.boundary;
  return !(maxX < graph.left || minX > graph.right || maxY < graph.top || minY > graph.bottom);
}
const useClipPath: UseClipPath = (ctx) => {
  const set = (x: number, y: number, width: number, height: number) => {
    ctx.save();
    ctx.$rect(x, y, width, height);
    ctx.clip();
    // ctx.$beginPath();
  }
  const destroy = () => {
    ctx.restore();
  }
  return [set, destroy];
};
export const useGraph: UseGraph = (engineId) => {
  const engineInstance = engineById.get(engineId);
  if (graphCoreByEngineId.get(engineInstance)) return graphCoreByEngineId.get(engineInstance);
  const graph = graphByEngineId.set(engineId, setIdentify({
    translateX: 0,
    translateY: 0,
    left: 0,
    top: 0,
    right: engineById.get(engineId).engine.width,
    bottom: engineById.get(engineId).engine.height,
    zoom: 1,
  }, 'graph')).get(engineId);
  const translate = (x: number, y: number, cachePointer: Object = {}) => {
    if (!isNumber(x) || !isNumber(y)) return;
    const { clearRect, updateAllShapeToGrid, engine: { ctx, width, height } } = engineById.get(engineId);
    clearRect(graph.left, graph.top, width, height);
    ctx.translate(x, y);
    Object.assign(graph, {
      translateX: graph.translateX + x,
      translateY: graph.translateY + y,
      left: -graph.translateX,
      top: -graph.translateY,
      right: graph.left + width,
      bottom: graph.top + height
    });
    for (const elem of [...shapeById.values()]) {
      if (isShapeInScreen(elem, graph)) {
        (elem.rotateDeg && elem.draw(ctx, { x: elem.graphics.ox, y: elem.graphics.oy }, elem.rotateDeg)) || elem.draw(ctx);
      }
    }
    updateAllShapeToGrid();
  };
  const resizeCanvas = (width: number, height: number) => {
    if (!isNumber(width) || !isNumber(height)) return;
    const { engine } = engineById.get(engineId);
    const boundary = getBoundary();
    const imageData = getImageData(boundary, engine.ctx);
    setCanvasSize(engine.canvas, width, height, engine.ctx);
    Object.assign(engine, { width, height });
    engine.ctx.putImageData(imageData, boundary.minX, boundary.minY);
  };
  const clearRect = (x: number, y: number, width: number, height: number) => {
    const { engine: { ctx } } = engineById.get(engineId);
    ctx.clearRect(x, y, width, height);
  };
  const gridToGraph = (boundary: Boundary): Boundary & { width: number; height: number; } => {
    const x = boundary.minX - graphByEngineId.get(engineId).translateX,
      y = boundary.minY - graphByEngineId.get(engineId).translateY,
      width = boundary.maxX - boundary.minX,
      height = boundary.maxY - boundary.minY;
    return {
      minX: x,
      minY: y,
      width,
      height,
      maxX: x + width,
      maxY: y + height
    }
  }
  const repaintInfluencedShape = (graphics: Graphics, excludesSet: Set<Shape> = new Set()) => {
    const { engine: { ctx }, mergeGridBoundary } = engineById.get(engineId);
    const { getInfluencedGrid, getInfluencedShape } = useGrid(engineId);
    const boundary = graphicsToBoundary(graphics);
    const grids = getInfluencedGrid(boundary);
    const shapes = getInfluencedShape(boundary, grids);
    const gridClearBoundary = mergeGridBoundary(grids);
    const canvasClearBoundary = gridToGraph(gridClearBoundary);
    const [setClip, destroyClip] = useClipPath(ctx);
    setClip(canvasClearBoundary.minX, canvasClearBoundary.minY, canvasClearBoundary.width, canvasClearBoundary.height);
    clearRect(
      canvasClearBoundary.minX, // clearBoundary是grid算出来的，gird坐标永远是canvas左上角为0,0
      canvasClearBoundary.minY,
      canvasClearBoundary.width,
      canvasClearBoundary.height);
    for (const elem of shapes) {
      if (!excludesSet.has(elem)) {
        const ctx = engineById.get(engineId).engine.ctx;
        (elem.rotateDeg && elem.draw(ctx, { x: elem.graphics.ox, y: elem.graphics.oy }, elem.rotateDeg)) || elem.draw(ctx);
      }
    }
    destroyClip();
  };
  return graphCoreByEngineId.set(engineInstance, {
    translate,
    clearRect,
    resizeCanvas,
    repaintInfluencedShape
  }).get(engineInstance);
};