import { isObject } from "./is";
export const mergeObject = (oldObj: any, newObj: any): { [key: string]: any } => {
  const deep = (obj: any, custom: any, result: any) => {
    Object.assign(result, obj);
    for (const key in obj) {
      result[key] = obj[key];
    }
    for (const key in custom) {
      const oldValue = obj[key];
      result[key] = oldValue;
      if (!oldValue) {
        result[key] = custom[key] === undefined ? oldValue : custom[key];
      } else if (isObject(oldValue)) {
        if (!custom[key]) {
          result[key] = custom[key] === undefined ? oldValue : custom[key];
        } else if (!isObject(custom[key])) {
          result[key] = custom[key];
        } else {
          deep(oldValue, custom[key], result[key]);
        }
      } else {
        result[key] = custom[key] === undefined ? result[key] : custom[key];
      }
    }
  }
  const result = {};
  deep(oldObj, newObj, result);
  return result;
}
