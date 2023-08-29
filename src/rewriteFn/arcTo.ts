import type { Point, EngineCtx, OffEngineCtx } from './type';
import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import { getBoundary, getTransBoundary, getTransPoint } from '../config/common';
import { angleToRadian, getAngle, getDistanceBetween2Points, getIntersectionPoint, getLineFormulaBy2Point, getParallelLines, getPointOnLineAtDistance, getSlope, getThePointClosedToAPoint, isPointInTriangle } from '../utils/math';
import { debug } from 'webpack';

export const arcTo = (ctx: EngineCtx | OffEngineCtx) => {
  const oldArcTo = ctx.arcTo;
  (ctx as EngineCtx).$arcTo = oldArcTo;
  return (x1: number, y1: number, x2: number, y2: number, r: number) => {
    // const { set } = useLineWidthToCoordinateMap();
    const {
      drawCoordinates,
      pathCoordinates
      // drawOffset: { dx, dy }
    } = ctx;
    oldArcTo.call(ctx, x1, y1, x2, y2, r);
    if (!drawCoordinates) return;
    // debugger
    const matrix = ctx.getTransform();
    // console.log
    function getActualRadius(ctx: any, radius: number) {
      const transform = ctx.getTransform();
      const sx = Math.sqrt(transform.a * transform.a + transform.c * transform.c);
      const sy = Math.sqrt(transform.b * transform.b + transform.d * transform.d);
      const theta = Math.atan2(transform.b, transform.a);
      return Math.abs(sx * sy) * radius / Math.abs(Math.cos(theta));
    }
    const getBbox1 = () => {
      debugger;
      const [preP0, preP1, preP2] = [pathCoordinates.at(-1), { x: x1, y: y1 }, { x: x2, y: y2 }];
      const theta = getAngle(preP1.x, preP1.y, preP0.x, preP0.y, preP1.x, preP1.y, preP2.x, preP2.y) / 2;
      const distanceFromP1ToTangencyPoint = Math.round(r / Math.tan(angleToRadian(theta))); // p1到切点distance
      const [k1, k2] = [getSlope(preP1, preP0), getSlope(preP1, preP2)];
      const point1s = [getPointOnLineAtDistance(preP1.x, preP1.y, k1, distanceFromP1ToTangencyPoint, true), getPointOnLineAtDistance(preP1.x, preP1.y, k1, distanceFromP1ToTangencyPoint, false)];
      const point2s = [getPointOnLineAtDistance(preP1.x, preP1.y, k2, distanceFromP1ToTangencyPoint, true), getPointOnLineAtDistance(preP1.x, preP1.y, k2, distanceFromP1ToTangencyPoint, false)];
      const [startPoint, endPoint] = [getThePointClosedToAPoint(point1s, preP0), getThePointClosedToAPoint(point2s, preP2)];
      const pointOrigins = [getPointOnLineAtDistance(startPoint.x, startPoint.y, -1 / k1, r, true), getPointOnLineAtDistance(startPoint.x, startPoint.y, -1 / k1, r, false)];
      // const distanceP1ToArcCenterPoint = r / Math.sin(angleToRadian(theta)) - r;
      // const pointCenters = [getPointOnLineAtDistance(preP1.x, preP1.y, k1, distanceFromP1ToTangencyPoint, true), getPointOnLineAtDistance(preP1.x, preP1.y, k1, distanceFromP1ToTangencyPoint, false)];
      const originPoint = getThePointClosedToAPoint(pointOrigins, preP2);
      const pointCenters = [getPointOnLineAtDistance(originPoint.x, originPoint.y, getSlope(preP1, originPoint), r, true), getPointOnLineAtDistance(originPoint.x, originPoint.y, getSlope(preP1, originPoint), r, false)];
      const centerPoint = getThePointClosedToAPoint(pointCenters, originPoint);
      console.log('绘画三个点', { startPoint, centerPoint, endPoint });
      const transBoundary = getTransBoundary(matrix, [startPoint, endPoint, centerPoint], [startPoint, centerPoint, endPoint]);
      drawCoordinates.push(...[{ x: transBoundary.minX, y: transBoundary.minY }, { x: transBoundary.maxX, y: transBoundary.maxY }]);
      pathCoordinates.push(getTransPoint(matrix, endPoint));
      (window as any).tess = {
        x: transBoundary.minX,
        y: transBoundary.minY,
        width: transBoundary.maxX - transBoundary.minX,
        height: transBoundary.maxY - transBoundary.minY
      };
    }
    const getBbox2 = () => {
      const transRadius = getActualRadius(ctx, r);
      let transP0 = pathCoordinates.at(-1), transP1 = getTransPoint(matrix, { x: x1, y: y1 }), transP2 = getTransPoint(matrix, { x: x2, y: y2 });
      const theta = getAngle(transP1.x, transP1.y, transP0.x, transP0.y, transP1.x, transP1.y, transP2.x, transP2.y) / 2;
      const distanceFromP1ToTangencyPoint = Math.round(transRadius / Math.tan(angleToRadian(theta)));
      const k1 = getSlope(transP1, transP0), k2 = getSlope(transP1, transP2);
      const point1s = [getPointOnLineAtDistance(transP1.x, transP1.y, k1, distanceFromP1ToTangencyPoint, true), getPointOnLineAtDistance(transP1.x, transP1.y, k1, distanceFromP1ToTangencyPoint, false)];
      const point2s = [getPointOnLineAtDistance(transP1.x, transP1.y, k2, distanceFromP1ToTangencyPoint, true), getPointOnLineAtDistance(transP1.x, transP1.y, k2, distanceFromP1ToTangencyPoint, false)];
      const startPoint = getThePointClosedToAPoint(point1s, transP0);
      const endPoint = getThePointClosedToAPoint(point2s, transP2);
      const centers = [getPointOnLineAtDistance(endPoint.x, endPoint.y, -1 / k2, transRadius, true), getPointOnLineAtDistance(endPoint.x, endPoint.y, -1 / k2, transRadius, false)];
      const circleCenter = getThePointClosedToAPoint(centers, startPoint);
      // const circleCenter = getArcCenter(transP0.x, transP0.y, transP1.x, t);
      const circleLineSlope = getSlope(transP1, circleCenter); 
      const point3s = [getPointOnLineAtDistance(circleCenter.x, circleCenter.y, circleLineSlope, transRadius, true), getPointOnLineAtDistance(circleCenter.x, circleCenter.y, circleLineSlope, transRadius, false)];
      const centerPoint = getThePointClosedToAPoint(point3s, transP1);
      // const transStart = { x: startPoint.x * matrix.a, y: startPoint.y * matrix.d };
      // const transEnd = { x: endPoint.x * matrix.a, y: endPoint.y * matrix.d };
      // const transCenter = { x: centerPoint.x * matrix.a, y: centerPoint.y * matrix.d };
      const transBoundary = getTransBoundary(matrix, [startPoint, endPoint, transP1], [startPoint, endPoint, transP1]);
      // console.log(transBoundary);
      // window as any)
      (window as any).tess = {
        x: transBoundary.minX, 
        y: transBoundary.minY,
        width: transBoundary.maxX - transBoundary.minX,
        height: transBoundary.maxY - transBoundary.minY
      };
      drawCoordinates.push(...[{ x: transBoundary.minX, y: transBoundary.minY }, { x: transBoundary.maxX, y: transBoundary.maxY }]);
    }
    // debugger;
    getBbox2();
    // debugger
    // const transRadius = getActualRadius(ctx, r);
    // let transP0 = pathCoordinates.at(-1), transP1 = getTransPoint(matrix, { x: x1, y: y1 }), transP2 = getTransPoint(matrix, { x: x2, y: y2 });
    // (window as any)['testtt'] = [transP0, transP1, transP2];
    // const theta = getAngle(transP1.x, transP1.y, transP0.x, transP0.y, transP1.x, transP1.y, transP2.x, transP2.y) / 2;
    // const distanceFromP1ToTangencyPoint = Math.round(transRadius / Math.tan(angleToRadian(theta)));
    // const k1 = getSlope(transP1, transP0), k2 = getSlope(transP1, transP2);
    // const point1s = [getPointOnLineAtDistance(transP1.x, transP1.y, k1, distanceFromP1ToTangencyPoint, true), getPointOnLineAtDistance(transP1.x, transP1.y, k1, distanceFromP1ToTangencyPoint, false)];
    // const point2s = [getPointOnLineAtDistance(transP1.x, transP1.y, k2, distanceFromP1ToTangencyPoint, true), getPointOnLineAtDistance(transP1.x, transP1.y, k2, distanceFromP1ToTangencyPoint, false)];
    // const startPoint = getThePointClosedToAPoint(point1s, transP0);
    // const endPoint = getThePointClosedToAPoint(point2s, transP2);
    // const centers = [getPointOnLineAtDistance(endPoint.x, endPoint.y, -1 / k2, transRadius, true), getPointOnLineAtDistance(endPoint.x, endPoint.y, -1 / k2, transRadius, false)];
    // const circleCenter = getThePointClosedToAPoint(centers, startPoint);
    // const circleLineSlope = getSlope(transP1, circleCenter); 
    // const point3s = [getPointOnLineAtDistance(circleCenter.x, circleCenter.y, circleLineSlope, transRadius, true), getPointOnLineAtDistance(circleCenter.x, circleCenter.y, circleLineSlope, transRadius, false)];
    // const centerPoint = getThePointClosedToAPoint(point3s, transP1);
    // const transBoundary = getTransBoundary(matrix, [startPoint, endPoint, transP1], [startPoint, endPoint, transP1])
    // drawCoordinates.push(...[{ x: transBoundary.minX, y: transBoundary.minY }, { x: transBoundary.maxX, y: transBoundary.maxY }]);
    // pathCoordinates.push(endPoint);
    // (window as any)['arcTest'] = [circleCenter, startPoint, centerPoint, endPoint];
  };
};
