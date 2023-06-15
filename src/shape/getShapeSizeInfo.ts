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
  const boundToLineWidth = new Map<keyof Boundary, number>();
  for (const item of coordinateStack) {
    const { x, y, dWidth } = item; // the difference of stroke lineWidth and 1px
    if (preBoundary.minX > x) {
      preBoundary.minX = x;
      boundToLineWidth.set('minX', dWidth || 0);
    }
    if (preBoundary.maxX < x) {
      preBoundary.maxX = x;
      boundToLineWidth.set('maxX', dWidth || 0);
    }
    if (preBoundary.minY > y) {
      preBoundary.minY = y;
      boundToLineWidth.set('minY', dWidth || 0);
    }
    if (preBoundary.maxY < y) {
      preBoundary.maxY = y;
      boundToLineWidth.set('maxY', dWidth || 0);
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
  console.log('info', info)
  // debugger
  const { get: getCanvas } = useOffCanvas();
  const { ox, oy, width, height } = info;
  const COMPENSATE = 8;
  const translateX = ox <= 0 ? Math.abs(ox) + COMPENSATE : COMPENSATE;
  const translateY = oy <= 0 ? Math.abs(oy) + COMPENSATE : COMPENSATE;
  const drawOffset = {
    dx: translateX,
    dy: translateY
  };
  const imageOx = ox + translateX;
  const imageOy = oy + translateY;
  const canvasWidth = Math.floor(imageOx + width + COMPENSATE);
  const canvasHeight = Math.floor(imageOy + height + COMPENSATE);
  const offCanvas = getCanvas(canvasWidth, canvasHeight);
  const ctx = offCanvas.getContext('2d');
  (ctx as any).drawOffset = drawOffset;
  reloadCtxFunction(ctx);
  drawFunc(ctx);
  // {ox: 298, oy: 59, width: 154, height: 407}
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
  for (let y = imageOy; y < canvasHeight; y++) {
    // console.log('minY', y)
    for (let x = 0; x < canvasWidth; x++) {
      index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        minYFlag = true;
        reduce.top = y;
        console.log(`找到minY在第${y + 1}次循环`, y)
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
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        console.log(`找到了maxY在第${ canvasHeight - y + 1 }次循环`, y)
        reduce.bottom = y;
        maxYFlag = true;
        // console.log('zhaodao')
        break;
      }
    }
    if (maxYFlag) break;
  }

  let minXFlag = false;
  for (let x = imageOx; x < canvasWidth; x++) {
    for (let y = 0; y < canvasHeight; y++) {
      index = (y * canvasWidth + x) * 4; // 当前像素在pixels的起始位置
      r = pixels![index];
      g = pixels![index + 1];
      b = pixels![index + 2];
      a = pixels![index + 3];
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        console.log(`找到了minX在第${x + 1}次循环`, x)
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
      if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
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
  console.log('reduce', reduce);
  console.log({
    translateX,
    translateY
  })
  console.log('计算结果', {
    ox: reduce.left - translateX,
    oy: reduce.top - translateY,
    width: reduce.right - reduce.left,
    height: reduce.bottom - reduce.top
  });
  return {
    ox: reduce.left - translateX,
    oy: reduce.top - translateY,
    width: reduce.right - reduce.left,
    height: reduce.bottom - reduce.top
  }
};
