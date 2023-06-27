import type { Point, EngineCtx, OffEngineCtx } from './type';
// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import Engine from '../engine';
import { toHalfPixel } from '../utils/common';

export const lineTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldLineTo = ctx.lineTo;
  (ctx as EngineCtx).$lineTo = oldLineTo;
  return (x: number, y: number) => {
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldLineTo.call(ctx, toHalfPixel(x), toHalfPixel(y));
    if (!drawCoordinates) return;
    const { x: transX, y: transY } = ctx.getTransform().transformPoint({ x, y });
    const point = { x: Math.round(transX), y: Math.round(transY) };
    drawCoordinates.push(point);
  };
};
