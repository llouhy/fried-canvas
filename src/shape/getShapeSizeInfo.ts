import { reloadCtxFunction } from '../init/context';
import { useOffCanvas } from '../init/useOffCanvas';
import type { Boundary, OffEngineCtx, Point } from '../rewriteFn/type';
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
  // const boundToLineWidth = new Map<keyof Boundary, number>();
  console.log('精确计算开始')
  let pxMin, pyMin, pxMax, pyMax;
  for (const item of coordinateStack) {
    const { x, y, dWidth, dWidthX, dWidthY } = item; // the difference of stroke lineWidth and 1px
    pxMin = x - (dWidthX || dWidth || 0);
    pyMin = y - (dWidthY || dWidth || 0);
    pxMax = x + (dWidthX || dWidth || 0);
    pyMax = y + (dWidthY || dWidth || 0);
    // console.log({
    //   pxMin, pxMax, pyMax, pyMin
    // })
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
  info: { ox: number; oy: number; width: number; height: number }
) => {
  console.log('info', info)
  // debugger
  const { get: getCanvas } = useOffCanvas();
  const { ox, oy, width, height } = info;
  const COMPENSATE = 4;
  const translateX = ox <= 0 ? Math.ceil(Math.abs(ox)) + COMPENSATE : COMPENSATE;
  const translateY = oy <= 0 ? Math.ceil(Math.abs(oy)) + COMPENSATE : COMPENSATE;
  const drawOffset = {
    dx: translateX,
    dy: translateY
  };
  const imageOx = Math.floor(ox + translateX);
  const imageOy = Math.floor(oy + translateY);
  const canvasWidth = Math.floor(imageOx + width + COMPENSATE);
  const canvasHeight = Math.floor(imageOy + height + COMPENSATE);
  // console.log({ drawOffset, imageOx, imageOy, canvasWidth, canvasHeight });
  const offCanvas = getCanvas(canvasWidth, canvasHeight);
  const ctx = offCanvas.getContext('2d');
  (ctx as any).drawOffset = { dx: 0, dy: 0 };
  reloadCtxFunction(ctx);
  (ctx as any).translate(translateX, translateY);
  drawFunc(ctx);
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
    // console.log('minY', y)
    for (let x = 0; x < canvasWidth; x++) {
      index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r || g || b || a) {
        minYFlag = true;
        reduce.top = y;
        console.log(`找到minY在第${y - (imageOy - 2)}次循环`, y)
        break;
      }
    }
    if (minYFlag) break;
  }

  let maxYFlag = false;
  for (let y = canvasHeight - 1; y >= 0; y--) {
    // console.log('maxY', canvasHeight - y)
    for (let x = 0; x < canvasWidth; x++) {
      index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r || g || b || a) {
        console.log(`找到了maxY在第${canvasHeight - y + 1}次循环`, y)
        reduce.bottom = y;
        maxYFlag = true;
        // console.log('zhaodao')
        break;
      }
    }
    if (maxYFlag) break;
  }

  let minXFlag = false;
  console.log(imageOx);
  for (let x = imageOx - 2; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r || g || b || a) {
        console.log(`找到了minX在第${x - (imageOx - 2)}次循环`, x)
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
        console.log(`找到了maxX在第${canvasWidth - x + 1}次循环`, x)
        reduce.right = x;
        maxXFlag = true;
        break;
      }
    }
    if (maxXFlag) break;
  }
  // const dx = reduce.left - COMPENSATE; // 实际跟 ox 的偏差距离
  // const dy = reduce.top - COMPENSATE; // 实际跟 oy 的偏差距离
  // console.log('计算的三维', {
  //   top: imageOy - 2,
  //   bottom: canvasHeight - 1,
  // })
  console.log('计算结果', {
    ox: reduce.left - translateX,
    oy: reduce.top - translateY,
    width: reduce.right - reduce.left,
    height: reduce.bottom - reduce.top
  });
    // console.log('reduce', reduce);
    // console.log('计算结果', {
    //   ox: reduce.left - translateX + 1,
    //   oy: reduce.top - translateY + 1,
    //   width: reduce.right - reduce.left - 1,
    //   height: reduce.bottom - reduce.top - 1,
    //   maxX: reduce.left - translateX + 1 + (reduce.right - reduce.left - 1),
    //   maxY: reduce.top - translateY + 1 + (reduce.bottom - reduce.top - 1)
    // });
    (ctx as any).$strokeRect(reduce.left, reduce.top, reduce.right - reduce.left, reduce.bottom - reduce.top);
  (window as any)[`testtest`] = ctx.getImageData(0, 0, canvasWidth, canvasHeight);
  return {
    ox: reduce.left - translateX,
    oy: reduce.top - translateY,
    width: reduce.right - reduce.left,
    height: reduce.bottom - reduce.top
  }
  // return {
  //   ox: reduce.left - translateX + 1,
  //   oy: reduce.top - translateY + 1,
  //   width: reduce.right - reduce.left - 1,
  //   height: reduce.bottom - reduce.top - 1
  // }
};
