import { isArray } from '../utils/is';
import { engineById } from '../engineFn';
import { useOffscreenCanvas } from '../utils/useOffscreen';
import { reloadCtxFunction } from './context';
import { getPreciseShapeSizeInfo, getImpreciseShapeSizeInfo } from '../shape/getShapeSizeInfo';
import type { ModelOptions } from '../graphOptions';
import type { EngineCtx, OffEngineCtx, Point } from '../rewriteFn/type';
import { setIdentify } from '../utils/setIdentify';

export type UseModelRes = {
  addModel: (x: ModelOptions | ModelOptions[]) => any;
  getModel: (name: string) => undefined | ModelOptions;
  deleteModel: (name: string) => boolean;
};
export type UseModel = (engineId: string) => UseModelRes;

const modelMap = new Map<string, ModelOptions>();
export const useModel: UseModel = (
  engineId: string
): UseModelRes => {
  const prefix = engineId + ':';
  const addModel = (modelOptions: ModelOptions | ModelOptions[]): any => {
    const models = isArray(modelOptions) ? modelOptions : [modelOptions];
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
      elem.draw = (() => {
        let isInitInfo = false;
        return (ctx: EngineCtx | OffEngineCtx, placePoint?: Point) => {
          const offset = {
            dx: placePoint && elem.graphics ? placePoint.x - elem.graphics.ox : 0,
            dy: placePoint && elem.graphics ? placePoint.y - elem.graphics.oy : 0
          };
          // console.log('ctx', ctx);
          // console.log('offset', offset)
          ctx.drawOffset = offset;
          if (!isInitInfo) {
            const coordinates: Point[] = [];
            ctx.drawCoordinates = coordinates;
            draw(ctx);
            const boundary = getPreciseShapeSizeInfo(draw, getImpreciseShapeSizeInfo(coordinates));
            // const boundary = getImpreciseShapeSizeInfo(coordinates)
            elem.graphics = { ...boundary };
            isInitInfo = true;
            ctx.drawCoordinates = null;
          } else {
            draw(ctx);
          }
        };
      })();
      modelMap.set(`${prefix}${elem.name}`, elem);
      offCtx?.clearRect(0, 0, width, height);
      elem.draw(offCtx as OffEngineCtx);
    }
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
    deleteModel
  };
};
