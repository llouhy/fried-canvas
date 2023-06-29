import { getTransBoundary } from "../config/common";
import { BorderOptions, Graphics } from "../graphOptions";
import { Graph } from "../init/useGraph";
import { Boundary, EngineCtx } from "../rewriteFn/type";

const useCache = <P, T>(fn: ((...args: any[]) => T)) => {
  const map = new Map();
  return (params: P): T => {
    return map.get(params) || (map.set(params, fn(params)) && map.get(params));
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

export const angleToRadian = useCache<number, number>((angle: number): number => {
  return (Math.PI * angle) / 180;
});

export const radianToAngle = useCache<number, number>((radian: number): number => {
  return (radian * 180) / Math.PI;
});

export const getTypeStr = useCache<any, string>((value: any) => {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
});

export const toHalfPixel = useCache<number, number>((pixel: number): number => {
  return Math.round(pixel) + 0.5;
});

export const setCanvasSize = (canvas: HTMLCanvasElement, width: number, height: number, ctx: EngineCtx) => {
  const dpr = window.devicePixelRatio;
  canvas.height = Math.round(width * dpr);
  canvas.width = Math.round(height * dpr);
  canvas.style.height = height + 'px';
  canvas.style.width = width + 'px';
  ctx.scale(dpr, dpr);
};

export const getPureObject = (obj: { [key: string]: any }) => {
  return Object.assign(Object.create(null), obj);
};

export const getDivisibleNum = (cur: number, divisor: number): number => {
  let result = cur;
  if (cur % divisor !== 0) {
    result++;
  }
  return result;
};

export const graphicsToBoundary = (graphics: Graphics, graph: Partial<Graph> = { translateX: 0, translateY: 0 }): Boundary => {
  const minX = Math.floor(graphics.ox);
  const minY = Math.floor(graphics.oy);
  const { translateX, translateY } = graph;
  return {
    minX: minX + translateX,
    minY: minY + translateY,
    maxX: Math.ceil(minX + graphics.width) + translateX,
    maxY: Math.ceil(minY + graphics.height) + translateY
  };
}

export const getGraphicsWithBorder = (graphics: Graphics, borderOptions: BorderOptions, rotateDeg?: number): Graphics => {
  const { paddingLeft, paddingRight, paddingTop, paddingBottom, borderWidth } = borderOptions;
  const lineWidth = borderWidth ?? 2;
  const boundOx = graphics.ox - (paddingLeft ?? 4);
  const boundOy = graphics.oy - (paddingTop ?? 4);
  const boundWidth = graphics.width + (paddingLeft ?? 4) + (paddingRight ?? 4);
  const boundHeight = graphics.height + (paddingTop ?? 4) + (paddingBottom ?? 4);
  const dlineWidth = Math.ceil(lineWidth / 2);
  return (rotateDeg && getRotateGraphics(rotateDeg, {
    minX: Math.ceil(boundOx - dlineWidth),
    maxX: Math.ceil(boundOx - dlineWidth) + Math.floor(boundWidth + 2 * dlineWidth),
    minY: Math.ceil(boundOy - dlineWidth),
    maxY: Math.ceil(boundOy - dlineWidth) + Math.floor(boundHeight + 2 * dlineWidth)
  })) || {
    ox: Math.ceil(boundOx - dlineWidth),
    oy: Math.ceil(boundOy - dlineWidth),
    width: Math.floor(boundWidth + 2 * dlineWidth),
    height: Math.floor(boundHeight + 2 * dlineWidth)
  }
}

const getRotateGraphics = (rotateDeg: number, boundary: Boundary) => {
  // debugger
  const ctx = new OffscreenCanvas(1, 1).getContext('2d');
  // ctx.save();
  ctx.rotate(rotateDeg * Math.PI / 180);
  // const rad = angleToRadian(rotateDeg);
  const [reduceX, reduceY] = [(boundary.maxX + boundary.minX) >> 1, (boundary.maxY + boundary.minY) >> 1];
  const points = [
    { x: boundary.minX - reduceX, y: boundary.minY - reduceY },
    { x: boundary.minX - reduceX, y: boundary.maxY - reduceY },
    { x: boundary.maxX - reduceX, y: boundary.maxY - reduceY },
    { x: boundary.maxX - reduceX, y: boundary.minY - reduceY }
  ];
  // console.log(ctx.getTransform())
  const transBoundary = getTransBoundary(ctx.getTransform(), points);
  return {
    ox: transBoundary.minX + reduceX,
    oy: transBoundary.minY + reduceY,
    width: transBoundary.maxX - transBoundary.minX,
    height: transBoundary.maxY - transBoundary.minY
  };
}

export const compose = (...fns: ((arg: any) => any)[]) => {
  return (arg: any) => {
    return fns.reduce((preRes, curFn) => {
      return curFn(preRes);
    }, arg);
  };
};

export const useCollectReturn = (...fns: ((arg: any) => any)[]) => {
  return (arg: any) => {
    return fns.reduce((preRes, curFn) => {
      return arg === preRes ? [curFn(arg)] : [...preRes, curFn(arg)];
    }, arg);
  };
};

export const mergeObjectInList = <result>(list: any[]): result => {
  return list.reduce((preRes, curElem) => ({ ...preRes, ...curElem }));
}

export const omitObjectProperty = (obj: { [key: string]: any }, omitProperties: string[]) => {
  for (const elem of omitProperties) {
    obj[elem] && (delete obj[elem]);
  }
  return obj;
}

export const setPropertyUnWritable = (obj: { [key: string]: any }, properties?: string[]) => {
  let allProperties = properties || Object.keys(obj);
  for (const elem of allProperties) {
    obj[elem] && Object.defineProperty(obj, elem, {
      writable: false
    });
  }
}