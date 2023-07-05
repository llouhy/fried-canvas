import { getBoundary, getTransBoundary } from '../config/common';
import type { Point, EngineCtx, OffEngineCtx, Boundary } from './type';

export const bezierCurveTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldBezierCurveTo = ctx.bezierCurveTo;
  (ctx as EngineCtx).$bezierCurveTo = oldBezierCurveTo;
  return (cp1x: number, cp1y: number, cp2x: number, cp2y: number, x: number, y: number): void => {
    const {
      drawCoordinates,
      // drawOffset: { dx, dy }
    } = ctx;
    oldBezierCurveTo.call(ctx, cp1x, cp1y, cp2x, cp2y, x, y);
    if (!drawCoordinates) return;
    const matrix = ctx.getTransform();
    const p0 = drawCoordinates.at(-1);
    const p1 = { x: cp1x, y: cp1y };
    const p2 = { x: cp2x, y: cp2y };
    const p3 = { x, y };
    // console.log();
    if (p0) {
      const boundary = sumBezier3Boundary(p0, matrix.transformPoint(p1), matrix.transformPoint(p2), matrix.transformPoint(p3));
      drawCoordinates.push(...[
        { x: boundary.minX, y: boundary.minY },
        { x: boundary.maxX, y: boundary.maxY }
      ]);
      return;
    }
    const points = [
      { x: cp1x, y: cp1y },
      { x: cp2x, y: cp2y },
      { x, y }
    ];
    const transBoundary = getTransBoundary(matrix, points);
    const transPoints = [
      { x: transBoundary.minX, y: transBoundary.minY },
      { x: transBoundary.maxX, y: transBoundary.maxY }
    ];
    drawCoordinates.push(...transPoints);
  };
};

const sumBezier3Boundary = (p0: Point, p1: Point, p2: Point, p3: Point): Boundary => {
  // debugger
  return getBoundsOfCurve(p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y);
  function getBoundsOfCurve(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    const tValues = [];
    const bounds: any = [[], []];
    const points = [];

    let a, b, c, t, t1, t2, b2ac, sqrtb2ac;
    for (let i = 0; i < 2; ++i) {
      if (i === 0) {
        b = 6 * x0 - 12 * x1 + 6 * x2;
        a = -3 * x0 + 9 * x1 - 9 * x2 + 3 * x3;
        c = 3 * x1 - 3 * x0;
      }
      else {
        b = 6 * y0 - 12 * y1 + 6 * y2;
        a = -3 * y0 + 9 * y1 - 9 * y2 + 3 * y3;
        c = 3 * y1 - 3 * y0;
      }

      if (Math.abs(a) < 1e-12) // Numerical robustness
      {
        if (Math.abs(b) < 1e-12) // Numerical robustness
        {
          continue;
        }
        t = -c / b;
        if (0 < t && t < 1) {
          tValues.push(t);
        }
        continue;
      }
      b2ac = b * b - 4 * c * a;
      sqrtb2ac = Math.sqrt(b2ac);
      if (b2ac < 0) {
        continue;
      }
      t1 = (-b + sqrtb2ac) / (2 * a);
      if (0 < t1 && t1 < 1) {
        tValues.push(t1);
      }
      t2 = (-b - sqrtb2ac) / (2 * a);
      if (0 < t2 && t2 < 1) {
        tValues.push(t2);
      }
    }

    var x, y, j = tValues.length, jLen = j, mt;
    while (j--) {
      t = tValues[j];
      mt = 1 - t;
      x = (mt * mt * mt * x0) + (3 * mt * mt * t * x1) + (3 * mt * t * t * x2) + (t * t * t * x3);
      bounds[0][j] = x;

      y = (mt * mt * mt * y0) + (3 * mt * mt * t * y1) + (3 * mt * t * t * y2) + (t * t * t * y3);
      bounds[1][j] = y;
      points[j] = { X: x, Y: y };
    }

    tValues[jLen] = 0;
    tValues[jLen + 1] = 1;
    points[jLen] = { X: x0, Y: y0 };
    points[jLen + 1] = { X: x3, Y: y3 };
    bounds[0][jLen] = x0;
    bounds[1][jLen] = y0;
    bounds[0][jLen + 1] = x3;
    bounds[1][jLen + 1] = y3;
    tValues.length = bounds[0].length = bounds[1].length = points.length = jLen + 2;

    return {
      minX: Math.min.apply(null, bounds[0]),
      minY: Math.min.apply(null, bounds[1]),
      maxX: Math.max.apply(null, bounds[0]),
      maxY: Math.max.apply(null, bounds[1]),
      // points: points, // local extremes
      // tValues: tValues // t values of local extremes
    };
  }
}
