import { Shape } from "../shape/shape";
import { getPureObject, setCanvasSize } from "../utils/common";
import { generateRandomStr } from "../utils/math";
import { setIdentify } from "../utils/setIdentify";
import { graphByEngineId } from "../init/useGraph";
import { EngineCtx } from "../rewriteFn/type";
import { InitEngineResult } from "../engineFn";
import { initContext, reloadCtxFunction } from "../init/context";

export type LayerIns = {
  id: string;
  shapes: Set<Shape>;
  index: number;
  canvas: HTMLCanvasElement;
  ctx: EngineCtx;
  isDefault: boolean;
};
type GetLayer = (o: {
  index: number;
  isDefault: boolean;
  engineInstance: InitEngineResult;
}) => LayerIns;

export const getLayer: GetLayer = (options) => {
  const { index, isDefault, engineInstance } = options;
  const initCanvas = () => {
    if (isDefault) return {
      canvas: engineInstance.engine.canvas,
      ctx: engineInstance.engine.ctx
    };
    const { engine: { width, height, canvasWrapDom, id } } = engineInstance;
    const layerCanvas = document.createElement('canvas');
    const layerCtx = initContext('2d', layerCanvas);
    const graph = graphByEngineId.get(id);
    reloadCtxFunction(layerCtx as CanvasRenderingContext2D);
    setCanvasSize(layerCanvas, width, height, layerCtx);
    layerCtx.translate(graph.translateX, graph.translateY);
    canvasWrapDom.appendChild(layerCanvas).setAttribute('style', 'position:absolute;left:0;top:0;');
    return { canvas: layerCanvas, ctx: layerCtx }
  }
  const { ctx, canvas } = initCanvas();
  return setIdentify(getPureObject({
    id: generateRandomStr(6),
    ctx,
    index,
    canvas,
    isDefault,
    shapes: new Set()
  }), 'layer');
};
