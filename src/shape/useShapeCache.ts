import type { Shape } from './shape';
import type Engine from '../engine';
import { idToEngineMap } from '../engine';

export const getShape = (engineId: string, shapeId: string): Shape | null => {
  const engine: Engine | undefined = idToEngineMap.get(engineId);
  return engine?.getShape(shapeId) ?? null;
};
