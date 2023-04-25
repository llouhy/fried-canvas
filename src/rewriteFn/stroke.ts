import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import type { EngineCtx, OffEngineCtx } from './type';
export const stroke = (ctx: EngineCtx | OffEngineCtx) => {
  const oldStroke = ctx.stroke;
  (ctx as EngineCtx).$stroke = oldStroke;
  return (...args: any) => {
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldStroke.apply(ctx, args);
    if (!drawCoordinates) return;
    const { getAll, clear } = useLineWidthToCoordinateMap();
    const lineWidth = ctx.lineWidth;
    if (lineWidth !== 1) {
      const mapList = getAll();
      for (const item of mapList) {
        const points = item[1];
        const dWidth = Math.ceil((lineWidth - 1) / 2);
        for (const point of points) {
          point.dWidth = dWidth;
        }
      }
    }
    clear();
  };
};
