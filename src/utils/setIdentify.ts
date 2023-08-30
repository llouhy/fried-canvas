import { error, engine, shape, model, grid, graph, checkParams } from '../definition/identify';

export type InstanceType = 'error' | 'model' | 'shape' | 'engine' | 'grid' | 'graph' | 'checkParams';
export const setIdentify = (obj: any, type: InstanceType) => {
  const identifyByType = {
    error,
    engine,
    shape,
    model,
    grid,
    graph,
    checkParams
  };
  const identify = identifyByType[type];
  return Object.defineProperty(obj, identify.description, {
    value: identify,
    writable: false
  });
};
