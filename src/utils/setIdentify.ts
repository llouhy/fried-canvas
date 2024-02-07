import { error, engine, shape, model, grid, graph, observe, layer } from '../definition/identify';

export type InstanceType = 'error' | 'model' | 'shape' | 'engine' | 'grid' | 'graph' | 'observe' | 'layer';
export const setIdentify = (obj: any, type: InstanceType) => {
  const identifyByType = {
    error,
    engine,
    shape,
    model,
    grid,
    graph,
    layer,
    observe
  };
  const identify = identifyByType[type];
  return Object.defineProperty(obj, identify.description, {
    value: identify,
    writable: false
  });
};
