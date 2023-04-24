import type { ModelOptions } from '../graphOptions';
export type ModelCache = {
  modelLibrary: Array<ModelOptions>;
  modelMap: Map<string, ModelOptions>;
};
const model: ModelCache = {
  modelLibrary: [],
  modelMap: new Map()
};

export const useModelCache = (): ModelCache => {
  return model;
};
