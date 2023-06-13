import type { Boundary, Point } from '../rewriteFn/type';
import { getPureObject } from '../utils/common';
const getInitBoundary = () => {
  return getPureObject({
    minX: Infinity,
    maxX: -Infinity,
    minY: Infinity,
    maxY: -Infinity
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
  // console.log(info)
  const { ox, oy, width, height } = info;
  // const canvasWidth = Math.abs(ox) + width + 4;
  // const canvasHeight = Math.abs(oy) + height + 4;
  const offCanvas = new OffscreenCanvas(1, 1);
  const ctx = offCanvas.getContext('2d');
  drawFunc(ctx);
  // const imageData = ctx?.getImageData(0, 0, canvasWidth, canvasHeight); // bug，负数计算错误
  const COMPENSATE = 0;
  const imageWidth = width + 2 * COMPENSATE;
  const imageHeight = height + 2 * COMPENSATE;
  const imageData = ctx?.getImageData(ox - COMPENSATE, oy - COMPENSATE, imageWidth, imageHeight);
  const pixels = imageData?.data;
  // let [minX, minY, maxX, maxY] = [ox - COMPENSATE, oy - COMPENSATE, ox - COMPENSATE + imageWidth, oy - COMPENSATE + imageHeight];
  let reduce = {
    right: 0,
    left: 0,
    top: 0,
    bottom: 0
  };
  let [r, g, b, a] = [0, 0, 0, 0];
  let minYFlag = false;
  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const index = (y * imageWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        minYFlag = true;
        reduce.top = y;
        break;
      }
    }
    if (minYFlag) break;
  }

  let maxYFlag = false;
  for (let y = imageHeight; y > 0; y--) {
    for (let x = 0; x < imageWidth; x++) {
      const index = (y * imageWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        reduce.bottom = imageHeight - y;
        maxYFlag = true;
        break;
      }
    }
    if (maxYFlag) break;
  }

  let minXFlag = false;
  for (let x = 0; x < imageWidth; x++) {
    for (let y = 0; y < imageHeight; y++) {
      const index = (y * imageWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        minXFlag = true;
        reduce.left = x;
        break;
      }
    }
    if (minXFlag) break;
  }
  let maxXFlag = false;
  for (let x = imageWidth; x > 0; x--) {
    for (let y = 0; y < imageHeight; y++) {
      const index = (y * imageWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        reduce.right = imageWidth - x;
        maxXFlag = true;
        break;
      }
    }
    if (maxXFlag) break;
  }

  return {
    ox: ox - COMPENSATE + reduce.left,
    oy: oy - COMPENSATE + reduce.top,
    width: imageWidth - reduce.left - reduce.right,
    height: imageHeight - reduce.top - reduce.bottom
  };
};
