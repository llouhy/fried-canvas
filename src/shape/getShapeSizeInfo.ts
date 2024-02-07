import { Graphics } from '../graphOptions';
import { getPureObject } from '../utils/common';
import { useOffCanvas } from '../init/useOffCanvas';
import { reloadCtxFunction } from '../init/context';
import { ModelDrawFuncArgs } from '../init/useModel';
import type { Boundary, Point } from '../rewriteFn/type';

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
): Graphics => {
  const preBoundary: Boundary = getInitBoundary();
  let pxMin, pyMin, pxMax, pyMax;
  for (const item of coordinateStack) {
    const { x, y, dWidth, dWidthX, dWidthY } = item; // the difference of stroke lineWidth and 1px
    pxMin = x - (dWidthX || dWidth || 0);
    pyMin = y - (dWidthY || dWidth || 0);
    pxMax = x + (dWidthX || dWidth || 0);
    pyMax = y + (dWidthY || dWidth || 0);
    if (preBoundary.minX > pxMin) {
      preBoundary.minX = pxMin;
      // boundToLineWidth.set('minX', dWidth || 0);
    }
    if (preBoundary.maxX < pxMax) {
      preBoundary.maxX = pxMax;
      // boundToLineWidth.set('maxX', dWidth || 0);
    }
    if (preBoundary.minY > pyMin) {
      preBoundary.minY = pyMin;
      // boundToLineWidth.set('minY', dWidth || 0);
    }
    if (preBoundary.maxY < pyMax) {
      preBoundary.maxY = pyMax;
      // boundToLineWidth.set('maxY', dWidth || 0);
    }
  }
  const boundary = {
    minX: preBoundary.minX,
    maxX: preBoundary.maxX,
    minY: preBoundary.minY,
    maxY: preBoundary.maxY
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
  info: { ox: number; oy: number; width: number; height: number },
  ...args: ModelDrawFuncArgs[]
) => {
  const { get: getCanvas } = useOffCanvas();
  const { ox, oy, width, height } = info;
  const COMPENSATE = 4;
  const translateX = ox <= 0 ? Math.ceil(Math.abs(ox)) + COMPENSATE : COMPENSATE;
  const translateY = oy <= 0 ? Math.ceil(Math.abs(oy)) + COMPENSATE : COMPENSATE;
  const imageOx = Math.floor(ox + translateX);
  const imageOy = Math.floor(oy + translateY);
  const canvasWidth = Math.floor(imageOx + width + COMPENSATE);
  const canvasHeight = Math.floor(imageOy + height + COMPENSATE);
  const offCanvas = getCanvas(canvasWidth, canvasHeight);
  const ctx = offCanvas.getContext('2d');
  // (ctx as any).drawOffset = { dx: 0, dy: 0 };
  reloadCtxFunction(ctx);
  (ctx as any).translate(translateX, translateY);
  drawFunc(ctx, ...args);
  (ctx as any).translate(-translateX, -translateY);
  // {ox: 298, oy: 59, width: 154, height: 407}
  // (ctx as any).$strokeRect(0,0,canvasWidth, canvasHeight);
  const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  const pixels = imageData?.data;
  let reduce = {
    right: 0,
    left: 0,
    top: 0,
    bottom: 0
  };
  let [index, r, g, b, a] = [0, 0, 0, 0, 0];
  let minYFlag = false;
  for (let y = imageOy - 2; y < canvasHeight; y++) {
    for (let x = 0; x < canvasWidth; x++) {
      index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r || g || b || a) {
        minYFlag = true;
        reduce.top = y;
        break;
      }
    }
    if (minYFlag) break;
  }

  let maxYFlag = false;
  for (let y = canvasHeight - 1; y >= 0; y--) {
    for (let x = 0; x < canvasWidth; x++) {
      index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r || g || b || a) {
        reduce.bottom = y;
        maxYFlag = true;
        break;
      }
    }
    if (maxYFlag) break;
  }

  let minXFlag = false;
  for (let x = imageOx - 2; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r || g || b || a) {
        minXFlag = true;
        reduce.left = x;
        break;
      }
    }
    if (minXFlag) break;
  }

  let maxXFlag = false;
  for (let x = canvasWidth - 1; x >= 0; x--) {
    for (let y = 0; y < canvasHeight; y++) {
      index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r || g || b || a) {
        reduce.right = x;
        maxXFlag = true;
        break;
      }
    }
    if (maxXFlag) break;
  }

  return {
    graphics: {
      ox: reduce.left - translateX,
      oy: reduce.top - translateY,
      width: reduce.right - reduce.left,
      height: reduce.bottom - reduce.top
    },
    imageData: ctx.getImageData(reduce.left, reduce.top, reduce.right - reduce.left, reduce.bottom - reduce.top)
  }
};
