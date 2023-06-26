import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import type { Point, EngineCtx, OffEngineCtx } from './type';
export const rect = (ctx: EngineCtx | OffEngineCtx) => {
  const oldRect = ctx.rect;
  (ctx as EngineCtx).$rect = oldRect;
  return (x: number, y: number, width: number, height: number) => {
    const { set } = useLineWidthToCoordinateMap();
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldRect.call(ctx, x + dx, y + dy, width, height);
    if (!drawCoordinates) return;
    const boundary = {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
    const points = [
      { x: boundary.minX, y: boundary.minY },
      { x: boundary.maxX, y: boundary.maxY }
    ];
    drawCoordinates.push(...points);
    set(ctx.lineWidth, points);
  };
};
