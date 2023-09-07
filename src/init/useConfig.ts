import getDefaultConfig from '../config';
import { InitEngineResult, engineById } from '../engineFn';
import { mergeObject } from '../utils/mergeObject';

type EngineConfig = Partial<{
  color: { [key: string]: `#${string}` };
}>;
export type UseConfigRes = {
  getConfig: () => EngineConfig;
  updateConfig: (custom: EngineConfig) => void;
};
type UseConfig = (eid: string, customConfig?: EngineConfig) => UseConfigRes;
export const configByEngineId = new Map<string, EngineConfig>();
export const configCoreByEngineId = new WeakMap<InitEngineResult, UseConfigRes>();
export const useConfig: UseConfig = (engineId, customConfig) => {
  const engineInstance = engineById.get(engineId);
  if (configCoreByEngineId.get(engineInstance)) return configCoreByEngineId.get(engineInstance);
  let currentConfig: EngineConfig = configByEngineId.get(engineId) || getDefaultConfig();
  const updateConfig = (custom: EngineConfig) => {
    const mergeConfig: EngineConfig = mergeObject(currentConfig, custom);
    currentConfig = mergeConfig;
  }
  customConfig && updateConfig(customConfig);
  configByEngineId.set(engineId, currentConfig);
  return configCoreByEngineId.set(engineInstance, {
    getConfig: () => {
      return  currentConfig;
    },
    updateConfig
  }).get(engineInstance);
}