import useRewriteCtxFunction from './rewriteFn';
import { getDefaultContextAttribute } from './config/common';
import { useModelCache } from './config/useModel';
import { useCoordinateCache } from './shape/coordinate';
import { quadraticCurveTo } from './rewriteFn/quadraticCurveTo';
import { bezierCurveTo } from './rewriteFn/bezierCurveTo';
import type { ModelCache } from './config/useModel';
import type { ModelOptions } from './graphOptions';
import type { Shape } from './shape/shape';
import type { EngineCtx } from './rewriteFn/type';
import { generateRandomStr } from './utils/math';

export type EngineOptions = {
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

export const idToEngineMap = new Map<string, Engine>();

export default class Engine {
  private id: string;
  private _width = 300;
  private _height = 300;
  readonly = false;
  get width() {
    return this._width;
  }
  set width(val: number) {
    this._width = val;
    if (this.canvasIns) {
      this.canvasIns.setAttribute('width', this._width + '');
    }
  }
  get height() {
    return this._height;
  }
  set height(val: number) {
    this._height = val;
    if (this.canvasIns) {
      this.canvasIns.setAttribute('height', this._height + '');
    }
  }
  ctx!: EngineCtx;
  canvasIns!: HTMLCanvasElement;
  modelLibrary: ModelOptions[] = [];
  modelMap: Map<string, ModelOptions> = new Map();
  shapeMap: Map<string, Shape> = new Map();

  constructor(options: EngineOptions) {
    const { id, width, height, canvas, modelList } = options;
    if (!(canvas instanceof HTMLCanvasElement)) {
      throw new Error(' $o.canvas not a HTMLCanvasElement');
    }
    this.id = id ?? generateRandomStr(8);
    this.width = width ?? this.width;
    this.height = height ?? this.height;
    const { modelLibrary, modelMap } = useModelCache() as ModelCache;
    this.modelLibrary = modelLibrary;
    this.modelMap = modelMap;
    this.addModel(modelList ?? []);
    this.canvasIns = canvas;
    this.canvasIns?.setAttribute('id', this.id);
    this.canvasIns?.setAttribute('width', this.width + '');
    this.canvasIns?.setAttribute('height', this.height + '');
    idToEngineMap.set(this.id, this);
  }

  start(contextType: '2d', contextAttributes?: ContextAttributes): EngineCtx {
    if (!this.canvasIns) {
      throw new Error('$o.canvas not a HTMLCanvasElement, call the function reInitCanvas');
    }
    this.ctx = this.canvasIns.getContext(contextType, {
      ...getDefaultContextAttribute(),
      ...contextAttributes
    }) as EngineCtx;
    this.reloadCtxFunction();
    return this.ctx;
  }

  reloadCtxFunction() {
    const coordinateStack = useCoordinateCache(this.id);
    const { arc, arcTo, rect, fillRect, strokeRect, moveTo, lineTo, stroke, beginPath } = useRewriteCtxFunction();
    this.ctx.arc = arc(this.ctx);
    this.ctx.arcTo = arcTo(this.ctx);
    this.ctx.rect = rect(this.ctx);
    this.ctx.fillRect = fillRect(this.ctx);
    this.ctx.strokeRect = strokeRect(this.ctx);
    this.ctx.moveTo = moveTo(this.ctx);
    this.ctx.lineTo = lineTo(this.ctx);
    this.ctx.quadraticCurveTo = quadraticCurveTo(this.ctx);
    this.ctx.bezierCurveTo = bezierCurveTo(this.ctx);
    this.ctx.stroke = stroke(this.ctx);
    this.ctx.beginPath = beginPath(this.ctx);
  }

  reInitCanvas(canvas: HTMLCanvasElement) {
    this.canvasIns = canvas;
    this.resizeCanvas(this.width, this.height);
  }

  resizeCanvas(width: number, height: number) {
    const tmpImage = this.ctx.getImageData(0, 0, this.canvasIns.width, this.canvasIns.height);
    this.width = width;
    this.height = height;
    this.ctx.putImageData(tmpImage, 0, 0);
  }

  addModel = (modelOptions: ModelOptions | ModelOptions[]): { repeat: ModelOptions[]; success: ModelOptions[] } => {
    let list: ModelOptions[] = [];
    const repeat: ModelOptions[] = [];
    const success: ModelOptions[] = [];
    if (Array.isArray(modelOptions)) {
      list = modelOptions;
    } else {
      list.push(modelOptions);
    }
    for (const item of list) {
      if (this.modelMap.get(item.name)) {
        repeat.push(item);
      }
      const { name } = item;
      this.modelLibrary.push(item);
      this.modelMap.set(name, item);
      success.push(item);
    }
    return {
      repeat,
      success
    };
  };

  getModel = (name?: string): ModelOptions | undefined | ModelOptions[] => {
    if (name) {
      return this.modelMap.get(name);
    } else {
      return this.modelLibrary;
    }
  };

  deleteModel = (name: string) => {
    const model = this.modelMap.get(name);
    if (model) {
      this.modelMap.delete(name);
      for (const [idx, item] of this.modelLibrary.entries()) {
        if (item.name === name) {
          this.modelLibrary.splice(idx, 1);
          break;
        }
      }
    }
  };

  createShape = (shape: Shape) => {
    try {
      shape.draw(this.ctx as EngineCtx);
      const shapeId = shape.id;
      this.shapeMap.set(shapeId, shape);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`create Shape error: unknown error`);
    }
  };

  getShape = (id: string): Shape | undefined => {
    return this.shapeMap.get(id);
  };
}
