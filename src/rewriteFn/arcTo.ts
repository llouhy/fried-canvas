import type { Point, EngineCtx, OffEngineCtx } from './type';
import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import { getBoundary } from '../config/common';

export const arcTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldArcTo = ctx.arcTo;
  (ctx as EngineCtx).$arcTo = oldArcTo;
  return (x1: number, y1: number, x2: number, y2: number, r: number) => {
    const { set } = useLineWidthToCoordinateMap();
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldArcTo.call(ctx, x1 + dx, y1 + dy, x2 + dx, y2 + dy, r);
    if (!drawCoordinates) return;
    const prePoint = drawCoordinates.at(-1);
    let point1 = { x: x1, y: y1 };
    let point2 = { x: x2, y: y2 };
    if (prePoint) {
      const { minX, minY, maxX, maxY } = getBoundary(
        [
          { x: prePoint.x, y: prePoint.y },
          { x: x2, y: y2 }
        ],
        [{ x: x1, y: y1 }],
        ctx
      );
      point1 = { x: minX, y: minY };
      point2 = { x: maxX, y: maxY };
    }
    const points = [point1, point2];
    drawCoordinates.push(...points);
    set(ctx.lineWidth, points);
  };
};
