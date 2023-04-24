import type { Point, EngineCtx, OffEngineCtx } from './type';
export const fillRect = (ctx: EngineCtx | OffEngineCtx) => {
  const FillRect = ctx.fillRect;
  (ctx as EngineCtx).$fillRect = FillRect;
  return (x: number, y: number, width: number, height: number) => {
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    FillRect.call(ctx, x + dx, y + dy, width, height);
    if (!drawCoordinates) return;
    const boundary = {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };

    drawCoordinates.push(
      ...[
        { x: boundary.minX, y: boundary.minY },
        { x: boundary.maxX, y: boundary.maxY }
      ]
    );
  };
};
