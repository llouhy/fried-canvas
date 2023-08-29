import { toHalfPixel } from '../utils/math';
import type { EngineCtx, OffEngineCtx } from './type';

export const moveTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldMoveTo = ctx.moveTo;
  (ctx as EngineCtx).$moveTo = oldMoveTo;
  return (x: number, y: number) => {
    const {
      drawCoordinates,
      pathCoordinates
    } = ctx;
    const halfX = toHalfPixel(x);
    const halfY = toHalfPixel(y);
    oldMoveTo.call(ctx, halfX, halfY);
    if (!drawCoordinates) return;
    const { x: transX, y: transY } = ctx.getTransform().transformPoint({ x, y });
    const point = { x: Math.round(transX), y: Math.round(transY) };
    drawCoordinates.push(point);
    pathCoordinates.push({ x: transX, y: transY });
  };
};
