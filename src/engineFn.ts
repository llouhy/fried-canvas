import { useModel } from './init/useModel';
import { useShape } from './init/useShape';
import { useGrid } from './init/initGrid';
import { generateRandomStr } from './config/common';
// import { _Error, isString, setCanvasSize } from './tools/utils';
import { initContext, reloadCtxFunction } from './init/context';
import type { Shape } from './shape/shape';
import type { Graphics, ModelOptions } from './graphOptions';
import type { Boundary, EngineCtx, Point } from './rewriteFn/type';
import { isString } from './utils/is';
import { getError } from './definition/error';
import { identifyMap } from './definition/identify';
import { setCanvasSize, getPureObject } from './utils/common';
import { setIdentify } from './utils/setIdentify';

export const isEngine = (value: any) => {
  return value === identifyMap.engine;
};

export type InitEngineResult = {
  engine: {
    width: number;
    height: number;
    id: string;
    ctx: EngineCtx;
    canvas: HTMLCanvasElement;
    readonly: boolean;
    repaintInfluencedShape: (graphics: Graphics) => void;
  };
  addModel: (modelList: ModelOptions[] | ModelOptions) => any;
  getModel: (modelName: string) => ModelOptions | undefined;
  deleteModel: (modelName: string) => boolean;
  createShape: (modelName: string, options?: { data?: any; model?: ModelOptions; index?: number }) => Shape;
  drawShape: (shape: Shape, placePoint?: Point) => string | undefined;
  getShape: (shapeId: string) => Shape | undefined;
  resizeCanvas: (w: number, h: number) => void;
  clearRect: (x: number, y: number, width: number, height: number) => void;
  [key: string]: any;
};
export type InitEngine = (options: EngineOptions) => InitEngineResult;

export type EngineOptions = {
  readonly?: boolean;
  id?: string;
  width?: number;
  height?: number;
  canvas: HTMLCanvasElement;
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
  const { id, width, height, canvas, modelList, readonly } = options;
  const engineRes = engineById.get(id ?? '');
  if (engineRes) return engineRes;
  const canvasDom =
    canvas instanceof HTMLCanvasElement ? canvas : isString(canvas) && document.querySelector(`#${canvas}`);
  if (!(canvasDom instanceof HTMLCanvasElement)) {
    throw getError(`Create engine instance error: can't find a canvas dom by id ${canvas}`);
  }
  const ctx: CanvasRenderingContext2D = initContext('2d', canvasDom);
  const _id: string = id ?? generateRandomStr(8);
  const _readonly: boolean = readonly ?? false;
  const _width: number = width ?? DEFAULT_CANVAS_WIDTH;
  const _height: number = height ?? DEFAULT_CANVAS_HEIGHT;

  reloadCtxFunction(ctx as CanvasRenderingContext2D, _id);
  setCanvasSize(canvasDom, _width, _height);
  const engineInstance = getPureObject({
    ctx,
    id: _id,
    width: _width,
    height: _height,
    readonly: _readonly,
    canvas: canvasDom
  });

  const { addModel: _addModel, getModel: _getModel, deleteModel: _deleteModel } = useModel(_id);
  const {
    drawShape: _drawShape,
    getShape: _getShape,
    createShape: _createShape
  } = useShape(ctx as CanvasRenderingContext2D, _id);

  const resizeCanvas = (width: number, height: number) => {
    const { ctx, width: oldWidth, height: oldHeight, canvas } = engineInstance;
    const tmpImage = ctx.getImageData(0, 0, oldWidth, oldHeight);
    setCanvasSize(canvas, width, height);
    Object.assign(engineInstance, { width, height });
    ctx.putImageData(tmpImage, 0, 0);
  };
  const addModel = (models: ModelOptions[] | ModelOptions) => {
    return _addModel(models);
  };
  const getModel = (modelName: string): ModelOptions | undefined => {
    return _getModel(modelName);
  };
  const deleteModel = (modelName: string): boolean => {
    return _deleteModel(modelName);
  };
  const drawShape = (shape: Shape, placePoint?: Point) => {
    try {
      return _drawShape(shape, placePoint);
    } catch (err) {
      throw getError(`Draw shape ${shape.$model?.name} course an error`);
    }
  };
  const getShape = (shapeId: string) => {
    return _getShape(shapeId);
  };
  const createShape = (modelName: string, options?: { data?: any; model?: ModelOptions; index?: number }) => {
    return _createShape(modelName, options?.data, options?.model, options?.index);
  };
  const clearRect = (x: number, y: number, width: number, height: number) => {
    const { ctx } = engineInstance;
    ctx.clearRect(x, y, width, height);
  };

  const engineResult = getPureObject({
    engine: engineInstance,
    addModel,
    getModel,
    deleteModel,
    drawShape,
    getShape,
    clearRect,
    createShape,
    resizeCanvas
  });
  setIdentify(engineResult, 'engine');
  engineById.set(engineResult.engine.id, engineResult);
  const { getInfluencedShape } = useGrid(_id);
  const repaintInfluencedShape = (graphics: Graphics) => {
    const boundary = {
      minX: graphics.ox,
      minY: graphics.oy,
      maxX: graphics.ox + graphics.width,
      maxY: graphics.oy + graphics.height
    };
    const shapes = getInfluencedShape(boundary);
    for (const item of shapes) {
      item.draw(ctx);
    }
    console.log('受影响的shape', shapes);
  };
  Object.defineProperty(engineInstance, 'repaintInfluencedShape', {
    value: repaintInfluencedShape,
    writable: false
  });
  _addModel(modelList ?? []);
  return engineResult;
};
