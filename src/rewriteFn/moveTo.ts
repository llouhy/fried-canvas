import type { Point, EngineCtx, OffEngineCtx } from './type';
import { useLineWidthToCoordinateMap } from '../shape/coordinate';
export const moveTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldMoveTo = ctx.moveTo;
  (ctx as EngineCtx).$moveTo = oldMoveTo;
  return (x: number, y: number) => {
    const { set } = useLineWidthToCoordinateMap();
    const point = { x, y };
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldMoveTo.call(ctx, x + dx, y + dy);
    if (!drawCoordinates) return;
    drawCoordinates.push(point);
    set(ctx.lineWidth, [point]);
  };
};
