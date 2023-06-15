import type { Boundary, Point, Direction } from '../rewriteFn/type';
export const getDefaultContextAttribute = () => {
  return {
    alpha: true, // false will paint a black backgound
    antialias: true,
    depth: true,
    failIfMajorPerformanceCaveat: Boolean,
    powerPreference: 'default',
    premultipliedAlpha: false,
    preserveDrawingBuffer: false,
    stencil: true
  };
};

export const generateRandomStr = (e: number): string => {
  e = e || 32;
  const t = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
  const length = t.length;
  let str = '';
  for (let i = 0; i < e; i++) {
    str += t.charAt(Math.floor(Math.random() * length));
  }
  return str;
};

export const angleToRadian = (angle: number): number => {
  return (Math.PI * angle) / 180;
};

export const radianToAngle = (radian: number): number => {
  return (radian * 180) / Math.PI;
};

export const sumBoundary = (
  boundary: Boundary,
  direction: Direction,
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): number => {
  const { minX, maxX, minY, maxY } = boundary;
  const isX = direction === 'toLeft' || direction === 'toRight';
  const isFindMax = direction === 'toLeft' || direction === 'toTop';
  const directionToTargetMap = {
    toLeft: 'maxX',
    toRight: 'minX',
    toTop: 'maxY',
    toBottom: 'minY'
  };
  const key = directionToTargetMap[direction];
  const groupStart = isX ? minY : minX;
  const groupEnd = isX ? maxY : maxX;
  let cur = (boundary as any)[key];
  let maxIdx = isX ? maxX - minX : maxY - minY;
  let hasFindBoundary = false;
  while (maxIdx && !hasFindBoundary) {
    for (let i = groupStart; i < groupEnd; i++) {
      if (isX) {
        hasFindBoundary = ctx.isPointInStroke(cur, i);
      } else {
        hasFindBoundary = ctx.isPointInStroke(i, cur);
      }
      if (hasFindBoundary) {
        break;
      }
    }
    if (hasFindBoundary) {
      break;
    }
    maxIdx--;
    if (isFindMax) {
      cur--;
    } else {
      cur++;
    }
  }
  return cur;
};

export const getBoundary = (
  pathPoints: Point[],
  controlPoints: Point[],
  ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D
): Boundary => {
  const controlX = controlPoints.map((item) => item.x);
  const controlY = controlPoints.map((item) => item.y);
  const xs = [...pathPoints.map((item) => item.x), ...controlX].filter((item) => !!item);
  const ys = [...pathPoints.map((item) => item.y), ...controlY].filter((item) => !!item);
  let [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  if (controlX.includes(maxX)) {
    maxX = sumBoundary({ minX, minY, maxX, maxY }, 'toLeft', ctx);
  }
  if (controlX.includes(minX)) {
    minX = sumBoundary({ minX, minY, maxX, maxY }, 'toRight', ctx);
  }
  if (controlY.includes(maxY)) {
    // console.log('进来了', maxY, minY)
    maxY = sumBoundary({ minX, minY, maxX, maxY }, 'toTop', ctx);
  }
  if (controlY.includes(minY)) {
    minY = sumBoundary({ minX, minY, maxX, maxY }, 'toBottom', ctx);
  }
  // console.log({
  //   minX,
  //   minY,
  //   maxX,
  //   maxY
  // })
  return {
    minX,
    minY,
    maxX,
    maxY
  };
  (ctx as any).$strokeRect(minX, minY, maxX - minX, maxY - minY)
};
