export type IdentifyDescription = '__isError__' | '__isModel__' | '__isShape__' | '__isEngine__';

export const identifyMap = Object.freeze({
  error: Symbol('__isError__'),
  engine: Symbol('__isEngine__'),
  shape: Symbol('__isShape'),
  model: Symbol('__isModel__')
});
