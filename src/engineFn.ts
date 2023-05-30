import { useModel } from './init/useModel';
import { useShape } from './init/useShape';
import { useGrid } from './init/initGrid';
import { generateRandomStr } from './config/common';
// import { _Error, isString, setCanvasSize } from './tools/utils';
import { initContext, reloadCtxFunction } from './init/context';
import { Shape } from './shape/shape';
import type { Graphics, ModelOptions } from './graphOptions';
import type { Boundary, EngineCtx, OffEngineCtx, Point } from './rewriteFn/type';
import { isString } from './utils/is';
import { getError } from './definition/error';
import { identifyMap } from './definition/identify';
import { setCanvasSize, getPureObject, graphicsToBoundary } from './utils/common';
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
    repaintInfluencedShape: (graphics: Graphics, excludes: Shape[]) => void;
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
  canvas: HTMLCanvasElement | string;
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
    ctx.$strokeRect(x, y, width, height);
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
  const { getInfluencedShape, getInfluencedGrid } = useGrid(_id);
  const repaintPart = (graphics: Graphics, placementMap: WeakMap<Shape, Point> = new WeakMap()) => {
    const shapes = getInfluencedShape(graphicsToBoundary(graphics));
    for (const elem of shapes) {
      elem.draw(ctx, placementMap.get(elem));
    }
  };
  const repaintInfluencedShape = (graphics: Graphics, excludes: Shape[] = []) => {
    const boundary = graphicsToBoundary(graphics);
    // (ctx as any).$strokeRect(boundary.minX, boundary.minY, boundary.maxX - boundary.minX, boundary.maxY - boundary.minY);
    // console.log('engineFn159', boundary)
    // console.log(JSON.parse(JSON.stringify(excludes[0].graphics)));
    const grids = getInfluencedGrid(boundary);
    // console.log('grids', grids)
    const shapes = getInfluencedShape(boundary, grids);
    // console.log('engineFn162', grids);
    // console.log('engineFn163', shapes)
    // console.log('shapes', shapes);
    const clearBoundary = grids.reduce((pre, cur) => {
      // console.log('griddddd', cur);
      // (ctx as any).$strokeRect()
      return {
        minX: Math.min(pre.minX, cur.boundary.minX),
        minY: Math.min(pre.minY, cur.boundary.minY),
        maxX: Math.max(pre.maxX, cur.boundary.maxX),
        maxY: Math.max(pre.maxY, cur.boundary.maxY)
      }
    }, { minX: 999999, minY: 999999, maxX: -999999, maxY: -999999 });
    // console.log('clearBound', clearBoundary)
    // console.log(clearBoundary.minX, clearBoundary.minY, clearBoundary.maxX - clearBoundary.minX, clearBoundary.maxY - clearBoundary.minY)
    clearRect(clearBoundary.minX, clearBoundary.minY, clearBoundary.maxX - clearBoundary.minX, clearBoundary.maxY - clearBoundary.minY);
    // console.log('', excludes)
    for (const item of shapes) {
      // console.log(item);
      !excludes.includes(item) && item.draw(ctx);
    }
    // console.log('受影响的shape', shapes);
  };
  Object.defineProperty(engineInstance, 'repaintInfluencedShape', {
    value: repaintInfluencedShape,
    writable: false
  });
  Object.defineProperty(engineInstance, 'repaintPart', {
    value: repaintPart,
    writable: false
  });
  _addModel(modelList ?? []);
  return engineResult;
};

(window as any)['dogdog'] =  { initEngine };

const engine = initEngine({ canvas: 'canvas', width: 1500, height: 1500 });
// console.log(engine)
const { addModel, createShape, drawShape } = engine;
const angleToRadian = (angle: number) => {
  return (Math.PI * angle) / 180;
};
const getTestModel2 = (): ModelOptions => {
  return {
    name: 'test2',
    draw: (ctx: EngineCtx | OffEngineCtx): void => {
      ctx.save();
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'pink';
      ctx.beginPath();
      ctx.moveTo(300, 60);
      ctx.lineTo(420, 420);
      ctx.closePath();
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(420, 420, 44, angleToRadian(45), angleToRadian(270));
      ctx.stroke();
      ctx.restore();
    },
    borderOptions: {
      paddingLeft: 0,
      paddingRight: 0,
      paddingTop: 0,
      paddingBottom: 0,
      borderDash: [5, 5],
      borderWidth: 2
    }
  };
};
addModel(getTestModel2());
const shape = createShape('test2');
drawShape(shape, { x: 10, y: 10 });

const getTestModel3 = () => {
  return {
    name: 'test3',
    draw: (ctx: EngineCtx | OffEngineCtx) => {
      ctx.save();
      ctx.beginPath();
      ctx.moveTo(50, 50);
      ctx.lineTo(100, 100);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }
  }
}
addModel(getTestModel3());
const shape3 = createShape('test3');
drawShape(shape3);
let idx = 0;
let id = setInterval(() => {
  // drawShape(shape, { x: idx * 3 + 50, y: idx * 3 + 50 });
  idx += 1;
  idx >= 1 && clearInterval(id);
  shape.moveTo(idx * 3 + 50, idx * 3 + 50);
}, 0);
