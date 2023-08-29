import { engineById } from '../engineFn';
import type { ModelOptions } from '../graphOptions';
import type { Boundary, EngineCtx, Point } from '../rewriteFn/type';
import { Shape, getShape as getShapeIns } from '../shape/shape';
import { getGraphicsWithBorder } from '../utils/math';
import { useOffscreenCanvas } from '../utils/useOffscreen';
import { reloadCtxFunction } from './context';
import { useGrid } from './useGrid';
import { ModelDrawFuncArgs, checkParams, sumModelGraphics } from './useModel';

export type DrawShape = (shape: Shape, placePoint?: Point) => string | undefined;
export type GetShape = (id?: string) => undefined | Shape | Shape[];
export type UpdateShape = (shape: Shape, ...args: ModelDrawFuncArgs[]) => void;
export type CreateShape = (modelName: string, data?: any, model?: ModelOptions, index?: number) => Shape;
export type UseShapeRes = {
  drawShape: DrawShape;
  getShape: GetShape;
  updateShape: UpdateShape;
  createShape: CreateShape;
};
export type UseShape = (engineId: string) => UseShapeRes;

export const idToShape = new Map<string, Shape>();
export const useShape: UseShape = (
  // ctx: EngineCtx,
  engineId: string
): UseShapeRes => {
  // const coordinateStack = useCoordinateCache(engineId);
  const drawShape: DrawShape = (shape, placePoint) => {
    try {
      const { engine: { ctx } } = engineById.get(engineId);
      const { updateShapeToGrid } = useGrid(engineId);
      // console.log('drawShape', ctx.getTransform())
      const shapeId = shape.draw(ctx, placePoint);
      updateShapeToGrid(shape, shape.graphicsWithBorder);
      idToShape.set(shapeId, shape);
      return shapeId;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`create Shape error: unknown error`);
    }
  };
  const getShape: GetShape = (shapeId) => {
    if (!shapeId) {
      const result = [];
      for (const [key, val] of idToShape.entries()) {
        if (key.split(':')[0] !== engineId) continue;
        result.push(val);
      }
      return result;
    }
    return idToShape.get(shapeId);
  };
  const createShape: CreateShape = (modelName, options) => {
    const shape = getShapeIns(modelName, engineId, options?.data, options?.model, options?.index);
    return shape;
  };
  const updateShape: UpdateShape = (shape, ...args) => {
    const $model = shape.$model;
    const { engine: { width, height }, repaintInfluencedShape } = engineById.get(engineId);
    const isResize = [...$model.checkArg.checkArgMap.keys()].some(elem => ($model.checkArg.checkArgMap.get(elem) as checkParams).value !== args[elem]);
    const { updateShapeToGrid } = useGrid(shape.belongEngineId);
    if (!isResize) {
      shape.drawArgs = args;
      // shape.rotateDeg = 0;
      repaintInfluencedShape(shape.graphicsWithBorder, new Set([shape]));
      shape.draw(shape.ctx, { x: shape.graphics.ox, y: shape.graphics.oy }, shape.rotateDeg);
      updateShapeToGrid(shape, shape.graphicsWithBorder);
      return;
    }
    console.log('isResize', isResize)
    let offCanvas = useOffscreenCanvas().get(width, height);
    let offCtx = offCanvas!.getContext('2d') as OffscreenCanvasRenderingContext2D;
    reloadCtxFunction<OffscreenCanvasRenderingContext2D>(offCtx);
    const { graphics, imageData } = sumModelGraphics(offCtx, shape.$model.__draw__, ...args);
    // shape.rotateDeg = 0;
    shape._graphics = graphics;
    shape.graphics = { ...shape.graphics, width: shape._graphics.width, height: shape._graphics.height };
    shape.drawArgs = args;
    repaintInfluencedShape(shape.graphicsWithBorder || getGraphicsWithBorder(shape.graphics, shape.borderOptions), new Set([shape]));
    shape.draw(shape.ctx, { x: shape.graphics.ox, y: shape.graphics.oy }, shape.rotateDeg);
    updateShapeToGrid(shape, shape.graphicsWithBorder);
    offCanvas = null;
    offCtx = null;
  };
  return {
    createShape,
    updateShape,
    drawShape,
    getShape
  };
};
