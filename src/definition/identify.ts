import { InstanceType } from "../utils/setIdentify";
  checkParams: Symbol('__isCheckParams__')
  export type IdentifyDescription = '__isError__' | '__isModel__' | '__isShape__' | '__isEngine__' | '__isGrid__' | '__isGraph__';

export const identifyMap: { [key in InstanceType]: Symbol } = Object.freeze({
  error: Symbol('__isError__'),
  engine: Symbol('__isEngine__'),
  shape: Symbol('__isShape__'),
  model: Symbol('__isModel__'),
  grid: Symbol('__isGrid__'),
  graph: Symbol('__isGraph__'),
  checkParams: Symbol('__isCheckParams__')
});
