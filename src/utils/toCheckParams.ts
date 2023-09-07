import { getPureObject } from "./common";
import { setIdentify } from "./setIdentify";

export type ToCheckParams<T = any> = (value: any) => CheckParams<T>;
export type CheckParams<T = any> = {
  __isCheckParams__: symbol;
  value: T;
}; 

export const toCheckParams: ToCheckParams = (value) => {
  return new Proxy(setIdentify(getPureObject({
    value
  }), 'checkParams'), {});
}