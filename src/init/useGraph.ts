import { useGrid } from "./useGrid";
import { Shape } from "../shape/shape";
import { isNumber } from "../utils/is";
import { shapeById } from "./useShape";
import { InitEngineResult, engineById } from "../engineFn";
import { Graphics } from "../graphOptions";
import { setCanvasSize } from "../utils/common";
import { setIdentify } from "../utils/setIdentify";
import { graphicsToBoundary } from "../utils/math";
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
export const useGraph: UseGraph = (engineId) => {
  const engineInstance = engineById.get(engineId);
  if (graphCoreByEngineId.get(engineInstance)) return graphCoreByEngineId.get(engineInstance);
  graphByEngineId.set(engineId, setIdentify({
    translateX: 0,
    translateY: 0,
    left: 0,
    top: 0,
    right: engineById.get(engineId).engine.width,
    bottom: engineById.get(engineId).engine.height,
    zoom: 1,
  }, 'graph'));
  const translate = (x: number, y: number, cachePointer: Object = {}) => {
    if (!isNumber(x) || !isNumber(y)) return;
    const { clearRect, updateAllShapeToGrid, engine: { ctx, width, height } } = engineById.get(engineId);
    const graph = graphByEngineId.get(engineId);
    const boundary = useCache<Boundary>(getBoundary)(cachePointer);
    const imageData = useCache<ImageData>(getImageData)(cachePointer, boundary, ctx);
    clearRect(graph.left, graph.top, width, height);
    ctx.translate(x, y);
    graph.translateX = graph.translateX + x;
    graph.translateY = graph.translateY + y;
    graph.left = -graph.translateX;
    graph.top = -graph.translateY;
    graph.right = graph.left + width;
    graph.bottom = graph.top + height;
    [...shapeById.values()].forEach(elem => {
      if (isShapeInScreen(elem, graph)) {
        (elem.rotateDeg && elem.draw(ctx, { x: elem.graphics.ox, y: elem.graphics.oy }, elem.rotateDeg)) || elem.draw(ctx);
      }
    });
    updateAllShapeToGrid();
  };
  const resizeCanvas = (width: number, height: number) => {
    if (!isNumber(width) || !isNumber(height)) return;
    const { clearRect, engine } = engineById.get(engineId);
    const boundary = getBoundary();
    const imageData = getImageData(boundary, engine.ctx);
    setCanvasSize(engine.canvas, width, height, engine.ctx);
    Object.assign(engine, { width, height })
    engine.ctx.putImageData(imageData, boundary.minX, boundary.minY);
  };
  const clearRect = (x: number, y: number, width: number, height: number) => {
    const { engine: { ctx } } = engineById.get(engineId);
    ctx.clearRect(x, y, width, height);
    ctx.save();
    ctx.strokeStyle = 'pink';
    ctx.restore();
  };
  const repaintInfluencedShape = (graphics: Graphics, excludesSet: Set<Shape> = new Set()) => {
    const { engine: { ctx } } = engineById.get(engineId);
    const graph = graphByEngineId.get(engineId);
    const { getInfluencedGrid, getInfluencedShape } = useGrid(engineId);
    const boundary = graphicsToBoundary(graphics);
    const grids = getInfluencedGrid(boundary);
    const shapes = getInfluencedShape(boundary, grids);
    const clearBoundary = grids.reduce((pre, cur) => {
      return {
        minX: Math.min(pre.minX, cur.boundary.minX),
        minY: Math.min(pre.minY, cur.boundary.minY),
        maxX: Math.max(pre.maxX, cur.boundary.maxX),
        maxY: Math.max(pre.maxY, cur.boundary.maxY)
      }
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    clearRect(
      clearBoundary.minX - graph.translateX, // clearBoundary是grid算出来的，gird坐标永远是canvas左上角为0,0
      clearBoundary.minY - graph.translateY,
      clearBoundary.maxX - clearBoundary.minX,
      clearBoundary.maxY - clearBoundary.minY);
    for (const elem of shapes) {
      if (!excludesSet.has(elem)) {
        const ctx = engineById.get(engineId).engine.ctx;
        (elem.rotateDeg && elem.draw(ctx, { x: elem.graphics.ox, y: elem.graphics.oy }, elem.rotateDeg)) || elem.draw(ctx);
        ctx.save();
        ctx.strokeStyle = 'blue';
        ctx.$strokeRect(elem.graphicsWithBorder.ox, elem.graphicsWithBorder.oy, elem.graphicsWithBorder.width, elem.graphicsWithBorder.height);
        ctx.restore();
        // elem.draw(ctx);
      }
      if (elem.$model.name === 'test1' && excludesSet.has(elem)) {
        ctx.$strokeRect(clearBoundary.minX - graph.translateX, // clearBoundary是grid算出来的，gird坐标永远是canvas左上角为0,0
          clearBoundary.minY - graph.translateY,
          clearBoundary.maxX - clearBoundary.minX,
          clearBoundary.maxY - clearBoundary.minY);
      }
    }
  };
  return graphCoreByEngineId.set(engineInstance, {
    translate,
    clearRect,
    resizeCanvas,
    repaintInfluencedShape
  }).get(engineInstance);
};