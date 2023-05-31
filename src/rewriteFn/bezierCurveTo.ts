import { getBoundary } from '../config/common';
import type { Point, EngineCtx, OffEngineCtx } from './type';
import { useLineWidthToCoordinateMap } from '../shape/coordinate';

export const bezierCurveTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldBezierCurveTo = ctx.bezierCurveTo;
  (ctx as EngineCtx).$bezierCurveTo = oldBezierCurveTo;
  return (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void => {
    const { set } = useLineWidthToCoordinateMap();
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldBezierCurveTo.call(ctx, cp1x + dx, cp1y + dy, cp2x + dx, cp2y + dy, x + dx, y + dy);
    if (!drawCoordinates) return;
    const prePoint = drawCoordinates.at(-1);
    if (prePoint) {
      const { minX, minY, maxX, maxY } = getBoundary(
        [
          { x: prePoint.x, y: prePoint.y },
          { x, y }
        ],
        [
          { x: cp1x, y: cp1y },
          { x: cp2x, y: cp2y }
        ],
        ctx
      );
      const points = [
        { x: minX, y: minY },
        { x: maxX, y: maxY }
      ];
      console.log({ minX, minY, maxX, maxY })
      drawCoordinates.push(...points);
      set(ctx.lineWidth, points);
    } else {
      const points = [
        { x: cp1x, y: cp1y },
        { x: cp2x, y: cp2y },
        { x, y }
      ];
      console.log([...points])
      drawCoordinates.push(...points);
      set(ctx.lineWidth, points);
    }
  };
};
