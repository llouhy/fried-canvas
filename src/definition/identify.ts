export type IdentifyDescription = '__isError__' | '__isModel__' | '__isShape__' | '__isEngine__' | '__isGrid__' | '__isGraph__';
export const error = Symbol.for('__isError__');
export const engine = Symbol.for('__isEngine__');
export const shape = Symbol.for('__isShape__');
export const model = Symbol.for('__isModel__');
export const grid = Symbol.for('__isGrid__');
export const graph = Symbol.for('__isGraph__');
export const checkParams = Symbol.for('__isCheckParams__');
