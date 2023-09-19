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
type Translate = (x: number, y: number, cachePointer: Object) => void;
type ResizeCanvas = (width: number, height: number) => void;
type ClearRect = (ctx: EngineCtx, x: number, y: number, width: number, height: number) => void;
type RepaintInfluencedShape = (graphics: Graphics, shape: Shape) => void;
export type UseGraphRes = {
  translate: Translate;
  resizeCanvas: ResizeCanvas;
  clearRect: ClearRect;
  repaintInfluencedShape: RepaintInfluencedShape;
}
export type UseGraph = (engineId: string) => UseGraphRes;
export const graphByEngineId = new Map<string, Graph>();
export const graphCoreByEngineId = new WeakMap<InitEngineResult, UseGraphRes>();
export type UseClipPath = (ctx: EngineCtx) => [
  (x: number, y: number, width: number, height: number) => void,
  () => void
];
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
  const translate: Translate = (x, y, cachePointer = {}) => {
    if (!isNumber(x) || !isNumber(y)) return;
    const { clearRect, updateAllShapeToGrid, engine: { width, height }, getAllLayer } = engineInstance;
    for (const layer of getAllLayer()) {
      clearRect(layer.ctx, graph.left, graph.top, width, height);
      layer.ctx.translate(x, y);
    }
    const translateX = graph.translateX + x,
      translateY = graph.translateY + y,
      left = -translateX,
      top = -translateY,
      right = left + width,
      bottom = top + height;
    Object.assign(graph, { translateX, translateY, left, top, right, bottom });
    for (const elem of shapeById.values()) {
      if (isShapeInScreen(elem, graph)) {
        (elem.rotateDeg && elem.draw(elem.ctx, { x: elem.graphics.ox, y: elem.graphics.oy }, elem.rotateDeg)) || elem.draw(elem.ctx);
      }
    }
    updateAllShapeToGrid();
  };
  const resizeCanvas: ResizeCanvas = (width, height) => {
    if (!isNumber(width) || !isNumber(height)) return;
    const { getAllLayer } = engineInstance;
    for (const layer of getAllLayer()) {
      const boundary = getBoundary();
      const imageData = getImageData(boundary, layer.ctx);
      setCanvasSize(layer.canvas, width, height, layer.ctx);
      Object.assign(engineInstance.engine, { width, height });
      layer.ctx.putImageData(imageData, boundary.minX, boundary.minY);
    }
  };
  const clearRect: ClearRect = (ctx, x, y, width, height) => {
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
  const repaintInfluencedShape: RepaintInfluencedShape = (graphics, shape) => {
    // console.log(shape, layersByEngine.get(engineInstance));
    const excludesSet = new Set([shape]) || new Set(), layers = [shape.layer];
    const { mergeGridBoundary } = engineById.get(engineId);
    const { getInfluencedGrid, getInfluencedShape } = useGrid(engineId);
    const boundary = graphicsToBoundary(graphics),
      grids = getInfluencedGrid(boundary),
      shapes = getInfluencedShape(boundary, { influenceGrids: grids, layerSet: new Set(layers) }),
      gridClearBoundary = mergeGridBoundary(grids),
      canvasClearBoundary = gridToGraph(gridClearBoundary),
      destroyClips = [];
    // console.log('影响的shapes', shapes);
    // console.log('canvasClearBoundary', canvasClearBoundary)
    for (const elem of layers) {
      const [setClip, destroyClip] = useClipPath(elem.ctx);
      destroyClips.push(destroyClip);
      setClip(canvasClearBoundary.minX, canvasClearBoundary.minY, canvasClearBoundary.width, canvasClearBoundary.height);
      clearRect(
        elem.ctx,
        canvasClearBoundary.minX, // clearBoundary是grid算出来的，gird坐标永远是canvas左上角为0,0
        canvasClearBoundary.minY,
        canvasClearBoundary.width,
        canvasClearBoundary.height);
    }
    for (const elem of shapes) {
      if (!excludesSet.has(elem)) {
        (elem.rotateDeg && elem.draw(elem.ctx, { x: elem.graphics.ox, y: elem.graphics.oy }, elem.rotateDeg)) || elem.draw(elem.ctx);
      }
    }
    for (const elem of destroyClips) {
      elem();
    }
  };
  return graphCoreByEngineId.set(engineInstance, {
    translate,
    clearRect,
    resizeCanvas,
    repaintInfluencedShape
  }).get(engineInstance);
};