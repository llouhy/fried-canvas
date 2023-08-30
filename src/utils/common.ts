import { EngineCtx } from "../rewriteFn/type";
import { useCacheFunc } from "./cache";
import { isFunction, isObject } from "./is";

export const getType = (value: any) => {
  return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
};

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

export const mergeObjects = <result>(list: any[]): result => {
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

export const microtask = (task: () => any) => {
  if (isFunction(queueMicrotask)) {
    queueMicrotask(task);
  } else if (isObject(process) && isFunction(process.nextTick)) {
    process.nextTick(task);
  } else if (isFunction(Promise)) {
    Promise.resolve().then(task);
  } else {
    setTimeout(task, 0);
  }
}