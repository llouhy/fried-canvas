import { getTransBoundary } from '../config/common';
import { toHalfPixel } from '../utils/common';
import type { Point, EngineCtx, OffEngineCtx } from './type';
// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
export const strokeRect = (ctx: EngineCtx | OffEngineCtx) => {
  const oldStrokeRect = ctx.strokeRect;
  (ctx as EngineCtx).$strokeRect = oldStrokeRect;
  return (x: number, y: number, width: number, height: number) => {
    // const { set, getAll, clear } = useLineWidthToCoordinateMap();
    const {
      drawCoordinates,
      // drawOffset: { dx, dy },
      // scale
    } = ctx;
    const roundX = Math.round(x);
    const roundY = Math.round(y);
    const roundWidth = Math.round(width);
    const roundHeight = Math.round(height);
    oldStrokeRect.call(ctx, toHalfPixel(x), toHalfPixel(y), roundWidth, roundHeight);
    if (!drawCoordinates) return;
    const matrix = ctx.getTransform();
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
          dWidthX: Math.ceil(ctx.lineWidth / 2),
          dWidthY: Math.ceil(ctx.lineWidth / 2)
        },
        {
          x: transBoundary.maxX,
          y: transBoundary.maxY,
          dWidthX: Math.ceil(ctx.lineWidth / 2),
          dWidthY: Math.ceil(ctx.lineWidth / 2)
        },
      ]
    );
  };
};
