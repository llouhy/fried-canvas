// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import { getTransBoundary } from '../config/common';
import { toHalfPixel } from '../utils/common';
import type { Point, EngineCtx, OffEngineCtx } from './type';
export const rect = (ctx: EngineCtx | OffEngineCtx) => {
  const oldRect = ctx.rect;
  (ctx as EngineCtx).$rect = oldRect;
  return (x: number, y: number, width: number, height: number) => {
    // const { set } = useLineWidthToCoordinateMap();
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    const roundWidth = Math.round(width);
    const roundHeight = Math.round(height);
    oldRect.call(ctx, toHalfPixel(x) + dx, toHalfPixel(y) + dy, roundWidth, roundHeight);
    if (!drawCoordinates) return;
    const matrix = ctx.getTransform();
    const roundX = Math.round(x);
    const roundY = Math.round(y);
    const points = [
      { x: roundX, y: roundY },
      { x: roundX + roundWidth, y: roundY },
      { x: roundX + roundWidth, y: roundY + roundHeight },
      { x: roundX, y: y + roundHeight }
    ];
    const transBoundary = getTransBoundary(matrix, points);
    drawCoordinates.push(
      ...[
        {
          x: transBoundary.minX,
          y: transBoundary.minY,
        },
        {
          x: transBoundary.maxX,
          y: transBoundary.maxY
        },
      ]
    );
    // set(ctx.lineWidth, points);
  };
};
