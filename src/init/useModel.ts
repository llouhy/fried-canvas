import { isObserve } from '../utils/is';
import { InitEngineResult, engineById } from '../engineFn';
import { useOffscreenCanvas } from '../utils/useOffscreen';
import { reloadCtxFunction } from './context';
import { getPreciseShapeSizeInfo, getImpreciseShapeSizeInfo } from '../shape/getShapeSizeInfo';
import type { Graphics, ModelOptions } from '../graphOptions';
import type { EngineCtx, OffEngineCtx, Point } from '../rewriteFn/type';
import { setIdentify } from '../utils/setIdentify';
import { useEvent } from './useEvent';
import { presetModel } from '../shape/preset';

export type checkParams = { value: ModelDrawFuncArgs; isObserve: symbol };
export type ModelDrawFuncArgs = { [key: string]: any } | string | number | boolean | checkParams;
export type AddModel = (x: ModelOptions, ...args: ModelDrawFuncArgs[]) => any;
export type GetModel = (name: string) => undefined | ModelOptions;
export type DeleteModel = (name: string) => boolean;
export type UpdateModel = (name: string) => void;
export type UseModelRes = {
  addModel: AddModel;
  getModel: GetModel;
  deleteModel: DeleteModel;
  updateModel: UpdateModel;
};
export type UseModel = (engineId: string) => UseModelRes;

const modelById = new Map<string, ModelOptions>();
const modelCoreByEngineId = new WeakMap<InitEngineResult, UseModelRes>();

export const sumModelGraphics = (ctx: EngineCtx | OffEngineCtx, drawFunc: (ctx: EngineCtx | OffEngineCtx, ...args: ModelDrawFuncArgs[]) => any, ...args: ModelDrawFuncArgs[]): {
  graphics: Graphics,
  imageData: ImageData
} => {
  const coordinates: Point[] = [];
  ctx.drawCoordinates = coordinates;
  ctx.pathCoordinates = [];
  drawFunc.apply(null, [ctx, ...args]);
  const boundary = getPreciseShapeSizeInfo(drawFunc, getImpreciseShapeSizeInfo(coordinates), ...args);
  ctx.drawCoordinates = null;
  ctx.pathCoordinates = null;
  return boundary;
}

export const useModel: UseModel = (engineId) => {
  const engineInstance = engineById.get(engineId);
  if (modelCoreByEngineId.get(engineInstance)) return modelCoreByEngineId.get(engineInstance);
  const prefix = engineId + ':';
  const addModel: AddModel = (modelOptions, ...args) => {
    const { callEventCallback, createEventData } = useEvent(engineId);
    callEventCallback('before:modelAdd', createEventData('before:modelAdd', {
      target: engineById.get(engineId),
      modelOptions: [modelOptions, ...args]
    }));
    const models = [modelOptions];
    const { width, height } = engineById.get(engineId)!.engine;
    const offCanvas = useOffscreenCanvas().get(width, height);
    const offCtx = offCanvas!.getContext('2d') as OffscreenCanvasRenderingContext2D;
    reloadCtxFunction<OffscreenCanvasRenderingContext2D>(offCtx);
    for (const elem of models as ModelOptions[]) {
      const { draw } = elem;
      setIdentify(Object.defineProperty(elem, '__draw__', {
        writable: false,
        value: draw
      }), 'model');
      const checkArgMap = new Map<number, checkParams>();
      const checkArgs: checkParams[] = [];
      const modelArgs: unknown[] = [];
      for (const [key, item] of args.entries()) {
        if (isObserve(item)) {
          checkArgMap.set(key, item as checkParams);
          checkArgs.push((item as checkParams));
          modelArgs.push((item as checkParams).value);
        } else {
          modelArgs.push(item);
        }
      }
      elem.draw = (ctx: EngineCtx | OffEngineCtx, ...args: ModelDrawFuncArgs[]) => { 
        ctx.$beginPath();
        draw.apply(null, [ctx, ...args]);
      };
      modelById.set(`${prefix}${elem.name}`, elem);
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
      callEventCallback('after:modelAdd', createEventData('after:modelAdd', {
        target: engineById.get(engineId),
        model: elem
      }));
    }
  };
  const updateModel: UpdateModel = (modelName) => {
    const model = modelById.get(`${prefix}${modelName}`);
  };
  const getModel: GetModel = (modelName) => {
    return modelById.get(`${prefix}${modelName}`);
  };
  const deleteModel: DeleteModel = (modelName) => {
    return modelById.delete(`${prefix}${modelName}`);
  };
  return modelCoreByEngineId.set(engineInstance, {
    addModel,
    getModel,
    deleteModel,
    updateModel
  }).get(engineInstance);

};
