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
  const isFindMax = direction === 'toLeft' || direction === 'toBottom';
  const directionToTargetMap = {
    toLeft: 'maxX',
    toRight: 'minX',
    toTop: 'minY',
    toBottom: 'maxY'
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
  const controlx = controlPoints.map((item) => item.x);
  const controly = controlPoints.map((item) => item.y);
  const xs = [...pathPoints.map((item) => item.x), ...controlx].filter((item) => !!item);
  const ys = [...pathPoints.map((item) => item.y), ...controly].filter((item) => !!item);
  let [minX, maxX, minY, maxY] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  if (controlx.includes(maxX)) {
    maxX = sumBoundary({ minX, minY, maxX, maxY }, 'toLeft', ctx);
  }
  if (controlx.includes(minX)) {
    minX = sumBoundary({ minX, minY, maxX, maxY }, 'toRight', ctx);
  }
  if (controly.includes(maxY)) {
    maxY = sumBoundary({ minX, minY, maxX, maxY }, 'toTop', ctx);
  }
  if (controly.includes(minY)) {
    minY = sumBoundary({ minX, minY, maxX, maxY }, 'toBottom', ctx);
  }
  return {
    minX,
    minY,
    maxX,
    maxY
  };
};
