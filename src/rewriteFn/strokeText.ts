import { getTransBoundary } from '../config/common';
import { getTextOxOy, toHalfPixel } from '../utils/math';
import type { Point, EngineCtx, OffEngineCtx } from './type';
// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
export const strokeText = (ctx: EngineCtx | OffEngineCtx) => {
  const oldStrokeText = ctx.strokeText;
  (ctx as EngineCtx).$strokeText = oldStrokeText;
  return (text: string, x: number, y: number, maxWidth?: number) => {
    // const { set, getAll, clear } = useLineWidthToCoordinateMap();
    const {
      drawCoordinates,
      // drawOffset: { dx, dy },
      // scale
    } = ctx;
    oldStrokeText.call(ctx, text, toHalfPixel(x), toHalfPixel(y), maxWidth);
    if (!drawCoordinates) return;
    const origin = getTextOxOy(x, y, text, ctx);
    const roundX = origin.x;
    const roundY = origin.y;
    const roundWidth = Math.round(ctx.measureText(text).width);
    const roundHeight = Math.round(parseInt(ctx.font) * 1.2);    
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
