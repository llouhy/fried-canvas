import { InstanceType } from "../utils/setIdentify";
  checkParams: Symbol('__isCheckParams__')
  export type IdentifyDescription = '__isError__' | '__isModel__' | '__isShape__' | '__isEngine__' | '__isGrid__' | '__isGraph__';

export const identifyMap: { [key in InstanceType]: Symbol } = Object.freeze({
  error: Symbol.for('__isError__'),
  engine: Symbol.for('__isEngine__'),
  shape: Symbol.for('__isShape__'),
  model: Symbol.for('__isModel__'),
  grid: Symbol.for('__isGrid__'),
  graph: Symbol.for('__isGraph__'),
  checkParams: Symbol.for('__isCheckParams__')
});
