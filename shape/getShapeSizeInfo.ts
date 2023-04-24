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
  const map = new Map<keyof Boundary, number>();
  for (const item of coordinateStack) {
    const { x, y, dWidth } = item; // the difference of stroke lineWidth and 1px
    if (preBoundary.minX > x) {
      preBoundary.minX = x;
      map.set('minX', dWidth ?? 0);
    }
    if (preBoundary.maxX < x) {
      preBoundary.maxX = x;
      map.set('maxX', dWidth ?? 0);
    }
    if (preBoundary.minY > y) {
      preBoundary.minY = y;
      map.set('minY', dWidth ?? 0);
    }
    if (preBoundary.maxY < y) {
      preBoundary.maxY = y;
      map.set('maxY', dWidth ?? 0);
    }
  }
  // let boundary = { ...preBoundary };
  const boundary = {
    minX: preBoundary.minX - (map.get('minX') ?? 0),
    maxX: preBoundary.maxX + (map.get('maxX') ?? 0),
    minY: preBoundary.minY - (map.get('minY') ?? 0),
    maxY: preBoundary.maxY + (map.get('maxY') ?? 0)
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
