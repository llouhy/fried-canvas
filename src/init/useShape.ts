import { layer } from '../definition/identify';
import { LayerIns } from '../definition/layer';
import { InitEngineResult, engineById } from '../engineFn';
import type { ModelOptions } from '../graphOptions';
import type { Boundary, EngineCtx, Point } from '../rewriteFn/type';
import { Shape, getShape as getShapeIns } from '../shape/shape';
import { getGraphicsWithBorder } from '../utils/math';
import { useOffscreenCanvas } from '../utils/useOffscreen';
import { reloadCtxFunction } from './context';
import { useGrid } from './useGrid';
import { layersByEngine } from './useLayer';
import { ModelDrawFuncArgs, checkParams, sumModelGraphics } from './useModel';

export type DrawShape = (shape: Shape, placePoint?: Point) => string | undefined;
export type GetShape = (id?: string) => undefined | Shape | Shape[];
export type UpdateShape = (shape: Shape, ...args: ModelDrawFuncArgs[]) => void;
// modelName: string, data?: any, model?: ModelOptions, index?: number
export type CreateShape = (modelName: string, o?: { data?: any; model?: ModelOptions; index?: number; layer?: LayerIns; }) => Shape;
export type UseShapeRes = {
  drawShape: DrawShape;
  getShape: GetShape;
  updateShape: UpdateShape;
  createShape: CreateShape;
};
export type UseShape = (engineId: string) => UseShapeRes;

export const shapeById = new Map<string, Shape>();
export const shapeCoreByEngineId = new WeakMap<InitEngineResult, UseShapeRes>();
export const useShape: UseShape = (engineId) => {
  const engineInstance = engineById.get(engineId);
  if (shapeCoreByEngineId.get(engineInstance)) return shapeCoreByEngineId.get(engineInstance);
  const drawShape: DrawShape = (shape, placePoint) => {
    try {
      const { updateShapeToGrid } = useGrid(engineId);
      const shapeId = shape.draw(shape.ctx, placePoint);
      updateShapeToGrid(shape, shape.graphicsWithBorder);
      shapeById.set(shapeId, shape);
      return shapeId;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`create Shape error: unknown error`);
    }
  };
  const getShape: GetShape = (shapeId) => {
    if (!shapeId) {
      const result = [];
      for (const [key, val] of shapeById.entries()) {
        if (key.split(':')[0] !== engineId) continue;
        result.push(val);
      }
      return result;
    }
    return shapeById.get(shapeId);
  };
  const createShape: CreateShape = (modelName, options = {}) => {
    const shape = getShapeIns({ modelName, engineId, data: options.data, model: options.model, index: options.index });
    engineInstance.appendToLayer(shape, options.layer || layersByEngine.get(engineInstance).find(elem => elem.isDefault));
    return shape;
  };
  const updateShape: UpdateShape = (shape, ...args) => {
    const $model = shape.$model;
    const { engine: { width, height }, repaintInfluencedShape } = engineInstance;
    const isResize = [...$model.checkArg.checkArgMap.keys()].some(idx => shape.drawArgs[idx] !== args[idx]);
    const { updateShapeToGrid } = useGrid(shape.belongEngineId);
    if (!isResize) {
      shape.drawArgs = args;
      repaintInfluencedShape(shape.graphicsWithBorder, shape);
      shape.draw(shape.ctx, { x: shape.graphics.ox, y: shape.graphics.oy }, shape.rotateDeg);
      updateShapeToGrid(shape, shape.graphicsWithBorder);
      return;
    }
    let offCanvas = useOffscreenCanvas().get(width, height),
      offCtx = offCanvas!.getContext('2d') as OffscreenCanvasRenderingContext2D;
    reloadCtxFunction<OffscreenCanvasRenderingContext2D>(offCtx);
    const { graphics } = sumModelGraphics(offCtx, shape.$model.__draw__, ...args);
    shape._graphics = graphics;
    shape.graphics = { ...shape.graphics, width: shape._graphics.width, height: shape._graphics.height };
    shape.drawArgs = args;
    repaintInfluencedShape(shape.graphicsWithBorder || getGraphicsWithBorder(shape.graphics, shape.borderOptions), shape);
    shape.draw(shape.ctx, { x: shape.graphics.ox, y: shape.graphics.oy }, shape.rotateDeg);
    updateShapeToGrid(shape, shape.graphicsWithBorder);
    offCanvas = null;
    offCtx = null;
  };
  return shapeCoreByEngineId.set(engineInstance, {
    createShape,
    updateShape,
    drawShape,
    getShape
  }).get(engineInstance);
};
