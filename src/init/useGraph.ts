import { Boundary, EngineCtx } from "../rewriteFn/type";
import { isNumber } from "../utils/is";
import { idToShape } from "./useShape";
import { engineById } from "../engineFn";
import { setIdentify } from "../utils/setIdentify";
import { graphicsToBoundary, setCanvasSize } from "../utils/common";
import { Shape } from "../shape/shape";
import { Graphics } from "../graphOptions";
import { useGrid } from "./initGrid";

const graphByEngineId = new Map<string, Graph>();

type Graph = {
  translateX: number;
  translateY: number;
  zoom: number;
};
export type UseGraphRes = {
  translate: (x: number, y: number, cachePointer: Object) => void;
  resizeCanvas: (width: number, height: number) => void;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  repaintInfluencedShape: (graphics: Graphics, excludesSet: Set<Shape>) => void;
}
type UseGraph = (engineId: string) => UseGraphRes
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
  for (const elem of idToShape.values()) {
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
    imageBoundary.maxY - imageBoundary.maxY);
  return data;
};

export const useGraph: UseGraph = (engineId: string): UseGraphRes => {
  const graph: Graph = {
    translateX: 0,
    translateY: 0,
    zoom: 1,
  };
  setIdentify(graph, 'graph');
  graphByEngineId.set(engineId, graph);
  const translate = (x: number, y: number, cachePointer: Object) => {
    if (!isNumber(x) || !isNumber(y)) return;
    const { clearRect, engine: { ctx } } = engineById.get(engineId);
    const boundary = useCache<Boundary>(getBoundary)(cachePointer);
    const imageData = useCache<ImageData>(getImageData)(cachePointer, boundary, ctx);
    clearRect(boundary.minX, boundary.minY, boundary.maxX - boundary.minX, boundary.maxY - boundary.minY);
    ctx.translate(x, y);
    ctx.putImageData(imageData, boundary.minX, boundary.minY);
    // place图形
  };
  const resizeCanvas = (width: number, height: number) => {
    if (!isNumber(width) || !isNumber(height)) return;
    const { clearRect, engine } = engineById.get(engineId);
    const boundary = getBoundary();
    const imageData = getImageData(boundary, engine.ctx);
    setCanvasSize(engine.canvas, width, height);
    Object.assign(engine, { width, height })
    engine.ctx.putImageData(imageData, boundary.minX, boundary.minY);
  };
  const clearRect = (x: number, y: number, width: number, height: number) => {
    const { engine: { ctx } } = engineById.get(engineId);
    ctx.clearRect(x, y, width, height);
    ctx.save();
    ctx.strokeStyle = 'pink';
    // console.log(x, y, width, height)
    ctx.$strokeRect(x, y, width, height);
    ctx.restore();
  };
  const repaintInfluencedShape = (graphics: Graphics, excludesSet: Set<Shape> = new Set()) => {
    const { getInfluencedGrid, getInfluencedShape } = useGrid(engineId);
    const boundary = graphicsToBoundary(graphics);
    const grids = getInfluencedGrid(boundary);
    const shapes = getInfluencedShape(boundary, grids);
    const clearBoundary = grids.reduce((pre, cur) => {
      // (ctx as any).$strokeRect()
      return {
        minX: Math.min(pre.minX, cur.boundary.minX),
        minY: Math.min(pre.minY, cur.boundary.minY),
        maxX: Math.max(pre.maxX, cur.boundary.maxX),
        maxY: Math.max(pre.maxY, cur.boundary.maxY)
      }
    }, { minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity });
    clearRect(clearBoundary.minX, clearBoundary.minY, clearBoundary.maxX - clearBoundary.minX, clearBoundary.maxY - clearBoundary.minY);
    for (const item of shapes) {
      !excludesSet.has(item) && item.draw(engineById.get(engineId).engine.ctx);
    }
  };
  return { 
    translate,
    clearRect,
    resizeCanvas,
    repaintInfluencedShape
  }
};