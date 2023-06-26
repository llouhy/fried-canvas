import { getBoundary, getTransBoundary } from '../config/common';
// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import type { Point, EngineCtx, OffEngineCtx } from './type';

export const quadraticCurveTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldQuadraticCurveTo = ctx.quadraticCurveTo;
  (ctx as EngineCtx).$quadraticCurveTo = oldQuadraticCurveTo;
  return (cpx: number, cpy: number, x: number, y: number): void => {
    // const { set } = useLineWidthToCoordinateMap();
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldQuadraticCurveTo.call(ctx, cpx + dx, cpy + dy, x + dx, y + dy);
    if (!drawCoordinates) return;
    const prePoint = drawCoordinates.at(-1);
    let point1 = { x: cpx, y: cpy };
    let point2 = { x: x, y: y };
    // if (prePoint) {
    //   const { minX, minY, maxX, maxY } = getBoundary(
    //     [
    //       { x, y },
    //       { x: prePoint.x, y: prePoint.y }
    //     ],
    //     [{ x: cpx, y: cpy }],
    //     ctx
    //   );
    //   point1 = { x: minX, y: minY };
    //   point2 = { x: maxX, y: maxY };
    // }
    const points = [
      { x: point1.x, y: point1.y },
      { x: point2.x, y: point1.y },
      { x: point2.x, y: point2.y },
      { x: point1.x, y: point2.y }
    ];
    const transBoundary = getTransBoundary(ctx.getTransform(), points);
    drawCoordinates.push(
      ...[
        {
          x: transBoundary.minX,
          y: transBoundary.minY
        },
        {
          x: transBoundary.maxX,
          y: transBoundary.maxY
        },
      ]);
    // set(ctx.lineWidth, points);
  };
};
