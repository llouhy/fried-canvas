import { error, engine, shape, model, grid, graph, checkParams, layer } from '../definition/identify';

export type InstanceType = 'error' | 'model' | 'shape' | 'engine' | 'grid' | 'graph' | 'checkParams' | 'layer';
export const setIdentify = (obj: any, type: InstanceType) => {
  const identifyByType = {
    error,
    engine,
    shape,
    model,
    grid,
    graph,
    layer,
    checkParams
  };
  const identify = identifyByType[type];
  return Object.defineProperty(obj, identify.description, {
    value: identify,
    writable: false
  });
};
