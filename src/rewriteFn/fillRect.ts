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
    FillRect.call(ctx, x + dx, y + dy, width, height);
    if (!drawCoordinates) return;
    const boundary = {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
    console.log(shadowOffsetX, shadowOffsetY)
    const shadowBoundary = {
      minX: x + shadowOffsetX - shadowBlur / 2,
      minY: y + shadowOffsetY - shadowBlur / 2,
      maxX: x + shadowOffsetX + width + shadowBlur / 2,
      maxY: y + shadowOffsetY + height + shadowBlur / 2
    };
    // console.log([
    //   { x: Math.min(boundary.minX, shadowBoundary.minX), y: Math.min(boundary.minY, shadowBoundary.minY) },
    //   { x: Math.max(boundary.maxX, shadowBoundary.maxX), y: Math.max(boundary.maxY, shadowBoundary.maxY) },
    // ])
    const { a: scaleX, b: skewX, c: skewY, d: scaleY, e: tx, f: ty } = ctx.getTransform();
    drawCoordinates.push(
      ...[
        {
          x: Math.min(boundary.minX, shadowBoundary.minX),
          y: Math.min(boundary.minY, shadowBoundary.minY),
          dWidthX: tx,
          dWidthY: ty
        },
        {
          x: Math.max(boundary.maxX, shadowBoundary.maxX),
          y: Math.max(boundary.maxY, shadowBoundary.maxY),
          dWidthX: tx,
          dWidthY: ty
        },
      ]
    );
  };
};
