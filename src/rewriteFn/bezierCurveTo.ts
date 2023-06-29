import { getBoundary, getTransBoundary } from '../config/common';
import type { Point, EngineCtx, OffEngineCtx } from './type';

export const bezierCurveTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldBezierCurveTo = ctx.bezierCurveTo;
  (ctx as EngineCtx).$bezierCurveTo = oldBezierCurveTo;
  return (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void => {
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldBezierCurveTo.call(ctx, cp1x, cp1y, cp2x, cp2y, x, y);
    if (!drawCoordinates) return;
    const matrix = ctx.getTransform();
    const points = [
      { x: cp1x, y: cp1y },
      { x: cp2x, y: cp2y },
      { x, y }
    ];
    const transBoundary = getTransBoundary(matrix, points);
    const transPoints = [
      { x: transBoundary.minX, y: transBoundary.minY },
      { x: transBoundary.maxX, y: transBoundary.maxY }
    ];
    drawCoordinates.push(...transPoints);
  };
};
