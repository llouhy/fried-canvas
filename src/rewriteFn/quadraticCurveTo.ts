import { getBoundary, getTransBoundary } from '../config/common';
// import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import type { Point, EngineCtx, OffEngineCtx, Boundary } from './type';

export const quadraticCurveTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldQuadraticCurveTo = ctx.quadraticCurveTo;
  (ctx as EngineCtx).$quadraticCurveTo = oldQuadraticCurveTo;
  return (cpx: number, cpy: number, x: number, y: number): void => {
    const {
      drawCoordinates,
      pathCoordinates
      // drawOffset: { dx, dy }
    } = ctx;
    oldQuadraticCurveTo.call(ctx, cpx, cpy, x, y);
    if (!drawCoordinates) return;
    const matrix = ctx.getTransform();
    const p1 = pathCoordinates.at(-1);
    const p2 = matrix.transformPoint({ x: cpx, y: cpy });
    const p3 = matrix.transformPoint({ x, y });    
    if (!p1) {
      const points = [{ x: cpx, y: cpy }, { x, y }];
      const transBoundary = getTransBoundary(matrix, points);
      drawCoordinates.push(...[
        { x: transBoundary.minX, y: transBoundary.minY },
        { x: transBoundary.maxX, y: transBoundary.maxY }
      ]);
      pathCoordinates.push({ x: p3.x, y: p3.y });
      return;
    }
    const boundary = sumBezier2Boundary(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
    drawCoordinates.push(
      ...[
        { x: boundary.minX, y: boundary.minY },
        { x: boundary.maxX, y: boundary.maxY }
      ]
    );
    pathCoordinates.push({ x: p3.x, y: p3.y });
  };
};

const P = (x: number, y: number): Point => { return { x, y }; }
const pointOnCurve = (P1: Point, P2: Point, P3: Point, t: number): Point | false => {
  if (t <= 0 || 1 <= t || isNaN(t)) return false;
  const c1 = P(P1.x + (P2.x - P1.x) * t, P1.y + (P2.y - P1.y) * t);
  const c2 = P(P2.x + (P3.x - P2.x) * t, P2.y + (P3.y - P2.y) * t);
  return P(c1.x + (c2.x - c1.x) * t, c1.y + (c2.y - c1.y) * t);
}
const sumBezier2Boundary = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number): Boundary => {
  const P1 = P(ax, ay);
  const P2 = P(bx, by);
  const P3 = P(cx, cy);
  const tx = (P1.x - P2.x) / (P1.x - 2 * P2.x + P3.x);
  const ty = (P1.y - P2.y) / (P1.y - 2 * P2.y + P3.y);
  const Ex = pointOnCurve(P1, P2, P3, tx);
  const minX = Ex ? Math.min(P1.x, P3.x, Ex.x) : Math.min(P1.x, P3.x);
  const maxX = Ex ? Math.max(P1.x, P3.x, Ex.x) : Math.max(P1.x, P3.x);
  const Ey = pointOnCurve(P1, P2, P3, ty);
  const minY = Ey ? Math.min(P1.y, P3.y, Ey.y) : Math.min(P1.y, P3.y);
  const maxY = Ey ? Math.max(P1.y, P3.y, Ey.y) : Math.max(P1.y, P3.y);
  return { minX, minY, maxX, maxY };
}