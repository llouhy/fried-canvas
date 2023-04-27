import type { ModelOptions } from '../graphOptions';
import type { Boundary, EngineCtx, Point } from '../rewriteFn/type';
import { Shape } from '../shape/shape';

export const idToShape = new Map<string, Shape>();
export const useShape = (
  ctx: EngineCtx,
  engineId: string
): {
  drawShape: (shape: Shape, placePoint?: Point) => string | undefined;
  getShape: (id?: string) => undefined | Shape | Shape[];
  createShape: (modelName: string, data?: any, model?: ModelOptions, index?: number) => Shape;
} => {
  // const coordinateStack = useCoordinateCache(engineId);
  const drawShape = (shape: Shape, placePoint?: Point) => {
    try {
      const shapeId = shape.draw(ctx, placePoint);
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
  const createShape = (modelName: string, data?: any, model?: ModelOptions, index?: number) => {
    const shape = new Shape(modelName, engineId, data, model, index);
    idToShape.set(shape.id, shape);
    return shape;
  };
  return {
    createShape,
    drawShape,
    getShape
  };
};
