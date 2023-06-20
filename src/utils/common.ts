import { BorderOptions, Graphics } from "../graphOptions";
import { Graph } from "../init/useGraph";
import { Boundary, EngineCtx } from "../rewriteFn/type";

export const getTypeStr = (value: any) => {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

export const setCanvasSize = (canvas: HTMLCanvasElement, width: number, height: number, ctx: EngineCtx) => {
  // canvas.height = height;
  // canvas.width = width;
  console.log('ratio', window.devicePixelRatio);
  const dpr = window.devicePixelRatio;
  canvas.height = Math.round(width * dpr);
  canvas.width = Math.round(height * dpr);
  // canvas.height = height * 2;
  // canvas.width = width * 2;
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

export const getGraphicsWithBorder = (graphics: Graphics, borderOptions: BorderOptions): Graphics => {
  const { paddingLeft, paddingRight, paddingTop, paddingBottom, borderWidth } = borderOptions;
  const lineWidth = borderWidth ?? 2;
  const boundOx = graphics.ox - (paddingLeft ?? 4);
  const boundOy = graphics.oy - (paddingTop ?? 4);
  const boundWidth = graphics.width + (paddingLeft ?? 4) + (paddingRight ?? 4);
  const boundHeight = graphics.height + (paddingTop ?? 4) + (paddingBottom ?? 4);
  const dlineWidth = Math.ceil(lineWidth / 2);
  return {
    ox: Math.ceil(boundOx - dlineWidth),
    oy: Math.ceil(boundOy - dlineWidth),
    width: Math.floor(boundWidth + 2 * dlineWidth),
    height: Math.floor(boundHeight + 2 * dlineWidth)
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