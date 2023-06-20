// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import type { EngineCtx, OffEngineCtx } from './type';
export const stroke = (ctx: EngineCtx | OffEngineCtx) => {
  const oldStroke = ctx.stroke;
  (ctx as EngineCtx).$stroke = oldStroke;
  return (...args: any) => {
    const {
      // scale,
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldStroke.apply(ctx, args);
    if (!drawCoordinates) return;
    const { a: scaleX, b: skewX, c: skewY, d: scaleY, e: tx, f: ty } = ctx.getTransform();
    const { lineWidth, shadowBlur, shadowOffsetX, shadowOffsetY } = ctx;
    // console.log(ctx.getTransform())
    console.log(JSON.parse(JSON.stringify(drawCoordinates)), ctx.getTransform());
    for (const [key, point] of drawCoordinates.entries()) {
      if ('dWidthX' in point || 'dWidthY' in point) continue;
      // point.x = point.x + tx;
      // point.y = point.y + ty;
      point.x = point.x;
      point.y = point.y;
      point.key = key;
      point.dWidth = Math.ceil((lineWidth - 1) / 2) + Math.max(tx, ty);
    }
    // console.log('strokeScale', scale);
    return;
    // const { getAll, clear } = useLineWidthToCoordinateMap();
    // const { lineWidth, shadowBlur, shadowOffsetX, shadowOffsetY } = ctx;
    // if (lineWidth !== 1) {
    //   const mapList = getAll();
    //   for (const item of mapList) {
    //     const points = item[1];
    //     const dWidth = Math.ceil((lineWidth - 1) / 2);
    //     for (const point of points) {
    //       point.dWidth = dWidth;
    //     }
    //   }
    // }
    // clear();
  };
};
