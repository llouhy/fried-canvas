import { isError } from './is';

export const validateFns = () => {
  const fnStack: Set<(...args: any[]) => any> = new Set();
  const instance = {
    run,
    addValid
  };

  function run(...args: any[]) {
    let result;
    for (const fn of [...fnStack]) {
      // eslint-disable-next-line prefer-spread
      result = fn.apply(null, args);
      if (isError(result)) {
        return result;
      }
    }
    return true;
  }

  function addValid(fn: (...args: any[]) => any) {
    fnStack.add(fn);
    return instance;
  }

  return instance;
};
