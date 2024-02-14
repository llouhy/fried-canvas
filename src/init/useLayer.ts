import { LayerIns, getLayer } from "../definition/layer";
import { InitEngineResult, engineById } from "../engineFn";
import { Shape } from "../shape/shape";

type UseLayer = (engineId: string) => UseLayerRes;
type CreateLayer = (index: number, isDefault: boolean) => LayerIns;
type AppendToLayer = (shape: Shape, layer: LayerIns) => LayerIns;
type RemoveLayerShape = (shape: Shape) => Shape;
type GetAllLayer = () => LayerIns[];
export type UseLayerRes = {
  createLayer: CreateLayer;
  appendToLayer: AppendToLayer;
  removeLayerShape: RemoveLayerShape;
  getAllLayer: GetAllLayer;
};
export const layersByEngine = new WeakMap<InitEngineResult, LayerIns[]>();
const layerCoreByEngine = new WeakMap<InitEngineResult, UseLayerRes>();

export const useLayer: UseLayer = (engineId) => {
  const engineInstance = engineById.get(engineId);
  if (layerCoreByEngine.get(engineInstance)) return layerCoreByEngine.get(engineInstance);
  const insetLayer = (layer: LayerIns, layers: LayerIns[]) => {
    let insetFlag = false;
    for (let i = 0; i < layers.length; i++) {
      if (layers[i + 1] && layers[i + 1].index <= layer.index) {
        insetFlag = true;
        layers.splice(i, 0, layer);
        break;
      }
    }
    insetFlag || layers.push(layer);
  }
  const createLayer: CreateLayer = (index, isDefault) => {
    const layer = getLayer({ index, isDefault, engineInstance });
    const layers = layersByEngine.get(engineInstance) || layersByEngine.set(engineInstance, []).get(engineInstance);
    insetLayer(layer, layers);
    // console.log('createLayer', { layer, layers, layersByEngine });
    return layer;
  }
  const appendToLayer: AppendToLayer = (shape, layer) => {
    if (!shape) return layer;
    layer.shapes.add(shape);
    shape.layer = layer;
    shape.ctx = layer.ctx;
    return layer;
  }
  const removeLayerShape: RemoveLayerShape = (shape) => {
    shape.layer.shapes.delete(shape);
    shape.layer = null;
    shape.ctx = null;
    return shape;
  }
  const getAllLayer: GetAllLayer = () => {
    return layersByEngine.get(engineInstance);
  }
  createLayer(0, true);
  return layerCoreByEngine.set(engineInstance, {
    createLayer,
    getAllLayer,
    appendToLayer,
    removeLayerShape
  }).get(engineInstance);
}