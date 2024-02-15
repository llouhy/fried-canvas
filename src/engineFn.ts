import { Shape } from './shape/shape';
import { UseGridRes, useGrid } from './init/useGrid';
import { UseGraphRes, useGraph } from './init/useGraph';
import { generateRandomStr } from './utils/math';
import { setIdentify } from './utils/setIdentify';
import { UseShapeRes, useShape } from './init/useShape';
import { initContext, reloadCtxFunction } from './init/context';
import { UseEventRes, useEvent } from './init/useEvent';
import { UseModelRes, useModel } from './init/useModel';
import { getPureObject, microtask, omitObjectProperty, setCanvasSize, setPropertyUnWritable } from './utils/common';
import { UseConfigRes, useConfig } from './init/useConfig';
import { UseLayerRes, useLayer } from './init/useLayer';
import { presetModel } from './shape/preset';
import type { Graphics, ModelOptions } from './graphOptions';
import type { EngineCtx } from './rewriteFn/type';

export type InitEngineResult = {
  engine: {
    width: number;
    height: number;
    id: string;
    ctx: EngineCtx;
    canvas: HTMLCanvasElement;
    readonly: boolean;
    canvasWrapDom: HTMLDivElement;
    repaintInfluencedShape: (graphics: Graphics, excludes: Set<Shape>) => void;
  };
} & UseConfigRes & UseEventRes & UseGraphRes & UseShapeRes & UseGridRes & UseModelRes & UseLayerRes;
export type InitEngine = (options: EngineOptions) => InitEngineResult;

export type EngineOptions = {
  readonly?: boolean;
  id?: string;
  width?: number;
  height?: number;
  canvas?: HTMLCanvasElement | string;
  mountDom: HTMLElement;
  modelList?: ModelOptions[];
};
export type CanvasIns = {
  width: number;
  height: number;
};
export type ContextAttributes = {
  alpha: boolean;
  antialias: boolean;
  depth: boolean;
  failIfMajorPerformanceCaveat: boolean;
  powerPreference: 'default' | 'high-performance' | 'low-power';
  premultipliedAlpha: boolean;
  preserveDrawingBuffer: boolean;
  stencil: boolean;
};

const DEFAULT_CANVAS_WIDTH = 300;
const DEFAULT_CANVAS_HEIGHT = 300;
export const engineById = new Map<string, InitEngineResult>();

export const initEngine: InitEngine = (options): InitEngineResult => {
  const { id, width, height, canvas, modelList, readonly, mountDom } = options;
  const engineRes = engineById.get(id || '');
  if (engineRes) return engineRes;
  const canvasWrapDom = document.createElement('div'), canvasDom = document.createElement('canvas');
  // canvasDom.classList.add('hello');
  mountDom.innerHTML = '';
  mountDom.appendChild(canvasWrapDom).setAttribute('style', 'position:relative');
  canvasWrapDom.appendChild(canvasDom);
  const ctx: CanvasRenderingContext2D = initContext('2d', canvasDom as HTMLCanvasElement),
    _id: string = id || generateRandomStr(8),
    _readonly: boolean = readonly || false,
    _width: number = width ?? DEFAULT_CANVAS_WIDTH,
    _height: number = height ?? DEFAULT_CANVAS_HEIGHT;
  reloadCtxFunction(ctx as CanvasRenderingContext2D);
  setCanvasSize(canvasDom as HTMLCanvasElement, _width, _height, ctx);
  const engineResult = getPureObject({
    engine: getPureObject({
      ctx,
      id: _id,
      width: _width,
      height: _height,
      readonly: _readonly,
      canvas: canvasDom,
      canvasWrapDom: canvasWrapDom
    })
  });
  engineById.set(_id, setIdentify(engineResult, 'engine'));
  const coreInstance = {
    ...useLayer(_id),
    ...useModel(_id),
    ...useShape(_id),
    ...useGrid(_id),
    ...useGraph(_id),
    ...useEvent(_id),
    ...useConfig(_id)
  };
  setPropertyUnWritable(omitObjectProperty(Object.assign(engineResult, coreInstance), ['rootGrid']), Object.keys(coreInstance));
  microtask(() => {
    const { callEventCallback, createEventData, addModel } = engineResult;
    presetModel(_id);
    modelList && addModel(modelList);
    callEventCallback('after:engineInit', createEventData('after:engineInit', {
      object: engineResult,
      target: engineResult
    }));
  });
  return engineResult;
};
