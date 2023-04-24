import { useLineWidthToCoordinateMap } from '../shape/coordinate';
import { radianToAngle } from '../config/common';
import type { Boundary, Point, EngineCtx, OffEngineCtx } from './type';

const getQuadrant = (angle: number): number => {
  const absAngle = angle >= 0 ? angle % 360 : 360 + (angle % 360);
  const remainder = Math.floor(absAngle / 90);
  return -remainder + 4;
};

const getAngleX = (angle: number): number => {
  const absAngle = angle >= 0 ? angle % 360 : 360 + (angle % 360);
  const quadrant = -Math.floor(absAngle / 90) + 4;
  let res;
  if (quadrant === 1) {
    res = 360 - absAngle;
  } else if (quadrant === 2) {
    res = absAngle - 180;
  } else if (quadrant === 3) {
    res = 180 - absAngle;
  } else if (quadrant === 4) {
    res = absAngle;
  }
  return res as number;
};

const getArcBoundary = (x: number, y: number, radius: number, startAngle: number, endAngle: number): Boundary => {
  let minX, maxX, minY, maxY;
  const [startQuadrant, endQuadrant] = [getQuadrant(startAngle), getQuadrant(endAngle)];
  const [startAngleX, endAngleX] = [getAngleX(startAngle), getAngleX(endAngle)];
  const startLengthX = radius * Math.cos((startAngleX * Math.PI) / 180);
  const endLengthX = radius * Math.cos((endAngleX * Math.PI) / 180);
  const startLengthY = radius * Math.sin((startAngleX * Math.PI) / 180);
  const endLengthY = radius * Math.sin((endAngleX * Math.PI) / 180);
  if (startQuadrant === 1) {
    if (endQuadrant === 2) {
      // done
      minX = x - radius;
      maxX = x + radius;
      minY = y - Math.max(startLengthY, endLengthY);
      maxY = y + radius;
    } else if (endQuadrant === 3) {
      // done
      minX = x - endLengthX;
      maxX = x + radius;
      minY = y - startLengthY;
      maxY = y + radius;
    } else if (endQuadrant === 4) {
      minX = x + Math.min(startLengthX, endLengthX);
      maxX = x + radius;
      minY = y - startLengthY;
      maxY = y + endLengthY;
    } else {
      if (startAngleX > endAngleX) {
        // normal
        minX = x + startLengthX;
        maxX = x + endLengthX;
        minY = y - startLengthY;
        maxY = y - endLengthY;
      } else {
        minX = x - radius;
        maxX = x + radius;
        minY = y - radius;
        maxY = y + radius;
      }
    }
  } else if (startQuadrant === 2) {
    if (endQuadrant === 1) {
      // done
      minX = x - startLengthX;
      maxX = x + endLengthX;
      minY = y - radius;
      maxY = y - Math.min(startLengthY, endLengthY);
    } else if (endQuadrant === 3) {
      // done
      minX = x - Math.max(startLengthX, endLengthX);
      maxX = x + radius;
      maxY = y + radius;
      minY = y - radius;
    } else if (endQuadrant === 4) {
      // done
      minX = x - startLengthX;
      maxX = x + radius;
      minY = y - radius;
      maxY = y + endLengthY;
    } else {
      if (endAngleX > startAngleX) {
        minX = x - startLengthX;
        maxX = x - endLengthX;
        maxY = y - endLengthY;
        minY = y - startLengthY;
      } else {
        minX = x - radius;
        maxX = x + radius;
        minY = y - radius;
        maxY = y + radius;
      }
    }
  } else if (startQuadrant === 3) {
    if (endQuadrant === 1) {
      // done
      minX = x - radius;
      maxX = x + endLengthX;
      minY = y - radius;
      maxY = y + startLengthY;
    } else if (endQuadrant === 2) {
      // done
      minX = x - radius;
      maxX = x - Math.min(startLengthX, endLengthX);
      minY = y - endLengthY;
      maxY = y + startLengthY;
    } else if (endQuadrant === 4) {
      // done
      minX = x - radius;
      maxX = x + radius;
      minY = y - Math.max(startLengthY, endLengthY);
      maxY = y + radius;
    } else {
      if (startAngleX > endAngleX) {
        minX = x - endLengthX;
        maxX = x - startLengthX;
        minY = y + endLengthY;
        maxY = y + startLengthY;
      } else {
        minX = x - radius;
        maxX = x + radius;
        minY = y - radius;
        maxY = y + radius;
      }
    }
  } else {
    // 4-
    if (endQuadrant === 1) {
      // done
      minX = x - radius;
      maxX = x + Math.max(startLengthX, endLengthX);
      minY = y - radius;
      maxY = y + radius;
    } else if (endQuadrant === 2) {
      // done
      minX = x - radius;
      maxX = x + startLengthX;
      minY = y - endLengthY;
      maxY = y + radius;
    } else if (endQuadrant === 3) {
      // done
      minX = x - endLengthX;
      maxX = x + startLengthX;
      minY = y + Math.min(startLengthY, endLengthY);
      maxY = y + radius;
    } else {
      if (endAngleX > startAngleX) {
        // normal
        minX = x + endLengthX;
        maxX = x + startLengthX;
        minY = y + startLengthY;
        maxY = y + endLengthY;
      } else {
        minX = x - radius;
        maxX = x + radius;
        minY = y - radius;
        maxY = y + radius;
      }
    }
  }
  return { minX, maxX, minY, maxY };
};

// const getAngleY = (absAngle): number => {}
export const arc = (ctx: EngineCtx | OffEngineCtx) => {
  const oldArc = ctx.arc;
  return (
    x: number,
    y: number,
    radius: number,
    startAngle: number,
    endAngle: number,
    counterclockwise?: boolean | undefined
  ) => {
    const {
      drawCoordinates,
      drawOffset: { dx, dy }
    } = ctx;
    oldArc.call(ctx, x + dx, y + dy, radius, startAngle, endAngle, counterclockwise);
    if (!drawCoordinates) return;
    const { set } = useLineWidthToCoordinateMap();
    let boundary!: Boundary;
    if (!((endAngle - startAngle) % 360 === 0)) {
      boundary = getArcBoundary(x, y, radius, radianToAngle(startAngle), radianToAngle(endAngle));
    } else if (endAngle > startAngle) {
      boundary = {
        minX: x - radius,
        maxX: x + radius,
        minY: y - radius,
        maxY: y + radius
      };
    }
    const point1 = { x: boundary.minX, y: boundary.minY };
    const point2 = { x: boundary.maxX, y: boundary.maxY };
    const points = [point1, point2];
    set(ctx.lineWidth, points);
    drawCoordinates.push(...points);
    // oldArc.call(ctx, x, y, radius, startAngle, endAngle, counterclockwise);
    (ctx as EngineCtx).$arc = oldArc;
  };
};
