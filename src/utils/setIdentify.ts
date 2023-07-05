import type { IdentifyDescription } from '../definition/identify';
import { identifyMap } from '../definition/identify';

export type InstanceType = 'error' | 'model' | 'shape' | 'engine' | 'grid' | 'graph' | 'checkParams';
export const setIdentify = (obj: any, type: InstanceType) => {
  Object.defineProperty(obj, identifyMap[type].description as IdentifyDescription, {
    value: identifyMap[type],
    writable: false
  });
  return obj;
};
