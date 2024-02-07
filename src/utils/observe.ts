import { getPureObject } from "./common";
import { setIdentify } from "./setIdentify";

export type ToObserve<T = any> = (value: any) => Observe<T>;
export type Observe<T = any> = {
  __isObserve__: symbol;
  value: T;
}; 

export const observe: ToObserve = (value) => {
  return new Proxy(setIdentify(getPureObject({
    value
  }), 'observe'), {});
}