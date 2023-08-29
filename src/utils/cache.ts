import { isArray, isFunction, isObject } from "./is";

type CacheNode = {
  value: any;
  status: any;
  object: null | WeakMap<Object, CacheNode>;
  base: Map<string | number | boolean, CacheNode>;
};
type Func = (...args: any[]) => any;
const createCacheNode = (): CacheNode => {
  return {
    value: null,
    status: null,
    object: null,
    base: null
  }
};

const funcMap = new WeakMap<Func, CacheNode>();

export const useCacheFunc = (func: Func) => {
  return function (...args: any[]) {
    let curMap, curNode, nextNode;
    curNode = funcMap.get(func) || (funcMap.set(func, createCacheNode()) && funcMap.get(func));
    for (const curArg of args) {
      if ((isObject(curArg) || isArray(curArg) || isFunction(curArg)) && curArg !== null) {
        curMap = curNode.object ??= new WeakMap();
        nextNode = curMap.get(curArg);
        if (nextNode === undefined) {
          curMap.set(curArg, createCacheNode());
        }
        curNode = curMap.get(curArg);
      } else {
        curMap = curNode.base ??= new Map();
        nextNode = curMap.get(curArg);
        if (nextNode === undefined) {
          curMap.set(curArg, createCacheNode());
        }
        curNode = curMap.get(curArg);
      }
    }
    if (!curNode.value) {
      curNode.value = func.apply(this, args);
    }
    return curNode.value;
  }
}
