import { engineById } from '../engineFn';
import { useOffscreenCanvas } from '../utils/useOffscreen';
import { reloadCtxFunction } from './context';
import { getPreciseShapeSizeInfo, getImpreciseShapeSizeInfo } from '../shape/getShapeSizeInfo';
import type { Graphics, ModelOptions } from '../graphOptions';
import type { EngineCtx, OffEngineCtx, Point } from '../rewriteFn/type';
import { setIdentify } from '../utils/setIdentify';
import { setPropertyUnWritable } from '../utils/common';
import { isCheckParams } from '../utils/is';

export type checkParams = { value: ModelDrawFuncArgs; isCheckParams: symbol };

export type ModelDrawFuncArgs = { [key: string]: any } | string | number | boolean | checkParams;

export type UseModelRes = {
  addModel: (x: ModelOptions, ...args: ModelDrawFuncArgs[]) => any;
  getModel: (name: string) => undefined | ModelOptions;
  deleteModel: (name: string) => boolean;
  updateModel: (name: string) => void;
};
export type UseModel = (engineId: string) => UseModelRes;

const modelMap = new Map<string, ModelOptions>();

export const sumModelGraphics = (ctx: EngineCtx | OffEngineCtx, drawFunc: (ctx: EngineCtx | OffEngineCtx, ...args: ModelDrawFuncArgs[]) => any, ...args: ModelDrawFuncArgs[]): {
  graphics: Graphics,
  imageData: ImageData
} => {
  const coordinates: Point[] = [];
  ctx.drawCoordinates = coordinates;
  drawFunc.apply(null, [ctx, ...args]);
  const boundary = getPreciseShapeSizeInfo(drawFunc, getImpreciseShapeSizeInfo(coordinates), ...args);
  console.log(boundary)
  ctx.drawCoordinates = null;
  return boundary;
}

export const useModel: UseModel = (
  engineId: string
): UseModelRes => {
  const prefix = engineId + ':';
  const addModel = (modelOptions: ModelOptions, ...args: ModelDrawFuncArgs[]): any => {
    const models = [modelOptions];
    const { width, height } = engineById.get(engineId)!.engine;
    const offCanvas = useOffscreenCanvas().get(width, height);
    const offCtx = offCanvas!.getContext('2d') as OffscreenCanvasRenderingContext2D;
    reloadCtxFunction<OffscreenCanvasRenderingContext2D>(offCtx);
    for (const elem of models as ModelOptions[]) {
      const { draw } = elem;
      Object.defineProperty(elem, '__draw__', {
        writable: false,
        value: draw
      });
      setIdentify(elem, 'model');
      const checkArgMap = new Map<number, ModelDrawFuncArgs>();
      const checkArgs = [];
      const modelArgs = [];
      for (const [key, item] of args.entries()) {
        if (isCheckParams(item)) {
          checkArgMap.set(key, item);
          checkArgs.push((item as checkParams).value);
          modelArgs.push((item as checkParams).value);
        } else {
          modelArgs.push(item);
        }
      }
      elem.draw = (ctx: EngineCtx | OffEngineCtx, ...args: ModelDrawFuncArgs[]) => { draw.apply(null, [ctx, ...args]); };
      modelMap.set(`${prefix}${elem.name}`, elem);
      const { graphics, imageData } = sumModelGraphics(offCtx as OffEngineCtx, draw, ...modelArgs);
      offCtx?.clearRect(0, 0, width, height);
      elem.drawArgs = modelArgs;
      elem.graphics = { ...graphics };
      elem.imageData = imageData;
      elem.checkArg = {
        checkArgs,
        checkArgMap,
        hash: JSON.stringify(checkArgs)
      };
      elem.draw(offCtx as OffEngineCtx, ...modelArgs);
    }
  };
  const updateModel = (modelName: string) => {
    const model = modelMap.get(`${prefix}${modelName}`);
  };
  const getModel = (modelName: string) => {
    return modelMap.get(`${prefix}${modelName}`);
  };
  const deleteModel = (modelName: string) => {
    return modelMap.delete(`${prefix}${modelName}`);
  };
  return {
    addModel,
    getModel,
    deleteModel,
    updateModel
  };
};
