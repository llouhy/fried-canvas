import type { ModelOptions } from '../graphOptions';
import type { EngineCtx, Point } from '../rewriteFn/type';
import { Shape } from '../shape/shape';

const shapeMap = new Map<string, Shape>();
export const useShape = (
  ctx: EngineCtx,
  engineId: string
): {
  drawShape: (shape: Shape, placePoint?: Point) => string | undefined;
  getShape: (id: string) => undefined | Shape;
  createShape: (modelName: string, data?: any, model?: ModelOptions, index?: number) => Shape;
} => {
  // const coordinateStack = useCoordinateCache(engineId);
  const drawShape = (shape: Shape, placePoint?: Point) => {
    try {
      const shapeId = shape.draw(ctx, engineId, placePoint);
      shapeMap.set(shapeId, shape);
      return shapeId;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn(`create Shape error: unknown error`);
    }
  };
  const getShape = (shapeId: string) => {
    return shapeMap.get(shapeId);
  };
  const createShape = (modelName: string, data?: any, model?: ModelOptions, index?: number) => {
    return new Shape(modelName, engineId, data, model, index);
  };
  return {
    createShape,
    drawShape,
    getShape
  };
};
