import { engineById } from '../engineFn';
import type { ModelOptions } from '../graphOptions';
import type { Boundary, EngineCtx, Point } from '../rewriteFn/type';
import { Shape, getShape as getShapeIns } from '../shape/shape';
import { useGrid } from './useGrid';

export type UseShapeRes = {
  drawShape: (shape: Shape, placePoint?: Point) => string | undefined;
  getShape: (id?: string) => undefined | Shape | Shape[];
  createShape: (modelName: string, data?: any, model?: ModelOptions, index?: number) => Shape;
};
export type UseShape = (engineId: string) => UseShapeRes;

export const idToShape = new Map<string, Shape>();
export const useShape: UseShape = (
  // ctx: EngineCtx,
  engineId: string
): UseShapeRes => {
  // const coordinateStack = useCoordinateCache(engineId);
  const drawShape = (shape: Shape, placePoint?: Point) => {
    try {
      const { engine: { ctx } } = engineById.get(engineId);
      const { updateShapeToGrid } = useGrid(engineId);
      const shapeId = shape.draw(ctx, placePoint);
      updateShapeToGrid(shape, shape.graphicsWithBorder);
      idToShape.set(shapeId, shape);
      return shapeId;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`create Shape error: unknown error`);
    }
  };
  const getShape = (shapeId?: string) => {
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
  const createShape = (modelName: string, options: { data?: any; model?: ModelOptions; index?: number }) => {
    // console.log('createShape')
    // const shape = new Shape(modelName, engineId, options?.data, options?.model, options?.index);
    const shape = getShapeIns(modelName, engineId, options?.data, options?.model, options?.index);
    // idToShape.set(shape.id, shape);
    return shape;
  };
  return {
    createShape,
    drawShape,
    getShape
  };
};
