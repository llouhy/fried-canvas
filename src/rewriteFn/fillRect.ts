import { getTransBoundary } from '../config/common';
import { toHalfPixel } from '../utils/common';
import type { Point, EngineCtx, OffEngineCtx } from './type';
export const fillRect = (ctx: EngineCtx | OffEngineCtx) => {
  const FillRect = ctx.fillRect;
  (ctx as EngineCtx).$fillRect = FillRect;
  return (x: number, y: number, width: number, height: number) => {
    const {
      drawCoordinates,
      drawOffset: { dx, dy },
      shadowBlur,
      shadowOffsetX,
      shadowOffsetY
    } = ctx;
    const roundX = toHalfPixel(x);
    const roundY = toHalfPixel(y);
    const roundWidth = Math.round(width);
    const roundHeight = Math.round(height);
    FillRect.call(ctx, roundX + dx, roundY + dy, roundWidth, roundHeight);
    if (!drawCoordinates) return;
    const matrix = ctx.getTransform();
    const points = [
      { x: roundX, y: roundY },
      { x: roundX + roundWidth, y: roundY },
      { x: roundX + roundWidth, y: roundY + roundHeight },
      { x: roundX, y: roundY + roundHeight }
    ];
    const transBoundary = getTransBoundary(matrix, points);
    // console.log('lall', JSON.parse(JSON.stringify(drawCoordinates)));
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
    console.log(JSON.parse(JSON.stringify(drawCoordinates)));
  };
};
