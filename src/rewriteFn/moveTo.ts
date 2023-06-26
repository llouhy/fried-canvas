import { toHalfPixel } from '../utils/common';
import type { Point, EngineCtx, OffEngineCtx } from './type';
// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
export const moveTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldMoveTo = ctx.moveTo;
  (ctx as EngineCtx).$moveTo = oldMoveTo;
  return (x: number, y: number) => {
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldMoveTo.call(ctx, toHalfPixel(x) + dx, toHalfPixel(y) + dy);
    if (!drawCoordinates) return;
    const { x: transX, y: transY } = ctx.getTransform().transformPoint({ x, y });
    const point = { x: Math.round(transX), y: Math.round(transY) };
    drawCoordinates.push(point);
  };
};
