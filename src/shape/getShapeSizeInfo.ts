import type { Boundary, Point } from '../rewriteFn/type';
import { getPureObject } from '../utils/common';
const getInitBoundary = () => {
  return getPureObject({
    minX: 999999,
    maxX: -999999,
    minY: 999999,
    maxY: -999999
  });
};
export const getImpreciseShapeSizeInfo = (
  coordinateStack: Point[]
): {
  ox: number;
  oy: number;
  width: number;
  height: number;
} => {
  const preBoundary: Boundary = getInitBoundary();
  const boundToLineWidth = new Map<keyof Boundary, number>();
  for (const item of coordinateStack) {
    const { x, y, dWidth } = item; // the difference of stroke lineWidth and 1px
    if (preBoundary.minX > x) {
      preBoundary.minX = x;
      boundToLineWidth.set('minX', dWidth ?? 0);
    }
    if (preBoundary.maxX < x) {
      preBoundary.maxX = x;
      boundToLineWidth.set('maxX', dWidth ?? 0);
    }
    if (preBoundary.minY > y) {
      preBoundary.minY = y;
      boundToLineWidth.set('minY', dWidth ?? 0);
    }
    if (preBoundary.maxY < y) {
      preBoundary.maxY = y;
      boundToLineWidth.set('maxY', dWidth ?? 0);
    }
  }
  // let boundary = { ...preBoundary };
  const boundary = {
    minX: preBoundary.minX - (boundToLineWidth.get('minX') ?? 0),
    maxX: preBoundary.maxX + (boundToLineWidth.get('maxX') ?? 0),
    minY: preBoundary.minY - (boundToLineWidth.get('minY') ?? 0),
    maxY: preBoundary.maxY + (boundToLineWidth.get('maxY') ?? 0)
  };
  return {
    ox: boundary.minX,
    oy: boundary.minY,
    width: boundary.maxX - boundary.minX,
    height: boundary.maxY - boundary.minY
  };
};

export const getPreciseShapeSizeInfo = (
  drawFunc: any,
  info: { ox: number; oy: number; width: number; height: number }
) => {
  const { ox, oy, width, height } = info;
  const canvasWidth = ox + width + 4;
  const canvasHeight = oy + height + 4;
  const offCanvas = new OffscreenCanvas(canvasWidth, canvasHeight);
  const ctx = offCanvas.getContext('2d');
  drawFunc(ctx);
  const imageData = ctx?.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imageData?.data;
  let [minX, minY, maxX, maxY] = [ox, oy, ox + width, oy + height];
  let minYFlag = false;
  for (let y = minY; y < canvasHeight; y++) {
    for (let x = minX; x < canvasWidth; x++) {
      const index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      const r = pixels![index];
      const g = pixels![index + 1];
      const b = pixels![index + 2];
      const a = pixels![index + 3];
      // eslint-disable-next-line eqeqeq
      if (r != 0 || g != 0 || b != 0 || a != 0) {
        minYFlag = true;
        minY = y;
        break;
      }
    }
    if (minYFlag) break;
  }

  let maxYFlag = false;
  for (let y = oy + height; y > oy; y--) {
    for (let x = ox - 4; x < canvasWidth; x++) {
      const index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      const r = pixels![index];
      const g = pixels![index + 1];
      const b = pixels![index + 2];
      const a = pixels![index + 3];
      // eslint-disable-next-line eqeqeq
      if (r != 0 || g != 0 || b != 0 || a != 0) {
        maxY = y;
        maxYFlag = true;
        break;
      }
    }
    if (maxYFlag) break;
  }

  let minXFlag = false;
  for (let x = ox; x < canvasWidth; x++) {
    for (let y = oy - 4; y < canvasHeight; y++) {
      const index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      const r = pixels![index];
      const g = pixels![index + 1];
      const b = pixels![index + 2];
      const a = pixels![index + 3];
      // eslint-disable-next-line eqeqeq
      if (r != 0 || g != 0 || b != 0 || a != 0) {
        minXFlag = true;
        minX = x;
        break;
      }
    }
    if (minXFlag) break;
  }
  let maxXFlag = false;
  for (let x = ox + width; x > x; x--) {
    for (let y = oy - 4; y < canvasHeight; y++) {
      const index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      const r = pixels![index];
      const g = pixels![index + 1];
      const b = pixels![index + 2];
      const a = pixels![index + 3];
      // eslint-disable-next-line eqeqeq
      if (r != 0 || g != 0 || b != 0 || a != 0) {
        maxX = x;
        maxXFlag = true;
        break;
      }
    }
    if (maxXFlag) break;
  }
  return {
    ox: minX,
    oy: minY,
    width: maxX - minX,
    height: maxY - minY
  };
  // return {
  //   minX,
  //   maxX,
  //   minY,
  //   maxY
  // };
};
