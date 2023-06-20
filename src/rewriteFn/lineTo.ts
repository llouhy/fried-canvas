import type { Point, EngineCtx, OffEngineCtx } from './type';
// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import Engine from '../engine';

export const lineTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldLineTo = ctx.lineTo;
  (ctx as EngineCtx).$lineTo = oldLineTo;
  return (x: number, y: number) => {
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldLineTo.call(ctx, x + dx, y + dy);
    if (!drawCoordinates) return;
    // const { set } = useLineWidthToCoordinateMap();
    const point = { x, y };

    drawCoordinates.push(point);
    // set(ctx.lineWidth, [point]);
  };
};
