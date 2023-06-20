import type { Point, EngineCtx, OffEngineCtx } from './type';
// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
export const strokeRect = (ctx: EngineCtx | OffEngineCtx) => {
  const oldStrokeRect = ctx.strokeRect;
  (ctx as EngineCtx).$strokeRect = oldStrokeRect;
  return (x: number, y: number, width: number, height: number) => {
    // const { set, getAll, clear } = useLineWidthToCoordinateMap();
    const {
      drawCoordinates,
      drawOffset: { dx, dy },
      // scale
    } = ctx;
    oldStrokeRect.call(ctx, x + dx, y + dy, width, height);
    if (!drawCoordinates) return;
    const boundary = {
      minX: x,
      minY: y,
      maxX: x + width,
      maxY: y + height
    };
    const { a: scaleX, b: skewX, c: skewY, d: scaleY, e: tx, f: ty } = ctx.getTransform();
    const points = [
      {
        x: boundary.minX,
        y: boundary.minY,
        dWidthX: Math.ceil((ctx.lineWidth - 1) / 2) + tx, 
        dWidthY: Math.ceil((ctx.lineWidth - 1) / 2) + ty 
      },
      { 
        x: boundary.maxX, 
        y: boundary.maxY, 
        dWidthX: Math.ceil((ctx.lineWidth - 1) / 2) + tx, 
        dWidthY: Math.ceil((ctx.lineWidth - 1) / 2) + ty
      }
    ];
    // console.log(points)
    // const points = [
    //   { x: boundary.minX, y: boundary.minY },
    //   { x: boundary.maxX, y: boundary.maxY }
    // ];
    drawCoordinates.push(...points);
    // set(ctx.lineWidth, points);
  };
};
