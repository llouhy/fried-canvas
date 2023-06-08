import { InstanceType } from "../utils/setIdentify";
export type IdentifyDescription = '__isError__' | '__isModel__' | '__isShape__' | '__isEngine__' | '__isGrid__' | 'isGraph';

export const identifyMap: { [key in InstanceType]: Symbol } = Object.freeze({
  error: Symbol('__isError__'),
  engine: Symbol('__isEngine__'),
  shape: Symbol('__isShape'),
  model: Symbol('__isModel__'),
  grid: Symbol('__isGrid__'),
  graph: Symbol('__isGraph__')
});
