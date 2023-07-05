// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import type { EngineCtx, OffEngineCtx } from './type';
export const stroke = (ctx: EngineCtx | OffEngineCtx) => {
  const oldStroke = ctx.stroke;
  (ctx as EngineCtx).$stroke = oldStroke;
  return (...args: any) => {
    const {
      // scale,
      drawCoordinates,
      // drawOffset: { dx, dy }
    } = ctx;
    oldStroke.apply(ctx, args);
    if (!drawCoordinates) return;
    const { lineWidth, shadowBlur, shadowOffsetX, shadowOffsetY } = ctx;
    for (const [key, point] of drawCoordinates.entries()) {
      if ('dWidthX' in point || 'dWidthY' in point) continue;
      point.dWidthX = Math.ceil((lineWidth - 1) / 2);
      point.dWidthY = Math.ceil((lineWidth - 1) / 2);
    }
    return;
  };
};
